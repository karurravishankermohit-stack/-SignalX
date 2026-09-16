import React, { useState, useEffect, useRef } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import GoogleLoginButton from '../common/GoogleLoginButton';
import CinematicHeroCanvas from '../hero/CinematicHeroCanvas';
import ConstellationViewer from '../hero/ConstellationViewer';
import { useScrollReveal } from '../hero/ScrollReveal';

/* ─── Version A: CINEMATIC RF ─────────────────────────────────────
   Visual language: Very large, immersive, dark. Signal visualization
   dominates the hero. Typography is massive and editorial.
   Entrance animation reveals the interface like a scope powering on.
   ──────────────────────────────────────────────────────────────── */

const PIPELINE_STAGES = [
  { id: '01', label: 'INGEST', detail: 'IQ / WAV / SDR stream', color: '#0EA5E9' },
  { id: '02', label: 'PREPROCESS', detail: 'Normalization · DC offset · AGC', color: '#0EA5E9' },
  { id: '03', label: 'FFT', detail: '2048-point DFT · windowing', color: '#38BDF8' },
  { id: '04', label: 'DETECT', detail: 'Energy · matched filter · CFAR', color: '#38BDF8' },
  { id: '05', label: 'ESTIMATE', detail: 'fc · BW · SNR · phase offset', color: '#6EE7B7' },
  { id: '06', label: 'CLASSIFY', detail: 'CNN feature extraction · AMC', color: '#6EE7B7' },
  { id: '07', label: 'DEMOD', detail: 'BPSK · QPSK · QAM · FSK · AM · FM', color: '#FCD34D' },
  { id: '08', label: 'FEC', detail: 'Viterbi · Turbo · LDPC · CRC', color: '#FCD34D' },
  { id: '09', label: 'DECODE', detail: 'Bitstream · framing · protocol', color: '#F87171' },
  { id: '10', label: 'CORRELATE', detail: 'Cross-session · history · pattern', color: '#F87171' },
  { id: '11', label: 'REPORT', detail: 'PDF · JSON · confidence scores', color: '#C084FC' },
];

const STORY_SECTIONS = [
  {
    label: 'STAGE 01 — RAW SIGNAL',
    heading: 'IT STARTS\nWITH RAW DATA.',
    body: 'You upload a .IQ or .WAV file recorded from any SDR, spectrum analyzer, or signal capture system. No proprietary hardware. No vendor lock-in. SignalX reads your signal exactly as captured.',
    metric: { value: '≤ 2 GB', label: 'Max file size / session' },
    accent: '#0EA5E9',
  },
  {
    label: 'STAGE 02–05 — SIGNAL PROCESSING',
    heading: 'TURN SAMPLES\nINTO SIGNAL.',
    body: 'FFT, spectral density estimation, energy detection, parameter extraction — all computed with real DSP algorithms on your actual data. No pretend analysis. No fake confidence scores.',
    metric: { value: '2048pt', label: 'FFT resolution (configurable)' },
    accent: '#10B981',
  },
  {
    label: 'STAGE 06 — CLASSIFICATION',
    heading: 'FROM SIGNAL\nTO STRUCTURE.',
    body: 'Automatic Modulation Classification identifies BPSK, QPSK, QAM variants, FSK, AM, FM and more using CNN feature extraction trained on real signal datasets — not synthetically hallucinated data.',
    metric: { value: '14+', label: 'Modulation classes' },
    accent: '#F59E0B',
  },
  {
    label: 'STAGE 07–09 — DEMODULATION',
    heading: 'TURN SIGNAL\nINTO DATA.',
    body: 'After classification, SignalX demodulates the signal and attempts FEC decoding — Viterbi, Turbo, LDPC, CRC — extracting the actual bitstream where the modulation parameters allow.',
    metric: { value: '6+', label: 'FEC schemes supported' },
    accent: '#A78BFA',
  },
  {
    label: 'STAGE 10–11 — INTELLIGENCE',
    heading: 'EVERY RESULT\nNEEDS EVIDENCE.',
    body: 'Every classification comes with confidence score, signal evidence, physical parameter constraints, and explicit limitations. No black box. No fabricated results. Every conclusion is traceable.',
    metric: { value: '100%', label: 'Explainable outputs' },
    accent: '#F87171',
  },
];

const CAPABILITIES = [
  { code: 'FFT / PSD', label: 'Frequency analysis', note: '2048 · 4096 · 8192 point' },
  { code: 'WATERFALL', label: 'Temporal spectrum cascade', note: 'Time-frequency 2D map' },
  { code: 'AMC', label: 'Auto modulation classification', note: 'CNN · 14+ classes' },
  { code: 'CONSTELLATION', label: 'I/Q symbol mapping', note: 'BPSK → 64QAM' },
  { code: 'DEMOD', label: 'Signal demodulation', note: 'Digital + Analog modes' },
  { code: 'FEC', label: 'Error correction decoding', note: 'Viterbi · LDPC · Turbo' },
  { code: 'INTERLEAVING', label: 'De-interleaving analysis', note: 'Block · convolutional' },
  { code: 'REPORT', label: 'Explainable reports', note: 'PDF · JSON · confidence' },
];

const MOD_TABS = ['BPSK', 'QPSK', '16QAM', '64QAM'];

function SpectrumBars({ accentColor }) {
  const bars = Array.from({ length: 80 }, (_, i) => {
    const h = 15 + Math.random() * 75;
    return { h, delay: Math.random() * 1.5, dur: 0.8 + Math.random() * 0.8 };
  });
  return (
    <div className="flex items-end gap-px h-24 w-full">
      {bars.map((b, i) => (
        <div
          key={i}
          className="flex-1 spectrum-bar"
          style={{
            height: `${b.h}%`,
            background: `${accentColor}${Math.floor(80 + b.h * 1.5).toString(16).padStart(2,'0')}`,
            '--dur': `${b.dur}s`,
            '--delay': `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function PremiumVersionA() {
  const [entered, setEntered] = useState(false);
  const [activeModTab, setActiveModTab] = useState('QPSK');
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const pageRef = useRef(null);
  useScrollReveal(pageRef);

  // Entrance animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen bg-[#06080D] text-slate-200 font-sans overflow-x-hidden">
      <Header />

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section id="platform" className="relative min-h-screen flex flex-col justify-center pt-14 overflow-hidden">

        {/* Cinematic entrance: opacity + translateY */}
        <div
          className="w-full transition-all duration-700 ease-out"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          {/* Top system bar */}
          <div className="border-b border-[#1A2238] bg-[#090C13] px-4 sm:px-8 py-2 flex items-center justify-between font-mono text-[10px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="text-[#0EA5E9] font-bold">SIGNALX / RF INTELLIGENCE PLATFORM</span>
              <span className="hidden sm:inline">RECEIVER: NTRO-ALPHA (28.61°N, 77.20°E)</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-emerald-400 font-semibold">● SYSTEM READY</span>
              <span className="hidden sm:inline">SIH26147</span>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-8">
            {/* Eyebrow */}
            <div
              className="flex items-center gap-3 mb-8 transition-all duration-500"
              style={{
                opacity: entered ? 1 : 0,
                transform: entered ? 'translateY(0)' : 'translateY(12px)',
                transitionDelay: '0.1s',
              }}
            >
              <span className="w-5 h-px bg-[#0EA5E9]" />
              <span className="editorial-label text-[#0EA5E9]">Automated RF Signal Intelligence</span>
            </div>

            {/* Main hero heading — massive editorial type */}
            <div
              className="overflow-hidden mb-8"
              style={{
                transition: 'all 0.7s ease',
                transitionDelay: '0.2s',
                opacity: entered ? 1 : 0,
                transform: entered ? 'translateY(0)' : 'translateY(32px)',
              }}
            >
              <h1 className="editorial-heading text-[clamp(48px,8vw,120px)] text-white">
                READ THE
                <span className="block text-[#0EA5E9]">SIGNAL.</span>
              </h1>
            </div>

            <div
              className="max-w-xl mb-10"
              style={{
                transition: 'all 0.7s ease',
                transitionDelay: '0.35s',
                opacity: entered ? 1 : 0,
                transform: entered ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                From raw IQ and WAV files to explainable signal intelligence.
                Real DSP processing. No black boxes.
              </p>
            </div>

            <div
              className="flex flex-wrap gap-3 mb-14"
              style={{
                transition: 'all 0.6s ease',
                transitionDelay: '0.45s',
                opacity: entered ? 1 : 0,
                transform: entered ? 'translateY(0)' : 'translateY(16px)',
              }}
            >
              <GoogleLoginButton size="lg" variant="primary" label="Start Analysis" />
              <a
                href="/demo"
                className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs font-semibold text-slate-200 bg-transparent hover:bg-[#131826] border border-[#253044] hover:border-[#3A4D6A] rounded-sm transition-colors"
              >
                <span className="text-[#0EA5E9]">▶</span>
                <span>EXPLORE DEMO</span>
              </a>
            </div>
          </div>

          {/* Full-width spectrum canvas */}
          <div
            className="w-full border-t border-b border-[#1A2238] bg-[#06080D]"
            style={{
              transition: 'all 0.8s ease',
              transitionDelay: '0.55s',
              opacity: entered ? 1 : 0,
            }}
          >
            <div className="max-w-7xl mx-auto">
              <CinematicHeroCanvas height={260} accentColor="#0EA5E9" />
            </div>
          </div>

          {/* Stat strip below canvas */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-5 pb-16">
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-px border border-[#1A2238] rounded-sm overflow-hidden"
              style={{
                transition: 'all 0.6s ease',
                transitionDelay: '0.7s',
                opacity: entered ? 1 : 0,
              }}
            >
              {[
                { v: 'IQ / WAV', l: 'Input format' },
                { v: 'REAL DSP', l: 'Processing engine' },
                { v: '14+', l: 'Modulation classes' },
                { v: '100%', l: 'Explainable outputs' },
              ].map(({ v, l }) => (
                <div key={l} className="bg-[#090C13] px-4 py-3 border-r last:border-r-0 border-[#1A2238]">
                  <div className="font-mono text-[11px] text-slate-400">{l}</div>
                  <div className="font-mono font-bold text-sm text-[#0EA5E9] mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SCROLL STORY ────────────────────────────────────────── */}
      <section id="pipeline" className="py-24 border-t border-[#1A2238] bg-[#06080D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Section header */}
          <div className="reveal-on-scroll mb-20">
            <div className="editorial-label text-[#0EA5E9] mb-4">ANALYSIS PIPELINE</div>
            <h2 className="editorial-heading text-[clamp(32px,5vw,72px)] text-white">
              HOW SIGNALX<br />WORKS.
            </h2>
          </div>

          {STORY_SECTIONS.map((section, idx) => (
            <div
              key={idx}
              className="reveal-on-scroll grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32 last:mb-0"
            >
              <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="editorial-label mb-3" style={{ color: section.accent }}>
                  {section.label}
                </div>
                <h3
                  className="editorial-heading text-[clamp(28px,4vw,56px)] text-white mb-6 whitespace-pre-line"
                >
                  {section.heading}
                </h3>
                <p className="text-slate-300 leading-relaxed mb-8 max-w-md">
                  {section.body}
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono font-bold text-3xl" style={{ color: section.accent }}>
                    {section.metric.value}
                  </span>
                  <span className="editorial-label">{section.metric.label}</span>
                </div>
              </div>
              <div className={`${idx % 2 === 1 ? 'lg:order-1' : ''} p-4 border border-[#1A2238] bg-[#090C13] rounded-sm`}>
                {idx === 0 && (
                  <div>
                    <div className="editorial-label mb-3">RAW SIGNAL PREVIEW</div>
                    <div className="h-32 flex items-end gap-0.5 overflow-hidden">
                      {Array.from({ length: 200 }, (_, i) => {
                        const amp = 0.1 + 0.9 * Math.abs(Math.sin(i * 0.18) * Math.cos(i * 0.07));
                        return (
                          <div
                            key={i}
                            className="flex-1 bg-[#0EA5E9]"
                            style={{ height: `${amp * 100}%`, opacity: 0.6 + amp * 0.4 }}
                          />
                        );
                      })}
                    </div>
                    <div className="editorial-label mt-3 text-center">WAVEFORM — 1024 SAMPLES — SYNTHETIC PREVIEW</div>
                  </div>
                )}
                {idx === 1 && (
                  <div>
                    <div className="editorial-label mb-3">SPECTRUM ANALYSIS</div>
                    <SpectrumBars accentColor="#10B981" />
                    <div className="editorial-label mt-3 text-center">FFT OUTPUT — SYNTHETIC PREVIEW</div>
                  </div>
                )}
                {idx === 2 && (
                  <div className="flex flex-col items-center">
                    <div className="editorial-label mb-3">CONSTELLATION — QPSK</div>
                    <ConstellationViewer modulation="QPSK" size={200} />
                    <div className="editorial-label mt-2">SYNTHETIC PREVIEW</div>
                  </div>
                )}
                {idx === 3 && (
                  <div className="font-mono text-xs">
                    <div className="editorial-label mb-3">DEMODULATION OUTPUT</div>
                    <div className="text-emerald-400 mb-2">DETECTED: QPSK · 9600 bps</div>
                    <div className="text-[#1A2238] mb-2">────────────────────────</div>
                    <div className="text-slate-300">BITSTREAM: 01101001 11010011</div>
                    <div className="text-slate-300">           10010110 01001101</div>
                    <div className="text-slate-300">           11101000 00110101</div>
                    <div className="text-[#1A2238] my-2">────────────────────────</div>
                    <div className="text-amber-400">FEC: VITERBI RATE 1/2 · CRC-16 OK</div>
                    <div className="editorial-label mt-3">SYNTHETIC PREVIEW</div>
                  </div>
                )}
                {idx === 4 && (
                  <div className="font-mono text-xs space-y-2">
                    <div className="editorial-label mb-3">EXPLAINABILITY PANEL</div>
                    {[
                      { label: 'CLASSIFICATION', value: 'QPSK', confidence: 94, color: '#10B981' },
                      { label: 'EVIDENCE', value: '4 symbol clusters · phase offset 45°', confidence: null, color: '#0EA5E9' },
                      { label: 'CONFIDENCE', value: '94.2%', confidence: 94, color: '#F59E0B' },
                      { label: 'LIMITATIONS', value: 'Low SNR may reduce accuracy', confidence: null, color: '#F87171' },
                    ].map(({ label, value, confidence, color }) => (
                      <div key={label} className="flex items-start gap-3 border-b border-[#1A2238] pb-2">
                        <span className="text-slate-500 w-24 shrink-0">{label}</span>
                        <div className="flex-1">
                          <div style={{ color }}>{value}</div>
                          {confidence !== null && (
                            <div className="mt-1 h-1 bg-[#1A2238] rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${confidence}%`, background: color }} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="editorial-label mt-2">SYNTHETIC PREVIEW</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CAPABILITIES ────────────────────────────────────────── */}
      <section id="capabilities" className="py-24 border-t border-[#1A2238] bg-[#090C13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="reveal-on-scroll grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
            <div className="lg:col-span-1">
              <div className="editorial-label text-[#0EA5E9] mb-4">CAPABILITIES</div>
              <h2 className="editorial-heading text-[clamp(28px,3.5vw,52px)] text-white mb-6">
                FULL<br />SPECTRUM<br />ANALYSIS.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every analysis tool is backed by real DSP algorithms.
                No decorative charts. No hallucinated outputs.
              </p>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-px border border-[#1A2238]">
              {CAPABILITIES.map((cap) => (
                <div key={cap.code} className="reveal-on-scroll p-5 bg-[#06080D] border-b border-r border-[#1A2238] hover:bg-[#0C1019] transition-colors group">
                  <div className="font-mono text-xs font-bold text-[#0EA5E9] mb-1.5 group-hover:text-sky-300 transition-colors">
                    {cap.code}
                  </div>
                  <div className="text-sm text-slate-200 mb-1">{cap.label}</div>
                  <div className="editorial-label">{cap.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONSTELLATION SHOWCASE ──────────────────────────────── */}
      <section className="py-24 border-t border-[#1A2238] bg-[#06080D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="reveal-on-scroll mb-12">
            <div className="editorial-label text-[#F59E0B] mb-4">CONSTELLATION ANALYSIS</div>
            <h2 className="editorial-heading text-[clamp(28px,4vw,60px)] text-white">
              FIND THE<br />STRUCTURE.
            </h2>
          </div>
          <div className="reveal-on-scroll grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-slate-300 leading-relaxed mb-8">
                After classification, SignalX maps the I/Q symbol space to identify
                the modulation constellation. Each cluster corresponds to a discrete
                symbol. Cluster spread reveals noise and channel impairments.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {MOD_TABS.map((mod) => (
                  <button
                    key={mod}
                    onClick={() => setActiveModTab(mod)}
                    className={`font-mono text-xs px-3 py-1.5 border rounded-xs transition-colors ${
                      activeModTab === mod
                        ? 'bg-[#0EA5E9]/15 border-[#0EA5E9] text-[#0EA5E9]'
                        : 'border-[#253044] text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {mod}
                  </button>
                ))}
              </div>
              <div className="font-mono text-xs space-y-2 text-slate-300">
                <div className="flex justify-between border-b border-[#1A2238] pb-2">
                  <span className="text-slate-500">MODULATION</span>
                  <span className="text-[#0EA5E9]">{activeModTab}</span>
                </div>
                <div className="flex justify-between border-b border-[#1A2238] pb-2">
                  <span className="text-slate-500">SYMBOLS</span>
                  <span>{activeModTab === 'BPSK' ? 2 : activeModTab === 'QPSK' ? 4 : activeModTab === '16QAM' ? 16 : 64}</span>
                </div>
                <div className="flex justify-between border-b border-[#1A2238] pb-2">
                  <span className="text-slate-500">BITS/SYMBOL</span>
                  <span>{activeModTab === 'BPSK' ? 1 : activeModTab === 'QPSK' ? 2 : activeModTab === '16QAM' ? 4 : 6}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="border border-[#1A2238] bg-[#06080D] p-4">
                <ConstellationViewer modulation={activeModTab} size={280} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HONESTY / TRUST ─────────────────────────────────────── */}
      <section id="trust" className="py-24 border-t border-[#1A2238] bg-[#090C13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="reveal-on-scroll mb-12">
            <div className="editorial-label text-[#F87171] mb-4">TECHNICAL HONESTY</div>
            <h2 className="editorial-heading text-[clamp(28px,4vw,56px)] text-white">
              NO BLACK BOX.<br />NO FABRICATED<br />RESULTS.
            </h2>
          </div>
          <div className="reveal-on-scroll grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <p className="text-slate-300 leading-relaxed mb-8">
                Every SignalX output declares what is real computation and what is not.
                Confidence scores are derived from algorithm outputs, not generated.
                Limitations are documented alongside results.
              </p>
              <div className="border border-[#1A2238] overflow-hidden rounded-xs">
                <table className="w-full font-mono text-xs">
                  <thead>
                    <tr className="bg-[#06080D] border-b border-[#1A2238]">
                      <th className="px-4 py-2.5 text-left text-slate-400">Feature</th>
                      <th className="px-4 py-2.5 text-center text-emerald-400">SignalX</th>
                      <th className="px-4 py-2.5 text-center text-[#1A2238]">Demo Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['FFT computation', '✓', '✓'],
                      ['Real signal data', '✓', '✗'],
                      ['Modulation classification', '✓', 'Simulated'],
                      ['Demodulation output', '✓', '✗'],
                      ['Confidence scores', 'Real', 'Canned'],
                      ['Explainability', 'Full', 'Partial'],
                    ].map(([feat, signalx, demo], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-[#06080D]' : 'bg-[#090C13]'}>
                        <td className="px-4 py-2 text-slate-300">{feat}</td>
                        <td className="px-4 py-2 text-center text-emerald-400">{signalx}</td>
                        <td className={`px-4 py-2 text-center ${demo === '✓' ? 'text-emerald-400' : demo === '✗' ? 'text-[#F87171]' : 'text-amber-400'}`}>{demo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-5 border border-[#1A2238] bg-[#06080D]">
                <div className="editorial-label text-emerald-400 mb-2">REAL COMPUTATION</div>
                <p className="text-sm text-slate-300">
                  FFT, spectral estimation, energy detection, parameter measurement —
                  computed from your actual uploaded signal file.
                </p>
              </div>
              <div className="p-5 border border-[#1A2238] bg-[#06080D]">
                <div className="editorial-label text-amber-400 mb-2">SYNTHETIC PREVIEW</div>
                <p className="text-sm text-slate-300">
                  All homepage visualizations are mathematically generated examples,
                  not live signal data. Labeled clearly in every display.
                </p>
              </div>
              <div className="p-5 border border-[#1A2238] bg-[#06080D]">
                <div className="editorial-label text-[#F87171] mb-2">LIMITATIONS DOCUMENTED</div>
                <p className="text-sm text-slate-300">
                  Low SNR degrades classification accuracy. Encrypted signals cannot be decoded.
                  All limitations are reported alongside results, never hidden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="py-32 border-t border-[#1A2238] bg-[#06080D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
          <div className="reveal-on-scroll">
            <div className="editorial-label text-[#0EA5E9] mb-6">READY TO START</div>
            <h2 className="editorial-heading text-[clamp(40px,7vw,100px)] text-white mb-8">
              READY TO READ<br />THE SIGNAL?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
              Upload your IQ or WAV file and receive a full explainable RF signal intelligence report.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <GoogleLoginButton size="lg" variant="primary" label="Begin Analysis" />
              <a href="/demo" className="inline-flex items-center gap-2 px-6 py-2.5 font-mono text-xs font-semibold text-slate-300 border border-[#253044] hover:border-slate-500 rounded-sm transition-colors">
                EXPLORE DEMO
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
