import type {
  ComentarioReal,
  MetricaPasseio,
  PalavraNuvem,
  PasseioId,
} from '../types';
import comentariosRaw from '../../../dados/comentarios.json';
import metricasRaw from '../../../dados/metricas_topicos.json';
import palavrasRaw from '../../../dados/palavras_nuvem.json';

const PASSEIO_ID_MAP: Record<string, PasseioId> = {
  'Itaipu Iluminada':                              'itaipu_iluminada',
  'Itaipu - Visita Panorâmica - Refúgio Biológico': 'itaipu_panoramica',
  'Itaipu Especial - Interior da Usina':           'itaipu_especial',
  'Parque Nacional - Cataratas e Trilhas':         'refugio_biologico',
};

export const COMENTARIOS: ComentarioReal[] =
  (comentariosRaw as unknown as Record<string, unknown>[]).map((c) => ({
    ...(c as unknown as ComentarioReal),
    passeio: PASSEIO_ID_MAP[c.passeio as string] ?? (c.passeio as PasseioId),
  }));

const metricasObj = metricasRaw as unknown as { passeios: MetricaPasseio[] };
export const METRICAS_PASSEIOS: MetricaPasseio[] = metricasObj.passeios;

const palavrasObj = palavrasRaw as unknown as { palavras: PalavraNuvem[] };
export const PALAVRAS_NUVEM: PalavraNuvem[] = palavrasObj.palavras;

export const PASSEIOS_DISPONIVEIS: PasseioId[] = METRICAS_PASSEIOS.map(
  (m) => m.passeio,
);
