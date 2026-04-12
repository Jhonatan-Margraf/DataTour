import {
  COMENTARIOS,
  METRICAS_PASSEIOS,
  PALAVRAS_NUVEM,
} from '../mocks/feedback.mock';
import type {
  ComentarioReal,
  MetricaPasseio,
  NpsCategoria,
  PalavraNuvem,
  PasseioId,
  PerfilVisitante,
  SentimentoPt,
} from '../types';

// ─── Labels ─────────────────────────────────────────────────────────────────

export const PASSEIO_LABELS: Record<PasseioId, string> = {
  refugio_biologico: 'Refúgio Biológico',
  itaipu_panoramica: 'Itaipu Panorâmica',
  itaipu_iluminada:  'Itaipu Iluminada',
  itaipu_especial:   'Itaipu Especial',
};

/** Alias para compatibilidade com consumidores antigos. */
export const SOURCE_LABELS = PASSEIO_LABELS;

export const PERFIS_LABELS: Record<PerfilVisitante, string> = {
  família:         'Família',
  turista:         'Turista',
  estudante:       'Estudante',
  profissional:    'Profissional',
  'grupo escolar': 'Grupo Escolar',
};

// ─── Métricas agregadas ─────────────────────────────────────────────────────

export function getMetricaPasseio(passeio: PasseioId): MetricaPasseio | undefined {
  return METRICAS_PASSEIOS.find((m) => m.passeio === passeio);
}

export function getAllMetricasPasseios(): MetricaPasseio[] {
  return METRICAS_PASSEIOS;
}

// ─── Filtros de comentários ─────────────────────────────────────────────────

export interface ComentarioFilters {
  sentimento?: SentimentoPt;
  perfil?: PerfilVisitante;
  npsCategoria?: NpsCategoria;
}

export function filterComentarios(
  passeio: PasseioId,
  filters: ComentarioFilters = {},
): ComentarioReal[] {
  return COMENTARIOS.filter((c) => {
    if (c.passeio !== passeio) return false;
    if (filters.sentimento && c.sentimento !== filters.sentimento) return false;
    if (filters.perfil && c.perfil_visitante !== filters.perfil) return false;
    if (filters.npsCategoria && c.nps_categoria !== filters.npsCategoria) return false;
    return true;
  }).sort((a, b) => b.data_visita.localeCompare(a.data_visita));
}

// ─── Séries temporais ───────────────────────────────────────────────────────

/** Série mensal da nota média (extraída de `por_periodo`). */
export function getNotaPorPeriodo(
  passeio: PasseioId,
): { periodo: string; nota: number }[] {
  const m = getMetricaPasseio(passeio);
  if (!m) return [];
  return m.por_periodo.map((p) => ({
    periodo: p.periodo,
    nota: Math.round(p.media_nota * 100) / 100,
  }));
}

/** Série mensal do NPS calculada a partir dos comentários reais. */
export function getNpsPorPeriodo(
  passeio: PasseioId,
): { periodo: string; nps: number }[] {
  const comments = COMENTARIOS.filter((c) => c.passeio === passeio);
  const byMonth = new Map<
    string,
    { promotores: number; detratores: number; total: number }
  >();

  for (const c of comments) {
    const mes = c.data_visita.slice(0, 7);
    const curr = byMonth.get(mes) ?? { promotores: 0, detratores: 0, total: 0 };
    curr.total += 1;
    if (c.nps_categoria === 'promotor') curr.promotores += 1;
    if (c.nps_categoria === 'detrator') curr.detratores += 1;
    byMonth.set(mes, curr);
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodo, s]) => ({
      periodo,
      nps:
        s.total > 0
          ? Math.round(((s.promotores - s.detratores) / s.total) * 1000) / 10
          : 0,
    }));
}

// ─── Tópicos críticos ───────────────────────────────────────────────────────

export interface TopicoCritico {
  id: number;
  palavra: string;
  palavras: string[];
  frequencia: number;
  media_nota: number;
  positivo_ratio: number;
}

/**
 * Tópicos ordenados por frequência (topN). Cada tópico traz a nota média
 * e a proporção positivo/total para colorir críticos (nota baixa = crítico).
 */
export function getTopicosCriticos(
  passeio: PasseioId,
  limit = 8,
): TopicoCritico[] {
  const m = getMetricaPasseio(passeio);
  if (!m) return [];

  return m.topicos
    .map((t) => {
      const positivo = t.sentimentos.positivo ?? 0;
      const negativo = t.sentimentos.negativo ?? 0;
      const neutro = t.sentimentos.neutro ?? 0;
      const total = positivo + negativo + neutro;
      return {
        id: t.topico_id,
        palavra: t.palavras_chave[0] ?? `Tópico ${t.topico_id}`,
        palavras: t.palavras_chave.slice(0, 4),
        frequencia: t.frequencia,
        media_nota: t.media_nota,
        positivo_ratio: total > 0 ? positivo / total : 0,
      };
    })
    .sort((a, b) => b.frequencia - a.frequencia)
    .slice(0, limit);
}

// ─── Agregados globais (Overview) ───────────────────────────────────────────

export function getAllSentimentosPorPasseio() {
  return METRICAS_PASSEIOS.map((m) => ({
    passeio: m.passeio,
    label: PASSEIO_LABELS[m.passeio],
    positivo: m.sentimentos.positivo,
    neutro:   m.sentimentos.neutro,
    negativo: m.sentimentos.negativo,
    nota:     m.media_nota,
    nps:      m.nps_score,
    total:    m.total_registros,
  }));
}

export function getNotaMediaGlobal(): number {
  const total = METRICAS_PASSEIOS.reduce((s, m) => s + m.total_registros, 0);
  if (total === 0) return 0;
  const weighted = METRICAS_PASSEIOS.reduce(
    (s, m) => s + m.media_nota * m.total_registros,
    0,
  );
  return Math.round((weighted / total) * 10) / 10;
}

export function getNpsGlobal(): number {
  const total = METRICAS_PASSEIOS.reduce((s, m) => s + m.total_registros, 0);
  if (total === 0) return 0;
  const promotores = METRICAS_PASSEIOS.reduce((s, m) => s + m.promotores, 0);
  const detratores = METRICAS_PASSEIOS.reduce((s, m) => s + m.detratores, 0);
  return Math.round(((promotores - detratores) / total) * 1000) / 10;
}

export function getTotalAvaliacoes(): number {
  return METRICAS_PASSEIOS.reduce((s, m) => s + m.total_registros, 0);
}

// ─── Palavras / Word cloud ──────────────────────────────────────────────────

export function getTopPalavras(limit = 20): PalavraNuvem[] {
  return [...PALAVRAS_NUVEM]
    .sort((a, b) => b.frequencia - a.frequencia)
    .slice(0, limit);
}
