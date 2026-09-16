import React, { useRef, useEffect, useState } from 'react';
import StatusBadge from './StatusBadge';

export default function ConstellationCanvas({ 
  modulation = 'QPSK', 
  height = 240, 
  showLabel = true,
  className = '' 
}) {
  const canvasRef = useRef(null);
  const [selectedMod, setSelectedMod] = useState(modulation);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let frameCount = 0;

    // Constellation ideal coordinates
    const getConstellationPoints = (modType) => {
      switch (modType) {
        case 'BPSK':
          return [
            { i: -1.0, q: 0.0, label: '0' },
            { i: 1.0, q: 0.0, label: '1' },
          ];
        case '8-PSK': {
          const pts = [];
          for (let k = 0; k < 8; k++) {
            const angle = (k * Math.PI) / 4;
            pts.push({ i: Math.cos(angle), q: Math.sin(angle), label: k.toString(2).padStart(3, '0') });
          }
          return pts;
        }
        case '16-QAM': {
          const pts = [];
          const levels = [-3, -1, 1, 3];
          levels.forEach((iVal, iIdx) => {
            levels.forEach((qVal, qIdx) => {
              pts.push({ i: iVal / 3.16, q: qVal / 3.16, label: `${iIdx}${qIdx}` });
            });
          });
          return pts;
        }
        case 'QPSK':
        default:
          return [
            { i: -0.707, q: 0.707, label: '01' },
            { i: 0.707, q: 0.707, label: '11' },
            { i: -0.707, q: -0.707, label: '00' },
            { i: 0.707, q: -0.707, label: '10' },
          ];
      }
    };

    const render = () => {
      frameCount++;
      const width = canvas.width;
      const h = canvas.height;

      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const centerX = width / 2;
      const centerY = h / 2;
      const scale = Math.min(centerX, centerY) * 0.72;

      // Dark background
      ctx.fillStyle = '#050914';
      ctx.fillRect(0, 0, width, h);

      // 1. Polar / Cartesian Grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = 1;

      // Concentric circles
      [0.33, 0.66, 1.0].forEach(r => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, scale * r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Axis lines: In-Phase (I) and Quadrature (Q)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, h);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('+I', width - 20, centerY - 6);
      ctx.fillText('+Q', centerX + 6, 14);

      // 2. Scatter Points around ideal constellation
      const targets = getConstellationPoints(selectedMod);
      const noiseSigma = 0.05 + Math.sin(frameCount * 0.03) * 0.01;

      // Draw faint trails / historical clouds
      ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
      for (let s = 0; s < targets.length; s++) {
        const tgt = targets[s];
        // Draw 18 sample points per constellation cluster
        for (let p = 0; p < 18; p++) {
          const angle = Math.random() * Math.PI * 2;
          const r = (Math.random() + Math.random()) * noiseSigma;
          const px = centerX + (tgt.i + Math.cos(angle) * r) * scale;
          const py = centerY - (tgt.q + Math.sin(angle) * r) * scale;

          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Ideal Target centroids
      targets.forEach(tgt => {
        const cx = centerX + tgt.i * scale;
        const cy = centerY - tgt.q * scale;

        // Centroid glow circle
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(tgt.label, cx + 8, cy - 8);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedMod]);

  return (
    <div className={`relative rounded-lg overflow-hidden border border-signalx-border bg-signalx-panel ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-signalx-dark/80 border-b border-signalx-border text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-semibold">I/Q CONSTELLATION</span>
          <div className="flex gap-1 ml-2">
            {['QPSK', '8-PSK', '16-QAM'].map(m => (
              <button
                key={m}
                onClick={() => setSelectedMod(m)}
                className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${selectedMod === m ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        {showLabel && (
          <StatusBadge type="synthetic" label="SYNTHETIC PREVIEW" size="xs" />
        )}
      </div>

      <div style={{ height: `${height}px` }} className="relative w-full">
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
        <div className="absolute left-2 bottom-2 pointer-events-none text-[10px] font-mono text-slate-400">
          EVMS: <span className="text-emerald-400">4.12%</span> | ROT: <span className="text-slate-300">0.0°</span>
        </div>
      </div>
    </div>
  );
}
