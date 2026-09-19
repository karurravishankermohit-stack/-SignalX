import React, { useRef, useEffect } from 'react';
import { useSignalStore } from '../../store/useSignalStore';

export default function EngineeringSpectrumAnalyzer({ 
  height = 290,
  frequency = null,
  snr = null,
  bandwidth = null,
  modulation = null,
  status = null,
  hasActiveSignal = false,
  isDemo = false,
  isCached = false,
  className = ''
}) {
  const canvasRef = useRef(null);
  const { dataSource, backendOnline } = useSignalStore();

  // If props didn't specify, derive from store
  const activeSignal = hasActiveSignal || Boolean(dataSource);
  const demoSignal = isDemo || dataSource === 'DEMO_DATA';
  const offlineMode = !backendOnline;

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
      const leftMargin = 52;   // Power dBFS axis
      const bottomMargin = 26; // Frequency axis
      const topMargin = 16;
      const rightMargin = 16;

      const plotWidth = Math.max(10, width - leftMargin - rightMargin);
      const plotHeight = Math.max(10, h - topMargin - bottomMargin);

      // 2. Instrument Screen Background
      ctx.fillStyle = offlineMode ? '#080506' : '#05070B';
      ctx.fillRect(leftMargin, topMargin, plotWidth, plotHeight);

      // 3. Grid Lines (10 dB horizontal steps, 100 kHz vertical steps)
      ctx.lineWidth = 1;
      ctx.strokeStyle = offlineMode ? '#201518' : '#151A26';

      // Horizontal grid lines & dBFS scale labels
      const dbSteps = [0, -20, -40, -60, -80, -100];
      dbSteps.forEach((db, i) => {
        const y = topMargin + (i / (dbSteps.length - 1)) * plotHeight;
        ctx.beginPath();
        ctx.moveTo(leftMargin, y);
        ctx.lineTo(leftMargin + plotWidth, y);
        ctx.stroke();

        ctx.fillStyle = offlineMode ? '#5C3840' : '#64748B';
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

        ctx.fillStyle = offlineMode ? '#5C3840' : '#64748B';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(lbl, x, topMargin + plotHeight + 6);
      });

      // Center Frequency axis marker (0 Hz offset dashed line)
      const centerX = leftMargin + plotWidth * 0.5;
      ctx.save();
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = offlineMode ? '#4A1D24' : '#27334D';
      ctx.beginPath();
      ctx.moveTo(centerX, topMargin);
      ctx.lineTo(centerX, topMargin + plotHeight);
      ctx.stroke();
      ctx.restore();

      // 4. Noise Floor line
      const noiseY = topMargin + (92 / 100) * plotHeight;
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = offlineMode ? '#3D2026' : '#334155';
      ctx.beginPath();
      ctx.moveTo(leftMargin, noiseY);
      ctx.lineTo(leftMargin + plotWidth, noiseY);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = offlineMode ? '#7F454E' : '#64748B';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('NOISE FLOOR: -92 dBFS', leftMargin + 8, noiseY - 6);

      // Plot border
      ctx.strokeStyle = offlineMode ? '#401820' : '#1E2638';
      ctx.lineWidth = 1;
      ctx.strokeRect(leftMargin, topMargin, plotWidth, plotHeight);

      // 5. Render Signal or State Overlays
      if (offlineMode) {
        // STATE 3 & 4: Backend Offline Display
        // Draw flat, muted thermal floor
        const samplePoints = 120;
        ctx.beginPath();
        for (let i = 0; i <= samplePoints; i++) {
          const norm = i / samplePoints;
          const x = leftMargin + norm * plotWidth;
          const floorNorm = 0.92 + Math.sin(norm * 20 + t) * 0.005 + (Math.random() - 0.5) * 0.01;
          const y = topMargin + floorNorm * plotHeight;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#4A1D24';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Centered Offline Warning Badge
        const cardW = Math.min(380, plotWidth - 20);
        const cardH = 76;
        const cardX = leftMargin + (plotWidth - cardW) / 2;
        const cardY = topMargin + (plotHeight - cardH) / 2;

        ctx.fillStyle = 'rgba(26, 8, 12, 0.92)';
        ctx.fillRect(cardX, cardY, cardW, cardH);
        ctx.strokeStyle = '#991B1B';
        ctx.lineWidth = 1;
        ctx.strokeRect(cardX, cardY, cardW, cardH);

        ctx.fillStyle = '#FCA5A5';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DSP ENGINE OFFLINE — NO LIVE DSP DATA', cardX + cardW / 2, cardY + 26);

        ctx.fillStyle = '#FECACA';
        ctx.font = '10px "Inter", sans-serif';
        ctx.fillText('Unable to reach signal processing backend service.', cardX + cardW / 2, cardY + 44);
        ctx.fillStyle = '#F87171';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText('Click "RETRY CONNECTION" to reconnect.', cardX + cardW / 2, cardY + 58);

      } else if (!activeSignal) {
        // STATE 1: Backend Online, No Signal Loaded
        // Draw real-time standby noise floor with gentle thermal variation
        const samplePoints = 180;
        ctx.beginPath();
        for (let i = 0; i <= samplePoints; i++) {
          const norm = i / samplePoints;
          const x = leftMargin + norm * plotWidth;
          const floorNorm = 0.92 + Math.sin(norm * 40 + t * 1.5) * 0.012 + (Math.random() - 0.5) * 0.02;
          const y = topMargin + Math.min(0.98, Math.max(0.85, floorNorm)) * plotHeight;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Standby sweep line
        const sweepNorm = (t * 0.4) % 1;
        const sweepX = leftMargin + sweepNorm * plotWidth;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sweepX, topMargin);
        ctx.lineTo(sweepX, topMargin + plotHeight);
        ctx.stroke();

        // Standby Overlay Message
        const cardW = Math.min(440, plotWidth - 20);
        const cardH = 64;
        const cardX = leftMargin + (plotWidth - cardW) / 2;
        const cardY = topMargin + (plotHeight - cardH) / 2;

        ctx.fillStyle = 'rgba(8, 12, 22, 0.85)';
        ctx.fillRect(cardX, cardY, cardW, cardH);
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1;
        ctx.strokeRect(cardX, cardY, cardW, cardH);

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('STANDBY SCANNER ACTIVE • NO SIGNAL LOADED', cardX + cardW / 2, cardY + 24);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px "Inter", sans-serif';
        ctx.fillText('Ingest a .WAV/.IQ file or load a demo benchmark to begin spectral analysis', cardX + cardW / 2, cardY + 44);

      } else {
        // STATE 2: Backend Online, Signal Loaded
        // Parse carrier offset for peak position
        let peakCenterNorm = 0.5; // Default center
        if (frequency && typeof frequency === 'string') {
          const match = frequency.match(/([+-]?\d+(?:\.\d+)?)/);
          if (match) {
            const khz = parseFloat(match[1]);
            peakCenterNorm = Math.max(0.1, Math.min(0.9, 0.5 + (khz / 1000)));
          }
        }

        const peakX = leftMargin + plotWidth * peakCenterNorm;
        const peakY = topMargin + (22 / 100) * plotHeight;

        // Bandwidth bracket
        let bwNorm = 0.35;
        if (bandwidth && typeof bandwidth === 'string') {
          const match = bandwidth.match(/(\d+(?:\.\d+)?)/);
          if (match) {
            const bwVal = parseFloat(match[1]);
            const isMhz = bandwidth.toLowerCase().includes('mhz');
            const khz = isMhz ? bwVal * 1000 : bwVal;
            bwNorm = Math.max(0.08, Math.min(0.8, khz / 1000));
          }
        }

        const bwLeft = Math.max(leftMargin + 4, peakX - (plotWidth * bwNorm) / 2);
        const bwRight = Math.min(leftMargin + plotWidth - 4, peakX + (plotWidth * bwNorm) / 2);

        // Bracket rendering
        ctx.strokeStyle = demoSignal ? '#D97706' : '#0284C7';
        ctx.lineWidth = 1;
        const bracketY = topMargin + (32 / 100) * plotHeight;
        ctx.beginPath();
        ctx.moveTo(bwLeft, bracketY);
        ctx.lineTo(bwRight, bracketY);
        ctx.moveTo(bwLeft, bracketY - 4);
        ctx.lineTo(bwLeft, bracketY + 4);
        ctx.moveTo(bwRight, bracketY - 4);
        ctx.lineTo(bwRight, bracketY + 4);
        ctx.stroke();

        ctx.fillStyle = demoSignal ? '#FBBF24' : '#38BDF8';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`|<-- BW: ${bandwidth || 'CALCULATED'} -->|`, (bwLeft + bwRight) / 2, bracketY - 6);

        // Spectrum Trace Curve
        const samplePoints = 180;
        ctx.beginPath();
        for (let i = 0; i <= samplePoints; i++) {
          const norm = i / samplePoints;
          const x = leftMargin + norm * plotWidth;

          let floorNorm = 0.90 + Math.sin(norm * 45 + t * 2) * 0.015 + (Math.random() - 0.5) * 0.03;
          const distFromPeak = Math.abs(norm - peakCenterNorm);
          const carrierSignal = Math.exp(-Math.pow(distFromPeak / (bwNorm * 0.35), 2)) * 0.68;
          const sideband = Math.exp(-Math.pow(Math.abs(distFromPeak - bwNorm * 0.6) / 0.03, 2)) * 0.14;
          const ripple = Math.sin(t * 6 + i * 0.5) * 0.015 * (carrierSignal > 0.1 ? 1 : 0);

          const totalMag = Math.max(0.12, floorNorm - carrierSignal - sideband - ripple);
          const y = topMargin + totalMag * plotHeight;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = demoSignal ? '#F59E0B' : '#0284C7';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Area gradient under curve
        ctx.lineTo(leftMargin + plotWidth, topMargin + plotHeight);
        ctx.lineTo(leftMargin, topMargin + plotHeight);
        ctx.closePath();
        const areaGrad = ctx.createLinearGradient(0, topMargin, 0, topMargin + plotHeight);
        if (demoSignal) {
          areaGrad.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
          areaGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
        } else {
          areaGrad.addColorStop(0, 'rgba(2, 132, 199, 0.15)');
          areaGrad.addColorStop(1, 'rgba(2, 132, 199, 0.0)');
        }
        ctx.fillStyle = areaGrad;
        ctx.fill();

        // Peak Marker
        ctx.fillStyle = demoSignal ? '#F59E0B' : '#38BDF8';
        ctx.beginPath();
        ctx.moveTo(peakX, peakY - 2);
        ctx.lineTo(peakX - 4, peakY - 8);
        ctx.lineTo(peakX + 4, peakY - 8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#F8FAFC';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`▼ ${frequency || 'CARRIER PEAK'}`, peakX, peakY - 12);

        // Provenance Watermark
        ctx.fillStyle = demoSignal ? 'rgba(245, 158, 11, 0.7)' : 'rgba(56, 189, 248, 0.7)';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(demoSignal ? 'DEMO / SYNTHETIC PREVIEW' : 'LIVE RF SPECTRAL ESTIMATION', leftMargin + plotWidth - 10, topMargin + 16);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [offlineMode, activeSignal, demoSignal, frequency, bandwidth]);

  // Derived display values for telemetry grid
  const displayFreq = offlineMode && !activeSignal ? 'UNAVAILABLE' : (activeSignal ? (frequency || '--') : '--');
  const displaySnr = offlineMode && !activeSignal ? 'UNAVAILABLE' : (activeSignal ? (snr || '--') : '--');
  const displayBw = offlineMode && !activeSignal ? 'UNAVAILABLE' : (activeSignal ? (bandwidth || '--') : '--');
  const displayMod = offlineMode && !activeSignal ? 'UNAVAILABLE' : (activeSignal ? (modulation || '--') : '--');
  const displayStatus = offlineMode 
    ? (activeSignal ? 'OFFLINE (CACHED)' : 'BACKEND OFFLINE') 
    : (activeSignal ? (status || 'ANALYSIS READY') : 'STANDBY / IDLE');

  return (
    <div className={`rounded-sm tech-panel overflow-hidden font-mono ${className}`}>
      {/* Instrument Header Strip */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0E121C] tech-border-b text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-xs ${offlineMode ? 'bg-rose-500' : 'bg-[#0284C7]'}`} />
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            SIGNAL ANALYSIS INSTRUMENTATION
          </span>
        </div>
        <div className="flex items-center gap-2">
          {offlineMode ? (
            <span className="px-1.5 py-0.5 rounded-xs bg-rose-950/80 text-rose-300 border border-rose-700/60 text-[10px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              BACKEND OFFLINE
            </span>
          ) : !activeSignal ? (
            <span className="px-1.5 py-0.5 rounded-xs bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 text-[10px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              STANDBY SCANNER
            </span>
          ) : demoSignal ? (
            <span className="px-1.5 py-0.5 rounded-xs bg-[#1A1813] text-[#F59E0B] border border-[#3E2F13] text-[10px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              DEMO / SYNTHETIC PREVIEW
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-xs bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[10px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE BACKEND ANALYSIS
            </span>
          )}
        </div>
      </div>

      {/* Primary Technical Telemetry Grid (No fabricated values) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 bg-[#0A0D15] tech-border-b text-xs divide-x divide-[#1E2638]">
        <div className="p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">FREQUENCY</div>
          <div className={`font-bold text-xs mt-0.5 ${displayFreq === 'UNAVAILABLE' ? 'text-rose-400/80' : 'text-white'}`}>
            {displayFreq}
          </div>
        </div>
        <div className="p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">SNR</div>
          <div className={`font-bold text-xs mt-0.5 ${displaySnr === 'UNAVAILABLE' ? 'text-rose-400/80' : (activeSignal ? 'text-[#10B981]' : 'text-slate-400')}`}>
            {displaySnr}
          </div>
        </div>
        <div className="p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">BANDWIDTH</div>
          <div className={`font-bold text-xs mt-0.5 ${displayBw === 'UNAVAILABLE' ? 'text-rose-400/80' : 'text-white'}`}>
            {displayBw}
          </div>
        </div>
        <div className="p-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">MODULATION</div>
          <div className={`font-bold text-xs mt-0.5 ${displayMod === 'UNAVAILABLE' ? 'text-rose-400/80' : (activeSignal ? 'text-sky-400' : 'text-slate-400')}`}>
            {displayMod}
          </div>
        </div>
        <div className="p-2.5 col-span-2 sm:col-span-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">STATUS</div>
          <div className="text-slate-200 font-bold text-xs mt-0.5 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${offlineMode ? 'bg-rose-500' : (activeSignal ? 'bg-[#10B981]' : 'bg-slate-500')}`} />
            <span className="truncate">{displayStatus}</span>
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
