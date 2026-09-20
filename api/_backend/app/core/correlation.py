"""SignalX Bitstream Correlation and Sync Pattern Detection.
Normalized cross-correlation between streams or against reference sync words.
"""
import numpy as np
import logging

logger = logging.getLogger(__name__)

def correlate_streams(bits_a: list, bits_b: list, max_lag: int = None) -> dict:
    a = np.array(bits_a, dtype=float) * 2.0 - 1.0
    b = np.array(bits_b, dtype=float) * 2.0 - 1.0

    if max_lag is None:
        max_lag = min(len(a), len(b), 1000)

    scores = []
    lags = list(range(-max_lag, max_lag + 1))

    for lag in lags:
        if lag >= 0:
            ac = a[:len(a) - lag] if lag > 0 else a
            bc = b[lag:lag + len(ac)]
        else:
            bc = b[:len(b) + lag]
            ac = a[-lag:-lag + len(bc)]
        n = min(len(ac), len(bc))
        scores.append(float(np.dot(ac[:n], bc[:n]) / n) if n > 0 else 0.0)

    sa = np.array(scores)
    pi = int(np.argmax(np.abs(sa)))

    return {
        'lags': lags,
        'scores': scores,
        'peak_lag': lags[pi],
        'peak_score': float(sa[pi]),
        'source': 'DSP_COMPUTED',
    }

def find_sync_pattern(bits: list, pattern: list, threshold: float = 0.8) -> dict:
    n = len(bits)
    m = len(pattern)
    if m == 0 or n < m:
        return {'locations': [], 'scores': [], 'pattern_length': m, 'threshold': threshold, 'source': 'DSP_COMPUTED'}

    a = np.array(bits, dtype=float) * 2.0 - 1.0
    p = np.array(pattern, dtype=float) * 2.0 - 1.0

    locations = []
    scores = []

    for i in range(n - m + 1):
        sc = float(np.dot(a[i:i + m], p) / m)
        if sc >= threshold:
            locations.append(i)
            scores.append(round(sc, 3))

    return {
        'locations': locations,
        'scores': scores,
        'pattern_length': m,
        'threshold': threshold,
        'source': 'DSP_COMPUTED',
        'note': 'CANDIDATE sync locations only — analyst confirmation required.',
    }
