import React, { useState } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import GoogleLoginButton from '../common/GoogleLoginButton';
import StatusBadge from '../common/StatusBadge';
import OscilloscopeCanvas from '../common/OscilloscopeCanvas';
import SignalPipeline from '../homepage/SignalPipeline';
import CapabilitiesGrid from '../homepage/CapabilitiesGrid';
import HowItWorksWorkflow from '../homepage/HowItWorksWorkflow';
import VisualizationShowcase from '../homepage/VisualizationShowcase';
import TechnicalTrustSection from '../homepage/TechnicalTrustSection';
import FinalCTA from '../homepage/FinalCTA';
import { ArrowDown, Sliders, Cpu, Activity, ShieldCheck, Microscope } from 'lucide-react';

export default function Variation2SignalLab() {
  const [selectedPreset, setSelectedPreset] = useState('FSK_9600');

  const labPresets = {
    FSK_9600: { freq: '144.390 MHz', power: '-42.8 dBm', snr: '21.4 dB', bw: '25 kHz', mod: '2-FSK', dev: '5.0 kHz' },
    QPSK_4800: { freq: '433.920 MHz', power: '-58.1 dBm', snr: '18.7 dB', bw: '420 kHz', mod: 'QPSK', dev: 'N/A (Phase)' },
    QAM16_1M: { freq: '2.412 GHz', power: '-64.5 dBm', snr: '26.2 dB', bw: '1.2 MHz', mod: '16-QAM', dev: 'N/A (Complex)' },
  };

  const currentData = labPresets[selectedPreset];

  return (
    <div className="min-h-screen bg-[#030611] text-slate-100 font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      <Header currentVariationName="RF Signal Lab" />

      {/* Lab Workstation Status Ribbon */}
      <div className="pt-24 pb-2 border-b border-emerald-500/20 bg-[#060D1F] text-center font-mono text-[11px] text-emerald-400 tracking-wider">
        <span className="inline-flex items-center gap-2">
          <Microscope className="w-3.5 h-3.5 text-emerald-400" />
          SIGNALX ADVANCED RF LAB & DSP RESEARCH WORKSTATION • REVERSE-ENGINEERING TESTBENCH
        </span>
      </div>

      {/* Hero Section: Research Laboratory Visual Pipeline */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-signalx-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Stage Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-2">
              <StatusBadge type="engine" label="DSP TESTBENCH ONLINE" size="sm" pulse={true} />
              <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
                STFT / WELCH PSD MATRIX
              </span>
            </div>
            <div className="text-xs font-mono text-emerald-400">
              SYNTHETIC WORKBENCH BENCHMARK
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Scientific Typography & The Downward Flow Diagram */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="font-mono text-xs text-emerald-400 uppercase tracking-widest mb-1.5 font-semibold">
                  DISCRETE TIME SIGNAL INTELLIGENCE & DSP DECOMPOSITION
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
                  RF Signal Laboratory
                  <span className="block text-xl sm:text-2xl font-mono text-emerald-400 font-semibold mt-1">
                    Explainable Modulation & Bitstream Recovery
                  </span>
                </h1>
              </div>

              <p className="text-base text-slate-300 leading-relaxed max-w-xl">
                SignalX provides a scientific workbench for disassembling complex electromagnetic recordings into calibrated spectral parameters, timing recovery, constellation geometries, and decoded payload bits.
              </p>

              {/* Visual Pipeline Flow: RAW SIGNAL -> DSP -> PARAMETERS -> MODULATION -> DEMODULATION -> FEC -> BITSTREAM */}
              <div className="p-4 rounded-lg bg-signalx-panel border border-emerald-500/30 font-mono text-xs">
                <div className="text-[11px] text-slate-400 mb-2 font-bold flex items-center justify-between">
                  <span>MATHEMATICAL DECOMPOSITION SEQUENCE</span>
                  <span className="text-emerald-400">7-STEP RIGOR</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-bold">
                    RAW SIGNAL
                  </span>
                  <ArrowDown className="w-3 h-3 text-slate-500 -rotate-90 sm:rotate-0" />
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    DSP
                  </span>
                  <ArrowDown className="w-3 h-3 text-slate-500 -rotate-90 sm:rotate-0" />
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    PARAMETERS
                  </span>
                  <ArrowDown className="w-3 h-3 text-slate-500 -rotate-90 sm:rotate-0" />
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    MODULATION
                  </span>
                  <ArrowDown className="w-3 h-3 text-slate-500 -rotate-90 sm:rotate-0" />
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    DEMOD
                  </span>
                  <ArrowDown className="w-3 h-3 text-slate-500 -rotate-90 sm:rotate-0" />
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    FEC
                  </span>
                  <ArrowDown className="w-3 h-3 text-slate-500 -rotate-90 sm:rotate-0" />
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                    BITSTREAM
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <GoogleLoginButton size="lg" variant="primary" />
                <a
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md font-mono text-sm font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 hover:border-emerald-400 transition-all"
                >
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Launch Research Demo</span>
                </a>
              </div>
            </div>

            {/* Right: Technical Parameter Extraction Analyzer Card */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-emerald-500/40 bg-signalx-panel p-5 shadow-2xl space-y-4">
                {/* Card Title */}
                <div className="flex items-center justify-between border-b border-signalx-border pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      PARAMETER EXTRACTION MONITOR
                    </span>
                  </div>
                  <StatusBadge type="demo" label="DEMO PRESET" size="xs" />
                </div>

                {/* Live Oscilloscope Trace */}
                <OscilloscopeCanvas height={160} showLabel={false} />

                {/* Preset Switcher */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">BENCHMARK PRESET:</span>
                  <div className="flex gap-1">
                    {Object.keys(labPresets).map(key => (
                      <button
                        key={key}
                        onClick={() => setSelectedPreset(key)}
                        className={`px-2 py-1 rounded text-[10px] transition-colors border ${
                          selectedPreset === key
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scientific Parameters Data Grid */}
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="p-2.5 rounded bg-signalx-dark border border-signalx-border">
                    <div className="text-slate-500 text-[10px]">CENTER FREQ (REL)</div>
                    <div className="text-emerald-400 font-bold text-sm">{currentData.freq}</div>
                  </div>
                  <div className="p-2.5 rounded bg-signalx-dark border border-signalx-border">
                    <div className="text-slate-500 text-[10px]">OCCUPIED BANDWIDTH</div>
                    <div className="text-white font-bold text-sm">{currentData.bw}</div>
                  </div>
                  <div className="p-2.5 rounded bg-signalx-dark border border-signalx-border">
                    <div className="text-slate-500 text-[10px]">ESTIMATED SNR</div>
                    <div className="text-emerald-300 font-bold text-sm">{currentData.snr}</div>
                  </div>
                  <div className="p-2.5 rounded bg-signalx-dark border border-signalx-border">
                    <div className="text-slate-500 text-[10px]">MODULATION SCHEME</div>
                    <div className="text-cyan-300 font-bold text-sm">{currentData.mod}</div>
                  </div>
                </div>

                {/* Evidence Note */}
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 leading-relaxed">
                  <span className="text-emerald-400 font-bold">DSP Evidence:</span> High-order cumulant ratio C42/C21 indicates constant envelope phase modulation with 98.2% statistical confidence.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signal Pipeline */}
      <SignalPipeline />

      {/* Capabilities */}
      <CapabilitiesGrid />

      {/* How It Works */}
      <HowItWorksWorkflow />

      {/* Visualization Showcase */}
      <VisualizationShowcase />

      {/* Technical Trust */}
      <TechnicalTrustSection />

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}
