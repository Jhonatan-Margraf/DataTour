import { useMemo, useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { Users, Star, TrendingUp, Activity, AlertTriangle } from "lucide-react";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "motion/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  getFluxoAnual,
} from "../services/flow.service";
import {
  getAllSentimentosPorPasseio,
  getMetricaPasseio,
  getNotaMediaGlobal,
  getTotalAvaliacoes,
  PASSEIO_LABELS,
} from "../services/feedback.service";
import { PASSEIOS_DISPONIVEIS } from "../mocks/feedback.mock";
import type { PasseioId } from "../types";

const recentAlerts = [
  {
    source: "Refúgio Biológico",
    title: "Lotação acima do esperado",
    time: "12 min atrás",
    level: "warning" as const,
  },
  {
    source: "Aeroporto",
    title: "Pico de chegadas detectado",
    time: "35 min atrás",
    level: "info" as const,
  },
  {
    source: "Itaipu Panorâmica",
    title: "Feedback negativo recorrente sobre filas",
    time: "1 hora atrás",
    level: "warning" as const,
  },
  {
    source: "Rodoviária",
    title: "Volume 12% acima da média semanal",
    time: "2 horas atrás",
    level: "critical" as const,
  },
  {
    source: "Itaipu Iluminada",
    title: "Avaliação média subiu para 4.6★",
    time: "3 horas atrás",
    level: "info" as const,
  },
];

const levelStyles = {
  info:     { bg: "bg-[#0082C4]/10", text: "text-[#0082C4]", label: "Info"     },
  warning:  { bg: "bg-[#FAB518]/10", text: "text-[#FAB518]", label: "Atenção"  },
  critical: { bg: "bg-[#E40F1C]/10", text: "text-[#E40F1C]", label: "Crítico"  },
};

const SENTIMENT_COLORS = ["#009339", "#FAB518", "#E40F1C"];

function formatLargeNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function calcChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function OverviewPage() {
  const [sentimentFilter, setSentimentFilter] = useState<string>("geral");
  const fluxoAnual = useMemo(() => getFluxoAnual(), []);

  const ANOS = useMemo(() => fluxoAnual.map((f) => f.ano), [fluxoAnual]);
  const [selectedAno, setSelectedAno] = useState<number>(ANOS[ANOS.length - 1]);

  const notaMedia = getNotaMediaGlobal();
  const totalAval = getTotalAvaliacoes();

  // Dados do ano selecionado e anterior para cálculo de variação
  const anoAtual = useMemo(
    () => fluxoAnual.find((f) => f.ano === selectedAno),
    [fluxoAnual, selectedAno],
  );
  const anoAnterior = useMemo(
    () => fluxoAnual.find((f) => f.ano === selectedAno - 1),
    [fluxoAnual, selectedAno],
  );

  const itaipuValue = useMemo(() => {
    if (!anoAtual) return 0;
    // 2026: usa YTD se disponível, senão projeção
    return anoAtual.ytd ? anoAtual.ytd.itaipu : anoAtual.itaipu;
  }, [anoAtual]);

  const chegadasValue = useMemo(() => {
    if (!anoAtual) return 0;
    if (anoAtual.ytd) return anoAtual.ytd.aeroporto + anoAtual.ytd.rodoviaria;
    return anoAtual.aeroporto + anoAtual.rodoviaria;
  }, [anoAtual]);

  const itaipuChange = useMemo(() => {
    if (!anoAnterior) return undefined;
    return calcChange(itaipuValue, anoAnterior.itaipu);
  }, [itaipuValue, anoAnterior]);

  const chegadasChange = useMemo(() => {
    if (!anoAnterior) return undefined;
    const prevChegadas = anoAnterior.aeroporto + anoAnterior.rodoviaria;
    return calcChange(chegadasValue, prevChegadas);
  }, [chegadasValue, anoAnterior]);

  const itaipuLabel = useMemo(() => {
    if (selectedAno === 2026 && anoAtual?.ytd) return "Visitantes Itaipu – Jan/Abr 2026";
    if (anoAtual?.isProjection) return `Visitantes Itaipu ${selectedAno} (proj.)`;
    return `Visitantes Itaipu ${selectedAno}`;
  }, [selectedAno, anoAtual]);

  const chegadasLabel = useMemo(() => {
    if (selectedAno === 2026 && anoAtual?.ytd) return "Chegadas a Foz – Jan/Abr 2026";
    if (anoAtual?.isProjection) return `Chegadas a Foz ${selectedAno} (proj.)`;
    return `Chegadas a Foz ${selectedAno}`;
  }, [selectedAno, anoAtual]);

  // Dados do gráfico de fluxo — barras com opacidade reduzida p/ anos não selecionados
  const fluxoChartData = useMemo(() => {
    return fluxoAnual.map((f) => {
      const chegadas = f.aeroporto + f.rodoviaria;
      return {
        ano: f.isProjection ? `${f.ano}*` : `${f.ano}`,
        anoNum: f.ano,
        "Chegadas a Foz": chegadas,
        "Itaipu Binacional": f.itaipu,
        "Conversão (%)": chegadas > 0
          ? Math.round((f.itaipu / chegadas) * 1000) / 10
          : 0,
      };
    });
  }, [fluxoAnual]);

  // Donut de sentimentos
  const sentimentDonutData = useMemo(() => {
    if (sentimentFilter === "geral") {
      const all = getAllSentimentosPorPasseio();
      const totals = all.reduce(
        (acc, s) => ({
          positivo: acc.positivo + s.positivo,
          neutro:   acc.neutro + s.neutro,
          negativo: acc.negativo + s.negativo,
        }),
        { positivo: 0, neutro: 0, negativo: 0 },
      );
      return [
        { name: "Positivo", value: totals.positivo },
        { name: "Neutro",   value: totals.neutro },
        { name: "Negativo", value: totals.negativo },
      ];
    }
    const m = getMetricaPasseio(sentimentFilter as PasseioId);
    if (!m) return [];
    return [
      { name: "Positivo", value: m.sentimentos.positivo },
      { name: "Neutro",   value: m.sentimentos.neutro },
      { name: "Negativo", value: m.sentimentos.negativo },
    ];
  }, [sentimentFilter]);

  const sentimentTotal = sentimentDonutData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="max-w-[1400px]">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl mb-2">Visão Geral</h1>
          <p className="text-zinc-600">
            Dados consolidados de turismo em Itaipu e Foz do Iguaçu
          </p>
        </div>

        {/* Filtro de ano */}
        <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-lg p-1">
          {ANOS.map((ano) => {
            const entry = fluxoAnual.find((f) => f.ano === ano);
            const isProj = entry?.isProjection;
            return (
              <button
                key={ano}
                onClick={() => setSelectedAno(ano)}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  selectedAno === ano
                    ? "bg-[#0082C4] text-white"
                    : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {ano}{isProj ? "*" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label={itaipuLabel}
          value={formatLargeNumber(itaipuValue)}
          change={itaipuChange}
          icon={Users}
          color="blue"
          delay={0}
        />
        <MetricCard
          label={chegadasLabel}
          value={formatLargeNumber(chegadasValue)}
          change={chegadasChange}
          icon={TrendingUp}
          color="green"
          delay={0.1}
        />
        <MetricCard
          label="Nota Média Geral"
          value={`${notaMedia.toFixed(1)} ★`}
          icon={Star}
          color="yellow"
          delay={0.2}
        />
        <MetricCard
          label="Total de Avaliações"
          value={formatLargeNumber(totalAval)}
          icon={Activity}
          color="red"
          delay={0.3}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Fluxo anual com taxa de conversão */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-zinc-200 rounded-xl p-6"
        >
          <h3 className="text-lg mb-1">Fluxo Anual — Chegadas vs. Itaipu</h3>
          <p className="text-xs text-zinc-500 mb-4">
            Chegadas a Foz (Aéreo + Rodoviário) · Taxa de conversão para Itaipu · *projeção
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={fluxoChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="ano" stroke="#71717a" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                stroke="#71717a"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatLargeNumber(v)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#E40F1C"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 40]}
              />
              <Tooltip
                formatter={(v: number, name: string) =>
                  name === "Conversão (%)" ? `${v}%` : formatLargeNumber(v)
                }
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="Chegadas a Foz" fill="#FAB518">
                {fluxoChartData.map((entry) => (
                  <Cell
                    key={entry.ano}
                    fill="#FAB518"
                    fillOpacity={entry.anoNum === selectedAno ? 1 : 0.35}
                  />
                ))}
              </Bar>
              <Bar yAxisId="left" dataKey="Itaipu Binacional" fill="#0082C4">
                {fluxoChartData.map((entry) => (
                  <Cell
                    key={entry.ano}
                    fill="#0082C4"
                    fillOpacity={entry.anoNum === selectedAno ? 1 : 0.35}
                  />
                ))}
              </Bar>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Conversão (%)"
                stroke="#E40F1C"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Donut de sentimentos com filtro */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-zinc-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg">Satisfação por Sentimento</h3>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-[200px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral (todos)</SelectItem>
                {PASSEIOS_DISPONIVEIS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PASSEIO_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={sentimentDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="value"
                  paddingAngle={2}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {sentimentDonutData.map((_, i) => (
                    <Cell key={i} fill={SENTIMENT_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => v.toLocaleString("pt-BR")}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e4e4e7",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <p className="text-center text-sm text-zinc-500 mt-2">
            {sentimentTotal.toLocaleString("pt-BR")} avaliações
          </p>
        </motion.div>
      </div>

      {/* Recent alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white border border-zinc-200 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-zinc-700" />
          <h3 className="text-lg">Alertas Recentes</h3>
        </div>
        <div className="space-y-3">
          {recentAlerts.map((alert, i) => {
            const style = levelStyles[alert.level];
            return (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs rounded ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-zinc-600">{alert.source}</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-500">{alert.time}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
