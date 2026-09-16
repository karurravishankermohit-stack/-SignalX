import React from 'react';

/**
 * Tactical SDR Radar Sweep indicator.
 * Displays concentric range rings, rotating phosphor sweep cone, and pinging target blips.
 */
export default function RadarSweep({
  size = 'md', // 'sm' | 'md' | 'lg' | number
  className = '',
  statusText = 'DSP ENGINE ACTIVE',
  showText = false
}) {
  const pixelSize = typeof size === 'number' ? size : {
    sm: 24,
    md: 40,
    lg: 64,
  }[size] || 40;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div 
        className="relative flex items-center justify-center shrink-0"
        style={{ width: pixelSize, height: pixelSize }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Sweep gradient */}
            <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sweep-beam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#0055FF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background grid disc */}
          <circle cx="50" cy="50" r="48" fill="#060A14" stroke="#1A2844" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="#162035" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="18" fill="none" stroke="#162035" strokeWidth="1" />
          
          {/* Crosshairs */}
          <line x1="50" y1="2" x2="50" y2="98" stroke="#1A2844" strokeWidth="1" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="#1A2844" strokeWidth="1" />

          {/* Rotating Radar Sweep Cone */}
          <g className="animate-radar-sweep">
            <path
              d="M 50 50 L 50 2 A 48 48 0 0 1 84 16 Z"
              fill="url(#sweep-beam)"
            />
            <line x1="50" y1="50" x2="50" y2="2" stroke="#00F0FF" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Target Blip 1 */}
          <circle cx="68" cy="38" r="2" fill="#00F0FF" className="animate-pulse" />
          {/* Target Blip 2 */}
          <circle cx="36" cy="65" r="1.8" fill="#10B981" className="animate-pulse" style={{ animationDelay: '0.7s' }} />

          {/* Center Origin Dot */}
          <circle cx="50" cy="50" r="2.5" fill="#00F0FF" />
          <circle cx="50" cy="50" r="5" fill="none" stroke="#00F0FF" strokeWidth="0.8" opacity="0.6" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider uppercase truncate">
            {statusText}
          </span>
          <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
            SWEEPING RF SPECTRUM
          </span>
        </div>
      )}
    </div>
  );
}
