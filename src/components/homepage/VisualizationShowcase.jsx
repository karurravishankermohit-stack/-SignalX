import React, { useState } from 'react';
import EngineeringSpectrumAnalyzer from '../common/EngineeringSpectrumAnalyzer';
import RFVisualizerCanvas from '../common/RFVisualizerCanvas';
import ConstellationCanvas from '../common/ConstellationCanvas';
import OscilloscopeCanvas from '../common/OscilloscopeCanvas';

export default function VisualizationShowcase() {
  const [activePanel, setActivePanel] = useState('spectrum');

  const panels = [
    { id: 'spectrum', label: 'PANEL 1: SPECTRUM', desc: 'Power Spectral Density (PSD)' },
    { id: 'waterfall', label: 'PANEL 2: WATERFALL', desc: '2D Continuous Spectrogram' },
    { id: 'constellation', label: 'PANEL 3: CONSTELLATION', desc: 'I/Q Complex Symbol Plane' },
    { id: 'oscilloscope', label: 'PANEL 4: OSCILLOSCOPE', desc: 'Time-Domain Quadrature' },
    { id: 'bitstream', label: 'PANEL 5: BITSTREAM', desc: 'Demodulated Frame Bytes' },
    { id: 'correlation', label: 'PANEL 6: CORRELATION', desc: 'Sync Peak Alignment' },
  ];

  return (
    <section id="showcase" className="py-14 border-b border-[#1E2638] bg-[#080A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-3 border-b border-[#1E2638]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-sky-400 font-bold tracking-wider">
              INSTRUMENT PANELS
            </span>
            <span className="text-[#1E2638]">•</span>
            <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-white">
              Data Visualization Suite
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 mt-1 sm:mt-0">
            <span className="px-1.5 py-0.5 rounded-xs bg-[#1A1813] text-[#F59E0B] border border-[#3E2F13] text-[10px]">
              SYNTHETIC PREVIEW
            </span>
            <span>60 FPS DETERMINISTIC CANVAS</span>
          </div>
        </div>

        {/* Panel Switcher Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-[#0A0D15] p-1 rounded-xs border border-[#1E2638]">
          {panels.map((p) => {
            const isActive = activePanel === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePanel(p.id)}
                className={`px-3 py-1.5 rounded-xs font-mono text-xs text-left transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#121828] text-white border border-sky-500 font-bold'
                    : 'bg-transparent text-slate-400 hover:text-slate-200 border border-transparent hover:border-[#1E2638]'
                }`}
              >
                <div>{p.label}</div>
                <div className="text-[9px] text-slate-500 font-normal">{p.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Active Instrument Display Container */}
        <div className="bg-[#0E121C] border border-[#1E2638] rounded-xs p-5">
          {activePanel === 'spectrum' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs text-slate-400 border-b border-[#1E2638] pb-2">
                <span className="font-bold text-white">CALIBRATED SPECTRUM ANALYZER</span>
                <span>WELCH METHOD • HANNING WINDOW • 2048 POINTS</span>
              </div>
              <EngineeringSpectrumAnalyzer height={320} />
            </div>
          )}

          {activePanel === 'waterfall' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs text-slate-400 border-b border-[#1E2638] pb-2">
                <span className="font-bold text-white">CONTINUOUS 2D SPECTROGRAM WATERFALL</span>
                <span>TEMPORAL DRIFT TRACKER • 40 BUFFER ROWS</span>
              </div>
              <RFVisualizerCanvas height={320} mode="waterfall" carrierFreq="433.920 MHz" bandwidth="420 kHz" snr="18.7 dB" />
            </div>
          )}

          {activePanel === 'constellation' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs text-slate-400 border-b border-[#1E2638] pb-2">
                <span className="font-bold text-white">POLAR I/Q CONSTELLATION ANALYZER</span>
                <span>CARRIER RECOVERY • GARDNER SYMBOL SYNCHRONIZATION</span>
              </div>
              <ConstellationCanvas height={300} modulation="QPSK" />
            </div>
          )}

          {activePanel === 'oscilloscope' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs text-slate-400 border-b border-[#1E2638] pb-2">
                <span className="font-bold text-white">TIME-DOMAIN BASEBAND OSCILLOSCOPE</span>
                <span>CH1: IN-PHASE (I) • CH2: QUADRATURE (Q)</span>
              </div>
              <OscilloscopeCanvas height={280} />
            </div>
          )}

          {activePanel === 'bitstream' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-[#1E2638] pb-2">
                <span className="font-bold text-white">DEMODULATED & DECODED FRAME BYTES</span>
                <span className="text-emerald-400">VITERBI + REED-SOLOMON VERIFIED</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#05070B] border border-[#1E2638] rounded-xs p-3">
                  <div className="text-slate-400 text-[10px] uppercase font-bold border-b border-[#1E2638] pb-1.5 mb-2 flex justify-between">
                    <span>HEXADECIMAL DUMP</span>
                    <span>OFFSET 0x0000</span>
                  </div>
                  <div className="space-y-1 text-slate-300 text-[11px] select-all">
                    <div><span className="text-slate-500">0000:</span> 4E 54 52 4F 20 53 49 48 20 32 30 32 36 20 53 49</div>
                    <div><span className="text-slate-500">0010:</span> 47 4E 41 4C 58 20 54 45 4C 45 4D 45 54 52 59 20</div>
                    <div><span className="text-slate-500">0020:</span> 53 59 4E 43 5F 57 4F 52 44 5F 31 41 43 46 46 43</div>
                    <div><span className="text-slate-500">0030:</span> 1D 02 B4 8C 9A 4F 33 E1 88 29 C4 72 05 FA 6B 91</div>
                  </div>
                </div>

                <div className="bg-[#05070B] border border-[#1E2638] rounded-xs p-3">
                  <div className="text-emerald-400 text-[10px] uppercase font-bold border-b border-[#1E2638] pb-1.5 mb-2 flex justify-between">
                    <span>ASCII DECODED STRING</span>
                    <span>FRAME 01</span>
                  </div>
                  <div className="p-3 bg-[#080A0F] border border-[#1E2638] rounded-xs text-emerald-300 text-xs select-all">
                    "NTRO SIH 2026 SIGNALX TELEMETRY SYNC_WORD_1ACFFC..."
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2">
                    CRC-32: <span className="text-slate-300">0x9F4C2A1E (PASSED)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePanel === 'correlation' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-[#1E2638] pb-2">
                <span className="font-bold text-white">CROSS-CORRELATION FRAME SYNC DETECTOR</span>
                <span className="text-sky-400">PEAK: SAMPLE 128 (99.4% CORRELATION)</span>
              </div>

              <div className="bg-[#05070B] border border-[#1E2638] rounded-xs p-4">
                <div className="h-36 flex items-end gap-1 px-1 border-b border-[#1E2638] pb-1">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const isPeak = i === 32;
                    const height = isPeak ? 96 : Math.max(8, Math.sin(i * 0.4) * 22 + Math.random() * 12);
                    return (
                      <div
                        key={i}
                        style={{ height: `${height}%` }}
                        className={`flex-1 rounded-xs transition-colors ${
                          isPeak ? 'bg-sky-400' : 'bg-[#1E2638] hover:bg-[#2C374E]'
                        }`}
                        title={`Offset ${i * 4}: ${height.toFixed(1)}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                  <span>Offset 0</span>
                  <span className="text-slate-300 font-bold">Sync Marker Detected (Sample 128)</span>
                  <span>Offset 256</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
