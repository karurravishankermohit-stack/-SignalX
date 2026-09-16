import React from 'react';

export default function StatusBadge({ 
  type = 'demo', 
  label = null, 
  size = 'sm', 
  pulse = false,
  className = '' 
}) {
  const configs = {
    demo: {
      defaultLabel: 'DEMO VISUALIZATION',
      bgColor: 'bg-amber-500/15',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      dotColor: 'bg-amber-400',
    },
    synthetic: {
      defaultLabel: 'SYNTHETIC PREVIEW',
      bgColor: 'bg-amber-500/15',
      textColor: 'text-amber-300',
      borderColor: 'border-amber-500/30',
      dotColor: 'bg-amber-400',
    },
    real: {
      defaultLabel: 'REAL RF ANALYSIS',
      bgColor: 'bg-emerald-500/15',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      dotColor: 'bg-emerald-400',
    },
    engine: {
      defaultLabel: 'DSP ENGINE ONLINE',
      bgColor: 'bg-cyan-500/15',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      dotColor: 'bg-cyan-400',
    },
    probabilistic: {
      defaultLabel: 'PROBABILISTIC CLASSIFICATION',
      bgColor: 'bg-blue-500/15',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/40',
      dotColor: 'bg-blue-400',
    },
  };

  const config = configs[type] || configs.demo;
  const displayText = label || config.defaultLabel;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
  }[size] || 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider rounded border font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
      </span>
      <span>{displayText}</span>
    </span>
  );
}
