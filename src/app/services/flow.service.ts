import { flowMock, FLUXO_ANUAL } from '../mocks/flow.mock';
import type {
  FlowDataPoint,
  FlowSource,
  FlowSummary,
  FluxoAnual,
  FluxoAnualSource,
  Period,
} from '../types';

// ─── Utilitários ────────────────────────────────────────────────────────────

function getPeriodDays(period: Period): number {
  return period === '7d' ? 7 : period === '30d' ? 30 : 90;
}

function slicePeriod(data: FlowDataPoint[], period: Period): FlowDataPoint[] {
  const days = getPeriodDays(period);
  return data.slice(-days);
}

// ─── Série temporal diária (sintética, proporcional aos reais de 2025) ─────

export function getFlowSeries(period: Period): FlowDataPoint[] {
  return slicePeriod(flowMock, period);
}

export function getFlowBySource(
  source: FlowSource,
  period: Period,
): { date: string; value: number }[] {
  return slicePeriod(flowMock, period).map((p) => ({
    date: p.date,
    value: p[source] ?? 0,
  }));
}

export function getFlowSummary(source: FlowSource): FlowSummary {
  const last7 = slicePeriod(flowMock, '7d');
  const last2 = flowMock.slice(-2);

  const todayValue = last2[1]?.[source] ?? 0;
  const weekValues = last7.map((p) => p[source] ?? 0);
  const weekAverage = Math.round(
    weekValues.reduce((s, v) => s + v, 0) / weekValues.length,
  );

  const yesterday = last2[0]?.[source] ?? 0;
  const changePercent =
    yesterday > 0
      ? Math.round(((todayValue - yesterday) / yesterday) * 1000) / 10
      : 0;

  return { source, todayValue, weekAverage, changePercent };
}

export function getTodayTotalFlow(): number {
  const today = flowMock[flowMock.length - 1];
  if (!today) return 0;
  return (
    (today.geodata ?? 0) +
    (today.aerodata ?? 0) +
    (today.hotel ?? 0) +
    (today.airbnb ?? 0)
  );
}

export function getTotalFlowChange(): number {
  const len = flowMock.length;
  if (len < 8) return 0;
  const today = flowMock[len - 1].total ?? 0;
  const weekAgo = flowMock[len - 8].total ?? 0;
  if (weekAgo === 0) return 0;
  return Math.round(((today - weekAgo) / weekAgo) * 1000) / 10;
}

export function getProjectedFlow7Days(): number {
  const last7 = slicePeriod(flowMock, '7d');
  const avg = last7.reduce((s, p) => s + (p.total ?? 0), 0) / last7.length;
  return Math.round(avg * 7 * 1.04);
}

// ─── Dados Anuais Reais ─────────────────────────────────────────────────────

export function getFluxoAnual(): FluxoAnual[] {
  return FLUXO_ANUAL;
}

export function getAnoAtual(): FluxoAnual {
  return FLUXO_ANUAL[FLUXO_ANUAL.length - 1];
}

export function getAnoAnterior(): FluxoAnual {
  return FLUXO_ANUAL[FLUXO_ANUAL.length - 2];
}

/** Total 2026 projetado (Itaipu + Aeroporto + Rodoviária). */
export function getTotal2026Projetado(): number {
  const a = getAnoAtual();
  return a.itaipu + a.aeroporto + a.rodoviaria;
}

/** Total 2025 fechado (Itaipu + Aeroporto + Rodoviária). */
export function getTotal2025(): number {
  const a = getAnoAnterior();
  return a.itaipu + a.aeroporto + a.rodoviaria;
}

/** Total YTD 2026 (Jan–Abr) — Itaipu + Aeroporto + Rodoviária. */
export function getTotalYtd2026(): number {
  const a = getAnoAtual();
  if (!a.ytd) return 0;
  return a.ytd.itaipu + a.ytd.aeroporto + a.ytd.rodoviaria;
}

/** Chegadas a Foz YTD 2026 (Aeroporto + Rodoviária). */
export function getChegadasFozYtd2026(): number {
  const a = getAnoAtual();
  if (!a.ytd) return 0;
  return a.ytd.aeroporto + a.ytd.rodoviaria;
}

/** Variação percentual 2026 projetado vs. 2025 fechado. */
export function getVariacao2026vs2025(): number {
  const proj = getTotal2026Projetado();
  const prev = getTotal2025();
  if (prev === 0) return 0;
  return Math.round(((proj - prev) / prev) * 1000) / 10;
}

/** Variação percentual ano fechado vs. ano anterior, por fonte. */
export function getVariacaoAnual(source: FluxoAnualSource): number {
  const anos = FLUXO_ANUAL.filter((a) => !a.isProjection);
  if (anos.length < 2) return 0;
  const last = anos[anos.length - 1][source];
  const prev = anos[anos.length - 2][source];
  if (prev === 0) return 0;
  return Math.round(((last - prev) / prev) * 1000) / 10;
}

// ─── Labels ─────────────────────────────────────────────────────────────────

export const FLUXO_ANUAL_LABELS: Record<FluxoAnualSource, string> = {
  itaipu:     'Itaipu Binacional',
  aeroporto:  'Aeroporto',
  rodoviaria: 'Rodoviária',
  voos:       'Voos/dia',
  onibus:     'Ônibus/dia',
  eventos:    'Alvará de Eventos',
};

export const FLUXO_ANUAL_COLORS: Record<FluxoAnualSource, string> = {
  itaipu:     '#0082C4',
  aeroporto:  '#009339',
  rodoviaria: '#FAB518',
  voos:       '#E40F1C',
  onibus:     '#6366F1',
  eventos:    '#8B5CF6',
};

export const FLOW_SOURCE_LABELS: Record<FlowSource, string> = {
  geodata:  'Itaipu Binacional',
  aerodata: 'Aeroporto',
  hotel:    'Rodoviária',
  airbnb:   'Alvará Eventos',
};

export const FLOW_SOURCE_COLORS: Record<FlowSource, string> = {
  geodata:  '#0082C4',
  aerodata: '#009339',
  hotel:    '#FAB518',
  airbnb:   '#E40F1C',
};
