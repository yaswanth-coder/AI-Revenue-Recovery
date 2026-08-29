import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const clamped = Math.min(Math.max(Math.round(score), 0), 100);

  const level = clamped <= 30 ? 'LOW' : clamped <= 70 ? 'MEDIUM' : 'HIGH';

  const config = {
    LOW: {
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.2)',
      text: 'text-emerald-400',
      label: 'LOW RISK',
      icon: ShieldCheck,
      desc: 'Safe for automated recovery',
    },
    MEDIUM: {
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.2)',
      text: 'text-amber-400',
      label: 'MEDIUM RISK',
      icon: AlertTriangle,
      desc: 'Selective bounded actions',
    },
    HIGH: {
      color: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.2)',
      text: 'text-red-400',
      label: 'HIGH RISK',
      icon: ShieldAlert,
      desc: 'Requires human escalation',
    },
  }[level];

  const Icon = config.icon;

  const radius = size === 'sm' ? 24 : size === 'lg' ? 48 : 36;
  const stroke = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="inline-flex items-center gap-3">
      <div className="relative flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="#1a2e23"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Active progress */}
          <circle
            stroke={config.color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.8s ease-in-out',
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-bold ${config.text} ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}`}>
            {clamped}
          </span>
          {size === 'lg' && (
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">/ 100</span>
          )}
        </div>
      </div>

      {showLabel && (
        <div>
          <div className="flex items-center gap-1.5">
            <Icon className={`w-4 h-4 ${config.text}`} />
            <span className={`font-semibold text-xs tracking-wider uppercase ${config.text}`}>
              {config.label}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">{config.desc}</span>
        </div>
      )}
    </div>
  );
};
