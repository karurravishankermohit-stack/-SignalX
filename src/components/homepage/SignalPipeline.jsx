import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const PIPELINE_NODES = [
  { id: 'ingest', code: '01', name: 'RAW IQ / WAV', sub: 'Ingest', spec: 'int16 / float32 PCM validation' },
  { id: 'parser', code: '02', name: 'PARSER', sub: 'Header & Frame', spec: 'Sample rate & RIFF/RAW unpack' },
  { id: 'preprocess', code: '03', name: 'PREPROCESS', sub: 'Conditioning', spec: 'DC bias removal & I/Q balance' },
  { id: 'fft', code: '04', name: 'FFT', sub: 'Spectral Est.', spec: 'Welch PSD & STFT spectrogram' },
  { id: 'params', code: '05', name: 'PARAMETERS', sub: 'Feature Extract', spec: 'OBW, carrier offset & SNR' },
  { id: 'mod', code: '06', name: 'MODULATION', sub: 'Classification', spec: 'Cumulant & cyclostationary' },
  { id: 'demod', code: '07', name: 'DEMODULATION', sub: 'Symbol Slicing', spec: 'Costas loop & Gardner sync' },
  { id: 'fec', code: '08', name: 'FEC', sub: 'Error Correction', spec: 'Viterbi soft-dec / RS / LDPC' },
  { id: 'bitstream', code: '09', name: 'BITSTREAM', sub: 'Hex / Binary', spec: 'Frame preamble sync search' },
  { id: 'corr', code: '10', name: 'CORRELATION', sub: 'Alignment', spec: 'Cross-correlation sync peak' },
  { id: 'report', code: '11', name: 'REPORT', sub: 'Dossier Export', spec: 'Explainable JSON & PDF dossier' },
];

export default function SignalPipeline() {
  const [selectedNode, setSelectedNode] = useState(PIPELINE_NODES[0]);

  return (
    <section id="pipeline" className="py-14 border-b border-[#1E2638] bg-[#080A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-3 border-b border-[#1E2638]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-sky-400 font-bold tracking-wider">
              SYSTEM ARCHITECTURE
            </span>
            <span className="text-[#1E2638]">•</span>
            <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-white">
              Signal Processing Pipeline
            </h2>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 sm:mt-0">
            DETERMINISTIC 11-STAGE REVERSE-ENGINEERING BUS
          </div>
        </div>

        {/* Engineering Architecture Diagram Flow */}
        <div className="bg-[#0A0D15] border border-[#1E2638] rounded-xs p-4 overflow-x-auto">
          <div className="min-w-[960px]">
            {/* Bus line indicator */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-3 px-1 border-b border-[#1E2638] pb-1.5">
              <span>INPUT: BASEBAND VOLTAGE SAMPLES</span>
              <span>BUS: 64-BIT IEEE-754 COMPLEX DSP</span>
              <span>OUTPUT: EXPLAINABLE INTELLIGENCE</span>
            </div>

            {/* Pipeline Block Nodes Connected with Thin Lines */}
            <div className="flex items-center justify-between gap-1.5 py-2">
              {PIPELINE_NODES.map((node, i) => {
                const isSelected = selectedNode.id === node.id;
                return (
                  <React.Fragment key={node.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedNode(node)}
                      className={`flex-1 min-w-[76px] p-2 rounded-xs border text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#121828] border-sky-500 text-white shadow-xs'
                          : 'bg-[#0E121C] hover:bg-[#141A28] border-[#1E2638] text-slate-300 hover:border-[#2C374E]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
                        <span>{node.code}</span>
                        <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-sky-400' : 'bg-slate-600'}`} />
                      </div>
                      <div className="font-mono text-[10px] font-bold text-white truncate">
                        {node.name}
                      </div>
                      <div className="font-mono text-[9px] text-slate-400 mt-0.5 truncate">
                        {node.sub}
                      </div>
                    </button>

                    {i < PIPELINE_NODES.length - 1 && (
                      <div className="shrink-0 text-slate-600 font-mono text-xs px-0.5">
                        →
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Stage Architecture Inspector */}
        <div className="mt-3 bg-[#0E121C] border border-[#1E2638] rounded-xs p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sky-400 font-bold">STAGE {selectedNode.code}:</span>
              <span className="text-white font-bold">{selectedNode.name}</span>
              <span className="text-slate-500">[{selectedNode.sub}]</span>
            </div>
            <div className="text-slate-400 text-[11px] font-sans">
              Algorithmic specification: <span className="text-slate-300 font-mono">{selectedNode.spec}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 border border-[#1E2638] px-3 py-1.5 rounded-xs bg-[#080A0F]">
            PASSIVE DSP PIPELINE • NO MOCK FALLBACKS
          </div>
        </div>
      </div>
    </section>
  );
}
