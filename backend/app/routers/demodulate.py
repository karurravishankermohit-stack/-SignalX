from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..database import load_signal, update_session, save_signal
from ..core.demod import demodulate

router = APIRouter()

class DemodRequest(BaseModel):
    session_id: str
    modulation: Optional[str] = None
    modulation_scheme: Optional[str] = None
    symbol_rate: Optional[float] = None
    freq_offset: float = 0.0
    phase_offset: float = 0.0
    samples_per_symbol: Optional[int] = None

@router.post("/demodulate")
def demod(req: DemodRequest):
    d = load_signal(req.session_id)
    if not d:
        raise HTTPException(404, "Session signal data not found")

    mod = req.modulation or req.modulation_scheme or d.get('modulation') or 'QPSK'
    sym_rate = req.symbol_rate
    if not sym_rate or sym_rate <= 0:
        sym_rate = d.get('symbol_rate') or d.get('results', {}).get('parameters', {}).get('estimated_symbol_rate', {}).get('symbol_rate_hz') or 4800.0

    r = demodulate(
        d['processed'],
        d['sample_rate'],
        mod,
        float(sym_rate),
        req.freq_offset,
        req.phase_offset,
    )

    if 'error' in r:
        raise HTTPException(422, r['error'])

    bits = r.get('bits', [])
    d['bits'] = bits
    d['modulation'] = mod
    save_signal(req.session_id, d)

    kb = d.get('known_bits')
    ds = d.get('data_source', 'REAL_ANALYSIS')
    source_type = 'DEMO' if ds == 'DEMO_DATA' else 'REAL_UPLOAD'
    ground_truth_available = (source_type == 'DEMO' and kb is not None)

    if ground_truth_available:
        n = min(len(bits), len(kb))
        er = sum(a != b for a, b in zip(bits[:n], kb[:n]))
        ber_i = {'ber': round(er / n, 6) if n > 0 else 0.0, 'n_compared': n, 'errors': er, 'source': 'DEMO_DATA', 'text': f"{er / n:.6f} ({er} errors / {n} bits)"}
    else:
        ber_i = {'ber': None, 'source': 'UNAVAILABLE', 'reason': 'BER: NOT AVAILABLE — ground truth/reference bits unavailable.', 'text': 'BER: NOT AVAILABLE — ground truth/reference bits unavailable.'}

    r['total_bits'] = len(bits)
    r['bit_count'] = len(bits)
    r['modulation'] = mod
    r['symbol_rate'] = sym_rate
    r['bits_preview'] = bits[:256]
    r['ber'] = ber_i
    r['ber_estimate'] = ber_i.get('ber')
    r['data_source'] = ds
    r['source_type'] = source_type
    r['ground_truth_available'] = ground_truth_available

    update_session(req.session_id, results={'demodulation': {'bit_count': len(bits), 'modulation': mod, 'ber': ber_i, 'bits': bits, 'source_type': source_type, 'ground_truth_available': ground_truth_available}})
    return r

@router.get("/bitstream/{session_id}")
@router.get("/demodulate/{session_id}")
def get_bitstream(session_id: str):
    d = load_signal(session_id)
    if not d:
        raise HTTPException(404, "Session signal data not found")

    bits = d.get('bits')
    mod = d.get('modulation') or 'QPSK'
    sym_rate = d.get('symbol_rate') or d.get('results', {}).get('parameters', {}).get('estimated_symbol_rate', {}).get('symbol_rate_hz') or 4800.0

    if (bits is None or len(bits) == 0) and d.get('processed') is not None:
        r = demodulate(
            d['processed'],
            d['sample_rate'],
            mod,
            float(sym_rate),
            0.0,
            0.0,
        )
        bits = r.get('bits', [])
        d['bits'] = bits
        save_signal(session_id, d)
        update_session(session_id, results={'demodulation': {'bit_count': len(bits), 'modulation': mod, 'bits': bits}})
    elif bits is None:
        bits = []

    kb = d.get('known_bits')
    ds = d.get('data_source', 'REAL_ANALYSIS')
    source_type = 'DEMO' if ds == 'DEMO_DATA' else 'REAL_UPLOAD'
    ground_truth_available = (source_type == 'DEMO' and kb is not None)

    if ground_truth_available:
        n = min(len(bits), len(kb))
        er = sum(a != b for a, b in zip(bits[:n], kb[:n]))
        ber_i = {'ber': round(er / n, 6) if n > 0 else 0.0, 'n_compared': n, 'errors': er, 'source': 'DEMO_DATA', 'text': f"{er / n:.6f} ({er} errors / {n} bits)"}
    else:
        ber_i = {'ber': None, 'source': 'UNAVAILABLE', 'reason': 'BER: NOT AVAILABLE — ground truth/reference bits unavailable.', 'text': 'BER: NOT AVAILABLE — ground truth/reference bits unavailable.'}

    return {
        'session_id': session_id,
        'bits': bits,
        'total_bits': len(bits),
        'bit_count': len(bits),
        'bits_preview': bits[:256],
        'modulation': mod,
        'symbol_rate': sym_rate,
        'ber': ber_i,
        'data_source': ds,
        'source_type': source_type,
        'ground_truth_available': ground_truth_available,
    }


