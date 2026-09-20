from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..database import load_signal, update_session
from ..core.modulation_classifier import classify
from ..core.constellation import extract_constellation

router = APIRouter()

class ModulationRequest(BaseModel):
    session_id: Optional[str] = None
    sessionId: Optional[str] = None

@router.post("/classify/modulation")
def classify_modulation(req: ModulationRequest):
    sid = req.session_id or req.sessionId
    if not sid:
        raise HTTPException(422, "session_id required in request body")
    d = load_signal(sid)
    if not d:
        raise HTTPException(404, "Session signal data not found")

    r = classify(d['processed'], d['sample_rate'])
    r['data_source'] = d.get('data_source', 'REAL_ANALYSIS')
    update_session(sid, results={'modulation': r})
    return r

@router.get("/classify/modulation/{session_id}")
@router.post("/classify/modulation/{session_id}")
def classify_modulation_path(session_id: str):
    d = load_signal(session_id)
    if not d:
        raise HTTPException(404, "Session signal data not found")


    r = classify(d['processed'], d['sample_rate'])
    r['data_source'] = d.get('data_source', 'REAL_ANALYSIS')
    update_session(session_id, results={'modulation': r})
    return r

@router.get("/analyze/constellation/{session_id}")
def get_constellation(session_id: str):
    d = load_signal(session_id)
    if not d:
        raise HTTPException(404, "Session signal data not found")

    mod = d.get('modulation') or d.get('results', {}).get('modulation', {}).get('best')
    sr = d.get('sample_rate') or 48000.0
    r = extract_constellation(d['processed'], modulation=mod, sample_rate=sr)
    r['data_source'] = d.get('data_source', 'REAL_ANALYSIS')
    return r
