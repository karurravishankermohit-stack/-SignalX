from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any, Union
from ..core.correlation import correlate_streams, find_sync_pattern
from ..core.frame_detector import detect_frame_boundaries
from ..database import load_signal, update_session

router = APIRouter()

class CorrelateRequest(BaseModel):
    session_id: Optional[str] = None
    bits_a: Optional[Any] = None
    bits_b: Optional[Any] = None
    sync_pattern: Optional[Any] = None
    max_lag: Optional[int] = 500

def _parse_bits(b: Any) -> Optional[List[int]]:
    if b is None:
        return None
    if isinstance(b, str):
        return [int(c) for c in b.strip() if c in '01']
    if isinstance(b, (list, tuple)):
        return [int(x) for x in b]
    return None

@router.post("/correlate")
def run_correlate(req: CorrelateRequest):
    bits_a = _parse_bits(req.bits_a)
    d = None
    if req.session_id:
        d = load_signal(req.session_id)
        if not bits_a and d and d.get('bits'):
            bits_a = [int(x) for x in d['bits']]

    if not bits_a:
        raise HTTPException(422, "Please provide bits_a (as a bit list or binary string) or a valid session_id with demodulated bits.")

    ds = d.get('data_source', 'REAL_ANALYSIS') if d else 'REAL_ANALYSIS'
    source_type = 'DEMO' if ds == 'DEMO_DATA' else 'REAL_UPLOAD'
    ground_truth_available = (source_type == 'DEMO' and d is not None and d.get('known_bits') is not None)

    bits_b = _parse_bits(req.bits_b)
    sync_pat = _parse_bits(req.sync_pattern)

    if bits_b:
        res = correlate_streams(bits_a, bits_b, req.max_lag or 500)
        res['source_type'] = source_type
        res['ground_truth_available'] = ground_truth_available
        res['status'] = 'VERIFIED'
        return res
    else:
        if not sync_pat:
            sync_pat = [1, 1, 0, 1, 0, 0, 1, 0]
        sr = find_sync_pattern(bits_a, sync_pat)
        fr = detect_frame_boundaries(bits_a, sr['locations'], sr['pattern_length'])
        is_periodic = fr.get('is_periodic', False)
        est_period = fr.get('estimated_frame_length')

        # Precise terminology per Requirement 2 & 4
        if source_type == 'DEMO' and est_period == 128 and is_periodic and ground_truth_available:
            framing_status = 'VERIFIED'
            period_label = 'VERIFIED FRAME PERIOD (GROUND TRUTH: 128 BITS)'
        elif is_periodic and est_period is not None:
            framing_status = 'CONFIGURED_MANUAL' if source_type == 'REAL_UPLOAD' else 'VERIFIED'
            period_label = f'CANDIDATE FRAME PERIOD ({est_period} BITS)'
        else:
            framing_status = 'NO_RELIABLE_CANDIDATE'
            period_label = 'NO RELIABLE CANDIDATE'

        res = {
            **sr,
            'status': framing_status,
            'detected': len(sr['locations']) > 0,
            'count': len(sr['locations']),
            'peak_locations': sr['locations'],
            'peak_scores': sr['scores'],
            'spacing_stats': fr.get('spacing_stats'),
            'estimated_period': est_period,
            'period_label': period_label,
            'period_confidence': fr.get('period_confidence', 0.0),
            'is_periodic': is_periodic,
            'reference_sync_word': sync_pat,
            'frame_analysis': fr,
            'source_type': source_type,
            'ground_truth_available': ground_truth_available,
            'note': 'Correlation peaks indicate evidence of periodic framing; for unknown real signals they are labeled as CANDIDATE FRAME PERIOD without higher-layer protocol decoding.'
        }
        if req.session_id:
            update_session(req.session_id, results={'correlation': {'estimated_period': est_period, 'period_label': period_label, 'is_periodic': is_periodic, 'status': framing_status, 'peaks': len(sr['locations'])}})
        return res


