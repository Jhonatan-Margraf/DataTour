import { MEMBERS, LOCATIONS } from '../mocks/team.mock';
import type { TeamMember, TeamLocation } from '../types';

// Estado mutável (MVP sem backend)
let members: TeamMember[] = MEMBERS.map((m) => ({ ...m }));

export function getLocations(): TeamLocation[] {
  return LOCATIONS;
}

export function getMembers(): TeamMember[] {
  return members;
}

export function getMembersAtLocation(locationId: string): TeamMember[] {
  return members.filter((m) => m.status === 'alocado' && m.locationId === locationId);
}

export function getAvailableMembers(): TeamMember[] {
  return members.filter((m) => m.status === 'disponivel');
}

export function getOffDutyMembers(): TeamMember[] {
  return members.filter((m) => m.status === 'folga');
}

export function allocateMember(memberId: string, locationId: string): void {
  const member = members.find((m) => m.id === memberId);
  if (!member) return;
  member.status = 'alocado';
  member.locationId = locationId;
}

export function deallocateMember(memberId: string): void {
  const member = members.find((m) => m.id === memberId);
  if (!member) return;
  member.status = 'disponivel';
  member.locationId = undefined;
}

export function getTeamStats() {
  const total = members.length;
  const alocados = members.filter((m) => m.status === 'alocado').length;
  const disponiveis = members.filter((m) => m.status === 'disponivel').length;
  const folga = members.filter((m) => m.status === 'folga').length;
  return { total, alocados, disponiveis, folga };
}

export const ROLE_LABELS: Record<string, string> = {
  guia:        'Guia',
  segurança:   'Segurança',
  operacional: 'Operacional',
  atendimento: 'Atendimento',
  coordenador: 'Coordenador',
};
