"""SignalX Waterfall / Spectrogram: 2D STFT spectrogram generation with density scaling and resolution decimation."""
import numpy as np
from scipy import signal as ss

def compute_waterfall(sig: np.ndarray, sample_rate: float,
                      nperseg: int = 256, noverlap: int = None,
                      max_time_bins: int = 500,
                      max_freq_bins: int = 500) -> dict:
    if noverlap is None:
        noverlap = nperseg // 2

    if np.iscomplexobj(sig):
        f, t, Sxx = ss.spectrogram(
            sig, fs=sample_rate, nperseg=nperseg, noverlap=noverlap,
            return_onesided=False, scaling='density'
        )
        f = np.fft.fftshift(f)
        Sxx = np.fft.fftshift(Sxx, axes=0)
    else:
        f, t, Sxx = ss.spectrogram(
            sig, fs=sample_rate, nperseg=nperseg, noverlap=noverlap,
            scaling='density'
        )

    Sxx_db = 10 * np.log10(np.maximum(Sxx, 1e-12))
    n_freq, n_time = Sxx_db.shape
    freq_step = max(1, n_freq // max_freq_bins)
    time_step = max(1, n_time // max_time_bins)

    Sxx_down = Sxx_db[::freq_step, ::time_step]
    f_down = f[::freq_step]
    t_down = t[::time_step]

    return {
        'freqs': f_down.tolist(),
        'times': t_down.tolist(),
        'intensities': Sxx_down.tolist(),
        'min_db': float(np.min(Sxx_down)),
        'max_db': float(np.max(Sxx_down)),
        'n_freq_bins': len(f_down),
        'n_time_bins': len(t_down),
    }
