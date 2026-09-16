import React, { useState, useEffect, useRef } from 'react';
import { useSignalStore } from '../store/useSignalStore';
import { getBitstream } from '../lib/api';
import SourceBadge from '../components/analysis/SourceBadge';
import { 
  Activity, 
  Search, 
  Copy, 
  Download, 
  Binary, 
  FileCode, 
  Type, 
  RefreshCw,
  Radio,
  Play,
  Pause,
  Terminal
} from 'lucide-react';
import { MotionButton, RadarSweep } from '../components/common/motion';

export default function BitstreamPage() {
  const { sessionId, demodulation, setSession } = useSignalStore();
  const [tab, setTab] = useState('hex'); // 'hex' | 'binary' | 'ascii' | 'stream'
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamIndex, setStreamIndex] = useState(0);
  const streamIntervalRef = useRef(null);
  const pageSize = 1024; // bits per page

  useEffect(() => {
    if (sessionId && (!demodulation?.bits || demodulation.bits.length === 0)) {
      setLoading(true);
      getBitstream(sessionId)
        .then(res => {
          if (res?.bits) {
            setSession({ demodulation: res });
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [sessionId, demodulation]);

  // Live Typewriter Streaming Effect
  useEffect(() => {
    if (isStreaming && demodulation?.bits?.length > 0) {
      streamIntervalRef.current = setInterval(() => {
        setStreamIndex(prev => {
          const next = prev + 16;
          if (next >= demodulation.bits.length) {
            return 0; // loop stream
          }
          return next;
        });
      }, 80);
    } else {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    }
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, [isStreaming, demodulation]);

  if (!sessionId) {
    return (
      <div className="text-center py-24 font-mono text-slate-400 space-y-4 glass-card rounded-sm max-w-lg mx-auto p-8 border border-white/10">
        <RadarSweep size="lg" className="mx-auto" />
        <div className="text-white font-bold tracking-wide">NO ACTIVE SIGINT SESSION</div>
        <p className="text-xs text-slate-400">
          Please ingest an RF signal file or initialize an evaluation benchmark first.
        </p>
      </div>
    );
  }

  const allBits = demodulation?.bits || [];
  const totalPages = Math.max(1, Math.ceil(allBits.length / pageSize));
  const pageBits = allBits.slice(page * pageSize, (page + 1) * pageSize);

  // Hex conversion
  const hexRows = [];
  for (let i = 0; i < pageBits.length; i += 128) {
    const rowBits = pageBits.slice(i, i + 128);
    const hexBytes = [];
    const asciiChars = [];

    for (let j = 0; j < rowBits.length; j += 8) {
      const byteBits = rowBits.slice(j, j + 8);
      const val = byteBits.reduce((acc, b, idx) => acc | (b << (7 - idx)), 0);
      hexBytes.push(val.toString(16).padStart(2, '0').toUpperCase());
      asciiChars.push(val >= 32 && val <= 126 ? String.fromCharCode(val) : '.');
    }

    hexRows.push({
      offset: (page * pageSize + i).toString(16).padStart(6, '0').toUpperCase(),
      hex: hexBytes.join(' '),
      ascii: asciiChars.join(''),
    });
  }

  // Stream preview rows
  const streamedBits = allBits.slice(0, Math.max(128, streamIndex));
  const streamedHex = [];
  for (let i = 0; i < streamedBits.length; i += 128) {
    const rowBits = streamedBits.slice(i, i + 128);
    const hexBytes = [];
    const asciiChars = [];
    for (let j = 0; j < rowBits.length; j += 8) {
      const byteBits = rowBits.slice(j, j + 8);
      const val = byteBits.reduce((acc, b, idx) => acc | (b << (7 - idx)), 0);
      hexBytes.push(val.toString(16).padStart(2, '0').toUpperCase());
      asciiChars.push(val >= 32 && val <= 126 ? String.fromCharCode(val) : '.');
    }
    streamedHex.push({
      offset: i.toString(16).padStart(6, '0').toUpperCase(),
      hex: hexBytes.join(' '),
      ascii: asciiChars.join(''),
    });
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(allBits.join(''));
  };

  const handleDownload = () => {
    const blob = new Blob([allBits.join('')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitstream_${sessionId.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-glow-cyan-sm" />
            <span>DSP STAGE 15 / 17 — DEMODULATED STREAM INSPECTION</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-sans mt-1">
            Bitstream Analysis Workstation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Tactical digital stream inspector with synchronized Hex, Binary, ASCII offsets, and live SDR stream simulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SourceBadge source={demodulation?.source || 'DSP_COMPUTED'} />
          
          <MotionButton
            variant="glass"
            size="sm"
            onClick={() => setIsStreaming(!isStreaming)}
            glow={isStreaming}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300">Pause Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live SDR Stream</span>
              </>
            )}
          </MotionButton>

          <MotionButton
            variant="glass"
            size="sm"
            onClick={handleCopy}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Bits</span>
          </MotionButton>

          <MotionButton
            variant="cyan"
            size="sm"
            glow={true}
            onClick={handleDownload}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Raw</span>
          </MotionButton>
        </div>
      </div>

      {/* Overview Stats & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-1.5 glass-card p-1 rounded-sm border border-white/10">
          <button
            onClick={() => setTab('hex')}
            className={`px-3 py-1.5 rounded-xs transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              tab === 'hex' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40 shadow-glow-cyan-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Hex Dump</span>
          </button>
          
          <button
            onClick={() => setTab('binary')}
            className={`px-3 py-1.5 rounded-xs transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              tab === 'binary' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40 shadow-glow-cyan-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Raw Binary</span>
          </button>
          
          <button
            onClick={() => setTab('ascii')}
            className={`px-3 py-1.5 rounded-xs transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              tab === 'ascii' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40 shadow-glow-cyan-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>ASCII Text</span>
          </button>

          <button
            onClick={() => setTab('stream')}
            className={`px-3 py-1.5 rounded-xs transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              tab === 'stream' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40 shadow-glow-cyan-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Typewriter Stream</span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-2">
            <span>TOTAL:</span>
            <span className="text-white font-bold bg-white/[0.04] px-2 py-0.5 rounded-xs border border-white/10 font-mono">
              {allBits.length.toLocaleString()} bits
            </span>
            <span className="text-slate-500">({Math.floor(allBits.length / 8).toLocaleString()} bytes)</span>
          </div>

          {tab !== 'stream' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xs disabled:opacity-40 cursor-pointer text-slate-300"
              >
                Prev
              </button>
              <span className="text-slate-300 font-mono">PAGE {page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xs disabled:opacity-40 cursor-pointer text-slate-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bitstream Viewer Panel with Glassmorphic Styling */}
      <div className="glass-card rounded-sm p-5 font-mono text-xs min-h-[440px] border border-white/10 relative overflow-hidden">
        {allBits.length === 0 ? (
          <div className="text-center py-24 text-slate-500 space-y-2">
            <Radio className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
            <div className="text-slate-400 font-bold">NO DEMODULATED BITSTREAM IN SESSION</div>
            <div className="text-[11px] text-slate-500 font-sans">
              Demodulate a signal to inspect payload bits.
            </div>
          </div>
        ) : tab === 'hex' ? (
          <div className="space-y-1">
            <div className="grid grid-cols-12 text-slate-400 border-b border-white/10 pb-2 font-bold text-[10px] tracking-wider">
              <div className="col-span-2 text-cyan-400/80">OFFSET (HEX)</div>
              <div className="col-span-7 text-cyan-400/80">HEXADECIMAL DATA STREAM</div>
              <div className="col-span-3 text-cyan-400/80">ASCII PAYLOAD</div>
            </div>
            {hexRows.map((row, i) => (
              <div key={i} className="grid grid-cols-12 font-mono hover:bg-cyan-500/[0.06] hover:border-l-2 hover:border-cyan-400 py-1 px-1.5 rounded-xs transition-colors group">
                <div className="col-span-2 text-slate-500 group-hover:text-slate-400 font-mono">{row.offset}</div>
                <div className="col-span-7 text-cyan-300 font-mono tracking-widest select-all">{row.hex}</div>
                <div className="col-span-3 text-slate-300 font-mono tracking-wider">{row.ascii}</div>
              </div>
            ))}
          </div>
        ) : tab === 'binary' ? (
          <div className="p-4 bg-black/50 border border-white/10 rounded-xs text-emerald-400 leading-relaxed tracking-widest break-all select-all font-mono shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
            {pageBits.join('')}
          </div>
        ) : tab === 'ascii' ? (
          <div className="p-4 bg-black/50 border border-white/10 rounded-xs text-slate-200 leading-relaxed break-all select-all font-mono whitespace-pre-wrap shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
            {hexRows.map(r => r.ascii).join('')}
          </div>
        ) : (
          /* Live Typewriter SDR Stream View */
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-cyan-400 font-mono font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                LIVE STREAM SIMULATION — REAL-TIME INGESTION
              </span>
              <span className="text-slate-400">
                STREAMED: {Math.min(streamedBits.length, allBits.length)} / {allBits.length} BITS
              </span>
            </div>
            <div className="space-y-1 pt-1 max-h-[360px] overflow-y-auto">
              {streamedHex.map((row, i) => (
                <div key={i} className="grid grid-cols-12 font-mono py-0.5 px-1 text-xs">
                  <div className="col-span-2 text-slate-500 font-mono">{row.offset}</div>
                  <div className="col-span-7 text-cyan-300 font-mono tracking-widest">{row.hex}</div>
                  <div className="col-span-3 text-slate-300 font-mono tracking-wider">{row.ascii}</div>
                </div>
              ))}
              {isStreaming && (
                <div className="flex items-center gap-1 text-cyan-400 font-mono text-xs py-1">
                  <span className="animate-pulse">_</span>
                  <span className="text-[10px] text-slate-500">Demodulating live RF stream...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

