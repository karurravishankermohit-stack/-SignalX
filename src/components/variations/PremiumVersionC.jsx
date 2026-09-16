import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import GoogleLoginButton from '../common/GoogleLoginButton';
import { useScrollReveal } from '../hero/ScrollReveal';

/* ─── Version C: MISSION CONTROL ───────────────────────────────────
   Visual language: Dense, multi-panel, instrumentation layout.
   Feels like a real operations center display. Every pixel is
   purposeful. Compact panels packed with technical data.
   ──────────────────────────────────────────────────────────────── */

// Mini live spectrum canvas panel
function MiniSpectrumPanel({ accentColor = '#0EA5E9', label, height = 80 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#06080D';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(30,38,56,0.4)';
      ctx.lineWidth = 0.5;
      for (let g = 0; g < W; g += 24) {
        ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, H); ctx.stroke();
      }
      for (let g = 0; g < H; g += 16) {
        ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(W, g); ctx.stroke();
      }

      const t = tRef.current;
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, accentColor + '80');
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let px = 0; px <= W; px++) {
        const f = px / W;
        const peak = 0.6 * Math.exp(-Math.pow((f - 0.4) / 0.1, 2));
        const noise = 0.05 * Math.random();
        const anim = 0.04 * Math.sin(t + f * 8);
        const y = H - (peak + noise + anim) * (H - 8) - 4;
        px === 0 ? ctx.lineTo(0, y) : ctx.lineTo(px, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      for (let px = 0; px <= W; px++) {
        const f = px / W;
        const peak = 0.6 * Math.exp(-Math.pow((f - 0.4) / 0.1, 2));
        const noise = 0.05 * Math.random();
        const anim = 0.04 * Math.sin(t + f * 8);
        const y = H - (peak + noise + anim) * (H - 8) - 4;
        px === 0 ? ctx.moveTo(0, y) : ctx.lineTo(px, y);
      }
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // SYNTHETIC watermark
      ctx.fillStyle = 'rgba(100,116,139,0.2)';
      ctx.font = `7px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'right';
      ctx.fillText('SYNTHETIC', W - 3, H - 3);

      tRef.current += 0.018;
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [accentColor, height]);

  return (
    <div>
      {label && <div className="font-mono text-[8px] text-slate-500 mb-1">{label}</div>}
      <canvas ref={canvasRef} className="w-full block" style={{ height }} />
    </div>
  );
}

// Mini waterfall (color-coded 2D spectrum over time)
function MiniWaterfallPanel({ height = 80 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const bufferRef = useRef([]);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    const W = canvas.offsetWidth;
    const H = height;

    const draw = () => {
      const t = tRef.current;
      // Generate a new frequency row
      const row = Array.from({ length: W }, (_, px) => {
        const f = px / W;
        const peak = 0.7 * Math.exp(-Math.pow((f - 0.4) / 0.08, 2));
        const side = 0.3 * Math.exp(-Math.pow((f - 0.65) / 0.06, 2));
        const noise = 0.05 * Math.random();
        const anim = 0.05 * Math.sin(t * 0.5 + f * 6);
        return Math.min(1, peak + side + noise + anim);
      });

      bufferRef.current.push(row);
      if (bufferRef.current.length > H) bufferRef.current.shift();

      ctx.clearRect(0, 0, W, H);
      bufferRef.current.forEach((r, rowIdx) => {
        r.forEach((v, px) => {
          const intensity = Math.floor(v * 255);
          // color: low = deep blue, mid = cyan, high = yellow/white
          const r2 = Math.min(255, intensity * 1.5);
          const g2 = Math.min(255, intensity * 0.8);
          const b2 = Math.max(0, 180 - intensity);
          ctx.fillStyle = `rgb(${r2},${g2},${b2})`;
          ctx.fillRect(px, rowIdx, 1, 1);
        });
      });

      ctx.fillStyle = 'rgba(100,116,139,0.25)';
      ctx.font = `7px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'right';
      ctx.fillText('SYNTHETIC', W - 3, H - 3);

      tRef.current += 0.1;
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [height]);

  return (
    <div>
      <div className="font-mono text-[8px] text-slate-500 mb-1">WATERFALL — TIME-FREQUENCY</div>
      <canvas ref={canvasRef} className="w-full block" style={{ height }} />
    </div>
  );
}

// Compact telemetry gauge
function TelemetryValue({ label, value, unit, status, color = '#0EA5E9' }) {
  return (
    <div className="border border-[#1A2238] bg-[#06080D] p-2.5">
      <div className="font-mono text-[8px] text-slate-500 mb-1">{label}</div>
      <div className="font-mono font-bold text-sm leading-none" style={{ color }}>
        {value}
        <span className="text-[9px] text-slate-500 font-normal ml-1">{unit}</span>
      </div>
      {status && <div className="font-mono text-[8px] text-emerald-400 mt-1">{status}</div>}
    </div>
  );
}

// Mission log entry
function LogEntry({ time, level, message }) {
  const levelColor = level === 'OK' ? '#10B981' : level === 'WARN' ? '#F59E0B' : level === 'ERR' ? '#F87171' : '#64748B';
  return (
    <div className="flex items-start gap-2 py-1 border-b border-[#1A2238] font-mono text-[9px]">
      <span className="text-slate-600 shrink-0">{time}</span>
      <span className="shrink-0 font-bold w-8" style={{ color: levelColor }}>{level}</span>
      <span className="text-slate-300">{message}</span>
    </div>
  );
}

const MISSION_LOG = [
  { time: '06:24:11', level: 'OK', message: 'Signal ingestion complete — 2.1 MB IQ file loaded' },
  { time: '06:24:12', level: 'OK', message: 'FFT computed — 2048 points, Hann window applied' },
  { time: '06:24:12', level: 'OK', message: 'Peak detected at +124.3 kHz, –14.2 dBFS' },
  { time: '06:24:13', level: 'OK', message: 'BW estimated: 420 kHz · SNR: 18.7 dB' },
  { time: '06:24:13', level: 'OK', message: 'AMC classifier: QPSK (confidence 94.2%)' },
  { time: '06:24:14', level: 'WARN', message: 'Low SNR region detected below –60 dBFS' },
  { time: '06:24:14', level: 'OK', message: 'Demodulation: QPSK · Rs 9600 baud · EVM 4.3%rms' },
  { time: '06:24:15', level: 'OK', message: 'FEC: Viterbi rate 1/2 · CRC-16 check passed' },
  { time: '06:24:15', level: 'OK', message: 'Report generated — CASE-2026-000142' },
];

const MOD_CLASSES = [
  { name: 'BPSK', conf: 4, color: '#64748B' },
  { name: 'QPSK', conf: 94, color: '#10B981' },
  { name: '8PSK', conf: 1, color: '#64748B' },
  { name: '16QAM', conf: 1, color: '#64748B' },
  { name: '64QAM', conf: 0, color: '#64748B' },
  { name: 'FSK', conf: 0, color: '#64748B' },
  { name: 'AM-DSB', conf: 0, color: '#64748B' },
  { name: 'FM', conf: 0, color: '#64748B' },
];

const CAPABILITIES_MC = [
  { code: 'FFT', label: 'Spectral Analysis', spec: '2048 · 4096 · 8192 pt' },
  { code: 'WTF', label: 'Waterfall Display', spec: 'Time-frequency 2D map' },
  { code: 'AMC', label: 'Modulation Classification', spec: 'CNN · 14+ classes' },
  { code: 'CST', label: 'Constellation Mapping', spec: 'BPSK → 64QAM' },
  { code: 'DEM', label: 'Signal Demodulation', spec: 'Digital + Analog' },
  { code: 'FEC', label: 'Error Correction', spec: 'Viterbi · LDPC · Turbo' },
  { code: 'ILV', label: 'De-interleaving', spec: 'Block · Convolutional' },
  { code: 'RPT', label: 'Intelligence Report', spec: 'PDF · JSON · Confidence' },
];

export default function PremiumVersionC() {
  const [entered, setEntered] = useState(false);
  const pageRef = useRef(null);
  useScrollReveal(pageRef);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen bg-[#06080D] text-slate-200 font-sans overflow-x-hidden">
      <Header />

      {/* ── MISSION CONTROL HERO ─────────────────────────────────── */}
      <section id="platform" className="pt-14 border-b border-[#1A2238]">

        {/* Top status bar */}
        <div className="bg-[#090C13] border-b border-[#1A2238] px-4 sm:px-8 py-1.5 flex items-center justify-between font-mono text-[9px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="text-[#0EA5E9] font-bold">SIGNALX MISSION CONTROL</span>
            <span className="hidden sm:inline">SESSION: CASE-2026-000142</span>
            <span className="hidden md:inline">ANALYST: AUTHORIZED</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400">● ALL SYSTEMS NOMINAL</span>
            <span className="hidden sm:inline">SIH26147</span>
          </div>
        </div>

        {/* Hero 3-column layout */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-0 transition-all duration-700"
          style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(16px)' }}
        >
          {/* LEFT PANEL: Identity + Actions */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#1A2238] p-6 sm:p-8 flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="editorial-label text-[#0EA5E9] mb-6">RF SIGNAL INTELLIGENCE PLATFORM</div>
              <h1 className="editorial-heading text-[clamp(36px,5vw,64px)] text-white mb-6 leading-none">
                MISSION<br />CONTROL.
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                Automated RF signal intelligence. Real DSP processing.
                Full explainability from raw IQ to structured report.
              </p>
              <div className="flex flex-col gap-3">
                <GoogleLoginButton size="md" variant="primary" label="Authorize Access" />
                <a
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 font-mono text-xs font-semibold text-slate-300 border border-[#253044] hover:border-[#3A4D6A] rounded-sm transition-colors"
                >
                  <span className="text-[#0EA5E9]">▶</span> OPEN DEMO STATION
                </a>
              </div>
            </div>
            <div className="pt-6 border-t border-[#1A2238] grid grid-cols-2 gap-2">
              <TelemetryValue label="PROCESSING" value="REAL" unit="DSP" status="ACTIVE" />
              <TelemetryValue label="INPUT FORMAT" value="IQ/WAV" unit="FILE" />
              <TelemetryValue label="MOD CLASSES" value="14+" unit="types" color="#F59E0B" />
              <TelemetryValue label="OUTPUTS" value="100%" unit="expl." color="#10B981" />
            </div>
          </div>

          {/* CENTER PANEL: Spectrum + Waterfall */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#1A2238] p-4 flex flex-col gap-3">
            <MiniSpectrumPanel label="FFT SPECTRUM — 2048 PT — dBFS vs kHz" height={100} accentColor="#0EA5E9" />
            <MiniWaterfallPanel height={90} />
            <MiniSpectrumPanel label="SIDEBAND DETAIL — ZOOM ×4" height={70} accentColor="#10B981" />
          </div>

          {/* RIGHT PANEL: Live Analysis Log */}
          <div className="lg:col-span-3 p-4 flex flex-col">
            <div className="editorial-label text-slate-500 mb-3">ANALYSIS LOG — LIVE</div>
            <div className="flex-1 space-y-0 overflow-hidden">
              {MISSION_LOG.map((entry, i) => (
                <LogEntry key={i} {...entry} />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 font-mono text-[9px] text-slate-500">
              <span className="anim-pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              READY FOR NEXT UPLOAD
            </div>
          </div>
        </div>
      </section>

      {/* ── CLASSIFIER PANEL ─────────────────────────────────────── */}
      <section className="border-b border-[#1A2238] bg-[#090C13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <div className="reveal-on-scroll grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="editorial-label text-[#F59E0B] mb-4">MODULATION CLASSIFIER</div>
              <h2 className="editorial-heading text-[clamp(28px,4vw,52px)] text-white mb-6">
                FROM SIGNAL<br />TO CLASS.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                CNN-based Automatic Modulation Classification. 14+ modulation types.
                Confidence scores derived from classifier output — not fixed thresholds.
              </p>
              <div className="font-mono text-xs space-y-1">
                <div className="flex justify-between border-b border-[#1A2238] pb-1.5 text-slate-500">
                  <span>CLASS</span>
                  <span>CONFIDENCE</span>
                </div>
                {MOD_CLASSES.map((mod) => (
                  <div key={mod.name} className="flex items-center gap-3 py-1">
                    <span className="w-14 text-slate-300">{mod.name}</span>
                    <div className="flex-1 h-1.5 bg-[#1A2238] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${mod.conf}%`, background: mod.color }}
                      />
                    </div>
                    <span style={{ color: mod.color }} className="w-10 text-right">{mod.conf}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 editorial-label text-slate-600">SYNTHETIC PREVIEW — DEMO SIGNAL</div>
            </div>
            <div>
              <div className="editorial-label text-slate-500 mb-4">DETECTED: QPSK — CONFIDENCE 94.2%</div>
              <div className="border border-[#1A2238] p-4 bg-[#06080D] mb-4">
                <div className="font-mono text-xs space-y-2">
                  {[
                    { k: 'CENTER FREQUENCY', v: '+124.3 kHz', c: '#0EA5E9' },
                    { k: 'BANDWIDTH', v: '420 kHz', c: '#0EA5E9' },
                    { k: 'SNR', v: '18.7 dB', c: '#10B981' },
                    { k: 'SYMBOL RATE', v: '9600 baud', c: '#F59E0B' },
                    { k: 'EVM', v: '4.3 %rms', c: '#F59E0B' },
                    { k: 'PHASE OFFSET', v: '45.0°', c: '#A78BFA' },
                    { k: 'MODULATION', v: 'QPSK', c: '#10B981' },
                    { k: 'FEC', v: 'VITERBI 1/2', c: '#10B981' },
                    { k: 'CRC', v: 'CRC-16 OK', c: '#10B981' },
                  ].map(({ k, v, c }) => (
                    <div key={k} className="flex justify-between border-b border-[#1A2238] pb-1.5">
                      <span className="text-slate-500">{k}</span>
                      <span style={{ color: c }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 editorial-label text-slate-600">SYNTHETIC PREVIEW</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES MATRIX ──────────────────────────────────── */}
      <section id="capabilities" className="py-16 border-b border-[#1A2238]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="reveal-on-scroll mb-10">
            <div className="editorial-label text-[#0EA5E9] mb-4">PLATFORM CAPABILITIES</div>
            <h2 className="editorial-heading text-[clamp(28px,4vw,52px)] text-white">
              FULL SPECTRUM<br />CAPABILITIES.
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px border border-[#1A2238]">
            {CAPABILITIES_MC.map((cap) => (
              <div key={cap.code} className="reveal-on-scroll bg-[#06080D] hover:bg-[#0B1420] transition-colors p-4 border-r last:border-r-0 border-[#1A2238] group">
                <div className="font-mono text-[10px] font-bold text-[#0EA5E9] mb-2 group-hover:text-sky-300 transition-colors">
                  {cap.code}
                </div>
                <div className="font-mono text-[9px] text-slate-300 mb-1 font-semibold">{cap.label}</div>
                <div className="editorial-label text-[8px]">{cap.spec}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECHNICAL HONESTY ────────────────────────────────────── */}
      <section id="trust" className="py-16 border-b border-[#1A2238] bg-[#090C13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="reveal-on-scroll grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4">
              <div className="editorial-label text-[#F87171] mb-4">SYSTEM INTEGRITY</div>
              <h2 className="editorial-heading text-[clamp(24px,3.5vw,44px)] text-white">
                NO BLACK<br />BOX. EVER.
              </h2>
            </div>
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-[#1A2238]">
                {[
                  { label: 'REAL COMPUTATION', desc: 'FFT, energy detection, parameter measurement — computed on your actual signal file.', color: '#10B981', icon: '✓' },
                  { label: 'SYNTHETIC LABELED', desc: 'All homepage visualizations are clearly labeled SYNTHETIC PREVIEW. Not live RF data.', color: '#F59E0B', icon: '⚠' },
                  { label: 'LIMITS REPORTED', desc: 'Low SNR degrades accuracy. Encrypted signals cannot be decoded. Stated alongside results.', color: '#F87171', icon: '!' },
                ].map(({ label, desc, color, icon }) => (
                  <div key={label} className="bg-[#06080D] p-5">
                    <div className="w-6 h-6 flex items-center justify-center border mb-4 font-mono text-xs font-bold" style={{ borderColor: color, color }}>
                      {icon}
                    </div>
                    <div className="editorial-label mb-2" style={{ color }}>{label}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="py-24 border-b border-[#1A2238]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="reveal-on-scroll flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <div className="editorial-label text-[#0EA5E9] mb-4">AUTHORIZED ANALYST ACCESS</div>
              <h2 className="editorial-heading text-[clamp(32px,5vw,72px)] text-white">
                READY TO READ<br />THE SIGNAL?
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <GoogleLoginButton size="lg" variant="primary" label="Begin Mission" />
              <a href="/demo" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 font-mono text-xs font-semibold border border-[#253044] hover:border-[#3A4D6A] text-slate-300 rounded-sm transition-colors">
                DEMO STATION
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
