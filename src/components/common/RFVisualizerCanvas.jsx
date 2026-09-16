import React, { useRef, useEffect } from 'react';
import StatusBadge from './StatusBadge';

export default function RFVisualizerCanvas({ 
  height = 240, 
  mode = 'combined', // 'fft', 'waterfall', 'combined'
  carrierFreq = '433.920 MHz',
  bandwidth = '420 kHz',
  snr = '18.7 dB',
  showLabel = true,
  className = ''
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    // Waterfall history buffer
    const waterfallRows = 40;
    const waterfallHistory = [];

    const render = () => {
      time += 0.04;
      const width = canvas.width;
      const h = canvas.height;

      // Ensure canvas internal dimensions match client size
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      ctx.fillStyle = '#040814';
      ctx.fillRect(0, 0, width, h);

      // Mode split
      const isCombined = mode === 'combined';
      const fftHeight = isCombined ? Math.floor(h * 0.58) : (mode === 'fft' ? h : 0);
      const waterfallTop = isCombined ? fftHeight : 0;
      const waterfallH = h - waterfallTop;

      // 1. Draw Subtle Grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
      ctx.lineWidth = 1;
      const gridCols = 8;
      for (let i = 1; i < gridCols; i++) {
        const x = (width / gridCols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, fftHeight);
        ctx.stroke();
      }
      const gridRows = 4;
      for (let i = 1; i < gridRows; i++) {
        const y = (fftHeight / gridRows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Synthesize FFT Spectrum Bins
      const bins = 120;
      const spectrumValues = [];
      const binWidth = width / bins;

      for (let i = 0; i < bins; i++) {
        const normX = i / bins;
        // Base thermal noise floor
        let noise = Math.sin(normX * 40 + time * 3) * 0.04 + Math.random() * 0.08 + 0.12;

        // Primary RF Carrier peak (centered around 0.45 - 0.55)
        const distFromCenter = Math.abs(normX - 0.5);
        const carrierSignal = Math.exp(-Math.pow(distFromCenter / 0.06, 2)) * 0.72;

        // Secondary harmonic sidebands (QPSK modulation envelope)
        const sideband1 = Math.exp(-Math.pow(Math.abs(normX - 0.32) / 0.03, 2)) * 0.22;
        const sideband2 = Math.exp(-Math.pow(Math.abs(normX - 0.68) / 0.03, 2)) * 0.22;

        // Dynamic pulsing modulation ripple
        const modulationRipple = Math.sin(time * 5 + i * 0.4) * 0.03 * (carrierSignal > 0.1 ? 1 : 0);

        const totalMagnitude = Math.min(1.0, noise + carrierSignal + sideband1 + sideband2 + modulationRipple);
        spectrumValues.push(totalMagnitude);
      }

      // Add to waterfall buffer
      waterfallHistory.unshift([...spectrumValues]);
      if (waterfallHistory.length > waterfallRows) {
        waterfallHistory.pop();
      }

      // 3. Render FFT Spectrum
      if (fftHeight > 0) {
        // Gradient fill under spectrum curve
        const grad = ctx.createLinearGradient(0, 0, 0, fftHeight);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
        grad.addColorStop(0.5, 'rgba(0, 102, 255, 0.18)');
        grad.addColorStop(1, 'rgba(4, 8, 20, 0.0)');

        ctx.beginPath();
        ctx.moveTo(0, fftHeight);

        for (let i = 0; i < bins; i++) {
          const x = i * binWidth;
          const val = spectrumValues[i];
          const y = fftHeight - (val * (fftHeight - 16));
          if (i === 0) ctx.lineTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.lineTo(width, fftHeight);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Stroke line on top of FFT
        ctx.beginPath();
        for (let i = 0; i < bins; i++) {
          const x = i * binWidth;
          const val = spectrumValues[i];
          const y = fftHeight - (val * (fftHeight - 16));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      // 4. Render Waterfall (Spectrogram)
      if (waterfallH > 0 && waterfallHistory.length > 0) {
        const rowHeight = waterfallH / waterfallRows;
        for (let r = 0; r < waterfallHistory.length; r++) {
          const rowData = waterfallHistory[r];
          const yPos = waterfallTop + (r * rowHeight);

          for (let b = 0; b < bins; b++) {
            const val = rowData[b];
            const xPos = b * binWidth;

            // Color map: deep navy (low) -> blue -> cyan -> bright amber/white (high power)
            let color;
            if (val < 0.22) {
              color = `rgba(5, 12, 30, ${0.4 + val})`;
            } else if (val < 0.45) {
              color = `rgba(0, 80, 200, ${val * 1.5})`;
            } else if (val < 0.7) {
              color = `rgba(0, 240, 255, ${val * 1.2})`;
            } else {
              color = `rgba(255, 230, 100, ${val})`;
            }

            ctx.fillStyle = color;
            ctx.fillRect(xPos, yPos, binWidth + 0.5, rowHeight + 0.5);
          }
        }

        // Waterfall / FFT divider line
        if (isCombined) {
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, waterfallTop);
          ctx.lineTo(width, waterfallTop);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode]);

  return (
    <div className={`relative rounded-lg overflow-hidden border border-signalx-border bg-signalx-panel ${className}`}>
      {/* Top telemetry bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-signalx-dark/80 border-b border-signalx-border/80 text-[11px] font-mono">
        <div className="flex items-center gap-3 text-slate-300">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            LIVE SPECTRUM
          </span>
          <span className="text-slate-400">CF: <span className="text-slate-200">{carrierFreq}</span></span>
          <span className="text-slate-400">SPAN: <span className="text-slate-200">{bandwidth}</span></span>
          <span className="text-slate-400">SNR: <span className="text-emerald-400">{snr}</span></span>
        </div>
        {showLabel && (
          <StatusBadge type="demo" label="DEMO VISUALIZATION" size="xs" />
        )}
      </div>

      {/* Canvas container */}
      <div style={{ height: `${height}px` }} className="relative w-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair"
          title="Simulated RF FFT & Waterfall Preview"
        />

        {/* FFT scale labels */}
        <div className="absolute right-2 top-2 pointer-events-none text-[10px] font-mono text-cyan-400/60 space-y-1">
          <div>-10 dBFS</div>
          <div>-30 dBFS</div>
          <div>-60 dBFS</div>
          <div>-90 dBFS</div>
        </div>
      </div>
    </div>
  );
}
