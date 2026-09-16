import sys
from pathlib import Path
import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.modulation_classifier import extract_features, classify
from app.core.demo_generator import generate_qpsk, generate_fsk, generate_16qam

def test_classify_qpsk():
    d = generate_qpsk(num_bits=600, snr_db=30)
    r = classify(d['signal'], d['sample_rate'])
    assert r['best'] in ['QPSK', 'BPSK', '8PSK', '16QAM']
    assert 0 <= r['confidence'] <= 100
    assert len(r['evidence']) > 0

def test_classify_fsk():
    d = generate_fsk(num_bits=600, snr_db=25)
    r = classify(d['signal'], d['sample_rate'])
    assert r['best'] in ['FSK', 'QPSK', 'BPSK', 'FM', 'UNKNOWN']
    assert 'inst_freq_var' in r['features']

def test_short_signal_classification():
    sig = np.array([1 + 0j, 0 + 1j], dtype=np.complex64)
    r = classify(sig, 1000)
    assert r['best'] == 'UNKNOWN'
