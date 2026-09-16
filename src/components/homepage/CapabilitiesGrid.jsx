import React from 'react';
import { Activity, Cpu, Shield, Binary } from 'lucide-react';

export default function CapabilitiesGrid() {
  return (
    <section id="capabilities" className="py-14 border-b border-[#1E2638] bg-[#080A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-3 border-b border-[#1E2638]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-sky-400 font-bold tracking-wider">
              CORE CAPABILITIES
            </span>
            <span className="text-[#1E2638]">•</span>
            <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-white">
              RF & DSP Engineering Modules
            </h2>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 sm:mt-0">
            DISCRETE TIME MATHEMATICAL SOLVERS
          </div>
        </div>

        {/* Asymmetric Technical Layout (Large primary section + dense adjacent sections) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Large Section (7 cols): SIGNAL PROCESSING CORE */}
          <div className="lg:col-span-7 bg-[#0E121C] border border-[#1E2638] rounded-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1E2638] pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    MODULE 01 • SIGNAL PROCESSING & SPECTRAL ESTIMATION
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded-xs bg-[#131826] border border-[#1E2638]">
                  CORE DSP
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed mb-6">
                Calibrated frequency-domain and time-frequency representation tailored for signal detection, carrier estimation, and occupied bandwidth extraction across complex I/Q baseband samples.
              </p>

              {/* 5 Technical Sub-capabilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs mb-6">
                <div className="p-3 bg-[#080A0F] rounded-xs border border-[#1E2638]">
                  <div className="text-white font-bold text-xs flex justify-between">
                    <span>Fast Fourier Transform</span>
                    <span className="text-sky-400 text-[10px]">2048-8192 PT</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans mt-1">
                    Welch averaged periodogram with peak-preserving downsampling.
                  </div>
                </div>

                <div className="p-3 bg-[#080A0F] rounded-xs border border-[#1E2638]">
                  <div className="text-white font-bold text-xs flex justify-between">
                    <span>2D Spectrogram Waterfall</span>
                    <span className="text-sky-400 text-[10px]">STFT</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans mt-1">
                    Rolling temporal frequency drift monitor with dynamic range tuning.
                  </div>
                </div>

                <div className="p-3 bg-[#080A0F] rounded-xs border border-[#1E2638]">
                  <div className="text-white font-bold text-xs flex justify-between">
                    <span>Calibrated SNR Estimator</span>
                    <span className="text-emerald-400 text-[10px]">± 0.5 dB</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans mt-1">
                    In-band signal to out-of-band noise ratio under M2M4 cumulants.
                  </div>
                </div>

                <div className="p-3 bg-[#080A0F] rounded-xs border border-[#1E2638]">
                  <div className="text-white font-bold text-xs flex justify-between">
                    <span>Occupied Bandwidth (OBW)</span>
                    <span className="text-sky-400 text-[10px]">99% POWER</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans mt-1">
                    Automated -3 dB, -6 dB, and 99% integrated power bandwidth bounds.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E2638] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>SUPPORTED SAMPLE RATES: UP TO 20.0 MSPS</span>
              <span className="text-slate-500">IEEE-754 COMPLEX FLOAT32</span>
            </div>
          </div>

          {/* Adjacent Sections (5 cols): 3 Dense Specialized Modules */}
          <div className="lg:col-span-5 space-y-4">
            {/* Section: MODULATION RECOGNITION */}
            <div className="bg-[#0E121C] border border-[#1E2638] rounded-xs p-4">
              <div className="flex items-center justify-between border-b border-[#1E2638] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    MODULE 02 • MODULATION CLASSIFIER
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-400">CUMULANTS</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-center text-xs">
                {['BPSK', 'QPSK', '8-PSK', '2-FSK', '4-FSK', '16-QAM', '64-QAM', 'MSK', 'OQPSK'].map((m) => (
                  <div key={m} className="p-1.5 rounded-xs bg-[#080A0F] border border-[#1E2638] text-slate-300 text-[11px]">
                    {m}
                  </div>
                ))}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-2">
                Features: C40, C42, C63 cumulant ratios & Gardner symbol synchronizer.
              </div>
            </div>

            {/* Section: ERROR CORRECTION (FEC) */}
            <div className="bg-[#0E121C] border border-[#1E2638] rounded-xs p-4">
              <div className="flex items-center justify-between border-b border-[#1E2638] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    MODULE 03 • FEC DECODING SUITE
                  </span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400">VERIFIED</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between p-1.5 bg-[#080A0F] border border-[#1E2638] rounded-xs text-[11px]">
                  <span className="text-white">Viterbi Soft/Hard</span>
                  <span className="text-slate-400">Rate 1/2, 2/3, 3/4 (k=7)</span>
                </div>
                <div className="flex justify-between p-1.5 bg-[#080A0F] border border-[#1E2638] rounded-xs text-[11px]">
                  <span className="text-white">Reed-Solomon</span>
                  <span className="text-slate-400">RS(255, 223 / 239)</span>
                </div>
                <div className="flex justify-between p-1.5 bg-[#080A0F] border border-[#1E2638] rounded-xs text-[11px]">
                  <span className="text-white">LDPC Architecture</span>
                  <span className="text-slate-400">Valid H-Matrix Parity Solver</span>
                </div>
              </div>
            </div>

            {/* Section: BITSTREAM FORENSICS */}
            <div className="bg-[#0E121C] border border-[#1E2638] rounded-xs p-4">
              <div className="flex items-center justify-between border-b border-[#1E2638] pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <Binary className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    MODULE 04 • BITSTREAM & CORRELATION
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-400">SYNCHRONIZED</span>
              </div>
              <div className="text-[11px] font-mono text-slate-300 space-y-1">
                <div>• Synchronized Hex & Binary byte stream inspection</div>
                <div>• Cross-correlation preamble alignment & candidate boundary</div>
                <div>• Technical dossier export (JSON / CSV / Printable PDF)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
