import React from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import GoogleLoginButton from '../common/GoogleLoginButton';
import StatusBadge from '../common/StatusBadge';
import ConstellationCanvas from '../common/ConstellationCanvas';
import SignalPipeline from '../homepage/SignalPipeline';
import CapabilitiesGrid from '../homepage/CapabilitiesGrid';
import HowItWorksWorkflow from '../homepage/HowItWorksWorkflow';
import VisualizationShowcase from '../homepage/VisualizationShowcase';
import TechnicalTrustSection from '../homepage/TechnicalTrustSection';
import FinalCTA from '../homepage/FinalCTA';
import { Sparkles, Shield, Compass, Disc, Zap } from 'lucide-react';

export default function Variation3FutureIntel() {
  return (
    <div className="min-h-screen bg-[#030612] text-slate-100 font-sans selection:bg-blue-500/20 selection:text-blue-300">
      <Header currentVariationName="Future Intelligence" />

      {/* Hero Section: Future Signals Intelligence Platform */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-blue-900/30">
        {/* Soft radial background glow (no harsh neon) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-7">
              {/* Badge */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>NEXT-GENERATION RF RECONNAISSANCE</span>
                </span>
                <StatusBadge type="synthetic" label="SYNTHETIC BENCHMARK" size="xs" />
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.08] font-sans">
                  SIGNAL<span className="text-blue-400">X</span>
                  <span className="block text-2xl sm:text-3xl lg:text-4xl font-normal text-slate-300 mt-2">
                    Future Automated Signal Intelligence
                  </span>
                </h1>
              </div>

              {/* Tagline */}
              <p className="text-lg text-slate-300 max-w-xl font-light leading-relaxed">
                "From Raw IQ/WAV Signals to Explainable Signal Intelligence. Transforming raw spectrum into decoded insight with high-precision DSP and cryptographic forward error correction."
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <GoogleLoginButton size="lg" variant="primary" />
                <a
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md font-mono text-sm text-blue-300 bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer"
                >
                  <Disc className="w-4 h-4 text-blue-400" />
                  <span>Inspect Constellations</span>
                </a>
              </div>

              {/* Intelligence Attributes */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-6 font-mono text-xs text-slate-400">
                <div>
                  <div className="text-white font-semibold text-sm">POLAR I/Q</div>
                  <div className="text-slate-400 text-[11px]">Symbol Cluster Geometry</div>
                </div>
                <div>
                  <div className="text-blue-300 font-semibold text-sm">PROBABILISTIC</div>
                  <div className="text-slate-400 text-[11px]">Confidence & Evidence</div>
                </div>
                <div>
                  <div className="text-cyan-300 font-semibold text-sm">ZERO SECRETS</div>
                  <div className="text-slate-400 text-[11px]">Hardened Defense Client</div>
                </div>
              </div>
            </div>

            {/* Right: Glassmorphic I/Q Constellation Console */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl glass-panel p-6 shadow-2xl border border-blue-500/30 hover:border-blue-500/50 transition-colors">
                <div className="flex items-center justify-between mb-4 border-b border-blue-900/40 pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                    <Compass className="w-4 h-4" />
                    <span className="font-bold tracking-wider">COMPLEX PLANE I/Q ANALYZER</span>
                  </div>
                  <StatusBadge type="engine" label="LOCKED" size="xs" />
                </div>

                <ConstellationCanvas height={280} modulation="QPSK" showLabel={false} />

                {/* Sub-panel intelligence stats */}
                <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
                  <div>
                    <div className="text-slate-500">MODULATION</div>
                    <div className="text-blue-300 font-bold">QPSK / 4-QAM</div>
                  </div>
                  <div>
                    <div className="text-slate-500">PHASE JITTER</div>
                    <div className="text-emerald-400 font-bold">&lt; 1.4° RMS</div>
                  </div>
                  <div>
                    <div className="text-slate-500">CLUSTER EVM</div>
                    <div className="text-cyan-400 font-bold">3.8%</div>
                  </div>
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
