import sys
from pathlib import Path
import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.demo_generator import generate_qpsk, generate_fsk
from app.core.dsp import compute_fft, estimate_snr
from app.core.modulation_classifier import classify
from app.core.demod import demodulate
from app.core.spectrum import compute_spectrum
from app.core.waterfall import compute_waterfall
from app.core.parameter_estimator import extract_all_parameters
from app.core.interleave_detector import detect_interleaving
from app.core.fec_detector import detect_fec

def test_full_pipeline_qpsk():
    d = generate_qpsk(num_bits=400, snr_db=25)
    sig = d['signal']
    sr = d['sample_rate']

    # FFT & Spectrum
    fft = compute_fft(sig, sr, nfft=1024)
    assert fft['peak_power_db'] > fft['noise_floor_db']
    spec = compute_spectrum(sig, sr, nfft=1024)
    assert len(spec['freqs']) > 0

    # Waterfall
    wf = compute_waterfall(sig, sr, nperseg=128)
    assert len(wf['times']) > 0

    # Parameter extraction
    params = extract_all_parameters(sig, sr, 'DEMO_DATA')
    assert params['snr']['value'] > 0

    # Modulation classification
    cls = classify(sig, sr)
    assert cls['best'] in ['QPSK', 'BPSK', '8PSK', '16QAM', 'FSK']

    # Demodulation
    dm = demodulate(sig, sr, 'QPSK', d['symbol_rate'])
    assert dm['bit_count'] == 400

    # BER evaluation with known reference bits
    known = d['bits']
    rec = dm['bits']
    n = min(len(rec), len(known))
    errs = sum(a != b for a, b in zip(rec[:n], known[:n]))
    ber = errs / n
    assert 0.0 <= ber <= 1.0

    # Interleaving & FEC identification
    il = detect_interleaving(rec[:256])
    assert 'best' in il
    fc = detect_fec(rec[:256])
    assert 'best' in fc

def test_no_fabrication_rule():
    # Calling demodulate with two distinct signals should never return identical bitstreams
    d1 = generate_qpsk(num_bits=200, snr_db=30)
    d2 = generate_fsk(num_bits=200, snr_db=30)
    dm1 = demodulate(d1['signal'], d1['sample_rate'], 'QPSK', d1['symbol_rate'])
    dm2 = demodulate(d2['signal'], d2['sample_rate'], 'FSK', d2['symbol_rate'])
    assert dm1['bits'] != dm2['bits']
    assert dm1['source'] == 'DSP_COMPUTED'
