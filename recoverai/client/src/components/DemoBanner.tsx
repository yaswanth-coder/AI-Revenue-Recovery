import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-emerald-950/60 border-b border-emerald-800/40 text-emerald-300 px-4 py-1.5 text-xs font-mono flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold text-emerald-200">DEMO ENVIRONMENT</span>
        <span className="text-emerald-400/60">|</span>
        <span className="text-emerald-300/80">SYNTHETIC DATA — NO REAL PAYMENTS — NO FINANCIAL RISK</span>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-emerald-400/80">
        <span>Policy Engine: <strong className="text-emerald-200">ACTIVE & BOUNDED</strong></span>
        <span>AI Autonomy: <strong className="text-emerald-200">CONSTRAINED</strong></span>
      </div>
    </div>
  );
};
