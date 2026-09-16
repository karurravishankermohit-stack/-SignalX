from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from ..database import load_signal, update_session, save_signal
from ..core.fec_codec import viterbi_decode, reed_solomon_decode, concatenated_decode, ldpc_decode, _b2by
from ..core.fec_detector import detect_fec
from ..core.demod import demodulate

router = APIRouter()

class FecRequest(BaseModel):
    session_id: str
    fec_type: str
    params: Dict[str, Any] = {}

@router.post("/detect/fec")
def detect_fec_endpoint(req: dict):
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

    if not bits or len(bits) < 32:
        return {
            'status': 'NO_RELIABLE_CANDIDATE',
            'best': None,
            'confidence': 0.0,
            'alternatives': [],
            'evidence': ['Insufficient demodulated bits for FEC code detection (<32 bits)'],
            'message': 'No reliable FEC candidate detected in current bitstream.',
            'source': 'AUTO_CLASSIFIED'
        }

    r = detect_fec(bits)
    update_session(sid, results={'fec_detection': r})
    return r

@router.post("/fec-decode")
def fec_decode(req: FecRequest):
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
    ds = d.get('data_source', 'REAL_ANALYSIS')
    source_type = 'DEMO' if ds == 'DEMO_DATA' else 'REAL_UPLOAD'
    ground_truth_available = (source_type == 'DEMO' and d.get('known_bits') is not None)

    if req.fec_type == 'convolutional':
        r = viterbi_decode(bits, K=int(p.get('K', 7)), rate_den=int(p.get('rate_den', 2)))
    elif req.fec_type == 'reed-solomon':
        r = reed_solomon_decode(_b2by(bits), nsym=int(p.get('nsym', 32)))
    elif req.fec_type == 'concatenated':
        r = concatenated_decode(bits)
    elif req.fec_type == 'ldpc':
        r = ldpc_decode(bits)
    else:
        raise HTTPException(422, f"Unknown FEC type: {req.fec_type}")

    det_res = d.get('results', {}).get('fec_detection', {})
    det_status = det_res.get('status', 'NO_RELIABLE_CANDIDATE')
    det_best = det_res.get('best')

    # Strict configuration source and honest labeling per Requirement 1
    if det_status == 'VERIFIED' and det_best and det_best.get('type') == req.fec_type:
        config_source = 'AUTO'
        decode_label = f"Auto-Detected FEC Decode ({req.fec_type.upper()})"
        execution_status = 'VERIFIED'
    elif ds == 'DEMO_DATA':
        config_source = 'DEMO'
        decode_label = "Configured/Manual FEC Decode — not automatically detected"
        execution_status = 'CONFIGURED_MANUAL'
    else:
        config_source = 'MANUAL'
        decode_label = "Configured/Manual FEC Decode — not automatically detected"
        execution_status = 'CONFIGURED_MANUAL'

    kb = d.get('known_bits')
    db = r.get('decoded_bits', [])

    if ground_truth_available and len(db) > 0:
        n = min(len(db), len(kb))
        er = sum(a != b for a, b in zip(db[:n], kb[:n]))
        r['ber'] = {'value': er / n if n > 0 else 0.0, 'n_compared': n, 'errors': er, 'source': 'DEMO_DATA', 'text': f"{er / n:.6f} ({er} errors / {n} bits)"}
    else:
        r['ber'] = {'value': None, 'source': 'UNAVAILABLE', 'reason': 'BER: NOT AVAILABLE — ground truth/reference bits unavailable.', 'text': 'BER: NOT AVAILABLE — ground truth/reference bits unavailable.'}

    r['status'] = execution_status
    r['detection_status'] = det_status
    r['config_source'] = config_source
    r['decode_label'] = decode_label
    r['source_type'] = source_type
    r['ground_truth_available'] = ground_truth_available
    r['data_source'] = ds
    r['decoder_configuration'] = {
        'fec_type': req.fec_type,
        'params': p,
        'standard': 'NASA Standard K=7, r=1/2 (171/133 octal) Viterbi' if req.fec_type == 'convolutional' else req.fec_type
    }
    r['limitations'] = [
        "Decoder executed using configured/manual parameter set; code was not automatically identified by detection stage.",
        "Blind FEC identification requires distinct non-random syndrome patterns or known trellis state invariants.",
        "Decoded bitstream integrity depends on exact parameter match with transmitter encoding."
    ]

    update_session(req.session_id, results={'fec_decode': {'type': req.fec_type, 'status': execution_status, 'config_source': config_source, 'decode_label': decode_label, 'ber': r.get('ber')}})
    return r
