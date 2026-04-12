import { useMemo, useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { Users, UserCheck, UserMinus, Coffee, X, Plus, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { motion } from "motion/react";
import {
  getLocations,
  getMembersAtLocation,
  getAvailableMembers,
  getOffDutyMembers,
  getTeamStats,
  allocateMember,
  deallocateMember,
  ROLE_LABELS,
} from "../services/team.service";

const flowBadge = {
  alto:  { bg: "bg-[#E40F1C]/10", text: "text-[#E40F1C]", label: "Fluxo Alto" },
  médio: { bg: "bg-[#FAB518]/10", text: "text-[#FAB518]", label: "Fluxo Médio" },
  baixo: { bg: "bg-[#009339]/10", text: "text-[#009339]", label: "Fluxo Baixo" },
};

const roleColors: Record<string, string> = {
  guia:        "bg-[#0082C4]/10 text-[#0082C4]",
  segurança:   "bg-[#E40F1C]/10 text-[#E40F1C]",
  operacional: "bg-[#FAB518]/10 text-[#FAB518]",
  atendimento: "bg-[#009339]/10 text-[#009339]",
  coordenador: "bg-[#6366F1]/10 text-[#6366F1]",
};

export function TeamPage() {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const stats = useMemo(() => getTeamStats(), [tick]);
  const locations = useMemo(() => getLocations(), []);
  const available = useMemo(() => getAvailableMembers(), [tick]);
  const offDuty = useMemo(() => getOffDutyMembers(), [tick]);

  // State for inline allocation selects
  const [allocatingAtLocation, setAllocatingAtLocation] = useState<string | null>(null);
  const [allocatingMember, setAllocatingMember] = useState<string | null>(null);

  function handleAllocateFromLocation(memberId: string, locationId: string) {
    allocateMember(memberId, locationId);
    setAllocatingAtLocation(null);
    refresh();
  }

  function handleAllocateFromPool(memberId: string, locationId: string) {
    allocateMember(memberId, locationId);
    setAllocatingMember(null);
    refresh();
  }

  function handleDeallocate(memberId: string) {
    deallocateMember(memberId);
    refresh();
  }

  return (
    <div className="max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Equipe</h1>
        <p className="text-zinc-600">
          Gestão de colaboradores nos pontos turísticos
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Total da Equipe"
          value={stats.total}
          icon={Users}
          color="blue"
          delay={0}
        />
        <MetricCard
          label="Alocados"
          value={stats.alocados}
          icon={UserCheck}
          color="green"
          delay={0.1}
        />
        <MetricCard
          label="Disponíveis"
          value={stats.disponiveis}
          icon={UserMinus}
          color="yellow"
          delay={0.2}
        />
        <MetricCard
          label="De Folga"
          value={stats.folga}
          icon={Coffee}
          color="red"
          delay={0.3}
        />
      </div>

      {/* Pontos Turísticos */}
      <h3 className="text-lg mb-4">Pontos Turísticos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {locations.map((loc, i) => {
          const membersHere = getMembersAtLocation(loc.id);
          const occupancy = membersHere.length;
          const pct = Math.round((occupancy / loc.maxCapacity) * 100);
          const badge = flowBadge[loc.flowLevel];

          return (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="bg-white border border-zinc-200 rounded-xl p-5"
            >
              {/* Location header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <h4 className="font-medium">{loc.label}</h4>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded ${badge.bg} ${badge.text}`}>
                  {badge.label}
                </span>
              </div>

              {/* Expected flow */}
              <p className="text-xs text-zinc-500 mb-3">
                {loc.expectedFlow.toLocaleString("pt-BR")} visitantes esperados hoje
              </p>

              {/* Occupancy bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                  <span>Equipe alocada</span>
                  <span>{occupancy}/{loc.maxCapacity}</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct >= 80 ? "bg-[#009339]" : pct >= 50 ? "bg-[#FAB518]" : "bg-[#E40F1C]"
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>

              {/* Allocated members chips */}
              <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
                {membersHere.map((m) => (
                  <span
                    key={m.id}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${roleColors[m.role] ?? "bg-zinc-100 text-zinc-600"}`}
                  >
                    {m.name.split(" ")[0]}
                    <button
                      onClick={() => handleDeallocate(m.id)}
                      className="hover:opacity-70 ml-0.5"
                      title={`Remover ${m.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Allocate button */}
              {available.length > 0 && occupancy < loc.maxCapacity && (
                <>
                  {allocatingAtLocation === loc.id ? (
                    <Select
                      onValueChange={(memberId) => handleAllocateFromLocation(memberId, loc.id)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Selecionar colaborador" />
                      </SelectTrigger>
                      <SelectContent>
                        {available.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name} — {ROLE_LABELS[m.role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <button
                      onClick={() => setAllocatingAtLocation(loc.id)}
                      className="flex items-center gap-1 text-xs text-[#0082C4] hover:text-[#006a9e] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Alocar colaborador
                    </button>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Pool de disponíveis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white border border-zinc-200 rounded-xl p-6 mb-8"
      >
        <h3 className="text-lg mb-4">Colaboradores Disponíveis</h3>
        {available.length === 0 ? (
          <p className="text-sm text-zinc-400">Todos os colaboradores estão alocados ou de folga.</p>
        ) : (
          <div className="space-y-3">
            {available.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0082C4] text-white flex items-center justify-center text-xs font-medium">
                    {m.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${roleColors[m.role] ?? "bg-zinc-100 text-zinc-600"}`}>
                        {ROLE_LABELS[m.role]}
                      </span>
                      {m.languages && (
                        <span className="text-xs text-zinc-400">
                          {m.languages.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-[180px]">
                  {allocatingMember === m.id ? (
                    <Select
                      onValueChange={(locId) => handleAllocateFromPool(m.id, locId)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Selecionar ponto" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <button
                      onClick={() => setAllocatingMember(m.id)}
                      className="px-3 py-1.5 text-xs border border-[#0082C4] text-[#0082C4] rounded-lg hover:bg-[#0082C4]/5 transition-colors"
                    >
                      Alocar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* De folga */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white border border-zinc-200 rounded-xl p-6"
      >
        <h3 className="text-lg mb-4">De Folga</h3>
        {offDuty.length === 0 ? (
          <p className="text-sm text-zinc-400">Nenhum colaborador de folga hoje.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {offDuty.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-50 rounded-lg"
              >
                <div className="w-7 h-7 rounded-full bg-zinc-300 text-white flex items-center justify-center text-xs">
                  {m.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm">{m.name}</p>
                  <p className="text-xs text-zinc-400">{ROLE_LABELS[m.role]}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
