import sys
from pathlib import Path
import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.correlation import correlate_streams, find_sync_pattern
from app.core.frame_detector import detect_frame_boundaries

def test_autocorrelation_peak():
    np.random.seed(42)
    bits = np.random.randint(0, 2, 100).tolist()
    r = correlate_streams(bits, bits, max_lag=10)
    assert r['peak_lag'] == 0
    assert r['peak_score'] > 0.95

def test_sync_pattern_detection():
    pattern = [1, 1, 0, 0, 1, 0, 1, 1]
    stream = [0] * 50 + pattern + [0] * 50
    r = find_sync_pattern(stream, pattern, threshold=0.9)
    assert 50 in r['locations']

def test_frame_boundary_detection():
    locations = [100, 250, 400]
    r = detect_frame_boundaries([0] * 600, locations, pattern_len=8)
    assert r['estimated_frame_length'] == 150
    assert len(r['candidates']) > 0
