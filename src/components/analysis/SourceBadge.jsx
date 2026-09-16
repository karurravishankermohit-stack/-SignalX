import React from 'react';

export default function SourceBadge({ source }) {
  const colors = {
    METADATA: 'bg-blue-500/20 text-blue-500',
    USER_PROVIDED: 'bg-purple-500/20 text-purple-500',
    DSP_ESTIMATED: 'bg-cyan-500/20 text-cyan-500',
    AUTO_CLASSIFIED: 'bg-emerald-500/20 text-emerald-500',
    DEMO_DATA: 'bg-amber-500/20 text-amber-500',
    UNAVAILABLE: 'bg-gray-500/20 text-gray-500',
  };
  const color = colors[source] || colors.UNAVAILABLE;

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${color}`}>
      {source || 'UNAVAILABLE'}
    </span>
  );
}
