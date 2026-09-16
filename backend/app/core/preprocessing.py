"""SignalX Preprocessing: DC offset removal, RMS power normalization, lowpass filtering, decimation."""
import numpy as np
from scipy import signal as ss
import logging

logger = logging.getLogger(__name__)

def remove_dc_offset(sig: np.ndarray) -> np.ndarray:
    if np.iscomplexobj(sig):
        return (sig - np.mean(sig.real) - 1j * np.mean(sig.imag)).astype(sig.dtype)
    return (sig - np.mean(sig)).astype(sig.dtype)

def normalize_power(sig: np.ndarray) -> np.ndarray:
    rms = np.sqrt(np.mean(np.abs(sig) ** 2))
    if rms < 1e-12:
        return sig
    return (sig / rms).astype(sig.dtype)

def apply_lowpass_filter(sig: np.ndarray, cutoff_hz: float, sample_rate: float, order: int = 5) -> np.ndarray:
    nyq = sample_rate / 2.0
    if cutoff_hz >= nyq or cutoff_hz <= 0:
        return sig
    b, a = ss.butter(order, cutoff_hz / nyq, btype='low')
    if np.iscomplexobj(sig):
        return (ss.filtfilt(b, a, sig.real) + 1j * ss.filtfilt(b, a, sig.imag)).astype(sig.dtype)
    return ss.filtfilt(b, a, sig).astype(sig.dtype)

def decimate_signal(sig: np.ndarray, factor: int) -> np.ndarray:
    if factor <= 1:
        return sig
    if np.iscomplexobj(sig):
        return (ss.decimate(sig.real, factor, zero_phase=True) + 1j * ss.decimate(sig.imag, factor, zero_phase=True)).astype(np.complex64)
    return ss.decimate(sig, factor, zero_phase=True).astype(sig.dtype)

def preprocess(sig: np.ndarray, sample_rate: float, remove_dc: bool = True,
               normalize: bool = True, lowpass_cutoff: float = None, decimate_factor: int = 1) -> dict:
    original = sig.copy()
    processed = sig.copy()
    steps = []

    if remove_dc:
        processed = remove_dc_offset(processed)
        steps.append('DC_REMOVED')
    if normalize:
        processed = normalize_power(processed)
        steps.append('NORMALIZED')
    if lowpass_cutoff:
        processed = apply_lowpass_filter(processed, lowpass_cutoff, sample_rate)
        steps.append(f'LOWPASS_{lowpass_cutoff:.0f}Hz')
    if decimate_factor > 1:
        processed = decimate_signal(processed, decimate_factor)
        sample_rate /= decimate_factor
        steps.append(f'DECIMATED_x{decimate_factor}')

    return {
        'original': original,
        'processed': processed,
        'steps': steps,
        'effective_sample_rate': sample_rate,
    }
