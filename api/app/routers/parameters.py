from fastapi import APIRouter, HTTPException
from ..database import load_signal, update_session
from ..core.parameter_estimator import extract_all_parameters

router = APIRouter()

@router.get("/analyze/parameters/{session_id}")
def get_parameters(session_id: str):
    d = load_signal(session_id)
    if not d:
        raise HTTPException(404, "Session signal data not found")

    r = extract_all_parameters(
        d['processed'],
        d['sample_rate'],
        d.get('sample_rate_source', 'METADATA'),
        center_freq_hz=d.get('center_freq_hz'),
        center_freq_source=d.get('center_freq_source', 'UNAVAILABLE'),
        n_samples=d.get('n_samples'),
        duration=d.get('duration'),
    )
    r['data_source'] = d.get('data_source', 'REAL_ANALYSIS')
    update_session(session_id, results={'parameters': r})
    return r
