import React from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import GoogleLoginButton from '../common/GoogleLoginButton';
import EngineeringSpectrumAnalyzer from '../common/EngineeringSpectrumAnalyzer';
import SignalPipeline from '../homepage/SignalPipeline';
import CapabilitiesGrid from '../homepage/CapabilitiesGrid';
import VisualizationShowcase from '../homepage/VisualizationShowcase';
import TechnicalTrustSection from '../homepage/TechnicalTrustSection';
import FinalCTA from '../homepage/FinalCTA';
import { ArrowRight, Crosshair, Radio, Shield, Terminal } from 'lucide-react';

export default function VariationAerospace() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-slate-200 font-sans selection:bg-sky-500/20 selection:text-sky-300">
      <Header />

      {/* Top Telemetry Header Strip */}
      <div className="pt-14 border-b border-[#1E2638] bg-[#0A0D15] text-[11px] font-mono text-slate-400 py-2 px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sky-400 font-bold">AEROSPACE COMMAND CENTER</span>
          <span className="text-[#1E2638]">•</span>
          <span>RECEIVER: NTRO-ALPHA (28.61° N, 77.20° E)</span>
        </div>
        <div className="flex items-center gap-3">
          <span>POLARIZATION: RHCP</span>
          <span className="text-emerald-400 font-bold">● TELEMETRY LOCKED</span>
        </div>
      </div>

      {/* Hero Section: Exact Engineering Split-Layout */}
      <section id="platform" className="py-14 lg:py-16 border-b border-[#1E2638] bg-[#080A0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* LEFT COLUMN: Technical Metadata & Actions */}
            <div className="lg:col-span-6 space-y-6">
              {/* Eyebrow */}
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400 tracking-wider font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>SIGNALX / RF INTELLIGENCE PLATFORM</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                Automated RF Signal
                <span className="block text-slate-300 font-semibold mt-1">
                  Intelligence & Analysis
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed max-w-xl">
                Transform raw IQ and WAV recordings into measurable signal parameters, modulation candidates, demodulated data, error-correction analysis and explainable technical reports.
              </p>

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <GoogleLoginButton size="lg" variant="primary" label="Continue with Google" />
                <a
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm font-mono text-xs font-semibold text-slate-200 bg-[#121724] hover:bg-[#182032] border border-[#2C374E] hover:border-[#3D4C6C] transition-colors"
                >
                  <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                  <span>Explore Demo</span>
                </a>
              </div>

              {/* Micro Details & Hardware Parameters (Required exact labels) */}
              <div className="pt-4 border-t border-[#1E2638] grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-2 bg-[#0E121C] rounded-xs border border-[#1E2638]">
                  <div className="text-[10px] text-slate-400 uppercase">SUPPORTED INPUT</div>
                  <div className="text-white font-bold text-xs mt-0.5">IQ / WAV</div>
                </div>
                <div className="p-2 bg-[#0E121C] rounded-xs border border-[#1E2638]">
                  <div className="text-[10px] text-slate-400 uppercase">PROCESSING</div>
                  <div className="text-emerald-400 font-bold text-xs mt-0.5">REAL DSP</div>
                </div>
                <div className="p-2 bg-[#0E121C] rounded-xs border border-[#1E2638]">
                  <div className="text-[10px] text-slate-400 uppercase">CASE ID</div>
                  <div className="text-slate-200 font-bold text-xs mt-0.5 truncate">CASE-2026-000142</div>
                </div>
                <div className="p-2 bg-[#0E121C] rounded-xs border border-[#1E2638]">
                  <div className="text-[10px] text-slate-400 uppercase">ENGINE</div>
                  <div className="text-sky-400 font-bold text-xs mt-0.5">DSP CORE 1.0</div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Realistic Engineering Spectrum Analyzer */}
            <div className="lg:col-span-6">
              <EngineeringSpectrumAnalyzer 
                height={300}
                frequency="+124.3 kHz"
                snr="18.7 dB"
                bandwidth="420 kHz"
                modulation="QPSK"
                status="DEMO BENCHMARK"
                hasActiveSignal={true}
                isDemo={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Signal Transformation Pipeline Architecture */}
      <SignalPipeline />

      {/* Asymmetric Capabilities Section */}
      <CapabilitiesGrid />

      {/* Visualization Suite */}
      <VisualizationShowcase />

      {/* Technical Trust & Scientific Honesty */}
      <TechnicalTrustSection />

      {/* Restrained Technical CTA */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}
