"""SignalX Parameter Estimation: Symbol rate estimation, carrier frequency offset, dynamic range, SNR, bandwidths."""
import numpy as np
from .dsp import compute_fft, estimate_bandwidth, estimate_snr, compute_instantaneous_frequency
import logging

logger = logging.getLogger(__name__)

def estimate_symbol_rate(sig: np.ndarray, sample_rate: float) -> dict:
    try:
        candidates = []
        nfft = min(16384, len(sig) - 1)

        # Method 1: Delay-and-multiply cyclostationary test (highly effective for PSK/QAM)
        tau = 1
        dm = sig[tau:] * np.conj(sig[:-tau]) if np.iscomplexobj(sig) else sig[tau:] * sig[:-tau]
        dm = dm - np.mean(dm)
        spec1 = np.abs(np.fft.fft(dm, n=nfft))
        freqs1 = np.fft.fftfreq(nfft, d=1.0 / sample_rate)
        pos1 = (freqs1 > 200) & (freqs1 < sample_rate / 2)
        if np.any(pos1):
            p_spec1 = spec1[pos1]
            p_freqs1 = freqs1[pos1]
            idx1 = int(np.argmax(p_spec1))
            ratio1 = float(p_spec1[idx1] / (np.median(p_spec1) + 1e-12))
            candidates.append((ratio1, float(p_freqs1[idx1]), 'delay_and_multiply_cyclostationary'))

        # Method 2: Squared magnitude periodicity
        sq_mag = np.abs(sig) ** 2
        sq_mag -= np.mean(sq_mag)
        spec2 = np.abs(np.fft.rfft(sq_mag, n=nfft))
        freqs2 = np.fft.rfftfreq(nfft, d=1.0 / sample_rate)
        pos2 = (freqs2 > 200) & (freqs2 < sample_rate / 2)
        if np.any(pos2):
            p_spec2 = spec2[pos2]
            p_freqs2 = freqs2[pos2]
            idx2 = int(np.argmax(p_spec2))
            ratio2 = float(p_spec2[idx2] / (np.median(p_spec2) + 1e-12))
            candidates.append((ratio2, float(p_freqs2[idx2]), 'squared_magnitude'))

        if candidates:
            candidates.sort(key=lambda x: x[0], reverse=True)
            best_ratio, best_rate, method = candidates[0]
            conf = min(95.0, (best_ratio / 5.0) * 25.0)
            return {
                'symbol_rate_hz': round(best_rate, 2) if best_rate > 0 else None,
                'confidence': round(max(5.0, conf), 1),
                'source': 'DSP_ESTIMATED',
                'method': method,
            }
        return {'symbol_rate_hz': None, 'confidence': 0, 'source': 'UNAVAILABLE', 'method': 'none'}
    except Exception as e:
        logger.warning(f"Symbol rate estimation error: {e}")
        return {'symbol_rate_hz': None, 'confidence': 0, 'source': 'UNAVAILABLE', 'method': 'failed'}

def estimate_frequency_offset(sig: np.ndarray, sample_rate: float) -> dict:
    try:
        r = compute_fft(sig, sample_rate, nfft=min(8192, len(sig)))
        return {
            'baseband_peak_hz': r['peak_freq_hz'],
            'source': 'DSP_ESTIMATED',
            'note': 'Baseband-relative peak offset. Absolute RF frequency requires metadata or user input.',
        }
    except Exception as e:
        return {'baseband_peak_hz': None, 'source': 'UNAVAILABLE', 'note': str(e)}

def extract_all_parameters(sig: np.ndarray, sample_rate: float,
                           sample_rate_source: str,
                           center_freq_hz=None,
                           center_freq_source: str = 'UNAVAILABLE',
                           n_samples: int = None,
                           duration: float = None) -> dict:
    nfft = min(8192, len(sig))
    r = compute_fft(sig, sample_rate, nfft=nfft)
    snr = estimate_snr(sig, sample_rate, nfft=nfft)
    bw_3db = estimate_bandwidth(r['freqs'], r['power_db'], -3.0)
    bw_20db = estimate_bandwidth(r['freqs'], r['power_db'], -20.0)
    sym_rate = estimate_symbol_rate(sig, sample_rate)
    freq_offset = estimate_frequency_offset(sig, sample_rate)

    signal_power_dbw = float(10 * np.log10(np.mean(np.abs(sig) ** 2) + 1e-12))
    dynamic_range = float(r['peak_power_db'] - r['noise_floor_db'])

    return {
        'sample_rate': {'value': sample_rate, 'unit': 'Hz', 'source': sample_rate_source},
        'n_samples': {'value': n_samples or len(sig), 'unit': 'samples', 'source': 'METADATA'},
        'duration': {'value': round(duration or (len(sig) / sample_rate), 4), 'unit': 's', 'source': 'METADATA'},
        'center_frequency_rf': {
            'value': center_freq_hz,
            'unit': 'Hz',
            'source': center_freq_source,
            'note': 'Absolute RF center frequency' if center_freq_hz else 'Cannot be determined from raw IQ without metadata or user input.',
        },
        'baseband_peak_freq': {
            'value': round(freq_offset['baseband_peak_hz'], 2) if freq_offset['baseband_peak_hz'] is not None else None,
            'unit': 'Hz',
            'source': 'DSP_ESTIMATED',
            'note': 'Baseband-relative only',
        },
        'occupied_bandwidth_3db': {
            'value': round(bw_3db['bandwidth_hz'], 2) if bw_3db['bandwidth_hz'] is not None else None,
            'unit': 'Hz',
            'source': 'DSP_ESTIMATED',
        },
        'occupied_bandwidth_20db': {
            'value': round(bw_20db['bandwidth_hz'], 2) if bw_20db['bandwidth_hz'] is not None else None,
            'unit': 'Hz',
            'source': 'DSP_ESTIMATED',
        },
        'snr': {
            'value': round(snr, 2) if snr is not None else None,
            'unit': 'dB',
            'source': 'DSP_ESTIMATED',
        },
        'noise_floor': {
            'value': round(r['noise_floor_db'], 2),
            'unit': 'dBFS',
            'source': 'DSP_ESTIMATED',
        },
        'signal_power': {
            'value': round(signal_power_dbw, 2),
            'unit': 'dBW (relative)',
            'source': 'DSP_ESTIMATED',
        },
        'dynamic_range': {
            'value': round(dynamic_range, 2),
            'unit': 'dB',
            'source': 'DSP_ESTIMATED',
        },
        'estimated_symbol_rate': sym_rate,
    }
