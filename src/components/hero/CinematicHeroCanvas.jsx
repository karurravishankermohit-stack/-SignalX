import React, { useRef, useEffect, useState } from 'react';

/**
 * CinematicHeroCanvas
 * Full-viewport canvas: renders a living RF spectrum + waveform visualization.
 * Mouse hover shows frequency/power tooltip.
 * Labels clearly as SYNTHETIC PREVIEW.
 */
export default function CinematicHeroCanvas({
  height = 340,
  accentColor = '#0EA5E9',
  secondaryColor = '#10B981',
  className = '',
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: -1, y: -1, inside: false });
  const [tooltip, setTooltip] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    // Synthesize a realistic-looking RF spectrum profile
    function getSpectrumY(x, W, t) {
      // Main signal lobe at ~35% from left
      const fcenterLeft = 0.35;
      // Secondary sideband at ~62%
      const fcenterRight = 0.62;
      const noiseFloor = 0.88;

      const freq = x / W; // 0..1
      // Gaussian main lobe
      const mainLobe = 0.65 * Math.exp(-Math.pow((freq - fcenterLeft) / 0.06, 2));
      // Secondary sideband
      const sideband = 0.35 * Math.exp(-Math.pow((freq - fcenterRight) / 0.04, 2));
      // Slow animated variation
      const anim = 0.04 * Math.sin(t * 0.8 + freq * 12);
      // Noise floor with variation
      const noise = 0.02 * (Math.random() * 0.5 + 0.5 * Math.sin(t * 3 + x * 0.1));
      // Combine: larger = higher peak (we'll invert to Y)
      const power = Math.min(1, mainLobe + sideband + anim + noise);
      return noiseFloor - power * (noiseFloor - 0.04);
    }

    const draw = () => {
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#06080D';
      ctx.fillRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = 'rgba(30,38,56,0.5)';
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx <= W; gx += 48) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy <= H; gy += 32) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      // dBFS axis labels (left side)
      ctx.font = `9px 'JetBrains Mono', monospace`;
      ctx.fillStyle = 'rgba(100,116,139,0.7)';
      ctx.textAlign = 'right';
      const dbLabels = ['0', '-20', '-40', '-60', '-80'];
      dbLabels.forEach((label, i) => {
        const y = 8 + (H - 24) * (i / (dbLabels.length - 1));
        ctx.fillText(label + ' dBFS', 44, y + 4);
      });

      // Frequency axis labels (bottom)
      ctx.textAlign = 'center';
      const freqLabels = ['-200', '-100', '0', '+100', '+200'];
      freqLabels.forEach((label, i) => {
        const x = 50 + (W - 60) * (i / (freqLabels.length - 1));
        ctx.fillText(label + ' kHz', x, H - 2);
      });

      // Spectrum fill gradient
      const specGrad = ctx.createLinearGradient(0, 0, 0, H);
      specGrad.addColorStop(0, accentColor + '80');
      specGrad.addColorStop(0.5, accentColor + '30');
      specGrad.addColorStop(1, 'transparent');

      // Spectrum path
      ctx.beginPath();
      const plotX0 = 50, plotW = W - 60;
      ctx.moveTo(plotX0, H - 18);
      for (let px = 0; px <= plotW; px++) {
        const sy = getSpectrumY(px, plotW, t) * (H - 24) + 4;
        if (px === 0) ctx.lineTo(plotX0 + px, sy);
        else ctx.lineTo(plotX0 + px, sy);
      }
      ctx.lineTo(plotX0 + plotW, H - 18);
      ctx.closePath();
      ctx.fillStyle = specGrad;
      ctx.fill();

      // Spectrum line (stroke)
      ctx.beginPath();
      for (let px = 0; px <= plotW; px++) {
        const sy = getSpectrumY(px, plotW, t) * (H - 24) + 4;
        px === 0 ? ctx.moveTo(plotX0, sy) : ctx.lineTo(plotX0 + px, sy);
      }
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Peak marker — main lobe at ~35%
      const peakX = plotX0 + plotW * 0.35;
      const peakY = getSpectrumY(plotW * 0.35, plotW, t) * (H - 24) + 4;
      ctx.fillStyle = '#F59E0B';
      ctx.font = `9px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('▼', peakX, peakY - 4);
      ctx.fillStyle = 'rgba(245,158,11,0.85)';
      ctx.fillText('+124.3 kHz  –14.2 dBFS', peakX, peakY - 14);

      // Bandwidth bracket
      const bwLeft = plotX0 + plotW * 0.28;
      const bwRight = plotX0 + plotW * 0.42;
      const bwY = (H - 24) * 0.25 + 4;
      ctx.strokeStyle = 'rgba(14,165,233,0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(bwLeft, bwY); ctx.lineTo(bwLeft, H - 18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bwRight, bwY); ctx.lineTo(bwRight, H - 18); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(bwLeft, bwY + 2); ctx.lineTo(bwRight, bwY + 2); ctx.stroke();
      ctx.fillStyle = 'rgba(14,165,233,0.8)';
      ctx.font = `8px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('|← BW: 420 kHz →|', (bwLeft + bwRight) / 2, bwY - 4);

      // Noise floor line
      const noiseY = (H - 24) * 0.87 + 4;
      ctx.strokeStyle = 'rgba(239,68,68,0.35)';
      ctx.lineWidth = 0.75;
      ctx.setLineDash([4, 8]);
      ctx.beginPath(); ctx.moveTo(plotX0, noiseY); ctx.lineTo(plotX0 + plotW, noiseY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(239,68,68,0.5)';
      ctx.font = `8px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'left';
      ctx.fillText('NOISE: –86 dBFS', plotX0 + 4, noiseY - 3);

      // Hover crosshair + tooltip
      if (mouseRef.current.inside) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        if (mx >= plotX0 && mx <= plotX0 + plotW) {
          ctx.strokeStyle = 'rgba(248,250,252,0.25)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 6]);
          ctx.beginPath(); ctx.moveTo(mx, 4); ctx.lineTo(mx, H - 18); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(plotX0, my); ctx.lineTo(plotX0 + plotW, my); ctx.stroke();
          ctx.setLineDash([]);

          const freqKhz = ((mx - plotX0) / plotW * 400 - 200).toFixed(1);
          const powerDb = (((my - 4) / (H - 24)) * -90).toFixed(1);

          setTooltip({
            x: mx,
            y: my,
            freq: freqKhz > 0 ? `+${freqKhz}` : freqKhz,
            power: powerDb,
          });
        } else {
          setTooltip(null);
        }
      } else {
        setTooltip(null);
      }

      // SYNTHETIC PREVIEW watermark
      ctx.fillStyle = 'rgba(100,116,139,0.18)';
      ctx.font = `bold 10px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'right';
      ctx.fillText('SYNTHETIC PREVIEW', W - 8, H - 6);

      t += 0.012;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [mounted, height, accentColor, secondaryColor]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      inside: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.inside = false;
    setTooltip(null);
  };

  return (
    <div
      className={`relative w-full select-none ${className}`}
      style={{ height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} className="block w-full" style={{ height }} />
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 px-2 py-1.5 rounded bg-[#0A0E18]/95 border border-[#2C374E] font-mono text-[10px] whitespace-nowrap"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 36,
            transform: tooltip.x > (canvasRef.current?.offsetWidth ?? 0) * 0.7
              ? 'translateX(-110%)' : 'none',
          }}
        >
          <div className="text-sky-400">FREQUENCY {tooltip.freq} kHz</div>
          <div className="text-amber-400">POWER {tooltip.power} dB</div>
        </div>
      )}
    </div>
  );
}
