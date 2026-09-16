import React, { useRef, useEffect } from 'react';
import StatusBadge from './StatusBadge';

export default function OscilloscopeCanvas({ 
  height = 180, 
  showLabel = true,
  className = '' 
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let phase = 0;

    const render = () => {
      phase += 0.05;
      const width = canvas.width;
      const h = canvas.height;

      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, h);

      // Draw horizontal reference lines
      const midY = h / 2;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let y = midY - 60; y <= midY + 60; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical time div lines
      const divX = width / 10;
      for (let x = 0; x < width; x += divX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // 1. Draw In-Phase Waveform (I) in Cyan
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      for (let x = 0; x < width; x += 2) {
        const normX = x / width;
        // Synthesize modulated waveform
        const carrier = Math.sin(normX * 28 + phase);
        const envelope = Math.cos(normX * 4 + phase * 0.4) * 0.4 + 0.6;
        const noise = (Math.random() - 0.5) * 0.04;
        const y = midY + (carrier * envelope + noise) * (h * 0.35);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Draw Quadrature Waveform (Q) in Aerospace Blue
      ctx.strokeStyle = '#388BFD';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = 'rgba(56, 139, 253, 0.3)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      for (let x = 0; x < width; x += 2) {
        const normX = x / width;
        const carrier = Math.cos(normX * 28 + phase);
        const envelope = Math.sin(normX * 4 + phase * 0.4) * 0.4 + 0.6;
        const noise = (Math.random() - 0.5) * 0.04;
        const y = midY + (carrier * envelope + noise) * (h * 0.35);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative rounded-lg overflow-hidden border border-signalx-border bg-signalx-panel ${className}`}>
      <div className="flex items-center justify-between px-3 py-1.5 bg-signalx-dark/90 border-b border-signalx-border text-[11px] font-mono">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-semibold">TIME-DOMAIN OSCILLOSCOPE</span>
          <span className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2 h-0.5 bg-cyan-400 inline-block" /> CH1 (I)
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2 h-0.5 bg-blue-400 inline-block" /> CH2 (Q)
          </span>
        </div>
        {showLabel && (
          <StatusBadge type="synthetic" label="DEMO TRACE" size="xs" />
        )}
      </div>

      <div style={{ height: `${height}px` }} className="relative w-full">
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="absolute right-3 bottom-2 pointer-events-none text-[10px] font-mono text-slate-400">
          50.0 µs / div | 2.4 MS/s
        </div>
      </div>
    </div>
  );
}
