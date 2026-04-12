import { useMemo, useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { TrendingUp, CalendarDays } from "lucide-react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "motion/react";
import {
  getPrediction,
  getModelInfo,
  getUpcomingEvents,
  formatPredictionDate,
} from "../services/prediction.service";

type Horizon = 7 | 14 | 30;

const HORIZONS: { value: Horizon; label: string }[] = [
  { value: 7,  label: "7 dias" },
  { value: 14, label: "14 dias" },
  { value: 30, label: "30 dias" },
];

const impactStyles = {
  high:   { bg: "bg-[#E40F1C]/10", text: "text-[#E40F1C]", label: "Alto" },
  medium: { bg: "bg-[#FAB518]/10", text: "text-[#FAB518]", label: "Médio" },
  low:    { bg: "bg-[#009339]/10", text: "text-[#009339]", label: "Baixo" },
};

function formatShortDate(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

function formatFullDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function PredictionPage() {
  const [horizon, setHorizon] = useState<Horizon>(14);

  const chartData = useMemo(() => {
    return getPrediction(horizon).map((p) => ({
      date: formatShortDate(p.date),
      Real: p.actual ?? null,
      Predito: p.predicted,
      Intervalo: [p.lowerBound, p.upperBound] as [number, number],
    }));
  }, [horizon]);

  const modelInfo = getModelInfo();
  const upcomingEvents = getUpcomingEvents();
  const nextEvent = upcomingEvents[0];

  return (
    <div className="max-w-[1400px]">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl mb-2">Predição</h1>
          <p className="text-zinc-600">
            Projeções de fluxo turístico baseadas em indicadores antecipados
          </p>
        </div>

        {/* Horizon filter */}
        <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg p-1">
          {HORIZONS.map((h) => (
            <button
              key={h.value}
              onClick={() => setHorizon(h.value)}
              className={`px-4 py-2 text-sm rounded-md transition-all ${
                horizon === h.value
                  ? "bg-[#0082C4] text-white"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          label="Pico Previsto"
          value={nextEvent ? `${(nextEvent.expectedVisitors / 1000).toFixed(1)}K` : "—"}
          icon={TrendingUp}
          color="blue"
          delay={0}
        />
        <MetricCard
          label="Data do Pico"
          value="19/04"
          icon={CalendarDays}
          color="yellow"
          delay={0.1}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-[#E40F1C]/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-zinc-600">Próximo Evento</p>
            <div className="p-2 rounded-lg bg-[#E40F1C]/10 text-[#E40F1C]">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-semibold truncate" title={nextEvent?.label}>
            {nextEvent?.label ?? "—"}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            {nextEvent ? formatFullDate(nextEvent.date) : ""}
          </p>
          <p className="text-lg text-[#E40F1C] mt-2">
            {nextEvent ? `${(nextEvent.expectedVisitors / 1000).toFixed(1)}K pessoas` : ""}
          </p>
        </motion.div>
      </div>

      {/* Main prediction chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border border-zinc-200 rounded-xl p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg">Fluxo Previsto vs. Real</h3>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-[#0082C4]" /> Real
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-[#009339]" /> Predito
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 bg-[#009339]/20" /> Intervalo de confiança
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#009339" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#009339" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 11 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e4e4e7",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Intervalo"
              stroke="none"
              fill="url(#confidenceGradient)"
              name="Intervalo de confiança"
            />
            <Line
              type="monotone"
              dataKey="Predito"
              stroke="#009339"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Predito"
            />
            <Line
              type="monotone"
              dataKey="Real"
              stroke="#0082C4"
              strokeWidth={3}
              dot={{ r: 3 }}
              connectNulls={false}
              name="Real"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Model info box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-zinc-600"
      >
        <span className="font-medium text-zinc-800">{modelInfo.name}</span>
        <span><span className="font-mono text-zinc-700">{modelInfo.formula}</span></span>
        <span>α = {modelInfo.alpha} · β = {modelInfo.beta} · IC 90% (±1,645σ)</span>
        <span>Treino: {modelInfo.nTrain} dias · Holdout: {modelInfo.nHoldout} dias · Previsão: 30 dias</span>
        <span>RMSE = {modelInfo.rmse} · MAPE = {modelInfo.mape.toFixed(1)}%</span>
        <span className="text-zinc-400">Dados: série diária calibrada nos totais reais de 2025/2026</span>
      </motion.div>

      {/* Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg mb-4">Eventos Especiais Previstos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => {
            const style = impactStyles[event.expectedImpact];
            return (
              <motion.div
                key={event.id}
                whileHover={{ y: -2 }}
                className="bg-white border border-zinc-200 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 text-xs rounded ${style.bg} ${style.text}`}>
                    Impacto {style.label}
                  </span>
                  <span className="text-xs text-zinc-500">{formatFullDate(event.date)}</span>
                </div>
                <h4 className="font-medium mb-2">{event.label}</h4>
                <p className="text-sm text-zinc-600 mb-4">{event.description}</p>
                <div className="pt-3 border-t border-zinc-100">
                  <p className="text-xs text-zinc-500">Visitantes esperados</p>
                  <p className="text-2xl text-[#0082C4]">
                    {(event.expectedVisitors / 1000).toFixed(1)}K
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
