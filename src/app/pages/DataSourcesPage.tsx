import { useMemo, useState } from "react";
import {
  MapPin,
  Plane,
  Bus,
  CalendarDays,
  Trees,
  Eye,
  Moon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "motion/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import {
  getFlowBySource,
  FLOW_SOURCE_LABELS,
  FLOW_SOURCE_COLORS,
} from "../services/flow.service";
import {
  getMetricaPasseio,
  PASSEIO_LABELS,
} from "../services/feedback.service";
import type {
  DataSourceId,
  DataSourceMeta,
  FlowSource,
  PasseioId,
  SourceStatus,
} from "../types";

// ─── Catálogo de fontes ──────────────────────────────────────────────────────

const sources: (DataSourceMeta & { icon: LucideIcon })[] = [
  {
    id: "geodata",
    label: FLOW_SOURCE_LABELS.geodata,
    type: "flow",
    status: "active",
    lastUpdate: "há 3 min",
    description: "Fluxo anual de visitantes ao Complexo Turístico de Itaipu Binacional.",
    mainMetric: "Visitantes 2025",
    mainMetricValue: "765K",
    icon: MapPin,
  },
  {
    id: "aerodata",
    label: FLOW_SOURCE_LABELS.aerodata,
    type: "flow",
    status: "active",
    lastUpdate: "há 12 min",
    description: "Movimentação anual de passageiros no Aeroporto Internacional de Foz do Iguaçu.",
    mainMetric: "Passageiros 2025",
    mainMetricValue: "2.28M",
    icon: Plane,
  },
  {
    id: "hotel",
    label: FLOW_SOURCE_LABELS.hotel,
    type: "flow",
    status: "active",
    lastUpdate: "há 8 min",
    description: "Embarque e desembarque anual na Rodoviária Internacional de Foz do Iguaçu.",
    mainMetric: "Passageiros 2025",
    mainMetricValue: "1.05M",
    icon: Bus,
  },
  {
    id: "airbnb",
    label: FLOW_SOURCE_LABELS.airbnb,
    type: "flow",
    status: "warning",
    lastUpdate: "há 1 hora",
    description: "Alvarás de eventos emitidos no município. Coleta parcial em 2025.",
    mainMetric: "Alvarás 2025",
    mainMetricValue: "122",
    icon: CalendarDays,
  },
  {
    id: "refugio_biologico",
    label: PASSEIO_LABELS.refugio_biologico,
    type: "feedback",
    status: "active",
    lastUpdate: "há 5 min",
    description: "Feedbacks de visitantes do Refúgio Biológico Bela Vista — fauna nativa e trilhas ecológicas.",
    mainMetric: "Avaliações",
    mainMetricValue: "—",
    icon: Trees,
  },
  {
    id: "itaipu_panoramica",
    label: PASSEIO_LABELS.itaipu_panoramica,
    type: "feedback",
    status: "active",
    lastUpdate: "há 9 min",
    description: "Feedbacks do tour panorâmico da Usina de Itaipu.",
    mainMetric: "Avaliações",
    mainMetricValue: "—",
    icon: Eye,
  },
  {
    id: "itaipu_iluminada",
    label: PASSEIO_LABELS.itaipu_iluminada,
    type: "feedback",
    status: "active",
    lastUpdate: "há 14 min",
    description: "Feedbacks do tour noturno Itaipu Iluminada.",
    mainMetric: "Avaliações",
    mainMetricValue: "—",
    icon: Moon,
  },
  {
    id: "itaipu_especial",
    label: PASSEIO_LABELS.itaipu_especial,
    type: "feedback",
    status: "active",
    lastUpdate: "há 2 horas",
    description: "Feedbacks do Itaipu Especial (circuito completo).",
    mainMetric: "Avaliações",
    mainMetricValue: "—",
    icon: Sparkles,
  },
];

// ─── Badges de status ───────────────────────────────────────────────────────

const statusConfig: Record<
  SourceStatus,
  { label: string; bg: string; text: string; icon: LucideIcon }
> = {
  active:   { label: "Ativa",    bg: "bg-[#009339]/10", text: "text-[#009339]", icon: CheckCircle2 },
  warning:  { label: "Atenção",  bg: "bg-[#FAB518]/10", text: "text-[#FAB518]", icon: AlertTriangle },
  inactive: { label: "Inativa",  bg: "bg-zinc-200",     text: "text-zinc-600",  icon: XCircle },
};

// ─── Componente ─────────────────────────────────────────────────────────────

export function DataSourcesPage() {
  const [selectedId, setSelectedId] = useState<DataSourceId | null>(null);

  const selectedSource = useMemo(
    () => sources.find((s) => s.id === selectedId) ?? null,
    [selectedId],
  );

  return (
    <div className="max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Fontes de Dados</h1>
        <p className="text-zinc-600">
          Catálogo de fontes integradas ao sistema de monitoramento
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sources.map((source, i) => {
          const Icon = source.icon;
          const StatusIcon = statusConfig[source.status].icon;
          return (
            <motion.button
              key={source.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedId(source.id)}
              className="text-left bg-white border border-zinc-200 rounded-xl p-6 hover:shadow-lg hover:border-[#0082C4]/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${
                    source.type === "flow"
                      ? "bg-[#0082C4]/10 text-[#0082C4]"
                      : "bg-[#009339]/10 text-[#009339]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${statusConfig[source.status].bg} ${statusConfig[source.status].text}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig[source.status].label}
                </span>
              </div>

              <h3 className="font-medium mb-1">{source.label}</h3>
              <p className="text-xs text-zinc-600 mb-4 line-clamp-2">{source.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                <div>
                  <p className="text-xs text-zinc-500">{source.mainMetric}</p>
                  <p className="text-lg">{source.mainMetricValue}</p>
                </div>
                <span className="text-xs text-zinc-400">{source.lastUpdate}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Detail sheet */}
      <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedSource && <SourceDetail source={selectedSource} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Detalhe de fonte ───────────────────────────────────────────────────────

function SourceDetail({
  source,
}: {
  source: DataSourceMeta & { icon: LucideIcon };
}) {
  const Icon = source.icon;

  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`p-3 rounded-lg ${
              source.type === "flow"
                ? "bg-[#0082C4]/10 text-[#0082C4]"
                : "bg-[#009339]/10 text-[#009339]"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <SheetTitle>{source.label}</SheetTitle>
        </div>
        <SheetDescription>{source.description}</SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6 px-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-50 rounded-lg p-3">
            <p className="text-xs text-zinc-500">Status</p>
            <p className="text-sm mt-1">{statusConfig[source.status].label}</p>
          </div>
          <div className="bg-zinc-50 rounded-lg p-3">
            <p className="text-xs text-zinc-500">Última atualização</p>
            <p className="text-sm mt-1">{source.lastUpdate}</p>
          </div>
        </div>

        {source.type === "flow" ? (
          <FlowSourceChart source={source.id as FlowSource} />
        ) : (
          <FeedbackSourceChart source={source.id as PasseioId} />
        )}
      </div>
    </>
  );
}

// ─── Gráficos por tipo ──────────────────────────────────────────────────────

function FlowSourceChart({ source }: { source: FlowSource }) {
  const data = getFlowBySource(source, "30d").map((p) => ({
    date: p.date.slice(-5).replace("-", "/"),
    valor: p.value,
  }));

  return (
    <div>
      <h4 className="font-medium mb-4">Série dos últimos 30 dias</h4>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 10 }} />
          <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="valor"
            stroke={FLOW_SOURCE_COLORS[source]}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function FeedbackSourceChart({ source }: { source: PasseioId }) {
  const m = getMetricaPasseio(source);
  if (!m) {
    return <p className="text-sm text-zinc-500">Sem dados disponíveis.</p>;
  }
  const data = [
    { label: "Positivo", value: m.sentimentos.positivo, color: "#009339" },
    { label: "Neutro",   value: m.sentimentos.neutro,   color: "#FAB518" },
    { label: "Negativo", value: m.sentimentos.negativo, color: "#E40F1C" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#009339]/10 rounded-lg p-3">
          <p className="text-xs text-zinc-600">Positivos</p>
          <p className="text-2xl text-[#009339]">{m.sentimentos.positivo}</p>
        </div>
        <div className="bg-[#FAB518]/10 rounded-lg p-3">
          <p className="text-xs text-zinc-600">Neutros</p>
          <p className="text-2xl text-[#FAB518]">{m.sentimentos.neutro}</p>
        </div>
        <div className="bg-[#E40F1C]/10 rounded-lg p-3">
          <p className="text-xs text-zinc-600">Negativos</p>
          <p className="text-2xl text-[#E40F1C]">{m.sentimentos.negativo}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-50 rounded-lg p-4">
          <p className="text-xs text-zinc-600 mb-1">Nota média</p>
          <p className="text-3xl">
            {m.media_nota.toFixed(1)} <span className="text-[#FAB518]">★</span>
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {m.total_registros} avaliações
          </p>
        </div>
        <div className="bg-zinc-50 rounded-lg p-4">
          <p className="text-xs text-zinc-600 mb-1">NPS Score</p>
          <p className="text-3xl">{m.nps_score.toFixed(0)}</p>
          <p className="text-xs text-zinc-500 mt-1">
            {m.promotores_pct.toFixed(0)}% promotores
          </p>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Distribuição</h4>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="label" stroke="#71717a" tick={{ fontSize: 11 }} />
            <YAxis stroke="#71717a" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.label} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
