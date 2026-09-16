import React from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import GoogleLoginButton from '../common/GoogleLoginButton';
import StatusBadge from '../common/StatusBadge';
import SignalPipeline from '../homepage/SignalPipeline';
import CapabilitiesGrid from '../homepage/CapabilitiesGrid';
import HowItWorksWorkflow from '../homepage/HowItWorksWorkflow';
import VisualizationShowcase from '../homepage/VisualizationShowcase';
import TechnicalTrustSection from '../homepage/TechnicalTrustSection';
import FinalCTA from '../homepage/FinalCTA';
import { ArrowRight, Terminal, Check, Code2, Hash } from 'lucide-react';

export default function Variation4TechMinimal() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-200 font-mono selection:bg-slate-700 selection:text-white">
      <Header currentVariationName="Technical Minimal" />

      {/* Hero Section: Technical Minimal & High-Density Engineering */}
      <section className="pt-32 pb-16 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Minimalist Status Line */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                SYSTEM: ONLINE
              </span>
              <span>/</span>
              <span>ENGINE: FASTAPI + NUMPY/SCIPY</span>
              <span>/</span>
              <StatusBadge type="demo" label="SYNTHETIC PREVIEW" size="xs" />
            </div>

            {/* Stark Large Typography */}
            <div>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white uppercase">
                SIGNALX
              </h1>
              <p className="text-xl sm:text-2xl text-slate-400 mt-1 font-sans font-medium">
                Automated RF Signal Intelligence & Reverse-Engineering Platform
              </p>
            </div>

            {/* Short Technical Description */}
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed font-sans">
              SignalX transforms raw <code className="text-white bg-slate-800 px-1 py-0.5 rounded">.iq</code> and <code className="text-white bg-slate-800 px-1 py-0.5 rounded">.wav</code> baseband streams into verified signal parameters, automatic modulation classification, digital demodulation, and forward error correction (FEC) decoded payloads.
            </p>

            {/* Direct CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <GoogleLoginButton size="md" variant="primary" />
              <a
                href="/demo"
                className="px-5 py-2.5 rounded border border-slate-700 hover:border-slate-500 bg-slate-900 text-slate-200 hover:text-white text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            {/* Direct Technical Pipeline Ribbon Below Hero:
                IQ / WAV → DSP → PARAMETERS → MODULATION → FEC → BITSTREAM → REPORT */}
            <div className="mt-10 pt-6 border-t border-slate-800">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">
                PROCESSING PIPELINE TOPOLOGY:
              </div>
              <div className="p-4 rounded bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-white font-bold">IQ / WAV</span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-300">DSP</span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-300">PARAMETERS</span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-300">MODULATION</span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-300">FEC</span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-300">BITSTREAM</span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">REPORT</span>
              </div>
            </div>

            {/* Technical Specification Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-4">
              <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
                <div className="text-slate-400">SUPPORTED FORMATS</div>
                <div className="text-white font-bold mt-0.5">WAV (PCM), RAW IQ (int16/float32)</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
                <div className="text-slate-400">CLASSIFIER FAMILY</div>
                <div className="text-white font-bold mt-0.5">2/4-FSK, B/Q/8-PSK, 16/64-QAM</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
                <div className="text-slate-400">FEC SOLVERS</div>
                <div className="text-white font-bold mt-0.5">Viterbi, Reed-Solomon, LDPC</div>
              </div>
              <div className="p-3 bg-slate-900/60 rounded border border-slate-800">
                <div className="text-slate-400">EXPORT SUITE</div>
                <div className="text-white font-bold mt-0.5">Dossier PDF, JSON, CSV</div>
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
