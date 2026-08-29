import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const normalized = (status || '').toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';

  if (['RECOVERED', 'SUCCESS', 'ALLOWED', 'ACTIVE', 'COMPLETE', 'LOW'].includes(normalized)) {
    colorClasses = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    dotColor = 'bg-emerald-400';
  } else if (['PENDING', 'PROCESSING', 'MEDIUM', 'WARNING', 'REQUIRES_APPROVAL', 'SEND_REMINDER'].includes(normalized)) {
    colorClasses = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    dotColor = 'bg-amber-400';
  } else if (['FAILED', 'BLOCKED', 'HIGH', 'REJECTED', 'DANGER'].includes(normalized)) {
    colorClasses = 'bg-red-500/15 text-red-300 border-red-500/30';
    dotColor = 'bg-red-400';
  } else if (['ESCALATED', 'AI', 'RETRY', 'CHANGE_PAYMENT_METHOD'].includes(normalized)) {
    colorClasses = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    dotColor = 'bg-purple-400';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${colorClasses} ${sizeClasses} tracking-wide uppercase transition-colors`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${['PROCESSING', 'ACTIVE'].includes(normalized) ? 'animate-pulse' : ''}`} />
      )}
      {normalized.replace(/_/g, ' ')}
    </span>
  );
};
