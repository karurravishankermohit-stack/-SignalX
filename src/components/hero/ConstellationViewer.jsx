import React, { useRef, useEffect } from 'react';

/**
 * ConstellationViewer
 * Renders a live, animated I/Q constellation diagram.
 * Supports BPSK, QPSK, 16QAM, 64QAM.
 * Labeled SYNTHETIC PREVIEW.
 */
const MODULATIONS = {
  BPSK: {
    points: [[-1, 0], [1, 0]],
    color: '#0EA5E9',
    spread: 0.10,
  },
  QPSK: {
    points: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
    color: '#10B981',
    spread: 0.09,
  },
  '16QAM': {
    points: Array.from({ length: 4 }, (_, i) =>
      Array.from({ length: 4 }, (_, j) => [i * 2 / 3 - 1, j * 2 / 3 - 1])
    ).flat(),
    color: '#F59E0B',
    spread: 0.07,
  },
  '64QAM': {
    points: Array.from({ length: 8 }, (_, i) =>
      Array.from({ length: 8 }, (_, j) => [(i * 2 / 7 - 1), (j * 2 / 7 - 1)])
    ).flat(),
    color: '#A78BFA',
    spread: 0.045,
  },
};

export default function ConstellationViewer({
  modulation = 'QPSK',
  size = 280,
  className = '',
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const mod = MODULATIONS[modulation] || MODULATIONS.QPSK;
    // Pre-generate persistent dots with jitter
    const dots = mod.points.map(([ix, iy]) =>
      Array.from({ length: 24 }, () => ({
        ix,
        iy,
        dx: (Math.random() - 0.5) * 2 * mod.spread,
        dy: (Math.random() - 0.5) * 2 * mod.spread,
        phase: Math.random() * Math.PI * 2,
      }))
    ).flat();

    const draw = () => {
      const t = tRef.current;
      const S = size;
      const cx = S / 2;
      const cy = S / 2;
      const scale = S * 0.38;

      ctx.clearRect(0, 0, S, S);
      ctx.fillStyle = '#06080D';
      ctx.fillRect(0, 0, S, S);

      // Grid
      ctx.strokeStyle = 'rgba(30,38,56,0.5)';
      ctx.lineWidth = 0.5;
      for (let g = -4; g <= 4; g++) {
        const gx = cx + (g / 4) * scale * 1.2;
        const gy = cy + (g / 4) * scale * 1.2;
        ctx.beginPath(); ctx.moveTo(gx, 8); ctx.lineTo(gx, S - 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(8, gy); ctx.lineTo(S - 8, gy); ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = 'rgba(100,116,139,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, 8); ctx.lineTo(cx, S - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(8, cy); ctx.lineTo(S - 8, cy); ctx.stroke();

      // Axis labels
      ctx.font = `8px 'JetBrains Mono', monospace`;
      ctx.fillStyle = 'rgba(100,116,139,0.6)';
      ctx.textAlign = 'center';
      ctx.fillText('I', S - 8, cy - 4);
      ctx.textAlign = 'left';
      ctx.fillText('Q', cx + 4, 12);

      // Ideal point rings
      mod.points.forEach(([ix, iy]) => {
        const px = cx + ix * scale;
        const py = cy - iy * scale;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.strokeStyle = mod.color + '25';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Scatter dots
      dots.forEach((dot) => {
        const px = cx + (dot.ix + dot.dx * Math.sin(t * 0.5 + dot.phase)) * scale;
        const py = cy - (dot.iy + dot.dy * Math.cos(t * 0.5 + dot.phase)) * scale;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = mod.color + 'CC';
        ctx.fill();
      });

      // Modulation label
      ctx.fillStyle = 'rgba(100,116,139,0.7)';
      ctx.font = `bold 10px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(modulation, S - 6, S - 6);

      ctx.fillStyle = 'rgba(100,116,139,0.2)';
      ctx.font = `8px 'JetBrains Mono', monospace`;
      ctx.fillText('SYNTHETIC', S - 6, S - 17);

      tRef.current += 0.02;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [modulation, size]);

  return (
    <canvas
      ref={canvasRef}
      className={`block ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
