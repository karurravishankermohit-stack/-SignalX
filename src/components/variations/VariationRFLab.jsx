import React, { useState } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import GoogleLoginButton from '../common/GoogleLoginButton';
import OscilloscopeCanvas from '../common/OscilloscopeCanvas';
import EngineeringSpectrumAnalyzer from '../common/EngineeringSpectrumAnalyzer';
import SignalPipeline from '../homepage/SignalPipeline';
import CapabilitiesGrid from '../homepage/CapabilitiesGrid';
import VisualizationShowcase from '../homepage/VisualizationShowcase';
import TechnicalTrustSection from '../homepage/TechnicalTrustSection';
import FinalCTA from '../homepage/FinalCTA';
import { Sliders, Cpu, Activity, ArrowDown, Microscope } from 'lucide-react';

export default function VariationRFLab() {
  const [activePreset, setActivePreset] = useState('FSK_9600');

  const presets = {
    FSK_9600: { freq: '144.390 MHz', pwr: '-42.8 dBm', snr: '21.4 dB', bw: '25 kHz', mod: '2-FSK', dev: '5.0 kHz' },
    QPSK_4800: { freq: '433.920 MHz', pwr: '-58.1 dBm', snr: '18.7 dB', bw: '420 kHz', mod: 'QPSK', dev: 'N/A' },
    QAM16_1M: { freq: '2.412 GHz', pwr: '-64.5 dBm', snr: '26.2 dB', bw: '1.2 MHz', mod: '16-QAM', dev: 'N/A' },
  };

  const curr = presets[activePreset];

  return (
    <div className="min-h-screen bg-[#080A0F] text-slate-200 font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      <Header />

      {/* Lab Banner Strip */}
      <div className="pt-14 border-b border-[#1E2638] bg-[#0A0D15] text-[11px] font-mono text-slate-400 py-2 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Microscope className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-bold">SCIENTIFIC RF LABORATORY</span>
          <span className="text-slate-500 hidden sm:inline">• ADVANCED DSP REVERSE-ENGINEERING BENCH</span>
        </div>
        <div className="text-slate-500 text-[10px]">
          BENCH ID: LAB-BENCH-4
        </div>
      </div>

      {/* Hero Section: Research Lab Decomposition */}
      <section id="platform" className="py-14 border-b border-[#1E2638] bg-[#080A0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Scientific Hierarchy */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 tracking-wider font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>DISCRETE-TIME DSP DECOMPOSITION WORKBENCH</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
                Scientific RF Signal
                <span className="block text-slate-300 font-semibold mt-1">
                  Laboratory & Testbench
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed max-w-xl">
                SignalX isolates, characterizes, and decodes raw uncalibrated electromagnetic recordings into mathematical parameters, symbol synchronizations, and verified error-corrected bitstreams.
              </p>

              {/* Mathematical Decomposition Sequence (Required exact flow) */}
              <div className="p-3.5 bg-[#0E121C] border border-[#1E2638] rounded-xs font-mono text-xs">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>MATHEMATICAL TRANSFORMATION SEQUENCE</span>
                  <span className="text-emerald-400 font-bold">7 STAGES</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded-xs bg-[#131826] text-emerald-400 border border-[#1E2638] font-bold">RAW SIGNAL</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2 py-0.5 rounded-xs bg-[#0A0D15] text-slate-300 border border-[#1E2638]">DSP</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2 py-0.5 rounded-xs bg-[#0A0D15] text-slate-300 border border-[#1E2638]">PARAMS</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2 py-0.5 rounded-xs bg-[#0A0D15] text-slate-300 border border-[#1E2638]">MODULATION</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2 py-0.5 rounded-xs bg-[#0A0D15] text-slate-300 border border-[#1E2638]">DEMOD</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2 py-0.5 rounded-xs bg-[#0A0D15] text-slate-300 border border-[#1E2638]">FEC</span>
                  <span className="text-slate-600">→</span>
                  <span className="px-2 py-0.5 rounded-xs bg-[#131826] text-emerald-400 border border-[#1E2638] font-bold">BITSTREAM</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <GoogleLoginButton size="lg" variant="primary" label="Continue with Google" />
                <a
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm font-mono text-xs font-semibold text-slate-200 bg-[#121724] hover:bg-[#182032] border border-[#2C374E] transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Launch Lab Preset</span>
                </a>
              </div>
            </div>

            {/* Right Column: Oscilloscope Trace + Technical Parameter Matrix */}
            <div className="lg:col-span-6 space-y-3">
              <div className="bg-[#0E121C] border border-[#1E2638] rounded-xs p-3">
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-300 border-b border-[#1E2638] pb-2 mb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    TIME-DOMAIN BASEBAND OSCILLOSCOPE
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#131826] text-[#F59E0B] border border-[#2A2416] text-[9px]">
                    SYNTHETIC
                  </span>
                </div>
                <OscilloscopeCanvas height={180} showLabel={false} />
              </div>

              {/* Parametric Analyzer Grid */}
              <div className="bg-[#0E121C] border border-[#1E2638] rounded-xs p-3 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-[#1E2638] pb-1.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">TESTBENCH PRESET:</span>
                  <div className="flex gap-1">
                    {Object.keys(presets).map(k => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setActivePreset(k)}
                        className={`px-2 py-0.5 rounded-xs text-[10px] cursor-pointer border ${
                          activePreset === k
                            ? 'bg-[#121828] text-emerald-400 border-emerald-500/60 font-bold'
                            : 'bg-[#080A0F] text-slate-400 border-[#1E2638] hover:text-white'
                        }`}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-[#080A0F] border border-[#1E2638] rounded-xs">
                    <div className="text-slate-500 text-[9px]">CENTER FREQ</div>
                    <div className="text-white font-bold mt-0.5">{curr.freq}</div>
                  </div>
                  <div className="p-2 bg-[#080A0F] border border-[#1E2638] rounded-xs">
                    <div className="text-slate-500 text-[9px]">BANDWIDTH</div>
                    <div className="text-white font-bold mt-0.5">{curr.bw}</div>
                  </div>
                  <div className="p-2 bg-[#080A0F] border border-[#1E2638] rounded-xs">
                    <div className="text-slate-500 text-[9px]">EST. SNR</div>
                    <div className="text-emerald-400 font-bold mt-0.5">{curr.snr}</div>
                  </div>
                  <div className="p-2 bg-[#080A0F] border border-[#1E2638] rounded-xs">
                    <div className="text-slate-500 text-[9px]">MODULATION</div>
                    <div className="text-sky-400 font-bold mt-0.5">{curr.mod}</div>
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
