import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCases, deleteCase } from '../lib/api';
import { useSignalStore } from '../store/useSignalStore';
import SourceBadge from '../components/analysis/SourceBadge';
import { FolderGit2, Trash2, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export default function HistoryPage() {
  const navigate = useNavigate();
  const setSession = useSignalStore(s => s.setSession);
  const currentUser = useSignalStore(s => s.currentUser);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCases = () => {
    setLoading(true);
    setError(null);
    getCases(currentUser?.id)
      .then(setCases)
      .catch(e => setError(e.message || 'Failed to fetch case history'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCases();
  }, [currentUser?.id]);

  const handleOpenCase = (c) => {
    setSession({
      sessionId: c.session_id,
      caseId: c.case_id,
      filename: c.filename,
      fileFormat: c.file_format,
      dataSource: c.data_source,
      processingStatus: 'ready',
    });
    navigate('/analysis');
  };

  const handleDelete = async (e, caseId) => {
    e.stopPropagation();
    if (!window.confirm(`Delete case record ${caseId}?`)) return;
    try {
      await deleteCase(caseId);
      setCases(cases.filter(c => c.case_id !== caseId));
    } catch (err) {
      alert(err.message || 'Failed to delete case');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2238] pb-4">
        <div>
          <div className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider">
            MISSION CASE RECORDS
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Signal Intelligence Case History</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real persisted session cases in local storage. Filtered by authorized analyst profile.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCases}
            disabled={loading}
            className="px-3 py-1.5 bg-[#0E121C] border border-[#1A2238] hover:border-sky-500 rounded-sm text-xs font-mono text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            <span>Refresh Cases</span>
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-sm text-xs font-mono">{error}</div>}

      <div className="bg-[#090C13] border border-[#1A2238] rounded-sm overflow-hidden font-mono text-xs">
        {cases.length === 0 ? (
          <div className="text-center py-20 text-slate-500 space-y-2">
            <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto" />
            <div>No persisted signal cases found in database.</div>
            <div className="text-[11px] text-slate-600">Upload a signal or run a demo to create a case record.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1A2238] bg-[#0E121C] text-slate-400 text-[11px]">
                  <th className="py-3 px-4 font-bold">CASE ID</th>
                  <th className="py-3 px-4 font-bold">FILE</th>
                  <th className="py-3 px-4 font-bold">TIMESTAMP</th>
                  <th className="py-3 px-4 font-bold">FORMAT</th>
                  <th className="py-3 px-4 font-bold">MODULATION</th>
                  <th className="py-3 px-4 font-bold">SNR</th>
                  <th className="py-3 px-4 font-bold">PROVENANCE</th>
                  <th className="py-3 px-4 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2238]/60">
                {cases.map((c) => (
                  <tr
                    key={c.case_id}
                    onClick={() => handleOpenCase(c)}
                    className="hover:bg-[#0E121C]/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-bold text-sky-400">{c.case_id}</td>
                    <td className="py-3 px-4 text-white font-bold">{c.filename || 'Unknown'}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-slate-300 uppercase">{c.file_format || 'IQ'}</td>
                    <td className="py-3 px-4 text-emerald-400">
                      {c.modulation ? `${c.modulation} (${Math.round(c.confidence || 0)}%)` : '--'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {c.snr !== null && c.snr !== undefined ? `${c.snr.toFixed(1)} dB` : '--'}
                    </td>
                    <td className="py-3 px-4">
                      <SourceBadge source={c.data_source || 'REAL_ANALYSIS'} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenCase(c)}
                          className="p-1 hover:text-sky-400 transition-colors"
                          title="Open Case"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, c.case_id)}
                          className="p-1 hover:text-rose-400 transition-colors"
                          title="Delete Case"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
