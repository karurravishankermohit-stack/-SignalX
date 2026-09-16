import React from 'react';
import { ShieldCheck, FileSpreadsheet, Info } from 'lucide-react';

export default function TechnicalTrustSection() {
  const comparisonData = [
    {
      field: 'DATA SOURCE',
      real: 'Direct hardware SDR / RF receiver IQ or WAV capture file',
      demo: 'Mathematically synthesized in-memory signal waveform',
    },
    {
      field: 'PROCESSING',
      real: 'Execution of complete SciPy / NumPy DSP pipeline with zero fallback',
      demo: 'Pre-computed deterministic waveform with known modulation benchmark',
    },
    {
      field: 'RESULT STATUS',
      real: 'Calculated metrics or explicit error: "Unable to determine from data"',
      demo: 'Benchmark reference metrics watermarked as SYNTHETIC PREVIEW',
    },
    {
      field: 'CONFIDENCE',
      real: 'Statistical evidence margin derived from SNR and cumulant divergence',
      demo: 'Nominal benchmark confidence score (for test validation)',
    },
    {
      field: 'GROUND TRUTH',
      real: 'Blind transmission; true BER requires known pilot bits or sequence',
      demo: 'Known bitstream sequence enables exact BER and constellation verification',
    },
  ];

  return (
    <section id="trust" className="py-14 border-b border-[#1E2638] bg-[#080A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section 17: REAL VS DEMO DATA COMPARISON */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-6 pb-3 border-b border-[#1E2638]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-sky-400 font-bold tracking-wider">
                DATA INTEGRITY MATRIX
              </span>
              <span className="text-[#1E2638]">•</span>
              <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-white">
                Real Analysis vs. Synthetic Demo Data
              </h2>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 sm:mt-0">
              NON-FABRICATION PROTOCOL
            </div>
          </div>

          <div className="bg-[#0E121C] border border-[#1E2638] rounded-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-slate-300">
                <thead className="bg-[#0A0D15] text-slate-400 uppercase text-[10px] border-b border-[#1E2638]">
                  <tr>
                    <th className="py-3 px-4 w-1/5">SPECIFICATION</th>
                    <th className="py-3 px-4 w-2/5 text-emerald-400">REAL ANALYSIS (HARDWARE)</th>
                    <th className="py-3 px-4 w-2/5 text-amber-400">DEMO DATA (SYNTHETIC)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2638]">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#121828] transition-colors">
                      <td className="py-3 px-4 font-bold text-white text-[11px] bg-[#0A0D15]/50">
                        {row.field}
                      </td>
                      <td className="py-3 px-4 text-slate-200 text-[11px] font-sans">
                        {row.real}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] font-sans">
                        {row.demo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 18: TECHNICAL HONESTY / ENGINEERING NOTE */}
        <div className="bg-[#0E121C] border border-[#1E2638] rounded-xs p-5 font-mono text-xs">
          <div className="flex items-center gap-2 text-white font-bold border-b border-[#1E2638] pb-2.5 mb-3 text-xs">
            <Info className="w-4 h-4 text-sky-400" />
            <span className="tracking-wider uppercase">ENGINEERING NOTE • ANALYSIS WITH EVIDENCE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] font-sans text-slate-300">
            <div className="p-3 bg-[#080A0F] border border-[#1E2638] rounded-xs">
              <div className="font-mono font-bold text-white mb-1 text-xs">Probabilistic Bounds</div>
              <p className="text-slate-400 leading-relaxed">
                Automatic modulation and FEC classifications are probabilistic under low SNR. Every result displays calculated confidence percentages and explicit cumulant evidence rationales.
              </p>
            </div>

            <div className="p-3 bg-[#080A0F] border border-[#1E2638] rounded-xs">
              <div className="font-mono font-bold text-white mb-1 text-xs">Calibrated Frequency Policy</div>
              <p className="text-slate-400 leading-relaxed">
                Raw IQ baseband files contain relative intermediate frequencies (IF). Absolute RF carrier frequency is never fabricated without hardware local oscillator (LO) calibration metadata.
              </p>
            </div>

            <div className="p-3 bg-[#080A0F] border border-[#1E2638] rounded-xs">
              <div className="font-mono font-bold text-white mb-1 text-xs">True BER & LDPC Matrices</div>
              <p className="text-slate-400 leading-relaxed">
                True Bit Error Rate requires known ground-truth reference bits. LDPC decoding requires a valid parity-check matrix (H); unsupported configurations report explicit limitations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
