"""SignalX FEC Codec Engine.
Viterbi decoding, Reed-Solomon decoding, Concatenated decoding, and LDPC protocol verification.
NEVER fabricates decoded bits.
"""
import numpy as np
import logging

logger = logging.getLogger(__name__)

def viterbi_decode(bits: list, rate_num: int = 1, rate_den: int = 2,
                   K: int = 7, generators: list = None) -> dict:
    if generators is None:
        generators = [0o171, 0o133]  # Standard NASA polynomials

    try:
        from commpy.channelcoding import Trellis, viterbi_decode as cvd
        tr = Trellis(memory=np.array([K - 1]), generator_matrix=np.array([generators]))
        rec = np.array(bits[:len(bits) - len(bits) % rate_den])
        dec = cvd(rec, tr, tb_depth=5 * (K - 1), decoding_type='hard')
        return {
            'decoded_bits': dec.tolist(),
            'bit_count': len(dec),
            'method': 'viterbi_commpy',
            'K': K,
            'rate': f'{rate_num}/{rate_den}',
            'source': 'DSP_COMPUTED',
        }
    except:
        pass

    return _viterbi_manual(bits, K, generators, rate_den)

def _viterbi_manual(bits: list, K: int, generators: list, rate_den: int) -> dict:
    ns = 2 ** (K - 1)
    INF = float('inf')
    trans = {}

    for st in range(ns):
        for ib in [0, 1]:
            nst = ((st >> 1) | (ib << (K - 2))) & (ns - 1)
            obs = []
            reg = (ib << (K - 1)) | st
            for g in generators:
                obs.append(bin(reg & g).count('1') % 2)
            trans[(st, ib)] = (nst, obs)

    nsym = len(bits) // rate_den
    if nsym == 0:
        return {'decoded_bits': [], 'bit_count': 0, 'method': 'viterbi_manual', 'source': 'DSP_COMPUTED'}

    pm = {0: 0.0}
    for s in range(1, ns):
        pm[s] = INF
    paths = {s: [] for s in range(ns)}

    for i in range(nsym):
        rec = bits[i * rate_den:(i + 1) * rate_den]
        npm = {s: INF for s in range(ns)}
        npa = {s: [] for s in range(ns)}

        for st in range(ns):
            if pm[st] == INF:
                continue
            for ib in [0, 1]:
                nst, exp = trans[(st, ib)]
                hd = sum(r != e for r, e in zip(rec, exp))
                m = pm[st] + hd
                if m < npm[nst]:
                    npm[nst] = m
                    npa[nst] = paths[st] + [ib]

        pm = npm
        paths = npa

    bs = min(pm, key=pm.get)
    return {
        'decoded_bits': paths[bs],
        'bit_count': len(paths[bs]),
        'method': 'viterbi_manual',
        'K': K,
        'rate': f'1/{rate_den}',
        'path_metric': float(pm[bs]),
        'source': 'DSP_COMPUTED',
    }

def reed_solomon_decode(data_bytes: bytes, nsym: int = 32) -> dict:
    try:
        import reedsolo
        rs = reedsolo.RSCodec(nsym)
        res = rs.decode(bytearray(data_bytes))
        if isinstance(res, tuple):
            dm = res[0]  # Stripped message
            ep = res[2] if len(res) > 2 else []
        else:
            dm = res
            ep = []
        db = bytes(dm)
        return {
            'decoded_bytes': list(db),
            'decoded_bits': _b2b(db),
            'errors_corrected': len(ep) if isinstance(ep, (list, bytearray, bytes)) else int(ep),
            'syndrome_status': 'CORRECTED' if (len(ep) if isinstance(ep, (list, bytearray, bytes)) else ep) > 0 else 'NO_ERRORS',
            'n_sym': nsym,
            'source': 'DSP_COMPUTED',
        }
    except ImportError:
        return {'error': 'reedsolo library not installed', 'source': 'UNAVAILABLE'}
    except Exception as e:
        return {
            'error': f'RS decode failed: {str(e)}',
            'syndrome_status': 'UNCORRECTABLE',
            'source': 'DSP_COMPUTED',
        }

def concatenated_decode(bits: list, inner_K: int = 7, inner_rate_den: int = 2, outer_nsym: int = 32) -> dict:
    inner = viterbi_decode(bits, 1, inner_rate_den, inner_K)
    if not inner.get('decoded_bits'):
        return {'error': 'Inner Viterbi decode produced no bits', 'source': 'DSP_COMPUTED'}

    ib = inner['decoded_bits']
    nb = len(ib) // 8
    if nb < outer_nsym + 1:
        return {
            'inner_viterbi': inner,
            'outer_rs': {'error': f'Insufficient bytes ({nb}) for outer RS with nsym={outer_nsym}', 'source': 'DSP_COMPUTED'},
            'source': 'DSP_COMPUTED',
        }

    db = _b2by(ib[:nb * 8])
    outer = reed_solomon_decode(db, nsym=outer_nsym)
    return {
        'inner_viterbi': inner,
        'outer_rs': outer,
        'source': 'DSP_COMPUTED',
    }

def ldpc_decode(bits: list, parity_check_matrix=None) -> dict:
    if parity_check_matrix is None:
        return {
            'available': False,
            'message': 'LDPC decoding unavailable because a valid parity-check matrix or code configuration was not identified.',
            'source': 'UNAVAILABLE',
        }
    return {
        'available': False,
        'error': 'LDPC decoding with custom parity check matrix not configured',
        'source': 'UNAVAILABLE',
    }

def _b2b(b: bytes) -> list:
    bits = []
    for byte in b:
        for i in range(7, -1, -1):
            bits.append((byte >> i) & 1)
    return bits

def _b2by(bits: list) -> bytes:
    n = (len(bits) // 8) * 8
    res = []
    for i in range(0, n, 8):
        byte = sum(bits[i + j] << (7 - j) for j in range(8))
        res.append(byte)
    return bytes(res)
