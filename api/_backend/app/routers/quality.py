import numpy as np
from fastapi import APIRouter, HTTPException
from ..database import load_signal, update_session
from ..core.dsp import estimate_snr, estimate_bandwidth, compute_fft

router = APIRouter()

@router.get("/analyze/quality/{session_id}")
def get_quality(session_id: str):
    d = load_signal(session_id)
    if not d:
        raise HTTPException(404, "Session signal data not found")

    sig = d['processed']
    sr = d['sample_rate']

    snr = estimate_snr(sig, sr)
    r = compute_fft(sig, sr, nfft=min(8192, len(sig)))
    bw3 = estimate_bandwidth(r['freqs'], r['power_db'], -3.0)
    bw20 = estimate_bandwidth(r['freqs'], r['power_db'], -20.0)

    sp = float(10 * np.log10(np.mean(np.abs(sig) ** 2) + 1e-12))
    dr = float(r['peak_power_db'] - r['noise_floor_db'])

    res = {
        'snr_db': round(snr, 2) if snr is not None else None,
        'snr_source': 'DSP_ESTIMATED',
        'noise_floor_db': round(r['noise_floor_db'], 2),
        'noise_floor_source': 'DSP_ESTIMATED',
        'signal_power_dbw': round(sp, 2),
        'peak_power_db': round(r['peak_power_db'], 2),
        'dynamic_range_db': round(dr, 2),
        'bandwidth_3db': bw3,
        'bandwidth_20db': bw20,
        'all_sources': 'DSP_ESTIMATED',
        'data_source': d.get('data_source', 'REAL_ANALYSIS'),
    }
    update_session(session_id, results={'quality': res})
    return res
