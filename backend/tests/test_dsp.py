import sys
from pathlib import Path
import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.dsp import compute_fft, estimate_snr, estimate_bandwidth, peak_preserving_downsample
from app.core.preprocessing import remove_dc_offset, normalize_power

def test_fft_pure_tone():
    fs = 48000
    n = 2048
    f0 = 5000.0
    t = np.arange(n) / fs
    sig = np.exp(2j * np.pi * f0 * t).astype(np.complex64)
    r = compute_fft(sig, fs, nfft=n)
    assert abs(r['peak_freq_hz'] - f0) < 100.0

def test_snr_clean_signal():
    fs = 48000
    t = np.arange(4096) / fs
    sig = (np.exp(2j * np.pi * 5000 * t) + 0.02 * (np.random.randn(4096) + 1j * np.random.randn(4096))).astype(np.complex64)
    snr = estimate_snr(sig, fs)
    assert snr is not None
    assert snr > 15.0

def test_dc_removal():
    sig = (np.ones(1000) * 4.0 + 1j * np.ones(1000) * 2.0).astype(np.complex64) + 0.05 * (np.random.randn(1000) + 1j * np.random.randn(1000))
    cleaned = remove_dc_offset(sig)
    assert abs(np.mean(cleaned.real)) < 0.1
    assert abs(np.mean(cleaned.imag)) < 0.1

def test_normalize_power():
    sig = (np.random.randn(1000) * 15.0).astype(np.float32)
    normed = normalize_power(sig)
    rms = np.sqrt(np.mean(normed ** 2))
    assert abs(rms - 1.0) < 0.05

def test_bandwidth_estimation():
    fs = 10000
    n = 1024
    sig = np.zeros(n, dtype=complex)
    for f in range(2000, 2500, 50):
        sig += np.exp(2j * np.pi * f * np.arange(n) / fs)
    r = compute_fft(sig, fs, nfft=n)
    bw = estimate_bandwidth(r['freqs'], r['power_db'], -3.0)
    assert bw['bandwidth_hz'] is not None
    assert bw['bandwidth_hz'] > 0

def test_downsample_preserves_peak():
    f = np.linspace(-5000, 5000, 8000)
    p = np.random.randn(8000) - 40.0
    p[4000] = 5.0
    df, dp = peak_preserving_downsample(f, p, 1000)
    assert max(dp) >= 0.0
