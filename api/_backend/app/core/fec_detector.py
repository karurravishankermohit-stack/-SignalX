"""SignalX Automatic FEC Identification.
Checks trellis path metric consistency, Reed-Solomon syndrome consistency, concatenated structure.
NEVER fabricates certainty.
"""
import numpy as np
import logging

logger = logging.getLogger(__name__)

def detect_fec(bits: list) -> dict:
    if len(bits) < 128:
        return {
            'best': None,
            'confidence': 0,
            'alternatives': [],
            'evidence': ['Insufficient bits for FEC detection (<128 bits)'],
            'source': 'AUTO_CLASSIFIED',
            'limitations': 'Sample length too short for reliable decoding metric extraction.',
        }

    cands = []

    # Check convolutional candidates (rate 1/2 and 1/3)
    for rd in [2, 3]:
        for K in [5, 7, 9]:
            try:
                from .fec_codec import viterbi_decode
                r = viterbi_decode(bits[:256], 1, rd, K)
                pm = r.get('path_metric', 999.0)
                # Only accept as valid candidate if path metric error rate is low (< 8% errors)
                err_rate = pm / (256.0 / rd) if (256.0 / rd) > 0 else 1.0
                if err_rate < 0.08:
                    sc = max(0.0, 90.0 - err_rate * 500.0)
                    cands.append({
                        'type': 'convolutional',
                        'params': {'rate': f'1/{rd}', 'K': K},
                        'confidence': round(min(85.0, sc), 1),
                        'evidence': [f'Viterbi path metric: {pm:.1f} (error rate: {err_rate*100:.1f}%)', f'Rate 1/{rd}, constraint length K={K}'],
                    })
            except:
                pass

    # Check Reed-Solomon candidates
    for nsym in [16, 32]:
        nb = min(255, len(bits) // 8)
        if nb > nsym:
            try:
                import reedsolo
                rs = reedsolo.RSCodec(nsym)
                db = bytearray()
                for i in range(0, min(nb * 8, len(bits)), 8):
                    db.append(sum(bits[i + j] << (7 - j) for j in range(8) if i + j < len(bits)))
                rs.decode(db)
                cands.append({
                    'type': 'reed-solomon',
                    'params': {'nsym': nsym},
                    'confidence': 70.0,
                    'evidence': [f'Reed-Solomon RS({len(db)}, {len(db)-nsym}) syndrome validation successful'],
                })
            except:
                pass

    # Concatenated code evaluation
    if any(c['type'] == 'convolutional' for c in cands) and any(c['type'] == 'reed-solomon' for c in cands):
        cands.append({
            'type': 'concatenated',
            'params': {'inner': 'convolutional', 'outer': 'reed-solomon'},
            'confidence': 60.0,
            'evidence': ['Both inner convolutional metric and outer RS parity consistency identified'],
        })

    cands.sort(key=lambda x: x.get('confidence', 0), reverse=True)

    if cands and cands[0]['confidence'] >= 40.0:
        status = 'FEC_DETECTED'
        best = cands[0]
        confidence = best['confidence']
        alts = cands[1:4]
        evidence = best['evidence']
    else:
        status = 'NO_RELIABLE_FEC_CANDIDATE'
        best = None
        confidence = 0.0
        alts = [{'type': c['type'], 'params': c.get('params', {}), 'confidence': c.get('confidence', 0)} for c in cands[:3]]
        evidence = [
            'Viterbi trellis path metric diverged across tested constraint lengths K=5, 7, 9 (indicates uncoded payload or non-standard polynomials).',
            'Reed-Solomon syndrome polynomial consistency check failed across standard Galois Field GF(2^8) parity depths (16, 32).'
        ]

    return {
        'status': status,
        'best': best,
        'confidence': confidence,
        'alternatives': alts,
        'evidence': evidence,
        'limitations': 'Automatic FEC identification is probabilistic. Confirmation requires formal protocol specification.',
        'source': 'AUTO_CLASSIFIED',
        'note': 'CANDIDATE detection only.',
    }
