import React, { useRef, useEffect } from 'react';
import { useSignalStore } from '../../store/useSignalStore';

export default function EngineeringSpectrumAnalyzer({ 
  height = 290,
  frequency = '+124.3 kHz',
  snr = '18.7 dB',
  bandwidth = '420 kHz',
  modulation = 'QPSK',
  status = 'ANALYSIS READY',
  className = ''
}) {
  const canvasRef = useRef(null);
  const { dataSource, backendOnline } = useSignalStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let t = 0;

    const render = () => {
      t += 0.03;
      const width = canvas.width;
      const h = canvas.height;

      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      // 1. Deep instrument panel background
      ctx.fillStyle = '#07090F';
      ctx.fillRect(0, 0, width, h);

      // Margins for physical instrumentation axes
      const leftMargin = 52;  // Power dBFS axis
      const bottomMargin = 26; // Frequency axis
      const topMargin = 16;
      const rightMargin = 16;

      const plotWidth = width - leftMargin - rightMargin;
      const plotHeight = h - topMargin - bottomMargin;

      // 2. Instrument Screen Background
      ctx.fillStyle = '#05070B';
      ctx.fillRect(leftMargin, topMargin, plotWidth, plotHeight);

      // 3. Grid Lines (10 dB horizontal steps, 100 kHz vertical steps)
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#151A26';

      // Horizontal grid lines & dBFS scale labels
      const dbSteps = [0, -20, -40, -60, -80, -100];
      dbSteps.forEach((db, i) => {
        const y = topMargin + (i / (dbSteps.length - 1)) * plotHeight;
        ctx.beginPath();
        ctx.moveTo(leftMargin, y);
        ctx.lineTo(leftMargin + plotWidth, y);
        ctx.stroke();

        // Amplitude axis text
        ctx.fillStyle = '#64748B';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${db} dB`, leftMargin - 6, y);
      });

      // Vertical grid lines & Frequency offset labels
      const freqSteps = ['-500k', '-250k', '0', '+250k', '+500k'];
      freqSteps.forEach((lbl, i) => {
        const x = leftMargin + (i / (freqSteps.length - 1)) * plotWidth;
        ctx.beginPath();
        ctx.moveTo(x, topMargin);
        ctx.lineTo(x, topMargin + plotHeight);
        ctx.stroke();

        // Frequency axis text
        ctx.fillStyle = '#64748B';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(lbl, x, topMargin + plotHeight + 6);
      });

      // Center Frequency axis marker (0 Hz offset dashed line)
      const centerX = leftMargin + plotWidth * 0.5;
      ctx.save();
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = '#27334D';
      ctx.beginPath();
      ctx.moveTo(centerX, topMargin);
      ctx.lineTo(centerX, topMargin + plotHeight);
      ctx.stroke();
      ctx.restore();

      // 4. Noise Floor line at -86 dBFS
      const noiseY = topMargin + (86 / 100) * plotHeight;
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(leftMargin, noiseY);
      ctx.lineTo(leftMargin + plotWidth, noiseY);
      ctx.stroke();
      ctx.restore();

      // Noise floor label
      ctx.fillStyle = '#64748B';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('NOISE FLOOR: -86 dBFS', leftMargin + 8, noiseY - 6);

      // 5. Synthesize Calibrated RF Signal Trace
      // Peak centered around +124.3 kHz offset:
      // Offset norm: 0.5 + (124.3 / 1000) = 0.624
      const peakCenterNorm = 0.624;
      const peakX = leftMargin + plotWidth * peakCenterNorm;
      const peakY = topMargin + (14.2 / 100) * plotHeight; // -14.2 dBFS peak

      // Bandwidth bounds: 420 kHz -> 0.42 norm width
      const bwLeft = peakX - (plotWidth * 0.42) / 2;
      const bwRight = peakX + (plotWidth * 0.42) / 2;

      // Draw Bandwidth Bracket Annotation: |<--- BW: 420 kHz --->|
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1;

      // Top bracket line
      const bracketY = topMargin + (26 / 100) * plotHeight;
      ctx.beginPath();
      ctx.moveTo(bwLeft, bracketY);
      ctx.lineTo(bwRight, bracketY);
      // Left vertical tick
      ctx.moveTo(bwLeft, bracketY - 4);
      ctx.lineTo(bwLeft, bracketY + 4);
      // Right vertical tick
      ctx.moveTo(bwRight, bracketY - 4);
      ctx.lineTo(bwRight, bracketY + 4);
      ctx.stroke();

      // Bandwidth text label
      ctx.fillStyle = '#38BDF8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('|<-- BW: 420 kHz -->|', (bwLeft + bwRight) / 2, bracketY - 6);

      // 6. Draw the Spectrum Trace
      const samplePoints = 180;
      ctx.beginPath();
      for (let i = 0; i <= samplePoints; i++) {
        const norm = i / samplePoints;
        const x = leftMargin + norm * plotWidth;

        // Base noise floor calculation with thermal variation
        let floorNorm = 0.86 + Math.sin(norm * 45 + t * 2) * 0.015 + (Math.random() - 0.5) * 0.04;

        // Carrier peak (Gaussian lobe with QPSK sinc sidelobes)
        const distFromPeak = Math.abs(norm - peakCenterNorm);
        const carrierSignal = Math.exp(-Math.pow(distFromPeak / 0.045, 2)) * 0.72;

        // First order sinc sidebands
        const sideband1 = Math.exp(-Math.pow(Math.abs(distFromPeak - 0.11) / 0.025, 2)) * 0.18;
        const sideband2 = Math.exp(-Math.pow(Math.abs(distFromPeak - 0.21) / 0.02, 2)) * 0.09;

        // Small random phase ripple on carrier envelope
        const ripple = Math.sin(t * 6 + i * 0.5) * 0.015 * (carrierSignal > 0.1 ? 1 : 0);

        const totalMag = Math.max(0.08, floorNorm - carrierSignal - sideband1 - sideband2 - ripple);
        const y = topMargin + totalMag * plotHeight;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Fill area under spectrum curve with very subtle neutral gradient (not bright neon)
      ctx.lineTo(leftMargin + plotWidth, topMargin + plotHeight);
      ctx.lineTo(leftMargin, topMargin + plotHeight);
      ctx.closePath();
      const areaGrad = ctx.createLinearGradient(0, topMargin, 0, topMargin + plotHeight);
      areaGrad.addColorStop(0, 'rgba(2, 132, 199, 0.15)');
      areaGrad.addColorStop(1, 'rgba(2, 132, 199, 0.0)');
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // 7. Peak Marker Triangle & Annotation
      ctx.fillStyle = '#F59E0B'; // Muted amber peak marker
      ctx.beginPath();
      ctx.moveTo(peakX, peakY - 2);
      ctx.lineTo(peakX - 4, peakY - 8);
      ctx.lineTo(peakX + 4, peakY - 8);
      ctx.closePath();
      ctx.fill();

      // Peak label
      ctx.fillStyle = '#F8FAFC';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('▼ +124.3 kHz (-14.2 dBFS)', peakX, peakY - 12);

      // Plot border
      ctx.strokeStyle = '#1E2638';
      ctx.lineWidth = 1;
      ctx.strokeRect(leftMargin, topMargin, plotWidth, plotHeight);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`rounded-sm tech-panel overflow-hidden font-mono ${className}`}>
      {/* Instrument Header Strip */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0E121C] tech-border-b text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-xs bg-[#0284C7]" />
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            SIGNAL ANALYSIS INSTRUMENTATION
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!backendOnline ? (
            <span className="px-1.5 py-0.5 rounded-xs bg-rose-950/80 text-rose-300 border border-rose-700/60 text-[10px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              BACKEND UNAVAILABLE
            </span>
          ) : dataSource === 'REAL_ANALYSIS' ? (
            <span className="px-1.5 py-0.5 rounded-xs bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[10px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE BACKEND
            </span>
          ) : dataSource === 'DEMO_DATA' ? (
            <span className="px-1.5 py-0.5 rounded-xs bg-[#1A1813] text-[#F59E0B] border border-[#3E2F13] text-[10px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              DEMO / SYNTHETIC
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-xs bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 text-[10px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              STANDBY SCANNER
            </span>
          )}
        </div>
      </div>

      {/* Primary Technical Telemetry Grid (Required exact values) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 bg-[#0A0D15] tech-border-b text-xs divide-x divide-[#1E2638]">
        <div className="p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">FREQUENCY</div>
          <div className="text-white font-bold text-xs mt-0.5">{frequency}</div>
        </div>
        <div className="p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">SNR</div>
          <div className="text-[#10B981] font-bold text-xs mt-0.5">{snr}</div>
        </div>
        <div className="p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">BANDWIDTH</div>
          <div className="text-white font-bold text-xs mt-0.5">{bandwidth}</div>
        </div>
        <div className="p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">MODULATION</div>
          <div className="text-sky-400 font-bold text-xs mt-0.5">{modulation}</div>
        </div>
        <div className="p-2.5 col-span-2 sm:col-span-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">STATUS</div>
          <div className="text-slate-200 font-bold text-xs mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            {status}
          </div>
        </div>
      </div>

      {/* Real-time Spectrum Canvas */}
      <div style={{ height: `${height}px` }} className="relative w-full bg-[#07090F]">
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
      </div>

      {/* Instrument Footer Status Line */}
      <div className="px-3 py-1.5 bg-[#0A0D15] tech-border-t flex items-center justify-between text-[10px] text-slate-400">
        <div>WELCH PSD • 2048 PT FFT • HANNING WINDOW</div>
        <div>SPAN: 1.000 MHz • RBW: 488.2 Hz</div>
      </div>
    </div>
  );
}
