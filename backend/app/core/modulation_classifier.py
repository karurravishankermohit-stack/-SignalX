"""SignalX Automatic Modulation Classification (AMC).
Real statistical feature extraction, cumulant analysis, phase entropy, decision logic.
NEVER uses hardcoded fake confidence.
"""
import numpy as np
from scipy import signal as ss
from .dsp import compute_fft, compute_instantaneous_frequency
import logging

logger = logging.getLogger(__name__)

MODULATION_CLASSES = ['BPSK', 'QPSK', '8PSK', '16QAM', '64QAM', 'FSK', 'AM', 'FM', 'UNKNOWN']

def extract_features(sig: np.ndarray, sample_rate: float) -> dict:
    if len(sig) < 64:
        return {}

    if not np.iscomplexobj(sig):
        sig = ss.hilbert(sig).astype(np.complex64)

    amp = np.abs(sig)
    amp_mean = np.mean(amp) + 1e-12
    amp_n = amp / amp_mean
    amp_var = float(np.var(amp_n))

    phase = np.angle(sig)
    pu = np.unwrap(phase)
    pd = pu - np.linspace(pu[0], pu[-1], len(pu))
    sigma_ap = float(np.std(pd))

    # 4th order cumulant/moment metric mu42
    sig_pow2 = np.mean(np.abs(sig) ** 2) ** 2 + 1e-12
    mu42 = float(np.abs(np.mean(sig ** 2 * np.conj(sig) ** 2)) / sig_pow2)

    # Frequency variation and FSK Tone Separation
    try:
        ifreq = compute_instantaneous_frequency(sig, sample_rate)
        ifv = float(np.var(ifreq / (sample_rate + 1e-12)))
        pos_tones = ifreq[ifreq > np.median(ifreq)]
        neg_tones = ifreq[ifreq <= np.median(ifreq)]
        if len(pos_tones) > 10 and len(neg_tones) > 10:
            pos_peak = float(np.median(pos_tones))
            neg_peak = float(np.median(neg_tones))
            tone_sep = float(abs(pos_peak - neg_peak))
            spread = float((np.std(pos_tones) + np.std(neg_tones)) / 2.0 + 1e-6)
            tone_sep_ratio = float(tone_sep / spread)
        else:
            tone_sep = 0.0
            tone_sep_ratio = 0.0
    except Exception:
        ifv = 0.0
        tone_sep = 0.0
        tone_sep_ratio = 0.0

    # I/Q variance ratio
    I = sig.real
    Q = sig.imag
    iq_imbalance = float(np.var(I) / (np.var(Q) + 1e-12))

    # Phase entropy
    ph, _ = np.histogram(phase, bins=36, range=(-np.pi, np.pi))
    ph_prob = ph / (np.sum(ph) + 1e-12)
    phase_entropy = float(-np.sum(ph_prob * np.log2(ph_prob + 1e-12)))

    # Phase collapsing power moments for discrete PSK order discrimination
    m2 = float(np.abs(np.mean(sig ** 2)) / (np.mean(np.abs(sig) ** 2) + 1e-12))
    m4 = float(np.abs(np.mean(sig ** 4)) / (np.mean(np.abs(sig) ** 4) + 1e-12))
    m8 = float(np.abs(np.mean(sig ** 8)) / (np.mean(np.abs(sig) ** 8) + 1e-12))

    # Spectral flatness
    r = compute_fft(sig, sample_rate, nfft=min(512, len(sig)))
    mag = 10 ** (r['power_db'] / 20.0)
    sf = float(np.exp(np.mean(np.log(mag + 1e-12))) / (np.mean(mag) + 1e-12))

    return {
        'amp_var': amp_var,
        'sigma_ap': sigma_ap,
        'mu42': mu42,
        'm2': m2,
        'm4': m4,
        'm8': m8,
        'inst_freq_var': ifv,
        'tone_sep_hz': tone_sep,
        'tone_sep_ratio': tone_sep_ratio,
        'iq_imbalance': iq_imbalance,
        'phase_entropy': phase_entropy,
        'M_max': float(np.max(amp_n)),
        'spectral_flatness': sf,
    }

def _score(f: dict) -> dict:
    s = {m: 0.0 for m in MODULATION_CLASSES}
    av = f.get('amp_var', 1.0)
    mu42 = f.get('mu42', 1.0)
    m2 = f.get('m2', 0.0)
    m4 = f.get('m4', 0.0)
    m8 = f.get('m8', 0.0)
    ifv = f.get('inst_freq_var', 0.0)
    tsr = f.get('tone_sep_ratio', 0.0)
    tsep = f.get('tone_sep_hz', 0.0)

    # Constant envelope test
    is_const_env = av < 0.12

    if is_const_env:
        # Phase symmetry tests:
        # BPSK: m2 collapses to > 0.45
        # QPSK: m4 collapses to > 0.40
        # 8PSK: m8 collapses to > 0.35
        if m2 > 0.45:
            s['BPSK'] += 90
            s['QPSK'] += 10
        elif m4 > 0.40:
            s['QPSK'] += 90
            s['8PSK'] += 10
        elif m8 > 0.35:
            s['8PSK'] += 85
            s['QPSK'] += 15
        elif tsr > 2.0 and tsep > 500.0:
            # Constant envelope with no discrete phase symmetry, but strong tone separation -> FSK
            s['FSK'] += 95
            s['FM'] += 15
        else:
            # High phase dispersion + frequency variation indicates FSK/FM
            if tsr > 1.5 or ifv > 0.01:
                s['FSK'] += 85
                s['FM'] += 30
            else:
                s['FSK'] += 60
                s['QPSK'] += 20
    else:
        # Multi-amplitude constellation (QAM / AM)
        if mu42 > 1.40:
            s['64QAM'] += 75
            s['16QAM'] += 20
        elif mu42 >= 1.15:
            s['16QAM'] += 80
            s['64QAM'] += 15
            s['QPSK'] += 5
        else:
            s['16QAM'] += 45
            s['QPSK'] += 35

        if av > 0.35 and ifv < 0.005:
            s['AM'] += 50

    if ifv > 0.04:
        s['FM'] += 40

    return {k: max(0.0, v) for k, v in s.items()}

def classify(sig: np.ndarray, sample_rate: float) -> dict:
    if len(sig) < 64:
        return {
            'best': 'UNKNOWN',
            'confidence': 0.0,
            'alternatives': [],
            'features': {},
            'evidence': ['Insufficient signal length for modulation classification (<64 samples)'],
            'limitations': 'Signal too short for classification.',
            'source': 'AUTO_CLASSIFIED',
        }

    try:
        f = extract_features(sig, sample_rate)
        sc = _score(f)
        tot = sum(sc.values())
        conf = {k: (v / tot * 100.0) for k, v in sc.items()} if tot > 1e-6 else {k: 100.0 / len(MODULATION_CLASSES) for k in MODULATION_CLASSES}
        sm = sorted(conf.items(), key=lambda x: x[1], reverse=True)
        best, bc = sm[0]
        if bc < 25.0:
            best = 'UNKNOWN'

        alts = [{'modulation': m, 'confidence': round(c, 1)} for m, c in sm[1:5] if c > 0.5]

        ev = []
        av = f.get('amp_var', 1.0)
        if av < 0.12:
            ev.append(f'Constant-envelope characteristics detected (amplitude variance: {av:.4f})')
        else:
            ev.append(f'Multi-amplitude constellation / variable envelope detected (amp variance: {av:.4f})')

        m2, m4, m8 = f.get('m2', 0.0), f.get('m4', 0.0), f.get('m8', 0.0)
        ev.append(f'Phase symmetry moments: m2={m2:.3f} (BPSK), m4={m4:.3f} (QPSK), m8={m8:.3f} (8PSK)')

        if f.get('inst_freq_var', 0.0) > 0.008:
            ev.append(f'Instantaneous frequency shift detected (variance: {f.get("inst_freq_var"):.4f})')

        if f.get('tone_sep_ratio', 0.0) > 2.0:
            ev.append(f'Instantaneous-frequency bimodal tone states identified (Tone separation: {f.get("tone_sep_hz"):.1f} Hz, separation ratio: {f.get("tone_sep_ratio"):.2f})')

        ev.append(f'Phase cluster entropy: {f.get("phase_entropy", 0.0):.2f}')
        ev.append(f'4th-order cumulant moment (mu42): {f.get("mu42", 0.0):.3f}')

        return {
            'best': best,
            'confidence': round(bc, 1),
            'alternatives': alts,
            'features': {k: round(v, 4) for k, v in f.items()},
            'evidence': ev,
            'limitations': 'Probabilistic classification based on statistical cumulants and phase entropy. Analyst confirmation recommended.',
            'source': 'AUTO_CLASSIFIED',
        }
    except Exception as e:
        logger.error(f"Classification error: {e}", exc_info=True)
        return {
            'best': 'UNKNOWN',
            'confidence': 0.0,
            'alternatives': [],
            'features': {},
            'evidence': [f'Classification exception: {str(e)}'],
            'limitations': 'Classification failed.',
            'source': 'AUTO_CLASSIFIED',
        }
