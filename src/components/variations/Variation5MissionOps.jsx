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
import { Satellite, Radio, Crosshair, Wifi, Globe2 } from 'lucide-react';

export default function Variation5MissionOps() {
  return (
    <div className="min-h-screen bg-[#02050E] text-slate-100 font-sans selection:bg-amber-500/20 selection:text-amber-300">
      <Header currentVariationName="Mission Analysis" />

      {/* Satellite Telemetry Ribbon */}
      <div className="pt-24 pb-2 border-b border-amber-500/30 bg-[#070E22] text-center font-mono text-[11px] text-amber-400 tracking-wider">
        <span className="inline-flex items-center gap-2">
          <Satellite className="w-3.5 h-3.5 text-amber-400" />
          SIGNALX SATELLITE DOWNLINK & MISSION ANALYSIS CONSOLE • DOWNLINK FREQ BAND 400-470 MHz
        </span>
      </div>

      {/* Hero Section: Large Satellite Downlink Signal Telemetry Viewport */}
      <section className="relative pt-10 pb-20 overflow-hidden border-b border-signalx-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
              <Globe2 className="w-3.5 h-3.5" />
              <span>ORBITAL RECONNAISSANCE & RF SURVEILLANCE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-sans">
              SIGNAL<span className="text-amber-400">X</span>
              <span className="block text-2xl sm:text-3xl font-semibold text-slate-300 mt-2">
                Automated RF Signal Intelligence
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto">
              "From raw IQ/WAV recordings to signal parameters, modulation, decoded bitstreams and correlation insights."
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <GoogleLoginButton size="lg" variant="primary" />
              <a
                href="/demo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md font-mono text-sm font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4 text-amber-400" />
                <span>Open Telemetry Demo</span>
              </a>
            </div>
          </div>

          {/* Large Central Mission Analysis Telemetry Viewport */}
          <div className="rounded-xl border border-amber-500/40 bg-signalx-panel p-4 shadow-2xl relative">
            {/* Top Telemetry Strip with Strictly Marked DEMO / VISUAL PREVIEW Label */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-signalx-dark border border-signalx-border rounded-t font-mono text-xs mb-3">
              <div className="flex items-center gap-4 text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  SATELLITE CARRIER ACQUISITION
                </span>
                <span className="text-slate-500 hidden sm:inline">|</span>
                <span className="text-slate-400 hidden sm:inline">POLARIZATION: RHCP</span>
              </div>

              {/* Strict Demo Label */}
              <div className="flex items-center gap-2">
                <StatusBadge type="demo" label="DEMO / VISUAL PREVIEW" size="xs" />
                <span className="text-[10px] text-slate-500 hidden md:inline">
                  (Non-fabricated benchmark stream)
                </span>
              </div>
            </div>

            {/* 5 Required Small Telemetry-Style Readouts:
                SAMPLE RATE: 2.4 MHz, SNR: 18.7 dB, BANDWIDTH: 420 kHz, MODULATION: QPSK, STATUS: DSP ENGINE ONLINE */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3 font-mono text-xs">
              <div className="p-2.5 rounded bg-signalx-card border border-signalx-border text-center">
                <div className="text-[10px] text-slate-500 uppercase">SAMPLE RATE</div>
                <div className="text-white font-bold text-sm">2.4 MHz</div>
              </div>
              <div className="p-2.5 rounded bg-signalx-card border border-signalx-border text-center">
                <div className="text-[10px] text-slate-500 uppercase">EST. SNR</div>
                <div className="text-emerald-400 font-bold text-sm">18.7 dB</div>
              </div>
              <div className="p-2.5 rounded bg-signalx-card border border-signalx-border text-center">
                <div className="text-[10px] text-slate-500 uppercase">BANDWIDTH</div>
                <div className="text-white font-bold text-sm">420 kHz</div>
              </div>
              <div className="p-2.5 rounded bg-signalx-card border border-signalx-border text-center">
                <div className="text-[10px] text-slate-500 uppercase">MODULATION</div>
                <div className="text-amber-400 font-bold text-sm">QPSK</div>
              </div>
              <div className="p-2.5 rounded bg-signalx-card border border-signalx-border text-center col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-500 uppercase">STATUS</div>
                <div className="text-cyan-400 font-bold text-xs flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  DSP ONLINE
                </div>
              </div>
            </div>

            {/* Central Signal Visualization Viewport */}
            <RFVisualizerCanvas height={360} mode="combined" carrierFreq="437.500 MHz (SAT-UHF)" bandwidth="420 kHz" snr="18.7 dB" />

            {/* Bottom Station Coordinates */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2 px-2">
              <div>GROUND STATION: NTRO-ALPHA (28.61° N, 77.20° E)</div>
              <div className="text-amber-400/80">ELEVATION: 42.6° | AZIMUTH: 184.2°</div>
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
