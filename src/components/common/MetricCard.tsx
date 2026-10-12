import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  kicker?: string;
  icon?: React.ReactNode;
  subtext?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  changeType = 'neutral',
  kicker,
  icon,
  subtext,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-medium">{label}</span>
          {icon && <div className="text-slate-400">{icon}</div>}
        </div>
        {kicker && <div className="text-[11px] font-medium text-sky-600 mb-1">{kicker}</div>}
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      </div>

      {(change || subtext) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {change && (
            <span
              className={`font-medium ${
                changeType === 'positive'
                  ? 'text-emerald-600'
                  : changeType === 'negative'
                  ? 'text-rose-600'
                  : 'text-slate-600'
              }`}
            >
              {change}
            </span>
          )}
          {subtext && <span className="text-slate-400 text-[11px]">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
