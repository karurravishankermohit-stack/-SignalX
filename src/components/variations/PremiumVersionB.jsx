import React, { useState, useRef, useEffect } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import GoogleLoginButton from '../common/GoogleLoginButton';
import ConstellationViewer from '../hero/ConstellationViewer';
import { useScrollReveal } from '../hero/ScrollReveal';

/* ─── Version B: EDITORIAL ENGINEERING ─────────────────────────────
   Visual language: Large whitespace, extreme typography, technical
   diagrams, minimal decoration. Feels like an engineering journal
   or premium technical publication — serious and purposeful.
   ──────────────────────────────────────────────────────────────── */

const PIPELINE_NODES = [
  { id: '01', code: 'ING', name: 'INGEST', sub: 'IQ · WAV · SDR' },
  { id: '02', code: 'PRE', name: 'PREPROCESS', sub: 'Norm · DC · AGC' },
  { id: '03', code: 'FFT', name: 'TRANSFORM', sub: '2048-pt DFT' },
  { id: '04', code: 'DET', name: 'DETECT', sub: 'CFAR · matched filter' },
  { id: '05', code: 'EST', name: 'ESTIMATE', sub: 'fc · BW · SNR' },
  { id: '06', code: 'AMC', name: 'CLASSIFY', sub: 'CNN · 14+ classes' },
  { id: '07', code: 'DEM', name: 'DEMODULATE', sub: 'BPSK · QAM · FSK' },
  { id: '08', code: 'FEC', name: 'DECODE', sub: 'Viterbi · LDPC' },
  { id: '09', code: 'RPT', name: 'REPORT', sub: 'PDF · JSON · scores' },
];

const ANALYSIS_CAPABILITIES = [
  {
    num: '01',
    title: 'Spectral Analysis',
    desc: 'FFT-based power spectral density with configurable window functions, frequency resolution, and dBFS-calibrated amplitude axis.',
    tags: ['FFT', 'PSD', 'WATERFALL'],
  },
  {
    num: '02',
    title: 'Modulation Classification',
    desc: 'CNN-based automatic modulation classification across 14+ classes. BPSK, QPSK, 8PSK, 16QAM, 64QAM, FSK, AM, FM, and more.',
    tags: ['AMC', 'CNN', '14+ CLASSES'],
  },
  {
    num: '03',
    title: 'Signal Demodulation',
    desc: 'Full demodulation chain for digital and analog modes. Phase, frequency, amplitude recovery with configurable symbol rate estimation.',
    tags: ['DIGITAL', 'ANALOG', 'SYMBOL SYNC'],
  },
  {
    num: '04',
    title: 'Error Correction Analysis',
    desc: 'FEC decoding with Viterbi, Turbo codes, LDPC, CRC-16/32. Bit error rate estimation. Frame synchronization and de-interleaving.',
    tags: ['VITERBI', 'LDPC', 'CRC'],
  },
  {
    num: '05',
    title: 'Explainable Intelligence',
    desc: 'Every output includes confidence score, signal evidence, physical parameter bounds, and explicit documented limitations. No black box.',
    tags: ['CONFIDENCE', 'EVIDENCE', 'LIMITATIONS'],
  },
  {
    num: '06',
    title: 'Structured Reporting',
    desc: 'Machine-readable JSON and human-readable PDF reports with full parameter tables, constellation plots, and decision rationale.',
    tags: ['PDF', 'JSON', 'API'],
  },
];

const PARAM_TABLE = [
  { param: 'Center Frequency', symbol: 'fc', unit: 'MHz', bound: 'Physical RF constraint' },
  { param: 'Bandwidth', symbol: 'BW', unit: 'kHz', bound: '≤ SDR sample rate / 2' },
  { param: 'SNR', symbol: 'SNR', unit: 'dB', bound: 'Noise floor limited' },
  { param: 'Symbol Rate', symbol: 'Rs', unit: 'baud', bound: 'Nyquist: Rs ≤ BW' },
  { param: 'Modulation Index', symbol: 'h', unit: '—', bound: 'FSK specific' },
  { param: 'Phase Offset', symbol: 'φ₀', unit: 'rad', bound: '± π' },
  { param: 'EVM', symbol: 'EVM', unit: '%rms', bound: 'Constellation error metric' },
  { param: 'PAPR', symbol: 'PAPR', unit: 'dB', bound: 'Multi-carrier signals' },
];

function MarqueeTagline() {
  const items = [
    'FFT ANALYSIS', '·', 'MODULATION CLASSIFICATION', '·',
    'DEMODULATION', '·', 'FEC DECODING', '·', 'EXPLAINABLE OUTPUTS', '·',
    'IQ FILE PROCESSING', '·', 'WAV FILE PROCESSING', '·', 'REAL DSP ENGINE', '·',
  ];
  return (
    <div className="overflow-hidden border-y border-[#1A2238] bg-[#090C13] py-3">
      <div className="flex gap-8 marquee-track whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className={`font-mono text-xs ${item === '·' ? 'text-[#253044]' : 'text-slate-400'}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function PipelineDiagram() {
  return (
    <div className="overflow-x-auto py-2">
      <div className="flex items-center gap-0 min-w-max">
        {PIPELINE_NODES.map((node, i) => (
          <React.Fragment key={node.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div className="font-mono text-[9px] text-slate-500">{node.id}</div>
              <div className="px-3 py-2 border border-[#253044] bg-[#090C13] hover:border-[#0EA5E9] hover:bg-[#0B1220] transition-colors group cursor-default">
                <div className="font-mono text-[8px] font-bold text-[#0EA5E9] group-hover:text-sky-300 mb-0.5">
                  {node.code}
                </div>
                <div className="font-mono text-[9px] text-slate-300 font-semibold">{node.name}</div>
                <div className="font-mono text-[8px] text-slate-500 mt-0.5">{node.sub}</div>
              </div>
            </div>
            {i < PIPELINE_NODES.length - 1 && (
              <div className="w-6 h-px bg-[#253044] relative flex-shrink-0">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[4px] border-l-[#253044]" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function PremiumVersionB() {
  const [activeCapIdx, setActiveCapIdx] = useState(0);
  const pageRef = useRef(null);
  const [entered, setEntered] = useState(false);
  useScrollReveal(pageRef);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  const activeCap = ANALYSIS_CAPABILITIES[activeCapIdx];

  return (
    <div ref={pageRef} className="min-h-screen bg-[#06080D] text-slate-200 font-sans overflow-x-hidden">
      <Header />

      {/* ── HERO: Typography-first, sparse, editorial ─────────── */}
      <section id="platform" className="pt-14 min-h-screen flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">

          {/* Thin rule + version label */}
          <div
            className="flex items-center gap-4 mb-12 pt-16 transition-all duration-700"
            style={{ opacity: entered ? 1 : 0, transitionDelay: '0.05s' }}
          >
            <div className="h-px flex-1 bg-[#1A2238]" />
            <span className="editorial-label text-slate-500">SIH26147 — NTRO — SIGNALX v1.0</span>
            <div className="h-px w-12 bg-[#1A2238]" />
          </div>

          {/* Main heading — very large, editorial weight */}
          <div
            className="transition-all duration-800 mb-6"
            style={{
              opacity: entered ? 1 : 0,
              transform: entered ? 'none' : 'translateY(40px)',
              transitionDelay: '0.15s',
            }}
          >
            <div className="editorial-label text-[#0EA5E9] mb-6">AUTOMATED RF SIGNAL INTELLIGENCE</div>
            <h1 className="editorial-heading text-white" style={{ fontSize: 'clamp(52px,10vw,140px)', lineHeight: 0.9 }}>
              FROM RAW<br />
              <span className="text-[#0EA5E9]">SIGNAL</span><br />
              TO INTELLIGENCE.
            </h1>
          </div>

          {/* Subtitle + CTA on same row */}
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mt-12 mb-16 transition-all duration-700"
            style={{ opacity: entered ? 1 : 0, transitionDelay: '0.3s' }}
          >
            <div>
              <p className="text-lg text-slate-300 leading-relaxed max-w-lg">
                SignalX processes IQ and WAV recordings through a complete DSP analysis chain —
                detection, classification, demodulation, FEC decoding — and produces
                fully explainable intelligence reports.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <GoogleLoginButton size="lg" variant="primary" label="Begin Analysis" />
              <a
                href="/demo"
                className="inline-flex items-center gap-2 px-6 py-2.5 font-mono text-xs font-semibold text-slate-300 border border-[#253044] hover:border-[#3A4D6A] hover:text-white rounded-sm transition-colors"
              >
                OPEN DEMO
              </a>
            </div>
          </div>

          {/* Horizontal rule */}
          <div
            className="transition-all duration-500"
            style={{ opacity: entered ? 1 : 0, transitionDelay: '0.45s' }}
          >
            <div className="h-px w-full bg-[#1A2238] mb-0" />
          </div>
        </div>

        {/* Marquee strip */}
        <div
          className="transition-all duration-500"
          style={{ opacity: entered ? 1 : 0, transitionDelay: '0.5s' }}
        >
          <MarqueeTagline />
        </div>

        {/* Pipeline diagram */}
        <div
          className="max-w-7xl mx-auto px-4 sm:px-8 py-10 transition-all duration-700 w-full"
          style={{ opacity: entered ? 1 : 0, transitionDelay: '0.6s' }}
        >
          <div className="editorial-label text-slate-500 mb-4">ANALYSIS PIPELINE — 9 STAGES</div>
          <PipelineDiagram />
        </div>
      </section>

      {/* ── ANALYSIS CAPABILITIES — editorial list layout ──────── */}
      <section id="capabilities" className="py-24 border-t border-[#1A2238]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="reveal-on-scroll grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: numbered list */}
            <div className="lg:col-span-5 space-y-0">
              <div className="editorial-label text-[#0EA5E9] mb-8">CAPABILITIES</div>
              {ANALYSIS_CAPABILITIES.map((cap, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCapIdx(idx)}
                  className={`w-full text-left flex items-start gap-5 py-5 border-b transition-all ${
                    activeCapIdx === idx
                      ? 'border-[#0EA5E9]/40 bg-[#0B1420]'
                      : 'border-[#1A2238] hover:bg-[#090C13]'
                  }`}
                >
                  <span className={`font-mono text-xs pt-1 shrink-0 ${activeCapIdx === idx ? 'text-[#0EA5E9]' : 'text-slate-600'}`}>
                    {cap.num}
                  </span>
                  <div>
                    <div className={`font-mono font-bold text-sm mb-1 ${activeCapIdx === idx ? 'text-white' : 'text-slate-400'}`}>
                      {cap.title.toUpperCase()}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cap.tags.map((t) => (
                        <span key={t} className={`text-[9px] font-mono px-1.5 py-0.5 border rounded-xs ${
                          activeCapIdx === idx
                            ? 'border-[#0EA5E9]/40 text-[#0EA5E9] bg-[#0EA5E9]/5'
                            : 'border-[#253044] text-slate-500'
                        }`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Right: active capability detail */}
            <div className="lg:col-span-7 lg:pl-12 lg:border-l lg:border-[#1A2238]">
              <div className="sticky top-24">
                <div className="font-mono text-[10px] text-[#0EA5E9] mb-2">{activeCap.num} / 06</div>
                <h3 className="editorial-heading text-[clamp(28px,3.5vw,48px)] text-white mb-6">
                  {activeCap.title.toUpperCase().replace(' ', '\n')}
                </h3>
                <p className="text-slate-300 leading-relaxed mb-8 text-base">{activeCap.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {activeCap.tags.map((t) => (
                    <span key={t} className="font-mono text-xs px-3 py-1.5 border border-[#0EA5E9]/40 text-[#0EA5E9] bg-[#0EA5E9]/5 rounded-xs">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Constellation if capability 2 */}
                {activeCapIdx === 1 && (
                  <div className="mt-8 flex items-start gap-6">
                    {['BPSK', 'QPSK', '16QAM'].map((mod) => (
                      <div key={mod} className="text-center">
                        <ConstellationViewer modulation={mod} size={80} />
                        <div className="editorial-label mt-1">{mod}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARAMETER TABLE — engineering reference ─────────────── */}
      <section className="py-24 border-t border-[#1A2238] bg-[#090C13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="reveal-on-scroll grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="editorial-label text-[#F59E0B] mb-4">SIGNAL PARAMETERS</div>
              <h2 className="editorial-heading text-[clamp(28px,4vw,56px)] text-white mb-6">
                MEASURED.<br />NOT ASSUMED.
              </h2>
              <p className="text-slate-300 leading-relaxed">
                Every parameter SignalX reports is measured from your actual signal data,
                constrained by physics, and bounded by the theoretical limits of the
                sampling theorem and noise floor.
              </p>
            </div>
            <div className="border border-[#1A2238] overflow-hidden">
              <div className="bg-[#06080D] border-b border-[#1A2238] px-4 py-3 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-300">PARAMETER REFERENCE TABLE</span>
                <span className="editorial-label">v1.0</span>
              </div>
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#1A2238] bg-[#090C13]">
                    <th className="px-4 py-2.5 text-left text-slate-500">Parameter</th>
                    <th className="px-4 py-2.5 text-left text-slate-500">Symbol</th>
                    <th className="px-4 py-2.5 text-left text-slate-500">Unit</th>
                    <th className="px-4 py-2.5 text-left text-slate-500 hidden sm:table-cell">Physical Bound</th>
                  </tr>
                </thead>
                <tbody>
                  {PARAM_TABLE.map((row, i) => (
                    <tr key={i} className={`border-b border-[#1A2238] ${i % 2 === 0 ? 'bg-[#06080D]' : 'bg-[#090C13]'}`}>
                      <td className="px-4 py-2 text-slate-200">{row.param}</td>
                      <td className="px-4 py-2 text-[#0EA5E9]">{row.symbol}</td>
                      <td className="px-4 py-2 text-slate-400">{row.unit}</td>
                      <td className="px-4 py-2 text-slate-500 hidden sm:table-cell">{row.bound}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── HONESTY STATEMENT ───────────────────────────────────── */}
      <section id="trust" className="py-24 border-t border-[#1A2238] bg-[#06080D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="reveal-on-scroll max-w-4xl">
            <div className="editorial-label text-[#F87171] mb-6">TECHNICAL PRINCIPLES</div>
            <h2 className="editorial-heading text-[clamp(32px,5vw,72px)] text-white mb-10">
              NO BLACK BOX.<br />NO FABRICATED<br />RESULTS.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  title: 'REAL COMPUTATION',
                  body: 'FFT, spectral density, energy detection, and parameter measurement are computed on your uploaded signal file — not simulated.',
                  color: '#10B981',
                },
                {
                  title: 'SYNTHETIC LABELED',
                  body: 'Every homepage visualization is clearly labeled SYNTHETIC PREVIEW. It is mathematically generated, not live RF data.',
                  color: '#F59E0B',
                },
                {
                  title: 'LIMITATIONS EXPLICIT',
                  body: 'Low SNR degrades accuracy. Encrypted signals cannot be decoded. All limitations are reported alongside results.',
                  color: '#F87171',
                },
              ].map(({ title, body, color }) => (
                <div key={title} className="border-t-2 pt-6" style={{ borderColor: color }}>
                  <div className="editorial-label mb-3" style={{ color }}>{title}</div>
                  <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="py-32 border-t border-[#1A2238]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="reveal-on-scroll grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="editorial-label text-[#0EA5E9] mb-6">START ANALYSIS</div>
              <h2 className="editorial-heading text-[clamp(36px,6vw,88px)] text-white">
                READ THE<br />SIGNAL.
              </h2>
            </div>
            <div>
              <p className="text-slate-400 leading-relaxed mb-8">
                Upload any IQ or WAV recording. SignalX will run the full analysis
                chain and return an explainable signal intelligence report.
              </p>
              <div className="flex flex-wrap gap-4">
                <GoogleLoginButton size="lg" variant="primary" label="Begin Analysis" />
                <a href="/demo" className="inline-flex items-center gap-2 px-6 py-2.5 font-mono text-xs font-semibold border border-[#253044] hover:border-slate-500 text-slate-300 hover:text-white rounded-sm transition-colors">
                  EXPLORE DEMO
                </a>
              </div>
              <div className="mt-8 pt-8 border-t border-[#1A2238] grid grid-cols-3 gap-4 font-mono text-xs">
                {[
                  { v: 'SIH26147', l: 'Problem Statement' },
                  { v: 'NTRO', l: 'Organization' },
                  { v: 'SIH 2026', l: 'Competition' },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <div className="text-slate-500 text-[10px]">{l}</div>
                    <div className="text-slate-200 font-bold mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
