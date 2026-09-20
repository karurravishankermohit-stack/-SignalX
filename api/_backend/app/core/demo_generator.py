"""SignalX Synthetic Signal Generator for Mode B (Demo Analysis).
Generates mathematically authentic QPSK, FSK, and 16-QAM signals from known bitstreams.
Allows end-to-end pipeline verification including true BER calculation.
"""
import numpy as np
import logging

logger = logging.getLogger(__name__)

def _add_awgn(sig: np.ndarray, snr_db: float) -> np.ndarray:
    sp = np.mean(np.abs(sig) ** 2)
    nl = 10.0 ** (snr_db / 10.0)
    np_ = sp / nl
    if np.iscomplexobj(sig):
        noise = np.sqrt(np_ / 2.0) * (np.random.randn(len(sig)) + 1j * np.random.randn(len(sig)))
    else:
        noise = np.sqrt(np_) * np.random.randn(len(sig))
    return (sig + noise).astype(sig.dtype)

def generate_qpsk(num_bits: int = 1000, sample_rate: float = 48000,
                  symbol_rate: float = 4800, snr_db: float = 20) -> dict:
    np.random.seed(42)
    num_bits = (num_bits // 2) * 2
    bits = np.random.randint(0, 2, num_bits).tolist()

    # Insert periodic framing preambles (128-bit frames with Barker-8 preamble 11010010)
    sync_word = [1, 1, 0, 1, 0, 0, 1, 0]
    frame_len = 128
    for f_start in range(0, num_bits - len(sync_word), frame_len):
        bits[f_start:f_start + len(sync_word)] = sync_word

    ns = num_bits // 2


    phases = {
        (0, 0): np.pi / 4,
        (0, 1): 3 * np.pi / 4,
        (1, 1): 5 * np.pi / 4,
        (1, 0): 7 * np.pi / 4
    }
    sps = int(round(sample_rate / symbol_rate))
    iq = []

    for i in range(ns):
        sym_phase = phases[(bits[2 * i], bits[2 * i + 1])]
        sym_val = np.exp(1j * sym_phase)
        iq.extend([sym_val] * sps)

    sig = _add_awgn(np.array(iq, dtype=np.complex64), snr_db).astype(np.complex64)

    return {
        'signal': sig,
        'bits': bits,
        'sample_rate': sample_rate,
        'symbol_rate': symbol_rate,
        'n_symbols': ns,
        'modulation': 'QPSK',
        'snr_db': snr_db,
        'data_source': 'DEMO_DATA',
        'label': 'DEMO DATA — SYNTHETIC SIGNAL',
    }

def generate_fsk(num_bits: int = 1000, sample_rate: float = 48000,
                 symbol_rate: float = 4800, deviation_hz: float = 5000,
                 snr_db: float = 20) -> dict:
    np.random.seed(43)
    bits = np.random.randint(0, 2, num_bits).tolist()
    sps = int(round(sample_rate / symbol_rate))
    iq = []
    phase = 0.0

    for bit in bits:
        freq = deviation_hz if bit == 1 else -deviation_hz
        t = np.arange(sps) / sample_rate
        ip = 2 * np.pi * freq * t + phase
        iq.extend(np.exp(1j * ip))
        phase = float(ip[-1])

    sig = _add_awgn(np.array(iq, dtype=np.complex64), snr_db).astype(np.complex64)

    return {
        'signal': sig,
        'bits': bits,
        'sample_rate': sample_rate,
        'symbol_rate': symbol_rate,
        'deviation_hz': deviation_hz,
        'modulation': '2FSK',
        'snr_db': snr_db,
        'data_source': 'DEMO_DATA',
        'label': 'DEMO DATA — SYNTHETIC SIGNAL',
    }

def generate_16qam(num_bits: int = 1000, sample_rate: float = 48000,
                   symbol_rate: float = 4800, snr_db: float = 25) -> dict:
    np.random.seed(44)
    num_bits = (num_bits // 4) * 4
    bits = np.random.randint(0, 2, num_bits).tolist()
    ns = num_bits // 4
    sps = int(round(sample_rate / symbol_rate))

    g2l = {0b00: -3.0, 0b01: -1.0, 0b11: 1.0, 0b10: 3.0}
    iq = []

    for i in range(ns):
        b = bits[4 * i:4 * i + 4]
        gi = b[0] * 2 + b[1]
        gq = b[2] * 2 + b[3]
        I_val = g2l.get(gi, -1.0) / 3.0
        Q_val = g2l.get(gq, -1.0) / 3.0
        sym_val = complex(I_val, Q_val)
        iq.extend([sym_val] * sps)

    sig = _add_awgn(np.array(iq, dtype=np.complex64), snr_db).astype(np.complex64)

    return {
        'signal': sig,
        'bits': bits,
        'sample_rate': sample_rate,
        'symbol_rate': symbol_rate,
        'n_symbols': ns,
        'modulation': '16QAM',
        'snr_db': snr_db,
        'data_source': 'DEMO_DATA',
        'label': 'DEMO DATA — SYNTHETIC SIGNAL',
    }

GENERATORS = {
    'qpsk': generate_qpsk,
    'fsk': generate_fsk,
    '2fsk': generate_fsk,
    '16qam': generate_16qam,
}
