import type { TeamMember, TeamLocation } from '../types';

// ─── Pontos Turísticos ──────────────────────────────────────────────────────

export const LOCATIONS: TeamLocation[] = [
  { id: 'itaipu_panoramica', label: 'Itaipu Panorâmica',  maxCapacity: 8, expectedFlow: 4200, flowLevel: 'alto'  },
  { id: 'itaipu_iluminada',  label: 'Itaipu Iluminada',   maxCapacity: 5, expectedFlow: 2800, flowLevel: 'médio' },
  { id: 'itaipu_especial',   label: 'Itaipu Especial',    maxCapacity: 4, expectedFlow: 1500, flowLevel: 'baixo' },
  { id: 'refugio_biologico', label: 'Refúgio Biológico',  maxCapacity: 6, expectedFlow: 3100, flowLevel: 'médio' },
  { id: 'aeroporto',         label: 'Aeroporto',          maxCapacity: 4, expectedFlow: 1800, flowLevel: 'médio' },
  { id: 'rodoviaria',        label: 'Rodoviária',         maxCapacity: 3, expectedFlow:  950, flowLevel: 'baixo' },
];

// ─── Colaboradores ──────────────────────────────────────────────────────────

export const MEMBERS: TeamMember[] = [
  // Alocados — Itaipu Panorâmica (5/8)
  { id: 'M01', name: 'Ana Souza',        role: 'coordenador', status: 'alocado', locationId: 'itaipu_panoramica', languages: ['PT', 'EN', 'ES'] },
  { id: 'M02', name: 'Carlos Lima',      role: 'guia',        status: 'alocado', locationId: 'itaipu_panoramica', languages: ['PT', 'EN'] },
  { id: 'M03', name: 'Beatriz Rocha',    role: 'guia',        status: 'alocado', locationId: 'itaipu_panoramica', languages: ['PT', 'ES'] },
  { id: 'M04', name: 'Diego Martins',    role: 'segurança',   status: 'alocado', locationId: 'itaipu_panoramica', languages: ['PT'] },
  { id: 'M05', name: 'Fernanda Alves',   role: 'atendimento', status: 'alocado', locationId: 'itaipu_panoramica', languages: ['PT', 'EN'] },

  // Alocados — Itaipu Iluminada (2/5)
  { id: 'M06', name: 'Gabriel Santos',   role: 'guia',        status: 'alocado', locationId: 'itaipu_iluminada',  languages: ['PT', 'EN', 'ES'] },
  { id: 'M07', name: 'Helena Costa',     role: 'atendimento', status: 'alocado', locationId: 'itaipu_iluminada',  languages: ['PT'] },

  // Alocados — Refúgio Biológico (3/6)
  { id: 'M08', name: 'Igor Pereira',     role: 'guia',        status: 'alocado', locationId: 'refugio_biologico', languages: ['PT', 'EN'] },
  { id: 'M09', name: 'Juliana Mendes',   role: 'operacional', status: 'alocado', locationId: 'refugio_biologico', languages: ['PT'] },
  { id: 'M10', name: 'Lucas Ferreira',   role: 'segurança',   status: 'alocado', locationId: 'refugio_biologico', languages: ['PT'] },

  // Alocados — Aeroporto (2/4)
  { id: 'M11', name: 'Mariana Ribeiro',  role: 'atendimento', status: 'alocado', locationId: 'aeroporto',         languages: ['PT', 'EN', 'ES'] },
  { id: 'M12', name: 'Nathan Oliveira',  role: 'operacional', status: 'alocado', locationId: 'aeroporto',         languages: ['PT'] },

  // Alocados — Rodoviária (1/3)
  { id: 'M13', name: 'Patrícia Dias',    role: 'atendimento', status: 'alocado', locationId: 'rodoviaria',        languages: ['PT', 'ES'] },

  // Disponíveis (3)
  { id: 'M14', name: 'Rafael Borges',    role: 'guia',        status: 'disponivel', languages: ['PT', 'EN'] },
  { id: 'M15', name: 'Sofia Campos',     role: 'operacional', status: 'disponivel', languages: ['PT'] },
  { id: 'M16', name: 'Thiago Nunes',     role: 'segurança',   status: 'disponivel', languages: ['PT', 'EN'] },

  // De folga (2)
  { id: 'M17', name: 'Vanessa Pinto',    role: 'guia',        status: 'folga', languages: ['PT', 'EN', 'ES'] },
  { id: 'M18', name: 'Wellington Cruz',  role: 'coordenador', status: 'folga', languages: ['PT', 'EN'] },
];
