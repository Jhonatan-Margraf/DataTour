// ─── Passeios / Fontes de Feedback ──────────────────────────────────────────

export type FeedbackSource =
  | 'refugio_biologico'
  | 'itaipu_panoramica'
  | 'itaipu_iluminada'
  | 'itaipu_especial';

export type PasseioId = FeedbackSource;

// ─── Fontes de Fluxo ────────────────────────────────────────────────────────

export type FlowSource = 'geodata' | 'aerodata' | 'hotel' | 'airbnb';

export type FluxoAnualSource =
  | 'itaipu'
  | 'aeroporto'
  | 'rodoviaria'
  | 'voos'
  | 'onibus'
  | 'eventos';

export type DataSourceId = FeedbackSource | FlowSource | FluxoAnualSource;

export type Period = '7d' | '30d' | '90d';

// ─── Sentimento / NPS / Perfil ──────────────────────────────────────────────

export type Sentiment = 'positive' | 'negative' | 'neutral';
export type SentimentoPt = 'positivo' | 'negativo' | 'neutro';

export type NpsCategoria = 'promotor' | 'neutro' | 'detrator';

export type PerfilVisitante =
  | 'família'
  | 'turista'
  | 'estudante'
  | 'profissional'
  | 'grupo escolar';

// ─── Feedback Real (JSON) ───────────────────────────────────────────────────

export interface ComentarioReal {
  id: number;
  passeio: PasseioId;
  perfil_visitante: PerfilVisitante;
  data_visita: string;
  titulo: string;
  comentario: string;
  nota_media: number;
  recomendaria: number;
  nps_categoria: NpsCategoria;
  nps_categoria_original?: NpsCategoria;
  sentimento: SentimentoPt;
  sentimento_score: number;
  topico_id: number;
}

export interface MetricaPorPerfil {
  perfil_visitante: PerfilVisitante;
  total: number;
  media_nota: number;
  media_recomendaria: number;
}

export interface MetricaPorPeriodo {
  periodo: string; // YYYY-MM
  total: number;
  media_nota: number;
  media_recomendaria: number;
}

export interface MetricaSentimentos {
  positivo: number;
  neutro: number;
  negativo: number;
  positivo_pct: number;
  neutro_pct: number;
  negativo_pct: number;
}

export interface MetricaTopico {
  topico_id: number;
  palavras_chave: string[];
  frequencia: number;
  media_nota: number;
  sentimentos: { positivo?: number; negativo?: number; neutro?: number };
}

export interface MetricaPasseio {
  passeio: PasseioId;
  total_registros: number;
  media_nota: number;
  media_recomendaria: number;
  nps_score: number;
  promotores: number;
  neutros: number;
  detratores: number;
  promotores_pct: number;
  neutros_pct: number;
  detratores_pct: number;
  por_perfil: MetricaPorPerfil[];
  por_periodo: MetricaPorPeriodo[];
  sentimentos: MetricaSentimentos;
  topicos: MetricaTopico[];
}

export interface PalavraNuvem {
  palavra: string;
  frequencia: number;
  topico_id: string;
  sentimento: SentimentoPt;
  positivos: number;
  negativos: number;
}

// ─── Fluxo Anual (dados reais) ──────────────────────────────────────────────

export interface FluxoAnual {
  ano: number;
  itaipu: number;
  aeroporto: number;
  rodoviaria: number;
  voos: number;
  onibus: number;
  eventos: number;
  isProjection?: boolean;
  ytd?: {
    itaipu: number;
    aeroporto: number;
    rodoviaria: number;
    voos: number;
    onibus: number;
    eventos: number;
  };
}

// ─── Fluxo (série temporal sintética, usada em gráficos de tendência) ──────

export interface FlowDataPoint {
  date: string;
  geodata?: number;
  aerodata?: number;
  hotel?: number;
  airbnb?: number;
  total?: number;
}

export interface FlowSummary {
  source: FlowSource;
  todayValue: number;
  weekAverage: number;
  changePercent: number;
}

// ─── Predição ───────────────────────────────────────────────────────────────

export interface PredictionPoint {
  date: string;
  predicted: number;
  actual?: number;
  lowerBound: number;
  upperBound: number;
}

export interface SpecialEvent {
  id: string;
  date: string;
  label: string;
  expectedImpact: 'high' | 'medium' | 'low';
  expectedVisitors: number;
  description: string;
}

// ─── Fontes de dados (catálogo) ─────────────────────────────────────────────

export type SourceStatus = 'active' | 'warning' | 'inactive';

export interface DataSourceMeta {
  id: DataSourceId;
  label: string;
  type: 'flow' | 'feedback';
  status: SourceStatus;
  lastUpdate: string;
  description: string;
  mainMetric: string;
  mainMetricValue: string;
}

// ─── Equipe / Pontos Turísticos ─────────────────────────────────────────────

export type TeamRole = 'guia' | 'segurança' | 'operacional' | 'atendimento' | 'coordenador';
export type TeamStatus = 'alocado' | 'disponivel' | 'folga';

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  status: TeamStatus;
  locationId?: string;
  languages?: string[];
}

export interface TeamLocation {
  id: string;
  label: string;
  maxCapacity: number;
  expectedFlow: number;
  flowLevel: 'alto' | 'médio' | 'baixo';
}

// ─── Alertas / Ocorrências ──────────────────────────────────────────────────

export type AlertLevel = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  title: string;
  description: string;
  level: AlertLevel;
  source: DataSourceId;
  date: string;
  resolved: boolean;
}
