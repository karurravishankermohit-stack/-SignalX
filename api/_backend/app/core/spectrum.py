"""SignalX Spectrum Analysis: Complete spectrum generation with peak detection and -3dB/-20dB bandwidth calculation."""
import numpy as np
from .dsp import compute_fft, peak_preserving_downsample, estimate_snr, estimate_bandwidth

def compute_spectrum(sig: np.ndarray, sample_rate: float,
                     nfft: int = 2048, window: str = 'hann',
                     max_display_points: int = 2000) -> dict:
    r = compute_fft(sig, sample_rate, nfft=min(nfft, len(sig)), window=window)
    d_freqs, d_power = peak_preserving_downsample(r['freqs'], r['power_db'], max_display_points)

    bw_3db = estimate_bandwidth(r['freqs'], r['power_db'], threshold_db=-3.0)
    bw_20db = estimate_bandwidth(r['freqs'], r['power_db'], threshold_db=-20.0)
    snr = estimate_snr(sig, sample_rate, nfft=min(nfft, len(sig)))

    return {
        'freqs': d_freqs.tolist(),
        'power_db': d_power.tolist(),
        'peak_freq_hz': r['peak_freq_hz'],
        'peak_power_db': r['peak_power_db'],
        'noise_floor_db': r['noise_floor_db'],
        'snr_db': snr,
        'snr_source': 'DSP_ESTIMATED',
        'bandwidth_3db': bw_3db,
        'bandwidth_20db': bw_20db,
        'window': window,
        'nfft': r['nfft'],
        'sample_rate': sample_rate,
    }
