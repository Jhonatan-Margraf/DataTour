import { useMemo, useState } from "react";
import { TrendingUp, Star, MessageSquare, ThumbsUp } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  getAllMetricasPasseios,
  filterComentarios,
  getTopicosCriticos,
  PASSEIO_LABELS,
  PERFIS_LABELS,
} from "../services/feedback.service";
import type {
  NpsCategoria,
  PasseioId,
  PerfilVisitante,
  SentimentoPt,
} from "../types";

const NPS_COLORS = {
  promotor: "#009339",
  neutro:   "#FAB518",
  detrator: "#E40F1C",
};

const SENTIMENTO_COLORS: Record<SentimentoPt, string> = {
  positivo: "#009339",
  neutro:   "#FAB518",
  negativo: "#E40F1C",
};

function formatPeriodo(iso: string): string {
  const [y, m] = iso.split("-");
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${meses[parseInt(m, 10) - 1]}/${y.slice(2)}`;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function npsColor(score: number): string {
  if (score < 0)  return "#E40F1C";
  if (score < 30) return "#FAB518";
  return "#009339";
}

function notaColor(nota: number): string {
  if (nota < 3) return "#E40F1C";
  if (nota < 4) return "#FAB518";
  return "#009339";
}

export function FeedbackPage() {
  const todosPasseios = getAllMetricasPasseios();

  const [passeio, setPasseio]             = useState<PasseioId>(todosPasseios[0]?.passeio ?? "itaipu_iluminada");
  const [perfilFilter, setPerfilFilter]   = useState<PerfilVisitante | "all">("all");
  const [sentimentoFilter, setSentimentoFilter] = useState<SentimentoPt | "all">("all");
  const [npsFilter, setNpsFilter]         = useState<NpsCategoria | "all">("all");

  // ── Base de comentários filtrados ──────────────────────────────────────────
  const comentarios = useMemo(
    () =>
      filterComentarios(passeio, {
        perfil:       perfilFilter     === "all" ? undefined : perfilFilter,
        sentimento:   sentimentoFilter === "all" ? undefined : sentimentoFilter,
        npsCategoria: npsFilter        === "all" ? undefined : npsFilter,
      }),
    [passeio, perfilFilter, sentimentoFilter, npsFilter],
  );

  // ── KPIs calculados da lista filtrada ─────────────────────────────────────
  const kpis = useMemo(() => {
    const total = comentarios.length;
    if (total === 0) return { nps: 0, notaMedia: 0, total: 0, promotoresPct: 0, detratoresPct: 0 };

    const promotores = comentarios.filter((c) => c.nps_categoria === "promotor").length;
    const detratores = comentarios.filter((c) => c.nps_categoria === "detrator").length;
    const somaNotas  = comentarios.reduce((s, c) => s + c.nota_media, 0);

    return {
      nps:           Math.round(((promotores - detratores) / total) * 1000) / 10,
      notaMedia:     Math.round((somaNotas / total) * 100) / 100,
      total,
      promotoresPct: Math.round((promotores / total) * 1000) / 10,
      detratoresPct: Math.round((detratores / total) * 1000) / 10,
    };
  }, [comentarios]);

  // ── Distribuição NPS (donut) ───────────────────────────────────────────────
  const npsData = useMemo(() => {
    const promotores = comentarios.filter((c) => c.nps_categoria === "promotor").length;
    const neutros    = comentarios.filter((c) => c.nps_categoria === "neutro").length;
    const detratores = comentarios.filter((c) => c.nps_categoria === "detrator").length;
    return [
      { name: "Promotores", value: promotores, color: NPS_COLORS.promotor },
      { name: "Neutros",    value: neutros,    color: NPS_COLORS.neutro },
      { name: "Detratores", value: detratores, color: NPS_COLORS.detrator },
    ].filter((d) => d.value > 0);
  }, [comentarios]);

  // ── Perfil do visitante ───────────────────────────────────────────────────
  const perfilData = useMemo(() => {
    const map = new Map<PerfilVisitante, number>();
    for (const c of comentarios) {
      map.set(c.perfil_visitante, (map.get(c.perfil_visitante) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([perfil, total]) => ({ perfil: PERFIS_LABELS[perfil], total }))
      .sort((a, b) => b.total - a.total);
  }, [comentarios]);

  // ── Evolução da Nota Média (série mensal) ──────────────────────────────────
  const notaTrend = useMemo(() => {
    const map = new Map<string, { soma: number; count: number }>();
    for (const c of comentarios) {
      const mes = c.data_visita.slice(0, 7);
      const curr = map.get(mes) ?? { soma: 0, count: 0 };
      map.set(mes, { soma: curr.soma + c.nota_media, count: curr.count + 1 });
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodo, { soma, count }]) => ({
        periodo: formatPeriodo(periodo),
        nota:    Math.round((soma / count) * 100) / 100,
      }));
  }, [comentarios]);

  // ── Evolução do NPS (série mensal) ────────────────────────────────────────
  const npsTrend = useMemo(() => {
    const map = new Map<string, { promotores: number; detratores: number; total: number }>();
    for (const c of comentarios) {
      const mes  = c.data_visita.slice(0, 7);
      const curr = map.get(mes) ?? { promotores: 0, detratores: 0, total: 0 };
      curr.total += 1;
      if (c.nps_categoria === "promotor") curr.promotores += 1;
      if (c.nps_categoria === "detrator") curr.detratores += 1;
      map.set(mes, curr);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodo, s]) => ({
        periodo: formatPeriodo(periodo),
        nps:     s.total > 0
          ? Math.round(((s.promotores - s.detratores) / s.total) * 1000) / 10
          : 0,
      }));
  }, [comentarios]);

  // ── Tópicos críticos (vêm do agregado, independem de filtro de perfil/nps) ─
  const topicos = useMemo(() => getTopicosCriticos(passeio, 8), [passeio]);

  const nps = kpis.nps;

  return (
    <div className="max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Feedbacks</h1>
        <p className="text-zinc-600">
          Análise de NPS, sentimento e tópicos por passeio com base nos dados reais
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs text-zinc-600 block mb-1">Passeio</label>
          <Select
            value={passeio}
            onValueChange={(v) => {
              setPasseio(v as PasseioId);
              setPerfilFilter("all");
              setSentimentoFilter("all");
              setNpsFilter("all");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {todosPasseios.map((m) => (
                <SelectItem key={m.passeio} value={m.passeio}>
                  {PASSEIO_LABELS[m.passeio]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-zinc-600 block mb-1">Perfil</label>
          <Select value={perfilFilter} onValueChange={(v) => setPerfilFilter(v as PerfilVisitante | "all")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os perfis</SelectItem>
              {(Object.keys(PERFIS_LABELS) as PerfilVisitante[]).map((p) => (
                <SelectItem key={p} value={p}>{PERFIS_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-zinc-600 block mb-1">Sentimento</label>
          <Select value={sentimentoFilter} onValueChange={(v) => setSentimentoFilter(v as SentimentoPt | "all")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="positivo">Positivo</SelectItem>
              <SelectItem value="neutro">Neutro</SelectItem>
              <SelectItem value="negativo">Negativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-zinc-600 block mb-1">NPS</label>
          <Select value={npsFilter} onValueChange={(v) => setNpsFilter(v as NpsCategoria | "all")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="promotor">Promotores</SelectItem>
              <SelectItem value="neutro">Neutros</SelectItem>
              <SelectItem value="detrator">Detratores</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs — calculados dos comentários filtrados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-zinc-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-zinc-600">NPS Score</p>
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${npsColor(nps)}1a`, color: npsColor(nps) }}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl" style={{ color: npsColor(nps) }}>
            {nps > 0 ? "+" : ""}{nps.toFixed(1)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {kpis.promotoresPct.toFixed(1)}% promotores −{" "}
            {kpis.detratoresPct.toFixed(1)}% detratores
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-zinc-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-zinc-600">Nota Média</p>
            <div className="p-2 rounded-lg bg-[#FAB518]/10 text-[#FAB518]">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl">{kpis.notaMedia.toFixed(2)} <span className="text-[#FAB518] text-2xl">★</span></p>
          <p className="text-xs text-zinc-500 mt-1">média de {kpis.total.toLocaleString("pt-BR")} avaliações</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-zinc-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-zinc-600">Total de Avaliações</p>
            <div className="p-2 rounded-lg bg-[#0082C4]/10 text-[#0082C4]">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl">{kpis.total.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-zinc-500 mt-1">
            {perfilFilter !== "all" ? `Filtro: ${PERFIS_LABELS[perfilFilter]}` :
             sentimentoFilter !== "all" ? `Filtro: ${sentimentoFilter}` :
             npsFilter !== "all" ? `Filtro: ${npsFilter}` : "todos os filtros"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-zinc-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-zinc-600">% Promotores</p>
            <div className="p-2 rounded-lg bg-[#009339]/10 text-[#009339]">
              <ThumbsUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl text-[#009339]">{kpis.promotoresPct.toFixed(1)}%</p>
          <p className="text-xs text-zinc-500 mt-1">
            {comentarios.filter((c) => c.nps_categoria === "promotor").length.toLocaleString("pt-BR")} promotores
          </p>
        </motion.div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-zinc-200 rounded-xl p-6"
        >
          <h3 className="text-lg mb-6">Distribuição NPS</h3>
          {npsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={npsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {npsData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-zinc-400 py-16 text-sm">Sem dados</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-zinc-200 rounded-xl p-6"
        >
          <h3 className="text-lg mb-6">Perfil do Visitante</h3>
          {perfilData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={perfilData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis type="number" stroke="#71717a" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="perfil"
                  stroke="#71717a"
                  width={90}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="total" fill="#0082C4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-zinc-400 py-16 text-sm">Sem dados</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white border border-zinc-200 rounded-xl p-6"
        >
          <h3 className="text-lg mb-6">Evolução da Nota Média</h3>
          {notaTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={notaTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="periodo" stroke="#71717a" tick={{ fontSize: 10 }} />
                <YAxis stroke="#71717a" domain={[1, 5]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="nota"
                  stroke="#FAB518"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-zinc-400 py-16 text-sm">Sem dados</p>
          )}
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white border border-zinc-200 rounded-xl p-6"
        >
          <h3 className="text-lg mb-2">Tópicos Críticos</h3>
          <p className="text-xs text-zinc-500 mb-4">
            Top 8 por frequência · cor = nota média · dados agregados do passeio
          </p>
          <div className="space-y-2">
            {topicos.map((t) => {
              const max   = Math.max(...topicos.map((x) => x.frequencia));
              const pct   = (t.frequencia / max) * 100;
              const color = notaColor(t.media_nota);
              return (
                <div key={t.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="truncate">
                      <span className="text-zinc-700">{t.palavra}</span>{" "}
                      <span className="text-zinc-400">{t.palavras.slice(1).join(" · ")}</span>
                    </span>
                    <span className="text-zinc-500 shrink-0 ml-2">
                      {t.frequencia} · {t.media_nota.toFixed(1)} ★
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white border border-zinc-200 rounded-xl p-6"
        >
          <h3 className="text-lg mb-6">Evolução do NPS</h3>
          {npsTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={npsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="periodo" stroke="#71717a" tick={{ fontSize: 10 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="nps"
                  stroke="#0082C4"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-zinc-400 py-16 text-sm">Sem dados</p>
          )}
        </motion.div>
      </div>

      {/* Comments table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white border border-zinc-200 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg">Comentários</h3>
          <span className="text-sm text-zinc-500">
            {comentarios.length.toLocaleString("pt-BR")} comentários
          </span>
        </div>

        {comentarios.length === 0 ? (
          <p className="text-center text-zinc-500 py-8">
            Nenhum comentário encontrado para os filtros atuais.
          </p>
        ) : (
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
            {comentarios.slice(0, 100).map((c) => {
              const sColor = SENTIMENTO_COLORS[c.sentimento];
              const npsC =
                c.nps_categoria === "promotor" ? NPS_COLORS.promotor :
                c.nps_categoria === "detrator" ? NPS_COLORS.detrator :
                NPS_COLORS.neutro;
              return (
                <div
                  key={c.id}
                  className="border border-zinc-100 rounded-lg p-4 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{c.titulo}</span>
                      <span
                        className="px-2 py-0.5 text-xs rounded capitalize"
                        style={{ backgroundColor: `${sColor}1a`, color: sColor }}
                      >
                        {c.sentimento}
                      </span>
                      <span
                        className="px-2 py-0.5 text-xs rounded capitalize"
                        style={{ backgroundColor: `${npsC}1a`, color: npsC }}
                      >
                        {c.nps_categoria}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {PERFIS_LABELS[c.perfil_visitante]} · {c.nota_media.toFixed(1)} ★ · recomenda {c.recomendaria}/10
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 shrink-0">
                      {formatDate(c.data_visita)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700">{c.comentario}</p>
                </div>
              );
            })}
            {comentarios.length > 100 && (
              <p className="text-center text-xs text-zinc-400 py-2">
                Exibindo 100 de {comentarios.length.toLocaleString("pt-BR")} — use os filtros para refinar
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
