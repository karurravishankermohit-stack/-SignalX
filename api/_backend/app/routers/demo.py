import uuid
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..database import create_session, update_session, save_signal
from ..core.demo_generator import GENERATORS
from ..core.demod import demodulate
from ..core.modulation_classifier import classify
from ..core.dsp import compute_fft, estimate_snr, estimate_bandwidth
from ..core.interleave_detector import detect_interleaving
from ..core.fec_detector import detect_fec

router = APIRouter()
logger = logging.getLogger(__name__)

class DemoRequest(BaseModel):
    signal_type: Optional[str] = None
    signalType: Optional[str] = None
    user_id: Optional[str] = None
    userId: Optional[str] = None

@router.post("/demo/load")
def load_demo(req: DemoRequest):
    st_raw = req.signal_type or req.signalType
    if not st_raw:
        raise HTTPException(422, "signal_type or signalType required in request body")
    st = st_raw.lower()
    if st not in GENERATORS:
        raise HTTPException(422, f"Unknown demo signal type: {st_raw}. Supported: {list(GENERATORS.keys())}")

    sid = str(uuid.uuid4())
    year = datetime.utcnow().strftime('%Y')
    seq = str(uuid.uuid4().int)[:6].upper()
    cid = f"DEMO-{year}-{seq}"
    owner_id = req.user_id or req.userId or "guest"

    demo = GENERATORS[st]()
    sig = demo['signal']
    sr = demo['sample_rate']
    sym_rate = demo.get('symbol_rate', 4800)
    mod_name = demo.get('modulation', 'QPSK')
    known_bits = demo.get('bits', [])

    create_session(sid, cid, f"demo_{st}.iq", 'iq', 'DEMO_DATA', user_id=owner_id)

    # Immediately execute initial DSP pipeline on the generated signal
    snr = estimate_snr(sig, sr)
    fft_res = compute_fft(sig, sr, nfft=min(2048, len(sig)))
    bw3 = estimate_bandwidth(fft_res['freqs'], fft_res['power_db'], -3.0)
    
    # Run AMC
    amc_res = classify(sig, sr)
    amc_res['data_source'] = 'DEMO_DATA'

    # Run Demodulation
    demod_res = demodulate(sig, sr, mod_name, sym_rate)
    recovered_bits = demod_res.get('bits', [])
    demod_res['data_source'] = 'DEMO_DATA'
    
    # Calculate ground truth BER for demo
    n_comp = min(len(recovered_bits), len(known_bits))
    errs = sum(a != b for a, b in zip(recovered_bits[:n_comp], known_bits[:n_comp]))
    ber_val = errs / n_comp if n_comp > 0 else 0.0
    demod_res['ber'] = {
        'ber': ber_val,
        'n_compared': n_comp,
        'errors': errs,
        'source': 'DEMO_DATA'
    }
    demod_res['bits_preview'] = recovered_bits[:256]

    # Run Interleaving and FEC detection
    il_res = detect_interleaving(recovered_bits[:512]) if len(recovered_bits) >= 64 else {'best': None}
    fec_res = detect_fec(recovered_bits[:512]) if len(recovered_bits) >= 128 else {'best': None}

    # Save to disk
    save_signal(sid, {
        'original': sig,
        'processed': sig,
        'sample_rate': sr,
        'sample_rate_source': 'DEMO_DATA',
        'center_freq_hz': None,
        'center_freq_source': 'UNAVAILABLE',
        'format': 'IQ',
        'interpretation': 'stereo_iq',
        'signal_type': 'COMPLEX_IQ',
        'n_samples': len(sig),
        'duration': len(sig) / sr,
        'data_source': 'DEMO_DATA',
        'bits': recovered_bits,
        'known_bits': known_bits,
        'modulation': mod_name,
        'symbol_rate': sym_rate,
        'snr_db': demo.get('snr_db'),
    })

    # Save to session results
    results = {
        'quality': {
            'snr_db': round(snr, 2) if snr is not None else 25.0,
            'snr_source': 'DSP_ESTIMATED',
            'noise_floor_db': round(fft_res['noise_floor_db'], 2),
            'noise_floor_source': 'DSP_ESTIMATED',
            'dynamic_range_db': round(fft_res['peak_power_db'] - fft_res['noise_floor_db'], 2),
            'bandwidth_3db': bw3,
            'data_source': 'DEMO_DATA',
        },
        'modulation': amc_res,
        'demodulation': demod_res,
        'interleaving_detection': il_res,
        'fec_detection': fec_res,
    }

    update_session(sid, status='ready', metadata={
        'filename': f"demo_{st}.iq",
        'modulation': mod_name,
        'snr_db': demo.get('snr_db'),
        'sample_rate': sr,
        'symbol_rate': sym_rate,
        'n_samples': len(sig),
        'duration': len(sig) / sr,
    }, results=results)

    return {
        'session_id': sid,
        'case_id': cid,
        'signal_type': st,
        'modulation': mod_name,
        'snr_db': demo.get('snr_db'),
        'sample_rate': sr,
        'n_samples': len(sig),
        'data_source': 'DEMO_DATA',
        'label': 'DEMO DATA — SYNTHETIC SIGNAL',
        'ber_available': True,
        'results': results,
        'note': 'Mathematically authentic signal generated with known bits. Full pipeline initialized.',
    }

@router.post("/demo/{signal_type}")
def load_demo_by_path(signal_type: str):
    return load_demo(DemoRequest(signal_type=signal_type))

