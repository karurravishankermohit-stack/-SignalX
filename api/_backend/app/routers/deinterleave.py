from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from ..database import load_signal, update_session, save_signal
from ..core.interleave import deinterleave_block, deinterleave_convolutional, deinterleave_diagonal, deinterleave_pseudorandom
from ..core.interleave_detector import detect_interleaving
from ..core.demod import demodulate

router = APIRouter()

class DeinterleaveRequest(BaseModel):
    session_id: str
    method: str
    params: Dict[str, Any] = {}

@router.post("/detect/interleaving")
def detect_interleaving_endpoint(req: dict):
    sid = req.get('session_id') or req.get('sessionId')
    if not sid:
        raise HTTPException(422, "session_id required")
    d = load_signal(sid)
    if not d:
        raise HTTPException(404, "Session signal not found")

    bits = d.get('bits')
    if (bits is None or len(bits) == 0) and d.get('processed') is not None:
        mod = d.get('modulation') or 'QPSK'
        sym_rate = d.get('symbol_rate') or d.get('results', {}).get('parameters', {}).get('estimated_symbol_rate', {}).get('symbol_rate_hz') or 4800.0
        r_demod = demodulate(d['processed'], d['sample_rate'], mod, float(sym_rate), 0.0, 0.0)
        bits = r_demod.get('bits', [])
        d['bits'] = bits
        save_signal(sid, d)

    if not bits or len(bits) < 16:
        return {
            'status': 'NO_RELIABLE_CANDIDATE',
            'best': None,
            'confidence': 0.0,
            'alternatives': [],
            'evidence': ['Insufficient demodulated bits for interleaving detection (<16 bits)'],
            'message': 'No reliable interleaving candidate detected in current bitstream.',
            'source': 'AUTO_CLASSIFIED'
        }

    r = detect_interleaving(bits)
    update_session(sid, results={'interleaving_detection': r})
    return r

@router.post("/deinterleave")
def run_deinterleave(req: DeinterleaveRequest):
    d = load_signal(req.session_id)
    if not d:
        raise HTTPException(404, "Session signal not found")
    bits = d.get('bits')
    if (bits is None or len(bits) == 0) and d.get('processed') is not None:
        mod = d.get('modulation') or 'QPSK'
        sym_rate = d.get('symbol_rate') or 4800.0
        r_demod = demodulate(d['processed'], d['sample_rate'], mod, float(sym_rate), 0.0, 0.0)
        bits = r_demod.get('bits', [])
        d['bits'] = bits
        save_signal(req.session_id, d)

    if not bits:
        raise HTTPException(422, "No demodulated bits found in session. Perform demodulation first.")


    p = req.params
    if req.method == 'block':
        out = deinterleave_block(bits, int(p.get('M', 8)), int(p.get('N', 16)))
    elif req.method == 'convolutional':
        out = deinterleave_convolutional(bits, int(p.get('depth', 8)))
    elif req.method == 'diagonal':
        out = deinterleave_diagonal(bits, int(p.get('rows', 8)), int(p.get('cols', 16)))
    elif req.method == 'pseudorandom':
        out = deinterleave_pseudorandom(bits, int(p.get('seed', 42)))
    else:
        raise HTTPException(422, f"Unknown de-interleaving method: {req.method}")

    res = {
        'method': req.method,
        'params': p,
        'before_128': bits[:128],
        'after_128': out[:128],
        'total_bits': len(out),
        'source': 'DSP_COMPUTED',
    }
    update_session(req.session_id, results={'deinterleaved': {'method': req.method, 'total_bits': len(out)}})
    return res
