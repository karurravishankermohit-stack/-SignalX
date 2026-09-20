from fastapi import APIRouter, HTTPException, Query
from ..database import load_signal, update_session
from ..core.waterfall import compute_waterfall

router = APIRouter()

@router.get("/analyze/waterfall/{session_id}")
def get_waterfall(session_id: str, nperseg: int = Query(256)):
    d = load_signal(session_id)
    if not d:
        raise HTTPException(404, "Session signal data not found")

    r = compute_waterfall(d['processed'], d['sample_rate'], nperseg=nperseg)
    r['data_source'] = d.get('data_source', 'REAL_ANALYSIS')
    update_session(session_id, results={'waterfall': {'n_time_bins': r['n_time_bins'], 'n_freq_bins': r['n_freq_bins']}})
    return r
