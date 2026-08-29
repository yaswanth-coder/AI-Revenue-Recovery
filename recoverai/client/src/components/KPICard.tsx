import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  variant?: 'emerald' | 'amber' | 'red' | 'purple' | 'slate';
  badgeText?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  variant = 'emerald',
  badgeText,
}) => {
  const variantStyles = {
    emerald: {
      border: 'border-emerald-900/40 hover:border-emerald-500/40',
      glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.25)]',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      textAccent: 'text-emerald-400',
    },
    amber: {
      border: 'border-amber-900/40 hover:border-amber-500/40',
      glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)]',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      textAccent: 'text-amber-400',
    },
    red: {
      border: 'border-red-900/40 hover:border-red-500/40',
      glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(239,68,68,0.25)]',
      iconBg: 'bg-red-500/10 text-red-400 border border-red-500/20',
      textAccent: 'text-red-400',
    },
    purple: {
      border: 'border-purple-900/40 hover:border-purple-500/40',
      glow: 'group-hover:shadow-[0_0_25px_-5px_rgba(139,92,246,0.25)]',
      iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      textAccent: 'text-purple-400',
    },
    slate: {
      border: 'border-slate-800 hover:border-slate-700',
      glow: '',
      iconBg: 'bg-slate-800/80 text-slate-300 border border-slate-700',
      textAccent: 'text-slate-200',
    },
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-card p-5 group relative overflow-hidden transition-all duration-300 ${variantStyles.border} ${variantStyles.glow}`}
    >
      {/* Subtle background gradient streak */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-white flex items-baseline gap-2">
            <span>{value}</span>
            {badgeText && (
              <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {badgeText}
              </span>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-xl ${variantStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
        {subtitle && (
          <span className="text-slate-400">{subtitle}</span>
        )}
        {change && (
          <div className={`flex items-center gap-1 font-medium ${isPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{change}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
