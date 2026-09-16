import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useSignalStore } from '../store/useSignalStore';
import { uploadFile, loadDemo } from '../lib/api';
import { UploadCloud, FileText, Settings, Play, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();
  const setSession = useSignalStore(s => s.setSession);
  const currentUser = useSignalStore(s => s.currentUser);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // IQ Config Modal state
  const [pendingIqFile, setPendingIqFile] = useState(null);
  const [iqSampleRate, setIqSampleRate] = useState('2400000');
  const [iqDtype, setIqDtype] = useState('float32');
  const [iqArrangement, setIqArrangement] = useState('interleaved');
  const [iqCenterFreq, setIqCenterFreq] = useState('');
  const [wavInterpretation, setWavInterpretation] = useState('auto');
  const [processLimit, setProcessLimit] = useState('');

  const executeUpload = async (file, config = {}) => {
    try {
      setUploading(true);
      setError(null);
      const uploadCfg = { ...config, userId: currentUser?.id || 'guest' };
      const res = await uploadFile(file, uploadCfg);
      const sid = res.session_id || res.sessionId;
      const cid = res.case_id || res.caseId;
      setSession({
        sessionId: sid,
        caseId: cid,
        filename: file.name,
        fileFormat: res.format,
        dataSource: 'REAL_ANALYSIS',
        processingStatus: 'ready',
      });
      navigate('/analysis');
    } catch (e) {
      setError(e.message || 'Failed to upload signal');
    } finally {
      setUploading(false);
      setPendingIqFile(null);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles?.length) return;
    const file = acceptedFiles[0];
    const isIq = file.name.toLowerCase().endsWith('.iq');
    if (isIq) {
      setPendingIqFile(file);
    } else {
      executeUpload(file, { interpretation: wavInterpretation });
    }
  }, [wavInterpretation]);


  const handleIqConfirm = () => {
    if (!pendingIqFile) return;
    executeUpload(pendingIqFile, {
      sample_rate: parseFloat(iqSampleRate) || 2400000,
      sample_format: iqDtype,
      arrangement: iqArrangement,
      center_freq_hz: iqCenterFreq ? parseFloat(iqCenterFreq) : null,
      processDurationLimit: processLimit ? parseFloat(processLimit) : null,
    });
  };

  const handleDemo = async (type) => {
    try {
      setUploading(true);
      setError(null);
      const res = await loadDemo(type.toLowerCase(), currentUser?.id);
      const sid = res.session_id || res.sessionId;
      const cid = res.case_id || res.caseId;
      const r = res.results || {};
      setSession({
        sessionId: sid,
        caseId: cid,
        filename: `demo_${type.toLowerCase()}.iq`,
        fileFormat: 'iq',
        dataSource: 'DEMO_DATA',
        processingStatus: 'ready',
        modulation: r.modulation || null,
        demodulation: r.demodulation || null,
        quality: r.quality || null,
        parameters: r.parameters || null,
        interleaving: r.interleaving_detection || null,
        fec: r.fec_detection || null,
      });
      navigate('/analysis');
    } catch (e) {
      setError(e.message || 'Failed to load demo signal');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8 font-sans">
      <div className="border-b border-[#1A2238] pb-6">
        <div className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider mb-1">
          INGESTION WORKSTATION
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Signal Ingestion & Intake</h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload raw recorded RF signals (.iq) or captured acoustic/baseband audio (.wav). Automatic parameter discovery runs on intake.
        </p>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-4 rounded-sm flex items-start gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Ingestion Failed</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* WAV Interpretation Mode Selector */}
      <div className="bg-[#090C13] border border-[#1A2238] p-4 rounded-sm font-mono text-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-slate-300 font-bold uppercase tracking-wider">WAV Ingestion Mode:</span>
          <span className="text-slate-500 ml-2">Stereo WAV is not automatically assumed to be IQ</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#06080D] p-1 border border-[#1A2238] rounded-xs">
          {[
            { id: 'auto', label: 'Auto Detect (Correlation Check)' },
            { id: 'real_audio', label: 'Real / Audio (Acoustic)' },
            { id: 'stereo_iq', label: 'Stereo IQ (Ch0=I, Ch1=Q)' }
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setWavInterpretation(opt.id)}
              className={`px-3 py-1 text-xs rounded-xs cursor-pointer transition-all ${
                wavInterpretation === opt.id
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-sm p-14 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-sky-500 bg-sky-500/10'
            : 'border-[#1A2238] bg-[#090C13] hover:border-sky-500/50 hover:bg-[#0B1420]'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-[#0E121C] border border-[#1A2238] rounded-full">
            <UploadCloud className="w-8 h-8 text-sky-400" />
          </div>
          <div className="text-base font-semibold text-slate-200">
            {uploading ? 'Processing File Through Ingestion Pipeline...' : isDragActive ? 'Drop signal file here' : 'Drag and drop .WAV or .IQ file here, or click to browse'}
          </div>
          <div className="text-xs text-slate-500 max-w-md">
            Supports standard PCM .wav files (Mono Real or Stereo IQ) and raw binary .iq baseband captures up to 500 MB.
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="bg-[#090C13] border border-[#1A2238] rounded-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              MODE B — SYNTHETIC DEMO SIGNALS
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generates mathematically authentic signals with tracked transmitted bits for end-to-end pipeline validation and ground-truth BER calculation.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-950/60 border border-amber-800 text-amber-300 rounded-xs">
            DEMO DATA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleDemo('QPSK')}
            disabled={uploading}
            className="flex items-center justify-between p-4 bg-[#0E121C] border border-[#1A2238] hover:border-sky-500/60 rounded-sm text-left transition-colors cursor-pointer group disabled:opacity-50"
          >
            <div>
              <div className="font-mono text-sm font-bold text-white group-hover:text-sky-400">QPSK Demo</div>
              <div className="text-xs text-slate-400 mt-1">4-Phase, Gray Coded, AWGN</div>
            </div>
            <Play className="w-4 h-4 text-sky-400 shrink-0" />
          </button>

          <button
            onClick={() => handleDemo('FSK')}
            disabled={uploading}
            className="flex items-center justify-between p-4 bg-[#0E121C] border border-[#1A2238] hover:border-sky-500/60 rounded-sm text-left transition-colors cursor-pointer group disabled:opacity-50"
          >
            <div>
              <div className="font-mono text-sm font-bold text-white group-hover:text-sky-400">2FSK Demo</div>
              <div className="text-xs text-slate-400 mt-1">Frequency Shift Keying, 5 kHz Dev</div>
            </div>
            <Play className="w-4 h-4 text-sky-400 shrink-0" />
          </button>

          <button
            onClick={() => handleDemo('16QAM')}
            disabled={uploading}
            className="flex items-center justify-between p-4 bg-[#0E121C] border border-[#1A2238] hover:border-sky-500/60 rounded-sm text-left transition-colors cursor-pointer group disabled:opacity-50"
          >
            <div>
              <div className="font-mono text-sm font-bold text-white group-hover:text-sky-400">16-QAM Demo</div>
              <div className="text-xs text-slate-400 mt-1">16-State Constellation Grid</div>
            </div>
            <Play className="w-4 h-4 text-sky-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* IQ Configuration Modal */}
      {pendingIqFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs font-mono">
          <div className="bg-[#0E121C] border border-[#253044] rounded-sm max-w-lg w-full p-6 shadow-2xl relative text-left">
            <div className="border-b border-[#1A2238] pb-3 mb-4">
              <div className="text-[10px] text-sky-400 uppercase font-bold tracking-wider">
                RAW IQ INGESTION CONFIGURATION
              </div>
              <h2 className="text-lg font-bold text-white font-sans mt-0.5">
                Configure {pendingIqFile.name}
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-1">
                Raw IQ captures lack standard metadata headers. Specify recording parameters for accurate mathematical interpretation.
              </p>
            </div>

            <form onSubmit={handleIqSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">
                  Sampling Rate (Hz) <span className="text-sky-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={iqSampleRate}
                  onChange={e => setIqSampleRate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#06080D] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                  placeholder="e.g. 2400000"
                />
                <span className="text-[10px] text-slate-500">Must match SDR capture hardware rate.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Sample Format</label>
                  <select
                    value={iqDtype}
                    onChange={e => setIqDtype(e.target.value)}
                    className="w-full px-3 py-2 bg-[#06080D] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                  >
                    <option value="float32">Float32 (32-bit float)</option>
                    <option value="int16">Int16 (16-bit signed int)</option>
                    <option value="int8">Int8 (8-bit signed int)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">IQ Arrangement</label>
                  <select
                    value={iqArrangement}
                    onChange={e => setIqArrangement(e.target.value)}
                    className="w-full px-3 py-2 bg-[#06080D] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                  >
                    <option value="interleaved">Interleaved (I0, Q0, I1, Q1...)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">
                  Absolute RF Center Frequency (Hz) <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={iqCenterFreq}
                  onChange={e => setIqCenterFreq(e.target.value)}
                  className="w-full px-3 py-2 bg-[#06080D] border border-[#1A2238] text-white rounded-xs focus:border-sky-500 focus:outline-hidden"
                  placeholder="e.g. 145320000"
                />
                <span className="text-[10px] text-slate-500">If omitted, absolute center frequency will remain UNAVAILABLE.</span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1A2238]">
                <button
                  type="button"
                  onClick={() => setPendingIqFile(null)}
                  className="px-4 py-2 bg-[#1A2238] text-slate-300 rounded-xs hover:bg-[#253044] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploading ? 'Processing...' : 'Ingest & Parse Signal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
