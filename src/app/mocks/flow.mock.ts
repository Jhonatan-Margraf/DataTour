import type { FlowDataPoint, FluxoAnual } from '../types';

// ─── Dados Anuais Reais ─────────────────────────────────────────────────────
// Fonte: dados fornecidos pelo gestor em abril/2026.

export const FLUXO_ANUAL: FluxoAnual[] = [
  { ano: 2022, itaipu: 626796, aeroporto: 1497528, rodoviaria:  834643, voos: 31, onibus: 143, eventos: 507 },
  { ano: 2023, itaipu: 810452, aeroporto: 1908969, rodoviaria:  862475, voos: 38, onibus: 148, eventos: 471 },
  { ano: 2024, itaipu: 689825, aeroporto: 2036023, rodoviaria:  885399, voos: 38, onibus: 138, eventos: 417 },
  { ano: 2025, itaipu: 765445, aeroporto: 2284517, rodoviaria: 1058957, voos: 40, onibus: 149, eventos: 122 },
  {
    ano: 2026,
    itaipu:     712000,
    aeroporto: 1870000,
    rodoviaria: 1289000,
    voos:           49,
    onibus:        158,
    eventos:       488,
    isProjection: true,
    ytd: { itaipu: 178206, aeroporto: 467379, rodoviaria: 322433, voos: 49, onibus: 158, eventos: 122 },
  },
];

// ─── Série temporal sintética (últimos 90 dias) ─────────────────────────────
// Escalonada proporcionalmente aos totais anuais reais de 2025 para alimentar
// os gráficos de tendência diária sem distorcer a ordem de grandeza.

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateFlowValue(
  baseLine: number,
  range: number,
  dayIndex: number,
  dayOfWeek: number,
  seed: number,
): number {
  const noise = (seededRandom(seed) - 0.5) * range * 0.4;
  const trend = dayIndex * (baseLine * 0.003);
  const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? baseLine * 0.3 : 0;
  const base = baseLine + range * 0.5 * seededRandom(seed * 2);
  return Math.max(0, Math.round(base + noise + trend + weekendBoost));
}

function generateFlowMock(): FlowDataPoint[] {
  const points: FlowDataPoint[] = [];
  const endDate = new Date('2026-04-11');

  // Bases diárias derivadas dos valores reais de 2025 (÷ 365).
  // Itaipu:     765.445 / 365 ≈ 2.097
  // Aeroporto: 2.284.517 / 365 ≈ 6.259
  // Rodoviária: 1.058.957 / 365 ≈ 2.901
  // Eventos (proxy):                    ~400/dia

  for (let i = 89; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const dayIndex = 89 - i;

    const geodata  = generateFlowValue(2100, 800, dayIndex, dayOfWeek, i * 3 + 1);
    const aerodata = generateFlowValue(6200, 1600, dayIndex, dayOfWeek, i * 7 + 2);
    const hotel    = generateFlowValue(2900, 700, dayIndex, dayOfWeek, i * 11 + 3);
    const airbnb   = generateFlowValue(400, 200, dayIndex, dayOfWeek, i * 13 + 4);
    const total    = geodata + aerodata + hotel + airbnb;

    points.push({ date: dateStr, geodata, aerodata, hotel, airbnb, total });
  }

  return points;
}

export const flowMock: FlowDataPoint[] = generateFlowMock();
