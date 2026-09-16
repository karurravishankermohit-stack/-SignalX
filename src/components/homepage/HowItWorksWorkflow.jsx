import React from 'react';
import { Upload, Cpu, Crosshair, Binary, FileCheck, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'UPLOAD',
    subtitle: 'IQ / WAV INGESTION',
    icon: Upload,
    desc: 'Ingest raw .IQ complex float/int or .WAV files. Automatic validation of sample rate, channel count, and file integrity.',
    tech: 'Format checks & DC removal',
  },
  {
    step: '02',
    title: 'ANALYZE',
    subtitle: 'REAL DSP PROCESSING',
    icon: Cpu,
    desc: 'Welch PSD estimation, FFT spectral analysis, 2D spectrogram waterfall, SNR computation, and occupied bandwidth extraction.',
    tech: 'Peak-preserving FFT',
  },
  {
    step: '03',
    title: 'CLASSIFY',
    subtitle: 'MODULATION & CODING',
    icon: Crosshair,
    desc: 'Automatic identification of modulation schemes (FSK, PSK, QAM), interleaving candidates, and FEC coding profiles.',
    tech: 'Cumulant & Spectral analysis',
  },
  {
    step: '04',
    title: 'DECODE',
    subtitle: 'DEMOD & FEC SOLVER',
    icon: Binary,
    desc: 'Costas & Gardner loops lock carrier/timing, followed by Viterbi, Reed-Solomon, or LDPC decoders to extract bitstream.',
    tech: 'Carrier sync & Soft-decision',
  },
  {
    step: '05',
    title: 'REPORT',
    subtitle: 'EXPLAINABLE INTELLIGENCE',
    icon: FileCheck,
    desc: 'Comprehensive technical reporting complete with evidence rationale, confidence metrics, RF limits, and export formats.',
    tech: 'JSON / CSV / PDF Export',
  },
];

export default function HowItWorksWorkflow() {
  return (
    <section id="how-it-works" className="py-16 relative bg-signalx-dark/50 border-y border-signalx-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-signalx-border">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              OPERATIONAL WORKFLOW
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Five-Step Signal Intelligence Process
            </h2>
          </div>
          <div className="font-mono text-xs text-slate-400 mt-2 md:mt-0">
            RAW CAPTURE → REVERSE-ENGINEERED PAYLOAD
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative rounded-lg border border-signalx-border bg-signalx-panel p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      STEP {step.step}
                    </span>
                    {idx < STEPS.length - 1 && (
                      <ArrowRight className="hidden md:block w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    )}
                  </div>

                  <div className="p-2.5 rounded bg-signalx-bg border border-signalx-border w-fit text-cyan-400 mb-3 group-hover:border-cyan-500/40 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-mono text-base font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {step.title}
                  </h3>
                  <div className="font-mono text-[10px] text-cyan-400/80 uppercase tracking-wider mb-2">
                    {step.subtitle}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-signalx-border/60 font-mono text-[10px] text-slate-400">
                  <span className="text-slate-500">ENGINE:</span> {step.tech}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
