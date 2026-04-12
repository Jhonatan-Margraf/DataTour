import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  delay?: number;
  color?: 'red' | 'yellow' | 'green' | 'blue';
}

const colorMap = {
  red: {
    bg: 'bg-[#E40F1C]/10',
    icon: 'text-[#E40F1C]',
    border: 'border-[#E40F1C]/20'
  },
  yellow: {
    bg: 'bg-[#FAB518]/10',
    icon: 'text-[#FAB518]',
    border: 'border-[#FAB518]/20'
  },
  green: {
    bg: 'bg-[#009339]/10',
    icon: 'text-[#009339]',
    border: 'border-[#009339]/20'
  },
  blue: {
    bg: 'bg-[#0082C4]/10',
    icon: 'text-[#0082C4]',
    border: 'border-[#0082C4]/20'
  }
};

export function MetricCard({ label, value, change, icon: Icon, delay = 0, color = 'blue' }: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-white border ${colors.border} rounded-xl p-6 hover:shadow-lg transition-shadow`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 ${colors.bg} rounded-lg`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        {change !== undefined && (
          <span
            className={`text-sm px-2 py-1 rounded ${
              isPositive ? "bg-[#009339]/10 text-[#009339]" : "bg-[#E40F1C]/10 text-[#E40F1C]"
            }`}
          >
            {isPositive ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <p className="text-sm text-zinc-600 mb-1">{label}</p>
      <p className="text-3xl">{value}</p>
    </motion.div>
  );
}
