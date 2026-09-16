"""SignalX Demodulation Engine: Real demodulation for BPSK, QPSK, 8PSK, 2FSK, 4FSK, 16QAM, 64QAM.
NEVER returns hardcoded bits. Every bit is computed from actual samples.
Pure NumPy clustering for FSK without external C-extensions.
"""
import numpy as np
import logging

logger = logging.getLogger(__name__)

def _kmeans_1d(data: np.ndarray, k: int, max_iter: int = 30) -> np.ndarray:
    """Pure NumPy 1-D K-Means clustering for tone detection."""
    if len(data) == 0:
        return np.zeros(k)
    centers = np.percentile(data, np.linspace(15, 85, k))
    for _ in range(max_iter):
        distances = np.abs(data[:, None] - centers[None, :])
        labels = np.argmin(distances, axis=1)
        new_centers = np.array([
            data[labels == j].mean() if np.any(labels == j) else centers[j]
            for j in range(k)
        ])
        if np.allclose(centers, new_centers, atol=1e-2):
            break
        centers = new_centers
    return np.sort(centers)

def demod_bpsk(sig: np.ndarray, sample_rate: float, symbol_rate: float, freq_offset: float = 0.0) -> dict:
    sps = max(1, int(round(sample_rate / symbol_rate)))
    if abs(freq_offset) > 0:
        t = np.arange(len(sig)) / sample_rate
        sig = sig * np.exp(-2j * np.pi * freq_offset * t)

    if not np.iscomplexobj(sig):
        from scipy.signal import hilbert
        sig = hilbert(sig).astype(np.complex64)

    ns = len(sig) // sps
    syms = [float(np.mean(sig[i * sps:(i + 1) * sps].real)) for i in range(ns)]
    bits = (np.array(syms) > 0).astype(int).tolist()

    return {
        'modulation': 'BPSK',
        'symbols': syms,
        'bits': bits,
        'bit_count': len(bits),
        'symbol_count': ns,
        'samples_per_symbol': sps,
        'source': 'DSP_COMPUTED',
    }

def demod_qpsk(sig: np.ndarray, sample_rate: float, symbol_rate: float,
               freq_offset: float = 0.0, phase_offset: float = 0.0) -> dict:
    sps = max(1, int(round(sample_rate / symbol_rate)))
    if abs(freq_offset) > 0:
        t = np.arange(len(sig)) / sample_rate
        sig = sig * np.exp(-2j * np.pi * freq_offset * t)

    if not np.iscomplexobj(sig):
        from scipy.signal import hilbert
        sig = hilbert(sig).astype(np.complex64)

    if abs(phase_offset) > 0:
        sig = sig * np.exp(-1j * phase_offset)

    ns = len(sig) // sps
    bits = []
    syms = []

    for i in range(ns):
        s = np.mean(sig[i * sps:(i + 1) * sps])
        syms.append(complex(s))
        # Standard Gray-coded QPSK quadrant decision:
        # Q1 (I >= 0, Q >= 0): [0, 0]
        # Q2 (I < 0,  Q >= 0): [0, 1]
        # Q3 (I < 0,  Q < 0) : [1, 1]
        # Q4 (I >= 0, Q < 0) : [1, 0]
        if s.real >= 0 and s.imag >= 0:
            bits.extend([0, 0])
        elif s.real < 0 and s.imag >= 0:
            bits.extend([0, 1])
        elif s.real < 0 and s.imag < 0:
            bits.extend([1, 1])
        else:
            bits.extend([1, 0])

    return {
        'modulation': 'QPSK',
        'symbols': [{'I': float(s.real), 'Q': float(s.imag)} for s in syms],
        'bits': bits,
        'bit_count': len(bits),
        'symbol_count': ns,
        'samples_per_symbol': sps,
        'source': 'DSP_COMPUTED',
    }

def demod_8psk(sig: np.ndarray, sample_rate: float, symbol_rate: float) -> dict:
    sps = max(1, int(round(sample_rate / symbol_rate)))
    if not np.iscomplexobj(sig):
        from scipy.signal import hilbert
        sig = hilbert(sig).astype(np.complex64)

    ns = len(sig) // sps
    bits = []
    syms = []
    angles_8psk = [k * np.pi / 4 for k in range(8)]
    gray_8psk = [0b000, 0b001, 0b011, 0b010, 0b110, 0b111, 0b101, 0b100]

    for i in range(ns):
        s = np.mean(sig[i * sps:(i + 1) * sps])
        syms.append(complex(s))
        ph = np.angle(s) % (2 * np.pi)
        diffs = [abs(((ph - a) + np.pi) % (2 * np.pi) - np.pi) for a in angles_8psk]
        idx = int(np.argmin(diffs))
        sym_bits = gray_8psk[idx]
        bits.extend([(sym_bits >> 2) & 1, (sym_bits >> 1) & 1, sym_bits & 1])

    return {
        'modulation': '8PSK',
        'symbols': [{'I': float(s.real), 'Q': float(s.imag)} for s in syms],
        'bits': bits,
        'bit_count': len(bits),
        'symbol_count': ns,
        'source': 'DSP_COMPUTED',
    }

def demod_fsk(sig: np.ndarray, sample_rate: float, symbol_rate: float, n_tones: int = 2) -> dict:
    from .dsp import compute_instantaneous_frequency

    sps = max(1, int(round(sample_rate / symbol_rate)))
    ifreq = compute_instantaneous_frequency(sig, sample_rate)

    if len(ifreq) < sps:
        return {'modulation': f'{n_tones}FSK', 'bits': [], 'bit_count': 0, 'source': 'DSP_COMPUTED', 'error': 'Signal too short'}

    ns = len(ifreq) // sps
    sf = np.array([float(np.median(ifreq[i * sps:(i + 1) * sps])) for i in range(ns)])

    centers = _kmeans_1d(sf, n_tones)
    bps = int(np.log2(n_tones))
    bits = []

    for freq in sf:
        ti = int(np.argmin(np.abs(centers - freq)))
        g = ti ^ (ti >> 1)
        for b in range(bps - 1, -1, -1):
            bits.append((g >> b) & 1)

    return {
        'modulation': f'{n_tones}FSK',
        'symbols': sf.tolist(),
        'bits': bits,
        'bit_count': len(bits),
        'symbol_count': ns,
        'tone_frequencies_hz': centers.tolist(),
        'source': 'DSP_COMPUTED',
    }

def demod_qam(sig: np.ndarray, sample_rate: float, symbol_rate: float, order: int = 16) -> dict:
    sps = max(1, int(round(sample_rate / symbol_rate)))
    if not np.iscomplexobj(sig):
        from scipy.signal import hilbert
        sig = hilbert(sig).astype(np.complex64)

    rms = np.sqrt(np.mean(np.abs(sig) ** 2)) + 1e-12
    sn = sig / rms

    sqo = int(np.sqrt(order))
    bps = int(np.log2(order))
    levels = np.linspace(-(sqo - 1), sqo - 1, sqo)

    ns = len(sn) // sps
    bits = []
    syms = []

    max_i = np.max(np.abs(sn.real)) + 1e-12
    max_q = np.max(np.abs(sn.imag)) + 1e-12

    for i in range(ns):
        s = np.mean(sn[i * sps:(i + 1) * sps])
        syms.append(complex(s))
        scaled_i = s.real * ((sqo - 1) / max_i)
        scaled_q = s.imag * ((sqo - 1) / max_q)

        Ii = int(np.argmin(np.abs(levels - scaled_i)))
        Qi = int(np.argmin(np.abs(levels - scaled_q)))

        gi = Ii ^ (Ii >> 1)
        gq = Qi ^ (Qi >> 1)
        hb = bps // 2

        for b in range(hb - 1, -1, -1):
            bits.append((gi >> b) & 1)
        for b in range(hb - 1, -1, -1):
            bits.append((gq >> b) & 1)

    return {
        'modulation': f'{order}QAM',
        'symbols': [{'I': float(s.real), 'Q': float(s.imag)} for s in syms],
        'bits': bits,
        'bit_count': len(bits),
        'symbol_count': ns,
        'source': 'DSP_COMPUTED',
    }

def demodulate(sig: np.ndarray, sample_rate: float, modulation: str,
               symbol_rate: float, freq_offset: float = 0.0,
               phase_offset: float = 0.0, **kw) -> dict:
    m = modulation.upper().strip()
    if m == 'BPSK':
        return demod_bpsk(sig, sample_rate, symbol_rate, freq_offset)
    elif m == 'QPSK':
        return demod_qpsk(sig, sample_rate, symbol_rate, freq_offset, phase_offset)
    elif m == '8PSK':
        return demod_8psk(sig, sample_rate, symbol_rate)
    elif m in ('FSK', '2FSK'):
        return demod_fsk(sig, sample_rate, symbol_rate, 2)
    elif m == '4FSK':
        return demod_fsk(sig, sample_rate, symbol_rate, 4)
    elif m == '16QAM':
        return demod_qam(sig, sample_rate, symbol_rate, 16)
    elif m == '64QAM':
        return demod_qam(sig, sample_rate, symbol_rate, 64)
    else:
        return {
            'error': f'Modulation {modulation} not supported',
            'supported': ['BPSK', 'QPSK', '8PSK', 'FSK', '2FSK', '4FSK', '16QAM', '64QAM'],
            'source': 'DSP_COMPUTED',
        }
