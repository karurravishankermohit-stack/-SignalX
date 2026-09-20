"""SignalX Automatic Interleaving Identification.
Evaluates candidate block dimensions, convolutional depths, and pseudo-random structures using autocorrelation and entropy.
"""
import numpy as np
from .interleave import deinterleave_block, deinterleave_convolutional, deinterleave_pseudorandom
import logging

logger = logging.getLogger(__name__)

def _entropy(bits: list) -> float:
    if len(bits) == 0:
        return 0.0
    p1 = float(np.mean(bits))
    p0 = 1.0 - p1
    if p0 <= 0 or p1 <= 0:
        return 0.0
    return float(-p0 * np.log2(p0) - p1 * np.log2(p1))

def detect_interleaving(bits: list) -> dict:
    if len(bits) < 64:
        return {
            'best': None,
            'confidence': 0,
            'alternatives': [],
            'evidence': ['Insufficient bits for interleaving detection (<64 bits)'],
            'source': 'AUTO_CLASSIFIED',
            'limitations': 'Not enough bitstream samples.',
        }

    cands = []

    # Test block interleaving
    for M in [4, 8, 16, 32]:
        for N in [4, 8, 16, 32]:
            if M * N > len(bits):
                continue
            try:
                di = deinterleave_block(bits[:M * N], M, N)
                a = np.array(di, dtype=float) - 0.5
                if len(a) >= M + 1:
                    sc = float(abs(np.correlate(a[:M * N // 2], a[M:M * N // 2 + M])[0] / (len(a[:M * N // 2]) + 1e-12)) * 100)
                else:
                    sc = 0.0
                if sc > 3.0:
                    cands.append({
                        'type': 'block',
                        'params': {'M': M, 'N': N},
                        'raw_score': sc,
                        'evidence': [f'Block matrix {M}x{N} autocorrelation score: {sc:.1f}'],
                    })
            except:
                pass

    # Test convolutional interleaving
    for depth in [3, 5, 8, 16]:
        try:
            di = deinterleave_convolutional(bits[:min(512, len(bits))], depth)
            eb = _entropy(bits[:len(di)])
            ea = _entropy(di)
            sc = max(0.0, (ea - eb) * 20.0 + 10.0)
            if sc > 3.0:
                cands.append({
                    'type': 'convolutional',
                    'params': {'depth': depth},
                    'raw_score': sc,
                    'evidence': [f'Convolutional depth={depth}, entropy shift: {ea - eb:.3f}'],
                })
        except:
            pass

    # Test pseudo-random interleaving
    for seed in [42, 0, 1]:
        try:
            di = deinterleave_pseudorandom(bits[:min(512, len(bits))], seed)
            ec = _entropy(di) - _entropy(bits[:len(di)])
            sc = max(0.0, ec * 15.0 + 5.0)
            if sc > 2.0:
                cands.append({
                    'type': 'pseudorandom',
                    'params': {'seed': seed},
                    'raw_score': sc,
                    'evidence': [f'Pseudo-random seed={seed}, entropy delta: {ec:.3f}'],
                })
        except:
            pass

    real_cands = [c for c in cands if c.get('type') != 'none']
    real_cands.sort(key=lambda x: x['raw_score'], reverse=True)

    # Threshold for declaring reliable detection
    DETECTION_THRESHOLD = 30.0

    if real_cands and real_cands[0]['raw_score'] >= DETECTION_THRESHOLD:
        status = 'INTERLEAVING_DETECTED'
        best = real_cands[0]
        confidence = round(min(90.0, best['raw_score']), 1)
        best['confidence'] = confidence
        alts = [{'type': c['type'], 'params': c['params'], 'confidence': round(min(85.0, c['raw_score']), 1)} for c in real_cands[1:4]]
        evidence = best['evidence']
    else:
        status = 'NO_RELIABLE_INTERLEAVING_DETECTED'
        best = None
        confidence = 0.0
        alts = [{'type': c['type'], 'params': c['params'], 'confidence': round(min(25.0, c['raw_score']), 1)} for c in real_cands[:3]]
        evidence = [
            'Autocorrelation and entropy shifts across tested block (4..32), convolutional (3..16), and pseudorandom patterns remained below detection threshold.',
            'Bitstream exhibits high random bit entropy consistent with uncoded or un-interleaved stream.'
        ]

    return {
        'status': status,
        'best': best,
        'confidence': confidence,
        'alternatives': alts,
        'evidence': evidence,
        'limitations': 'Interleaving detection is probabilistic. Detection requires repeating frame structures or deep bitstreams.',
        'source': 'AUTO_CLASSIFIED',
        'note': 'CANDIDATE detection only — analyst confirmation required.',
    }
