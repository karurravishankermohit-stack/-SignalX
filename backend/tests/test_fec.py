import sys
from pathlib import Path
import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.fec_codec import viterbi_decode, reed_solomon_decode, ldpc_decode, _b2b, _b2by

def test_viterbi_decode_runs():
    bits = [0, 1, 1, 0, 1, 0, 0, 1] * 16
    r = viterbi_decode(bits, rate_num=1, rate_den=2, K=7)
    assert 'decoded_bits' in r
    assert r['bit_count'] == len(bits) // 2
    assert r['source'] == 'DSP_COMPUTED'

def test_rs_codec():
    try:
        import reedsolo
        rs = reedsolo.RSCodec(10)
        msg = b"SIGNALX_NTRO_SIH26147_TEST"
        enc = rs.encode(msg)
        corrupted = bytearray(enc)
        corrupted[2] ^= 0x55
        r = reed_solomon_decode(bytes(corrupted), nsym=10)
        assert r['errors_corrected'] >= 1
        assert bytes(r['decoded_bytes']) == msg
    except ImportError:
        pytest.skip("reedsolo not available")

def test_ldpc_unavailability_reporting():
    r = ldpc_decode([0, 1] * 20, parity_check_matrix=None)
    assert r['available'] is False
    assert 'parity-check matrix' in r['message']

def test_bits_bytes_conversions():
    bits = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1]
    b = _b2by(bits)
    back = _b2b(b)
    assert back == bits
