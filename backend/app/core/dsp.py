"""SignalX DSP Core: Real FFT, power spectrum, SNR, occupied bandwidth estimation, peak preservation."""
import numpy as np
from scipy import signal as ss
import logging

logger = logging.getLogger(__name__)

WINDOWS = {
    'hann': np.hanning,
    'hamming': np.hamming,
    'blackman': np.blackman,
    'rectangular': np.ones,
}

def _apply_window(data: np.ndarray, window: str = 'hann') -> np.ndarray:
    wfunc = WINDOWS.get(window, np.hanning)
    return data * wfunc(len(data))

def compute_fft(sig: np.ndarray, sample_rate: float, nfft: int = 2048, window: str = 'hann') -> dict:
    if len(sig) == 0:
        raise ValueError("Signal is empty")

    chunk = sig[:nfft] if len(sig) >= nfft else sig
    n = len(chunk)

    if np.iscomplexobj(chunk):
        windowed = _apply_window(chunk, window)
        spec = np.fft.fftshift(np.fft.fft(windowed, n=n))
        freqs = np.fft.fftshift(np.fft.fftfreq(n, d=1.0 / sample_rate))
    else:
        windowed = _apply_window(chunk.real, window)
        spec = np.fft.rfft(windowed, n=n)
        freqs = np.fft.rfftfreq(n, d=1.0 / sample_rate)

    mag = np.maximum(np.abs(spec), 1e-12)
    power_db = 20 * np.log10(mag / n)

    peak_idx = int(np.argmax(power_db))
    peak_freq = float(freqs[peak_idx])
    peak_power = float(power_db[peak_idx])

    sorted_p = np.sort(power_db)
    noise_floor = float(np.median(sorted_p[:int(0.8 * len(sorted_p))]))

    return {
        'freqs': freqs,
        'power_db': power_db,
        'peak_freq_hz': peak_freq,
        'peak_power_db': peak_power,
        'noise_floor_db': noise_floor,
        'window': window,
        'nfft': n,
    }

def peak_preserving_downsample(freqs: np.ndarray, power_db: np.ndarray, max_points: int = 2000) -> tuple:
    n = len(freqs)
    if n <= max_points:
        return freqs, power_db

    factor = max(1, n // max_points)
    out_freqs = []
    out_power = []

    for i in range(0, n - factor + 1, factor):
        c_power = power_db[i:i + factor]
        c_freq = freqs[i:i + factor]
        p_idx = int(np.argmax(c_power))
        out_freqs.append(c_freq[p_idx])
        out_power.append(c_power[p_idx])

    return np.array(out_freqs), np.array(out_power)

def estimate_snr(sig: np.ndarray, sample_rate: float, nfft: int = 2048) -> float:
    try:
        r = compute_fft(sig, sample_rate, nfft=min(nfft, len(sig)))
        snr = r['peak_power_db'] - r['noise_floor_db']
        return float(max(0.0, snr))
    except Exception as e:
        logger.warning(f"SNR estimation error: {e}")
        return None

def estimate_bandwidth(freqs: np.ndarray, power_db: np.ndarray, threshold_db: float = -3.0) -> dict:
    peak_power = np.max(power_db)
    threshold = peak_power + threshold_db

    indices = np.where(power_db >= threshold)[0]
    if len(indices) == 0:
        return {'bandwidth_hz': None, 'low_freq_hz': None, 'high_freq_hz': None, 'threshold_db': threshold_db}

    low_freq = float(freqs[indices[0]])
    high_freq = float(freqs[indices[-1]])
    bw = abs(high_freq - low_freq)

    return {
        'bandwidth_hz': bw,
        'low_freq_hz': low_freq,
        'high_freq_hz': high_freq,
        'threshold_db': threshold_db,
    }

def compute_instantaneous_frequency(sig: np.ndarray, sample_rate: float) -> np.ndarray:
    if not np.iscomplexobj(sig):
        analytic = ss.hilbert(sig)
    else:
        analytic = sig
    phase = np.unwrap(np.angle(analytic))
    ifreq = np.diff(phase) * sample_rate / (2 * np.pi)
    if len(ifreq) > 0:
        ifreq = np.append(ifreq, ifreq[-1])
    return ifreq

def compute_instantaneous_amplitude(sig: np.ndarray) -> np.ndarray:
    if not np.iscomplexobj(sig):
        analytic = ss.hilbert(sig)
    else:
        analytic = sig
    return np.abs(analytic)

def compute_instantaneous_phase(sig: np.ndarray) -> np.ndarray:
    if not np.iscomplexobj(sig):
        analytic = ss.hilbert(sig)
    else:
        analytic = sig
    return np.angle(analytic)
