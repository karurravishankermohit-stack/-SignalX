"""SignalX File Parser. Real audio/IQ reading with accurate metadata extraction. NEVER fabricates signal data."""
import numpy as np
from pathlib import Path
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class ParseError(Exception):
    pass

def parse_wav(filepath: str, interpretation: str = 'auto') -> dict:
    try:
        import soundfile as sf
        data, sr = sf.read(filepath, dtype='float32', always_2d=True)
    except Exception as e:
        raise ParseError(f"WAV read error: {e}")

    n_samples, n_ch = data.shape
    duration = n_samples / sr

    try:
        info = sf.info(filepath)
        bit_depth = info.subtype
    except:
        bit_depth = 'UNKNOWN'

    interp = interpretation.lower()
    if interp in ('iq', 'stereo_iq'):
        interp = 'stereo_iq'
    elif interp in ('audio', 'real_audio', 'real'):
        interp = 'real_audio'
    elif interp == 'auto':
        if n_ch == 2:
            # Check inter-channel correlation to distinguish stereo audio from IQ
            ch0 = data[:, 0] - np.mean(data[:, 0])
            ch1 = data[:, 1] - np.mean(data[:, 1])
            denom = (np.std(ch0) * np.std(ch1) + 1e-12)
            corr = float(np.abs(np.mean(ch0 * ch1) / denom))
            # Correlated L/R channels indicate regular audio; orthogonal indicate I/Q
            if corr > 0.5:
                interp = 'real_audio'
            else:
                interp = 'stereo_iq'
        else:
            interp = 'real_audio'

    if interp == 'stereo_iq' and n_ch >= 2:
        signal = (data[:, 0] + 1j * data[:, 1]).astype(np.complex64)
        sig_type = 'COMPLEX_IQ'
    else:
        # Real Audio: average stereo channels or take mono
        if n_ch >= 2:
            signal = np.mean(data, axis=1).astype(np.float32)
        else:
            signal = data[:, 0].astype(np.float32)
        sig_type = 'REAL'


    return {
        'signal': signal,
        'sample_rate': float(sr),
        'sample_rate_source': 'METADATA',
        'n_samples': n_samples,
        'n_channels': n_ch,
        'duration': duration,
        'bit_depth': bit_depth,
        'interpretation': interp,
        'signal_type': sig_type,
        'format': 'WAV',
    }

def parse_iq(filepath: str, sample_rate: float, dtype: str = 'float32',
             arrangement: str = 'interleaved', center_freq_hz: Optional[float] = None) -> dict:
    dtype_map = {'int8': np.int8, 'int16': np.int16, 'float32': np.float32, 'float64': np.float64}
    if dtype not in dtype_map:
        raise ParseError(f"Unsupported dtype: {dtype}. Use int8, int16, float32")
    np_dtype = dtype_map[dtype]

    fsize = Path(filepath).stat().st_size
    if fsize == 0:
        raise ParseError("File is empty")

    try:
        raw = np.fromfile(filepath, dtype=np_dtype)
    except Exception as e:
        raise ParseError(f"IQ read error: {e}")

    if len(raw) < 2:
        raise ParseError("File contains insufficient samples")

    if arrangement == 'interleaved':
        if len(raw) % 2 != 0:
            raw = raw[:-1]
        I = raw[0::2].astype(np.float32)
        Q = raw[1::2].astype(np.float32)
        if np_dtype in (np.int8, np.int16):
            mv = np.iinfo(np_dtype).max
            I /= mv
            Q /= mv
        signal = (I + 1j * Q).astype(np.complex64)
    else:
        raise ParseError(f"Unsupported IQ arrangement: {arrangement}")

    n = len(signal)
    return {
        'signal': signal,
        'sample_rate': float(sample_rate),
        'sample_rate_source': 'USER_PROVIDED',
        'n_samples': n,
        'n_channels': 2,
        'duration': n / sample_rate,
        'bit_depth': dtype,
        'interpretation': 'stereo_iq',
        'signal_type': 'COMPLEX_IQ',
        'format': 'IQ',
        'center_freq_hz': center_freq_hz,
        'center_freq_source': 'USER_PROVIDED' if center_freq_hz is not None else 'UNAVAILABLE',
    }

def validate_file(filepath: str, expected_ext: str) -> Tuple[bool, str]:
    p = Path(filepath)
    if not p.exists():
        return False, "File does not exist"
    if p.stat().st_size == 0:
        return False, "File is empty"
    if p.suffix.lower() != expected_ext.lower():
        return False, f"Invalid file extension: expected {expected_ext}"
    return True, "OK"
