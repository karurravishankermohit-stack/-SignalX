import React, { useEffect, useState } from 'react';
import { useSignalStore } from '../store/useSignalStore';
import { detectFec, fecDecode } from '../lib/api';
import SourceBadge from '../components/analysis/SourceBadge';
import { Activity, Play, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function FecPage() {
  const { sessionId } = useSignalStore();
  const [detection, setDetection] = useState(null);
  const [fecType, setFecType] = useState('convolutional');
  const [convK, setConvK] = useState('7');
  const [convRateDen, setConvRateDen] = useState('2');
  const [rsNsym, setRsNsym] = useState('32');
  const [result, setResult] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [error, setError] = useState(null);

  const runFecDetection = () => {
    if (!sessionId) return;
    setDetecting(true);
    setError(null);
    detectFec(sessionId)
      .then(res => {
        setDetection(res);
        if (res?.best?.type && res.best.type !== 'none') {
          setFecType(res.best.type);
          if (res.best.params?.K) setConvK(res.best.params.K.toString());
          if (res.best.params?.rate === '1/2') setConvRateDen('2');
          if (res.best.params?.rate === '1/3') setConvRateDen('3');
          if (res.best.params?.nsym) setRsNsym(res.best.params.nsym.toString());
        }
      })
      .catch(e => setError(e.message || 'FEC detection failed. Demodulate signal bits first.'))
      .finally(() => setDetecting(false));
  };

  useEffect(() => {
    runFecDetection();
  }, [sessionId]);

  const handleDecode = async (e) => {
    e.preventDefault();
    if (!sessionId) return;
    try {
      setDecoding(true);
      setError(null);
      let params = {};
      if (fecType === 'convolutional') {
        params = { K: parseInt(convK), rate_den: parseInt(convRateDen) };
      } else if (fecType === 'reed-solomon') {
        params = { nsym: parseInt(rsNsym) };
      }

      const res = await fecDecode(sessionId, fecType, params);
      setResult(res);
    } catch (err) {
      setError(err.message || 'FEC decoding failed');
    } finally {
      setDecoding(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="text-center py-24 font-mono text-slate-400 space-y-2">
        <Activity className="w-10 h-10 text-slate-600 mx-auto" />
        <p>No signal session active. Please ingest a signal file first.</p>
      </div>
    );
  }

  const decodedBits = result?.decoded_bits || [];
  const hexPreview = decodedBits.length > 0 ? (
    Array.from({ length: Math.ceil(decodedBits.length / 8) }, (_, i) => {
      const byteBits = decodedBits.slice(i * 8, (i + 1) * 8);
      const byteVal = byteBits.reduce((acc, b, idx) => acc | (b << (7 - idx)), 0);
      return byteVal.toString(16).padStart(2, '0').toUpperCase();
    }).join(' ')
  ) : '';

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2238] pb-4">
        <div>
          <div className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider">
            DSP STAGE 13 & 14 / 17
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Forward Error Correction (FEC) & Viterbi Decoder</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            NASA standard K=7 Viterbi algorithm, Reed-Solomon algebraic decoding, and concatenated coding.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SourceBadge source={detection?.source || 'AUTO_CLASSIFIED'} />
          <button
            onClick={runFecDetection}
            disabled={detecting}
            className="p-2 bg-[#0E121C] border border-[#1A2238] hover:border-sky-500 rounded-sm text-slate-300 transition-colors cursor-pointer"
            title="Re-run FEC Auto Detection"
          >
            <RefreshCw className={`w-4 h-4 ${detecting ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-sm text-xs font-mono">{error}</div>}

      {/* Auto-Detection Candidate Banner */}
      {detection && (
        <div className="bg-[#090C13] border border-[#1A2238] p-4 rounded-sm font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 uppercase font-bold">AUTOMATIC FEC IDENTIFICATION CANDIDATE:</span>
            <span className={`px-2 py-0.5 rounded-xs border ${
              detection.status === 'NO_RELIABLE_FEC_CANDIDATE'
                ? 'bg-amber-950/40 border-amber-800 text-amber-400'
                : 'bg-sky-950/60 border-sky-800 text-sky-400'
            }`}>
              {detection.status === 'NO_RELIABLE_FEC_CANDIDATE'
                ? 'NO RELIABLE FEC CANDIDATE'
                : (detection.best ? `${detection.best.type.toUpperCase()} (${detection.best.confidence}%)` : 'NONE')}
            </span>
          </div>
          <div className="text-slate-400 space-y-1">
            {detection.evidence && detection.evidence.map((ev, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-slate-600">•</span>
                <span>{ev}</span>
              </div>
            ))}
          </div>
          {detection.alternatives && detection.alternatives.length > 0 && (
            <div className="text-[11px] text-slate-500 pt-1 border-t border-[#1A2238] flex items-center gap-3">
              <span className="text-slate-600">TESTED CODECS:</span>
              {detection.alternatives.map((alt, i) => (
                <span key={i} className="bg-[#121826] px-1.5 py-0.5 rounded text-slate-400">
                  {alt.type} ({alt.confidence}%)
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Decoder Execution Form */}
      <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-6">
        <form onSubmit={handleDecode} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1">FEC SCHEME</label>
              <select
                value={fecType}
                onChange={e => setFecType(e.target.value)}
                className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
              >
                <option value="convolutional">Convolutional (Viterbi)</option>
                <option value="reed-solomon">Reed-Solomon Block Code</option>
                <option value="concatenated">Concatenated (Viterbi + RS)</option>
                <option value="ldpc">LDPC (Low-Density Parity-Check)</option>
              </select>
            </div>

            {fecType === 'convolutional' && (
              <>
                <div>
                  <label className="block text-slate-400 mb-1">CONSTRAINT LENGTH (K)</label>
                  <select
                    value={convK}
                    onChange={e => setConvK(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                  >
                    <option value="7">K=7 (NASA Standard)</option>
                    <option value="5">K=5</option>
                    <option value="9">K=9</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">CODE RATE</label>
                  <select
                    value={convRateDen}
                    onChange={e => setConvRateDen(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                  >
                    <option value="2">Rate 1/2</option>
                    <option value="3">Rate 1/3</option>
                  </select>
                </div>
              </>
            )}

            {fecType === 'reed-solomon' && (
              <div>
                <label className="block text-slate-400 mb-1">PARITY SYMBOLS (NSYM)</label>
                <input
                  type="number"
                  value={rsNsym}
                  onChange={e => setRsNsym(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0E121C] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                  required
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={decoding}
              className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xs text-xs font-mono transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{decoding ? 'Executing Trellis / Parity Correction...' : 'Execute FEC Decoder'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Decoding Results */}
      {result && (
        <div className="space-y-4">
          {result.available === false ? (
            <div className="p-4 bg-amber-950/20 border border-amber-800 text-amber-300 rounded-sm font-mono text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold">Honest Scientific Reporting</div>
                <div>{result.message}</div>
              </div>
            </div>
          ) : (
            <>
              {/* Decode Label & Provenance Banner */}
              <div className="bg-[#090C13] border border-[#1A2238] p-4 rounded-sm font-mono text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A2238] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold uppercase">EXECUTION MODE:</span>
                    <span className="text-white font-bold">{result.decode_label || "Configured/Manual FEC Decode — not automatically detected"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#121826] border border-[#1A2238] rounded-xs text-slate-300 text-[11px]">
                      CONFIG SOURCE: <strong className="text-sky-400">{result.config_source || 'MANUAL'}</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-[#121826] border border-[#1A2238] rounded-xs text-slate-300 text-[11px]">
                      DETECTION: <strong className={result.detection_status === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}>{result.detection_status || 'NO_RELIABLE_CANDIDATE'}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-400 text-[11px]">
                  <div>
                    <span className="text-slate-500">DECODER STANDARD: </span>
                    <span className="text-slate-300">{result.decoder_configuration?.standard || (fecType === 'convolutional' ? 'NASA Standard K=7, r=1/2 (171/133 octal) Viterbi' : fecType)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">PROVENANCE: </span>
                    <span className="text-slate-300">{result.source_type === 'DEMO' ? 'DEMO DATA (Reference Bits Available)' : 'REAL UPLOAD (Blind Channel)'}</span>
                  </div>
                </div>

                {result.limitations && (
                  <div className="pt-2 border-t border-[#1A2238] space-y-1">
                    <span className="text-slate-500 text-[10px] font-bold uppercase">DECODER LIMITATIONS & ASSUMPTIONS:</span>
                    {result.limitations.map((lim, i) => (
                      <div key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                        <span className="text-amber-500">•</span>
                        <span>{lim}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
                  <div className="text-slate-500 text-[10px]">DECODED MESSAGE BITS</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">{result.bit_count || decodedBits.length} bits</div>
                  <div className="text-[10px] text-slate-500">Decoded payload bits</div>
                </div>

                <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
                  <div className="text-slate-500 text-[10px]">CORRECTION STATUS</div>
                  <div className="text-sm font-bold text-sky-400 mt-1">
                    {result.syndrome_status || (result.path_metric !== undefined ? `Path Metric: ${result.path_metric.toFixed(1)}` : 'Decoded')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {result.errors_corrected !== undefined ? `${result.errors_corrected} byte errors repaired` : 'Trellis path minimum'}
                  </div>
                </div>

                <div className="bg-[#090C13] border border-[#1A2238] p-3 rounded-sm">
                  <div className="text-slate-500 text-[10px]">RESIDUAL BER</div>
                  <div className="text-base font-bold text-white mt-1">
                    {result.ber?.value !== null && result.ber?.value !== undefined
                      ? `${(result.ber.value * 100).toFixed(2)}%`
                      : 'NOT AVAILABLE'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {result.ber?.reason || result.ber?.text || 'Ground truth/reference bits unavailable.'}
                  </div>
                </div>
              </div>

              {/* Hex and Binary Preview */}
              <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-4 font-mono text-xs space-y-4">
                <div>
                  <div className="text-slate-400 font-bold mb-1">DECODED BITS (HEXADECIMAL):</div>
                  <div className="p-3 bg-[#06080D] border border-[#1A2238] rounded-xs text-sky-300 tracking-wider break-all select-all">
                    {hexPreview || 'No decoded bits'}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-bold mb-1">DECODED BITS (BINARY):</div>
                  <div className="p-3 bg-[#06080D] border border-[#1A2238] rounded-xs text-emerald-400 break-all select-all font-mono tracking-widest leading-relaxed">
                    {decodedBits.slice(0, 128).join('') || 'No decoded bits'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
