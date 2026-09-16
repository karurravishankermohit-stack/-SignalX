import sys
import os
from pathlib import Path
import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.file_parser import parse_wav, parse_iq, validate_file

def test_parse_synthetic_iq(tmp_path):
    iq_file = tmp_path / "test.iq"
    # Generate 100 interleaved float32 samples (50 I, 50 Q)
    I = np.cos(np.linspace(0, 10, 50)).astype(np.float32)
    Q = np.sin(np.linspace(0, 10, 50)).astype(np.float32)
    interleaved = np.empty(100, dtype=np.float32)
    interleaved[0::2] = I
    interleaved[1::2] = Q
    interleaved.tofile(str(iq_file))

    res = parse_iq(str(iq_file), sample_rate=48000, dtype='float32', arrangement='interleaved')
    assert res['n_samples'] == 50
    assert res['sample_rate'] == 48000
    assert res['sample_rate_source'] == 'USER_PROVIDED'
    assert np.iscomplexobj(res['signal'])
    assert np.allclose(res['signal'].real, I)
    assert np.allclose(res['signal'].imag, Q)

def test_validate_file(tmp_path):
    f = tmp_path / "sample.wav"
    f.write_bytes(b"RIFFdummydata")
    ok, msg = validate_file(str(f), ".wav")
    assert ok is True
    ok_bad, msg_bad = validate_file(str(f), ".iq")
    assert ok_bad is False
