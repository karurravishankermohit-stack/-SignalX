from fastapi import APIRouter, HTTPException, Query
from ..database import load_signal, update_session
from ..core.spectrum import compute_spectrum

router = APIRouter()

@router.get("/analyze/spectrum/{session_id}")
def get_spectrum(session_id: str, window: str = Query('hann'), nfft: int = Query(2048)):
    d = load_signal(session_id)
    if not d:
        raise HTTPException(404, "Session signal data not found")

    r = compute_spectrum(d['processed'], d['sample_rate'], nfft=min(nfft, len(d['processed'])), window=window)
    r['data_source'] = d.get('data_source', 'REAL_ANALYSIS')
    update_session(session_id, results={'spectrum': {'peak_freq_hz': r['peak_freq_hz'], 'snr_db': r['snr_db']}})
    return r
