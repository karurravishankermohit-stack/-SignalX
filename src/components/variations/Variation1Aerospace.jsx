import React from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import GoogleLoginButton from '../common/GoogleLoginButton';
import StatusBadge from '../common/StatusBadge';
import RFVisualizerCanvas from '../common/RFVisualizerCanvas';
import SignalPipeline from '../homepage/SignalPipeline';
import CapabilitiesGrid from '../homepage/CapabilitiesGrid';
import HowItWorksWorkflow from '../homepage/HowItWorksWorkflow';
import VisualizationShowcase from '../homepage/VisualizationShowcase';
import TechnicalTrustSection from '../homepage/TechnicalTrustSection';
import FinalCTA from '../homepage/FinalCTA';
import { ArrowRight, Crosshair, Radio, Shield, Terminal, Zap } from 'lucide-react';

export default function Variation1Aerospace() {
  return (
    <div className="min-h-screen bg-signalx-bg text-slate-100 bg-tech-grid font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      <Header currentVariationName="Aerospace Command Center" />

      {/* Top Banner Tag */}
      <div className="pt-24 pb-2 border-b border-signalx-border/40 bg-signalx-dark/60 text-center font-mono text-[11px] text-cyan-400 tracking-widest uppercase">
        <span>[ DEFENSE INTELLIGENCE SPECIFICATION ] • MISSION OPERATIONS GRADE • SIH 2026</span>
      </div>

      {/* Hero Section: Aerospace Command Center */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-signalx-border">
        {/* Subtle grid corner telemetry */}
        <div className="absolute top-4 left-6 hidden lg:block font-mono text-[10px] text-cyan-400/40 space-y-0.5">
          <div>LOC: 28.6139° N, 77.2090° E</div>
          <div>GRID: NTRO-SEC-4</div>
          <div>STATUS: NOMINAL</div>
        </div>
        <div className="absolute top-4 right-6 hidden lg:block font-mono text-[10px] text-cyan-400/40 text-right space-y-0.5">
          <div>CHANNELS: 16 SYNC</div>
          <div>DSP_CORE: READY</div>
          <div>BUFFER: RING-64MB</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Command Center Text & CTAs */}
            <div className="lg:col-span-6 space-y-6">
              {/* Trust Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge type="engine" label="DSP ENGINE READY" size="sm" pulse={true} />
                <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded border border-signalx-border bg-signalx-card">
                  REAL IQ / WAV INGEST
                </span>
                <StatusBadge type="synthetic" label="DEMO PREVIEW READY" size="xs" />
              </div>

              {/* Headings */}
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-cyan-400 mb-2 font-semibold">
                  SATELLITE & TERRESTRIAL RF SURVEILLANCE
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                  SIGNAL<span className="text-cyan-400">X</span>
                  <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-300 mt-2">
                    Automated RF Signal Intelligence
                  </span>
                </h1>
              </div>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-xl">
                "From raw IQ/WAV recordings to signal parameters, modulation classification, decoded bitstreams and correlation insights."
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <GoogleLoginButton size="lg" variant="primary" className="shadow-cyan-glow" />
                <a
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md font-mono text-sm font-semibold text-cyan-300 bg-signalx-panel hover:bg-signalx-card border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-sm"
                >
                  <Crosshair className="w-4 h-4 text-cyan-400" />
                  <span>Explore Demo</span>
                </a>
              </div>

              {/* Hardware & Spec Stats */}
              <div className="pt-4 border-t border-signalx-border/80 grid grid-cols-3 gap-4 font-mono text-xs text-slate-400">
                <div>
                  <div className="text-cyan-300 font-bold text-sm">2.4 MS/s</div>
                  <div className="text-[10px] text-slate-500">MAX REALTIME SPAN</div>
                </div>
                <div>
                  <div className="text-emerald-400 font-bold text-sm">8 SCHEMES</div>
                  <div className="text-[10px] text-slate-500">FSK / PSK / QAM</div>
                </div>
                <div>
                  <div className="text-purple-400 font-bold text-sm">VITERBI + RS</div>
                  <div className="text-[10px] text-slate-500">FEC HARD/SOFT</div>
                </div>
              </div>
            </div>

            {/* Right Column: Mission Control Spectrum Instrumentation */}
            <div className="lg:col-span-6">
              <div className="relative rounded-xl border border-cyan-500/40 bg-signalx-panel/95 p-3 shadow-2xl shadow-cyan-950/40">
                {/* Visualizer Header HUD */}
                <div className="flex items-center justify-between px-3 py-2 bg-signalx-dark border border-signalx-border rounded-t font-mono text-xs text-slate-300 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-cyan-300 font-bold">SPECTRUM INSTRUMENTATION HUD</span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono">
                    SYNTHETIC PREVIEW
                  </div>
                </div>

                {/* Live FFT & Waterfall Canvas */}
                <RFVisualizerCanvas height={320} mode="combined" carrierFreq="433.920 MHz" bandwidth="420 kHz" snr="18.7 dB" />

                {/* Telemetry bottom indicators */}
                <div className="grid grid-cols-4 gap-2 mt-2 font-mono text-[10px] text-center">
                  <div className="bg-signalx-card p-2 rounded border border-signalx-border">
                    <div className="text-slate-500">BANDWIDTH</div>
                    <div className="text-white font-bold">420 kHz</div>
                  </div>
                  <div className="bg-signalx-card p-2 rounded border border-signalx-border">
                    <div className="text-slate-500">EST. SNR</div>
                    <div className="text-emerald-400 font-bold">18.7 dB</div>
                  </div>
                  <div className="bg-signalx-card p-2 rounded border border-signalx-border">
                    <div className="text-slate-500">MODULATION</div>
                    <div className="text-cyan-300 font-bold">QPSK (98.4%)</div>
                  </div>
                  <div className="bg-signalx-card p-2 rounded border border-signalx-border">
                    <div className="text-slate-500">FRAME SYNC</div>
                    <div className="text-purple-300 font-bold">LOCKED</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signal Transformation Pipeline */}
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
