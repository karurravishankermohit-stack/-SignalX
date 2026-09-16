import sys
from pathlib import Path
import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.demod import demod_bpsk, demod_qpsk, demod_fsk, demod_qam, demodulate
from app.core.demo_generator import generate_qpsk, generate_fsk, generate_16qam

def test_bpsk_known_bits():
    fs = 48000
    sr = 4800
    sps = 10
    bits = [0, 1, 0, 1, 1, 0, 0, 1]
    iq = []
    for b in bits:
        iq.extend([(-1.0 + 0j if b == 0 else 1.0 + 0j)] * sps)
    sig = np.array(iq, dtype=np.complex64)
    r = demod_bpsk(sig, fs, sr)
    assert len(r['bits']) == len(bits)
    assert r['bits'] == bits

def test_qpsk_demod():
    d = generate_qpsk(num_bits=200, snr_db=30)
    r = demod_qpsk(d['signal'], d['sample_rate'], d['symbol_rate'])
    assert r['bit_count'] == 200
    assert r['source'] == 'DSP_COMPUTED'

def test_fsk_demod():
    d = generate_fsk(num_bits=100, snr_db=25)
    r = demod_fsk(d['signal'], d['sample_rate'], d['symbol_rate'], n_tones=2)
    assert r['bit_count'] == 100
    assert len(r['tone_frequencies_hz']) == 2

def test_16qam_demod():
    d = generate_16qam(num_bits=200, snr_db=30)
    r = demod_qam(d['signal'], d['sample_rate'], d['symbol_rate'], order=16)
    assert r['bit_count'] == 200

def test_demodulate_dispatcher():
    d = generate_qpsk(num_bits=100, snr_db=30)
    r = demodulate(d['signal'], d['sample_rate'], 'QPSK', d['symbol_rate'])
    assert r['modulation'] == 'QPSK'
    assert 'bits' in r
