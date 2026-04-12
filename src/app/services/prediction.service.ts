/**
 * Serviço de Predição — Holt-Winters Duplo com Sazonalidade Semanal
 *
 * O modelo é executado em `prediction.mock.ts` e os resultados são
 * consumidos aqui. Separação mock/service mantida para compatibilidade.
 *
 * Modelo: Double Exponential Smoothing (Holt's Linear Method)
 *   L(t) = α · y_adj(t) + (1-α) · (L(t-1) + T(t-1))   α=0,40
 *   T(t) = β · (L(t) - L(t-1)) + (1-β) · T(t-1)         β=0,15
 *   Ŷ(t+h) = (L + h·T) · S[diaSemana(t+h)]
 *   IC 90%: ±1,645 · RMSE_holdout · √h
 *
 * Partição dos dados: treino=81 dias (90%) · holdout=9 dias (10%)
 */

import { predictionMock, modelMetrics, specialEventsMock } from '../mocks/prediction.mock';
import type { PredictionPoint, SpecialEvent } from '../types';

// predictionMock: 14 pontos históricos + 30 futuros = 44 pontos

export function getPrediction(horizon: 7 | 14 | 30): PredictionPoint[] {
  const historical = predictionMock.slice(0, 14);
  const future     = predictionMock.slice(14, 14 + horizon);
  return [...historical, ...future];
}

export function getFuturePrediction(horizon: 7 | 14 | 30): PredictionPoint[] {
  return predictionMock.slice(14, 14 + horizon);
}

export function getUpcomingEvents(): SpecialEvent[] {
  return specialEventsMock;
}

export function getPeakPrediction(horizon: 7 | 14 | 30): { date: string; value: number } {
  const future = getFuturePrediction(horizon);
  return future.reduce(
    (max, p) => (p.predicted > max.value ? { date: p.date, value: p.predicted } : max),
    { date: '', value: 0 },
  );
}

/**
 * Acurácia calculada via MAPE no conjunto de holdout real (9 dias).
 * MAPE = média de |actual - predicted| / actual × 100
 * Accuracy = 100 - MAPE
 */
export function getModelAccuracy(): number {
  return Math.round((100 - modelMetrics.holdoutMape) * 10) / 10;
}

/** Métricas do modelo para exibição na interface. */
export function getModelInfo() {
  return {
    name:     'Holt-Winters Duplo + Sazonalidade Semanal',
    formula:  'Ŷ(t+h) = (L + h·T) · S[dia]',
    alpha:    modelMetrics.alpha,
    beta:     modelMetrics.beta,
    rmse:     modelMetrics.rmse,
    mape:     modelMetrics.holdoutMape,
    nTrain:   modelMetrics.nTrain,
    nHoldout: modelMetrics.nHoldout,
  };
}

export function formatPredictionDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  return `${day}/${month}`;
}
