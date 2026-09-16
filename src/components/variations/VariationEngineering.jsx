import React from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import GoogleLoginButton from '../common/GoogleLoginButton';
import SignalPipeline from '../homepage/SignalPipeline';
import CapabilitiesGrid from '../homepage/CapabilitiesGrid';
import VisualizationShowcase from '../homepage/VisualizationShowcase';
import TechnicalTrustSection from '../homepage/TechnicalTrustSection';
import FinalCTA from '../homepage/FinalCTA';
import { ArrowRight, Terminal, Check, Code2 } from 'lucide-react';

export default function VariationEngineering() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-slate-200 font-mono selection:bg-slate-700 selection:text-white">
      <Header />

      {/* Hero Section: Minimal Engineering Workstation */}
      <section id="platform" className="pt-24 pb-14 border-b border-[#1E2638] bg-[#080A0F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Minimalist Telemetry Status */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                SYSTEM STATUS: NOMINAL
              </span>
              <span>/</span>
              <span>ENGINE: FASTAPI + NUMPY/SCIPY</span>
              <span>/</span>
              <span className="text-amber-400">BENCHMARK: SYNTHETIC</span>
            </div>

            {/* Stark Large Typography */}
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase font-mono">
                SIGNALX
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mt-1 font-sans font-medium">
                Automated RF Signal Intelligence & Reverse-Engineering Platform
              </p>
            </div>

            {/* Short Technical Description */}
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
              SignalX transforms raw <code className="text-white bg-[#131826] px-1 py-0.5 rounded-xs border border-[#1E2638]">.iq</code> and <code className="text-white bg-[#131826] px-1 py-0.5 rounded-xs border border-[#1E2638]">.wav</code> baseband recordings into verified signal parameters, automatic modulation classification, digital demodulation, and forward error correction (FEC) decoded payloads.
            </p>

            {/* Direct CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <GoogleLoginButton size="md" variant="primary" label="START ANALYSIS" />
              <a
                href="/demo"
                className="px-4 py-2 rounded-xs border border-[#2C374E] hover:border-[#3D4C6C] bg-[#0E121C] text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            {/* Direct Technical Pipeline Ribbon Below Hero:
                IQ / WAV → DSP → PARAMETERS → MODULATION → FEC → BITSTREAM → REPORT */}
            <div className="mt-8 pt-5 border-t border-[#1E2638]">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2.5">
                PROCESSING PIPELINE TOPOLOGY:
              </div>
              <div className="p-3 rounded-xs bg-[#0A0D15] border border-[#1E2638] flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-xs bg-[#131826] text-white font-bold border border-[#1E2638]">IQ / WAV</span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded-xs bg-[#0E121C] text-slate-300 border border-[#1E2638]">DSP</span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded-xs bg-[#0E121C] text-slate-300 border border-[#1E2638]">PARAMETERS</span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded-xs bg-[#0E121C] text-slate-300 border border-[#1E2638]">MODULATION</span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded-xs bg-[#0E121C] text-slate-300 border border-[#1E2638]">FEC</span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded-xs bg-[#0E121C] text-slate-300 border border-[#1E2638]">BITSTREAM</span>
                <span className="text-slate-600">→</span>
                <span className="px-2.5 py-1 rounded-xs bg-[#121E17] text-emerald-400 border border-emerald-800 font-bold">REPORT</span>
              </div>
            </div>

            {/* Technical Specification Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-3 bg-[#0E121C] rounded-xs border border-[#1E2638]">
                <div className="text-slate-400 text-[10px]">SUPPORTED FORMATS</div>
                <div className="text-white font-bold mt-0.5 text-xs">WAV (PCM), RAW IQ (int16/float32)</div>
              </div>
              <div className="p-3 bg-[#0E121C] rounded-xs border border-[#1E2638]">
                <div className="text-slate-400 text-[10px]">CLASSIFIER FAMILY</div>
                <div className="text-white font-bold mt-0.5 text-xs">2/4-FSK, B/Q/8-PSK, 16/64-QAM</div>
              </div>
              <div className="p-3 bg-[#0E121C] rounded-xs border border-[#1E2638]">
                <div className="text-slate-400 text-[10px]">FEC SOLVERS</div>
                <div className="text-white font-bold mt-0.5 text-xs">Viterbi, Reed-Solomon, LDPC</div>
              </div>
              <div className="p-3 bg-[#0E121C] rounded-xs border border-[#1E2638]">
                <div className="text-slate-400 text-[10px]">EXPORT SUITE</div>
                <div className="text-white font-bold mt-0.5 text-xs">Dossier PDF, JSON, CSV</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signal Pipeline */}
      <SignalPipeline />

      {/* Capabilities */}
      <CapabilitiesGrid />

      {/* Visualization Suite */}
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
