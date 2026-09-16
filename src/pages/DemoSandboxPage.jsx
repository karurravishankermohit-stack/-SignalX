import React, { useState } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import EngineeringSpectrumAnalyzer from '../components/common/EngineeringSpectrumAnalyzer';
import ConstellationCanvas from '../components/common/ConstellationCanvas';
import OscilloscopeCanvas from '../components/common/OscilloscopeCanvas';
import { 
  RotateCcw, 
  ArrowLeft,
  Activity,
  Cpu,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function DemoSandboxPage() {
  const [activeSignalKey, setActiveSignalKey] = useState('qpsk');
  const [isProcessing, setIsProcessing] = useState(false);

  const demoSignals = {
    fsk: {
      name: '2-FSK Telemetry Beacon',
      carrier: '144.390 MHz',
      bandwidth: '25.0 kHz',
      snr: '22.4 dB',
      modulation: '2-FSK',
      fec: 'None (Raw Frame)',
      baud: '9600 Bd',
      bitstream: '4E 54 52 4F 20 46 53 4B 20 42 45 4E 43 48 4D 41 52 4B 20 54 45 53 54',
      ascii: 'NTRO FSK BENCHMARK TEST',
    },
    qpsk: {
      name: 'QPSK Satellite Downlink',
      carrier: '433.920 MHz',
      bandwidth: '420.0 kHz',
      snr: '18.7 dB',
      modulation: 'QPSK',
      fec: 'Viterbi k=7, Rate 1/2',
      baud: '300 kBd',
      bitstream: '53 49 47 4E 41 4C 58 20 51 50 53 4B 20 53 59 4E 43 20 50 41 59 4C 4F',
      ascii: 'SIGNALX QPSK SYNC PAYLOAD',
    },
    qam16: {
      name: '16-QAM Wideband Channel',
      carrier: '2.412 GHz',
      bandwidth: '1.20 MHz',
      snr: '26.8 dB',
      modulation: '16-QAM',
      fec: 'Reed-Solomon (255, 223)',
      baud: '1.0 MBd',
      bitstream: '53 49 48 20 32 30 32 36 20 51 41 4D 20 46 52 41 4D 45 20 30 31 41 46',
      ascii: 'SIH 2026 QAM FRAME 01AF',
    },
  };

  const curr = demoSignals[activeSignalKey];

  const handleSimulate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#080A0F] text-slate-200 font-sans selection:bg-sky-500/20 selection:text-sky-300">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[#1E2638] pb-3 text-xs font-mono">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
            <span>Return to Homepage</span>
          </a>
          <span className="px-2 py-0.5 rounded-xs bg-[#1A1813] text-[#F59E0B] border border-[#3E2F13] text-[10px] font-bold">
            SYNTHETIC BENCHMARK WORKBENCH
          </span>
        </div>

        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1E2638]">
          <div>
            <div className="text-xs font-mono text-sky-400 uppercase tracking-wider font-semibold mb-1">
              DISCRETE-TIME DSP TESTBENCH
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Signal Analysis Demo Station
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-2xl leading-relaxed">
              Evaluate Welch PSD estimation, Costas carrier sync, and forward error correction routines across benchmark baseband signals.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSimulate}
            disabled={isProcessing}
            className="px-3.5 py-2 rounded-xs bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Re-computing FFT...' : 'Re-calculate DSP'}</span>
          </button>
        </div>

        {/* Signal Selection Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          {Object.entries(demoSignals).map(([k, sig]) => (
            <button
              key={k}
              type="button"
              onClick={() => setActiveSignalKey(k)}
              className={`p-3 rounded-xs border text-left transition-colors cursor-pointer ${
                activeSignalKey === k
                  ? 'bg-[#121828] border-sky-500 text-white'
                  : 'bg-[#0E121C] hover:bg-[#141A28] border-[#1E2638] text-slate-400 hover:border-[#2C374E]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-white">{sig.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-[#080A0F] border border-[#1E2638] text-sky-400">
                  {sig.modulation}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                CF: <span className="text-slate-200">{sig.carrier}</span> • BW: <span className="text-slate-200">{sig.bandwidth}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Main Instruments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Spectrum Analyzer & Oscilloscope (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-[#0E121C] border border-[#1E2638] rounded-xs p-4 space-y-3">
              <div className="flex items-center justify-between font-mono text-xs text-slate-300 border-b border-[#1E2638] pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  CALIBRATED RF SPECTRUM ANALYZER
                </span>
                <span className="text-slate-400">CF: {curr.carrier}</span>
              </div>
              <EngineeringSpectrumAnalyzer 
                height={260} 
                frequency={curr.carrier} 
                snr={curr.snr} 
                bandwidth={curr.bandwidth} 
                modulation={curr.modulation} 
              />
            </div>

            <div className="bg-[#0E121C] border border-[#1E2638] rounded-xs p-4 space-y-3">
              <div className="flex items-center justify-between font-mono text-xs text-slate-300 border-b border-[#1E2638] pb-2">
                <span className="font-bold text-white">TIME-DOMAIN BASEBAND QUADRATURE TRACE</span>
                <span className="text-slate-400">2.4 MSPS</span>
              </div>
              <OscilloscopeCanvas height={180} />
            </div>
          </div>

          {/* Right: Constellation & Demodulated Payload (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#0E121C] border border-[#1E2638] rounded-xs p-4 space-y-3">
              <div className="flex items-center justify-between font-mono text-xs text-slate-300 border-b border-[#1E2638] pb-2">
                <span className="font-bold text-white">I/Q CONSTELLATION PLANE</span>
                <span className="text-emerald-400 text-[11px]">EVM: 3.9%</span>
              </div>
              <ConstellationCanvas 
                height={220} 
                modulation={curr.modulation.includes('QAM') ? '16-QAM' : (curr.modulation.includes('FSK') ? 'BPSK' : 'QPSK')} 
              />
            </div>

            {/* Extracted Parameters Dossier */}
            <div className="bg-[#0E121C] border border-[#1E2638] rounded-xs p-4 space-y-2 font-mono text-xs">
              <div className="text-white font-bold border-b border-[#1E2638] pb-2 flex items-center justify-between">
                <span>ESTIMATED SIGNAL PARAMETERS</span>
                <span className="text-emerald-400 text-[11px]">99.4% CONF</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">MODULATION:</span>
                  <span className="text-sky-400 font-bold">{curr.modulation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">BANDWIDTH:</span>
                  <span className="text-white">{curr.bandwidth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ESTIMATED SNR:</span>
                  <span className="text-emerald-400 font-bold">{curr.snr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">FEC PROFILE:</span>
                  <span className="text-slate-300">{curr.fec}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">BAUD RATE:</span>
                  <span className="text-white">{curr.baud}</span>
                </div>
              </div>
            </div>

            {/* Decoded Bitstream Box */}
            <div className="bg-[#05070B] border border-[#1E2638] rounded-xs p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400 border-b border-[#1E2638] pb-2">
                <span className="text-white font-bold">DECODED FRAME BYTES</span>
                <span className="text-[10px]">SYNC 0x1ACFFC</span>
              </div>
              <div className="text-[11px] text-slate-300 bg-[#0A0D15] p-2.5 rounded-xs border border-[#1E2638] break-all select-all">
                {curr.bitstream}
              </div>
              <div className="text-xs text-emerald-400 bg-[#0E1B14] p-2 rounded-xs border border-emerald-900/50">
                <span className="text-slate-500 text-[10px] block mb-0.5">ASCII DECODE:</span>
                "{curr.ascii}"
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
