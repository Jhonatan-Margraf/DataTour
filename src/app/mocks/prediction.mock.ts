/**
 * Predição de Fluxo Turístico — Holt-Winters Duplo com Sazonalidade Semanal
 *
 * Modelo: Double Exponential Smoothing (Holt's Linear Method)
 *         com ajuste multiplicativo de sazonalidade semanal.
 *
 * Fonte de dados: `flowMock` — série diária de 90 dias calibrada nos
 *                 totais reais de 2025 (Itaipu + Aeroporto + Rodoviária + Eventos).
 *
 * Partição:
 *   Treino   : dias 0–80  (81 dias = 90%)
 *   Holdout  : dias 81–89 ( 9 dias = 10%) — usado para MAPE e RMSE
 *   Previsão : 30 dias além do fim da série
 *
 * Parâmetros:
 *   α = 0,40 — suavização do nível   (maior peso aos dados recentes)
 *   β = 0,15 — suavização da tendência (captura aceleração moderada)
 *   IC  90%  — bounds = previsão ± 1,645 × RMSE_holdout × √h
 */

import type { PredictionPoint, SpecialEvent } from '../types';
import { flowMock } from './flow.mock';

// ─── 1. Série total diária (90 dias) ────────────────────────────────────────

const series: number[] = flowMock.map(
  (p) => (p.geodata ?? 0) + (p.aerodata ?? 0) + (p.hotel ?? 0) + (p.airbnb ?? 0),
);
const dates: string[] = flowMock.map((p) => p.date);

const N        = series.length; // 90
const N_TRAIN  = 81;            // 90%
const N_FUTURE = 30;

// ─── 2. Fatores de sazonalidade semanal S[d] (d=0=Dom … d=6=Sáb) ────────────
//
// Calculados sobre os primeiros 56 dias (8 semanas completas).
// S[d] = média(valores do dia-da-semana d) / média global dos 56 dias

function dayOfWeekFromISO(iso: string): number {
  return new Date(iso).getDay();
}

const seasonalWindow = 56;
const dowSums   = new Array<number>(7).fill(0);
const dowCounts = new Array<number>(7).fill(0);
let   windowSum = 0;

for (let i = 0; i < seasonalWindow; i++) {
  const dow = dayOfWeekFromISO(dates[i]);
  dowSums[dow]   += series[i];
  dowCounts[dow] += 1;
  windowSum      += series[i];
}

const globalAvg = windowSum / seasonalWindow;
const S: number[] = dowSums.map((sum, d) =>
  dowCounts[d] > 0 ? sum / dowCounts[d] / globalAvg : 1,
);

// ─── 3. Dessazonalização ────────────────────────────────────────────────────

const yAdj: number[] = series.map((v, i) => {
  const dow = dayOfWeekFromISO(dates[i]);
  return v / (S[dow] || 1);
});

// ─── 4. Holt's DES nos 81 dias de treino ────────────────────────────────────
//
// L(t) = α · y_adj(t) + (1-α) · (L(t-1) + T(t-1))
// T(t) = β · (L(t) - L(t-1)) + (1-β) · T(t-1)
// Inicialização com as primeiras M=7 observações.

const ALPHA = 0.40;
const BETA  = 0.15;
const M     = 7;

let L = yAdj[0];
let T = (yAdj[M - 1] - yAdj[0]) / (M - 1);

const fittedAdj: number[] = [L];

for (let t = 1; t < N_TRAIN; t++) {
  const prevL = L;
  L = ALPHA * yAdj[t] + (1 - ALPHA) * (L + T);
  T = BETA  * (L - prevL) + (1 - BETA) * T;
  fittedAdj.push(L);
}

// Recompor com sazonalidade
const fittedFull: number[] = fittedAdj.map((v, i) => {
  const dow = dayOfWeekFromISO(dates[i]);
  return Math.round(v * S[dow]);
});

// ─── 5. Holdout: previsões h=1..9 a partir do estado final do treino ─────────

const holdoutPred: number[] = [];
for (let h = 1; h <= N - N_TRAIN; h++) {
  const predAdj = L + h * T;
  const dow     = dayOfWeekFromISO(dates[N_TRAIN + h - 1]);
  holdoutPred.push(Math.round(predAdj * S[dow]));
}

const holdoutActual: number[] = series.slice(N_TRAIN);

// RMSE no holdout → IC 90%
const sse  = holdoutPred.reduce((acc, pred, i) => acc + (holdoutActual[i] - pred) ** 2, 0);
const RMSE = Math.sqrt(sse / holdoutPred.length);
const IC   = 1.645; // z-score para 90% CI

// ─── 6. Previsão futura (30 dias) ───────────────────────────────────────────
//
// IC alarga com o horizonte: σ(h) ≈ RMSE × √h

function addDays(base: string, n: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

const lastDate = dates[N - 1];

const futurePred: PredictionPoint[] = [];
for (let h = 1; h <= N_FUTURE; h++) {
  const predAdj  = L + h * T;
  const dow      = new Date(addDays(lastDate, h)).getDay();
  const pred     = Math.max(0, Math.round(predAdj * S[dow]));
  const sigma    = RMSE * Math.sqrt(h);
  futurePred.push({
    date:       addDays(lastDate, h),
    predicted:  pred,
    lowerBound: Math.max(0, Math.round(pred - IC * sigma)),
    upperBound: Math.round(pred + IC * sigma),
    actual:     undefined,
  });
}

// ─── 6b. Override de feriados/eventos ───────────────────────────────────────
//
// O modelo matemático não tem consciência de feriados. Para que o gráfico
// seja coerente com os visitantes esperados informados nos Eventos Especiais,
// sobrescrevemos os valores dos dias de pico após a previsão estatística.

const HOLIDAY_OVERRIDES: Record<string, number> = {
  '2026-04-21': 18500, // Feriado de Tiradentes
  '2026-05-01': 17200, // Feriado do Trabalho
  '2026-05-10': 12800, // Festival Gastronômico de Foz
};

for (let i = 0; i < futurePred.length; i++) {
  const override = HOLIDAY_OVERRIDES[futurePred[i].date];
  if (override !== undefined) {
    const h      = i + 1;
    const sigma  = RMSE * Math.sqrt(h);
    futurePred[i] = {
      ...futurePred[i],
      predicted:  override,
      lowerBound: Math.max(0, Math.round(override - IC * sigma)),
      upperBound: Math.round(override + IC * sigma),
    };
  }
}

// ─── 7. Montar PredictionPoint[] final ──────────────────────────────────────
//
// Gráfico: últimos 14 dias históricos (dias 76–89) + 30 dias futuros.

const predictionMockData: PredictionPoint[] = [];

const histStart = N - 14; // dia 76
for (let i = histStart; i < N; i++) {
  const isHoldout = i >= N_TRAIN;
  const pred      = isHoldout ? holdoutPred[i - N_TRAIN] : fittedFull[i];
  const h         = isHoldout ? i - N_TRAIN + 1 : 1;
  const sigma     = RMSE * Math.sqrt(h);

  predictionMockData.push({
    date:       dates[i],
    actual:     series[i],
    predicted:  pred,
    lowerBound: Math.max(0, Math.round(pred - IC * sigma)),
    upperBound: Math.round(pred + IC * sigma),
  });
}

for (const fp of futurePred) {
  predictionMockData.push(fp);
}

export const predictionMock: PredictionPoint[] = predictionMockData;

// ─── Métricas do modelo (consumidas pelo serviço de acurácia) ───────────────

export const modelMetrics = {
  alpha:        ALPHA,
  beta:         BETA,
  rmse:         Math.round(RMSE),
  holdoutMape:  (() => {
    const mape = holdoutPred.reduce((acc, pred, i) => {
      const actual = holdoutActual[i];
      return acc + (actual > 0 ? Math.abs(actual - pred) / actual : 0);
    }, 0) / holdoutPred.length * 100;
    return Math.round(mape * 10) / 10;
  })(),
  nTrain:   N_TRAIN,
  nHoldout: N - N_TRAIN,
};

// ─── Eventos especiais ───────────────────────────────────────────────────────

export const specialEventsMock: SpecialEvent[] = [
  {
    id:               'EVT-001',
    date:             '2026-04-21',
    label:            'Feriado de Tiradentes',
    expectedImpact:   'high',
    expectedVisitors: 18500,
    description:
      'Feriado nacional com forte impacto no turismo regional. Expectativa de lotação máxima nas Cataratas e Itaipu.',
  },
  {
    id:               'EVT-002',
    date:             '2026-05-01',
    label:            'Feriado do Trabalho',
    expectedImpact:   'high',
    expectedVisitors: 17200,
    description:
      'Feriado nacional com alta demanda hoteleira. Reservas aéreas acima da média registradas.',
  },
  {
    id:               'EVT-003',
    date:             '2026-05-10',
    label:            'Festival Gastronômico de Foz',
    expectedImpact:   'medium',
    expectedVisitors: 12800,
    description:
      'Evento local com aumento esperado de fluxo de visitantes no centro e região hoteleira.',
  },
];
