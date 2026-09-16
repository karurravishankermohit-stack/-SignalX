import React, { useEffect, useState } from 'react';
import { useSignalStore } from '../store/useSignalStore';
import { useNavigate } from 'react-router-dom';
import { getQuality, getParameters, classifyModulation } from '../lib/api';
import { CheckCircle, Clock, AlertCircle, ArrowRight, Activity, Zap, Play } from 'lucide-react';
import SourceBadge from '../components/analysis/SourceBadge';

const PIPELINE_STAGES = [
  { id: 'upload', name: 'File Upload', path: '/upload', description: 'Raw signal ingestion and intake' },
  { id: 'parse', name: 'Validation & Parsing', path: '/parameters', description: 'Format, headers, and channel parsing' },
  { id: 'preprocess', name: 'Signal Preprocessing', path: '/parameters', description: 'DC removal and RMS normalization' },
  { id: 'quality', name: 'Quality Metrics', path: '/parameters', description: 'SNR, noise floor, dynamic range' },
  { id: 'spectrum', name: 'FFT Power Spectrum', path: '/spectrum', description: 'Peak detection and -3dB/-20dB bandwidth' },
  { id: 'waterfall', name: 'STFT Spectrogram', path: '/waterfall', description: 'Time-frequency intensity mapping' },
  { id: 'parameters', name: 'Parameter Extraction', path: '/parameters', description: 'Symbol rate and baseband carrier offset' },
  { id: 'modulation', name: 'Modulation Classification', path: '/modulation', description: 'Automatic Modulation Classification (AMC)' },
  { id: 'constellation', name: 'Constellation Analysis', path: '/constellation', description: 'I/Q symbol phase clustering' },
  { id: 'demodulation', name: 'Digital Demodulation', path: '/demodulation', description: 'Symbol slicing & bitstream recovery' },
  { id: 'interleaving', name: 'Interleaving Identification', path: '/deinterleaving', description: 'Candidate interleaver detection' },
  { id: 'deinterleaving', name: 'De-interleaving', path: '/deinterleaving', description: 'Block, Conv, Diag, PRN permutation' },
  { id: 'fec', name: 'FEC Identification', path: '/fec', description: 'Code rate and syndrome estimation' },
  { id: 'fec_decode', name: 'FEC Decoding', path: '/fec', description: 'Viterbi, Reed-Solomon, Concatenated' },
  { id: 'bitstream', name: 'Bitstream Inspection', path: '/bitstream', description: 'Hex/Binary/ASCII analysis' },
  { id: 'correlation', name: 'Correlation & Frame Detection', path: '/correlation', description: 'Sync search and candidate headers' },
  { id: 'report', name: 'Intelligence Report', path: '/reports', description: 'Consolidated report with provenance' },
];

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { sessionId, caseId, filename, dataSource, quality, parameters, modulation, setSession } = useSignalStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionId && !quality) {
      setLoading(true);
      Promise.all([
        getQuality(sessionId).then(q => setSession({ quality: q })).catch(() => {}),
        getParameters(sessionId).then(p => setSession({ parameters: p })).catch(() => {}),
        classifyModulation(sessionId).then(m => setSession({ modulation: m })).catch(() => {}),
      ]).finally(() => setLoading(false));
    }
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="text-center py-24 space-y-4 font-mono">
        <Activity className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Active Signal Loaded</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please upload a .wav or .iq file, or launch a synthetic demo signal to start the intelligence pipeline.
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xs cursor-pointer text-xs"
        >
          Open Ingestion Workstation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto">
      {/* Overview Card */}
      <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2238] pb-4 mb-4 font-mono text-xs">
          <div>
            <div className="text-slate-500">ACTIVE CASE</div>
            <div className="text-lg font-bold text-white font-mono">{caseId || 'CASE-2026-UNKNOWN'}</div>
          </div>
          <div>
            <div className="text-slate-500">FILENAME</div>
            <div className="text-white">{filename || 'Unknown'}</div>
          </div>
          <div>
            <div className="text-slate-500">DATA PROVENANCE</div>
            <SourceBadge source={dataSource || 'REAL_ANALYSIS'} />
          </div>
          <div>
            <div className="text-slate-500">ESTIMATED SNR</div>
            <div className="text-emerald-400 font-bold">
              {quality?.snr_db !== undefined ? `${quality.snr_db} dB` : 'Computing...'}
            </div>
          </div>
          <div>
            <div className="text-slate-500">CLASSIFIED MODULATION</div>
            <div className="text-sky-400 font-bold">
              {modulation?.best ? `${modulation.best} (${modulation.confidence}%)` : 'Computing...'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            SignalX 17-stage automated RF intelligence pipeline is active. Select any stage below to inspect physical data.
          </p>
          <button
            onClick={() => navigate('/spectrum')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xs font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            <span>Proceed to Spectrum Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 17-Stage Pipeline Grid */}
      <div className="space-y-3">
        <div className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
          PIPELINE STAGE EXECUTION STATUS
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = true; // In active session, stages are computed or on-demand
            return (
              <div
                key={stage.id}
                onClick={() => navigate(stage.path)}
                className="bg-[#090C13] border border-[#1A2238] hover:border-sky-500/60 p-4 rounded-sm transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-slate-500">
                      STAGE {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xs flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" />
                      READY
                    </span>
                  </div>
                  <h3 className="font-mono text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                    {stage.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {stage.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1A2238]/60 flex items-center justify-between text-[10px] font-mono text-slate-500 group-hover:text-sky-400">
                  <span>Inspect Physical Data</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
