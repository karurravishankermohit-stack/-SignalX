import os
import uuid
import json
import logging
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ..database import create_session, update_session, save_signal, list_sessions, get_session, load_signal, UPLOADS_DIR
from ..core.file_parser import parse_wav, parse_iq, ParseError
from ..core.preprocessing import preprocess

router = APIRouter()
logger = logging.getLogger(__name__)
MAX_SIZE = 500 * 1024 * 1024  # 500 MB

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    config: str = Form(None),
    iq_sample_rate: float = Form(None),
    iq_dtype: str = Form('float32'),
    iq_arrangement: str = Form('interleaved'),
    iq_center_freq: float = Form(None),
    wav_interpretation: str = Form('auto'),
    process_duration_limit: float = Form(None),
    user_id: str = Form('guest'),
):
    sid = str(uuid.uuid4())
    year = datetime.utcnow().strftime('%Y')
    seq = str(uuid.uuid4().int)[:6].upper()
    cid = f"CASE-{year}-{seq}"

    fn = file.filename or 'unknown_signal'
    ext = Path(fn).suffix.lower()

    if ext not in ['.wav', '.iq']:
        raise HTTPException(400, f"Unsupported file type: {ext}. SignalX accepts .wav and .iq formats.")

    # Parse config JSON if provided from frontend
    if config:
        try:
            cfg = json.loads(config)
            iq_sample_rate = cfg.get('sampleRate') or cfg.get('sample_rate') or iq_sample_rate
            iq_dtype = cfg.get('dtype') or cfg.get('sample_format') or iq_dtype
            iq_arrangement = cfg.get('arrangement') or iq_arrangement
            iq_center_freq = cfg.get('centerFreq') or cfg.get('center_freq_hz') or iq_center_freq
            wav_interpretation = cfg.get('interpretation') or wav_interpretation
            user_id = cfg.get('userId') or cfg.get('user_id') or user_id
        except Exception as e:
            logger.warning(f"Error parsing config JSON: {e}")

    sp = UPLOADS_DIR / f"{sid}{ext}"
    try:
        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(413, f"File size ({len(content)/(1024*1024):.1f} MB) exceeds maximum allowed (500 MB).")
        sp.write_bytes(content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"File save failed: {e}")

    create_session(sid, cid, fn, ext.lstrip('.'), 'REAL_ANALYSIS', user_id=user_id)

    try:
        if ext == '.wav':
            parsed = parse_wav(str(sp), wav_interpretation)
        else:
            if not iq_sample_rate:
                raise HTTPException(422, "Sample rate is mandatory for raw .iq signal parsing.")
            parsed = parse_iq(str(sp), float(iq_sample_rate), iq_dtype, iq_arrangement, iq_center_freq)
    except ParseError as e:
        update_session(sid, status='parse_failed')
        raise HTTPException(422, f"Parse error: {e}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File parsing failure: {e}", exc_info=True)
        raise HTTPException(500, f"Parse exception: {e}")

    sig = parsed['signal']
    if process_duration_limit and process_duration_limit > 0:
        max_s = int(process_duration_limit * parsed['sample_rate'])
        if len(sig) > max_s:
            sig = sig[:max_s]

    pp = preprocess(sig, parsed['sample_rate'])

    save_signal(sid, {
        'original': sig,
        'processed': pp['processed'],
        'sample_rate': parsed['sample_rate'],
        'sample_rate_source': parsed.get('sample_rate_source', 'METADATA'),
        'center_freq_hz': parsed.get('center_freq_hz'),
        'center_freq_source': parsed.get('center_freq_source', 'UNAVAILABLE'),
        'format': parsed['format'],
        'interpretation': parsed.get('interpretation'),
        'signal_type': parsed.get('signal_type'),
        'n_samples': len(sig),
        'duration': len(sig) / parsed['sample_rate'],
        'data_source': 'REAL_ANALYSIS',
        'bits': None,
        'known_bits': None,
    })

    meta = {
        'filename': fn,
        'format': parsed['format'],
        'sample_rate': parsed['sample_rate'],
        'sample_rate_source': parsed.get('sample_rate_source'),
        'channels': parsed.get('n_channels'),
        'duration': parsed.get('duration'),
        'n_samples': parsed.get('n_samples'),
        'bit_depth': parsed.get('bit_depth'),
        'interpretation': parsed.get('interpretation'),
        'signal_type': parsed.get('signal_type'),
        'center_freq_hz': parsed.get('center_freq_hz'),
        'large_file_warning': len(content) > 200 * 1024 * 1024,
    }
    update_session(sid, status='ready', metadata=meta)

    return {
        'session_id': sid,
        'case_id': cid,
        'filename': fn,
        'format': parsed['format'],
        'sample_rate': parsed['sample_rate'],
        'sample_rate_source': parsed.get('sample_rate_source'),
        'n_samples': len(sig),
        'duration': len(sig) / parsed['sample_rate'],
        'interpretation': parsed.get('interpretation'),
        'signal_type': parsed.get('signal_type'),
        'data_source': 'REAL_ANALYSIS',
        'status': 'ready',
        'large_file_warning': len(content) > 200 * 1024 * 1024,
    }

@router.get("/sessions")
def get_sessions():
    return list_sessions()

@router.get("/session/{session_id}")
def get_session_by_id(session_id: str):
    s = get_session(session_id)
    if not s:
        raise HTTPException(404, "Session not found")
    return s

@router.post("/preprocess/{session_id}")
@router.get("/preprocess/{session_id}")
def preprocess_session(session_id: str, remove_dc: bool = True, normalize: bool = True, lowpass_cutoff: float = None, decimate_factor: int = 1):
    d = load_signal(session_id)
    if not d:
        raise HTTPException(404, "Session signal not found")
    sig = d.get('original') if d.get('original') is not None else d['processed']
    pp = preprocess(sig, d['sample_rate'], remove_dc=remove_dc, normalize=normalize, lowpass_cutoff=lowpass_cutoff, decimate_factor=decimate_factor)
    d['processed'] = pp['processed']
    d['sample_rate'] = pp['effective_sample_rate']
    save_signal(session_id, d)
    res = {
        'session_id': session_id,
        'status': 'preprocessed',
        'steps': pp['steps'],
        'effective_sample_rate': pp['effective_sample_rate'],
        'n_samples': len(pp['processed']),
        'data_source': d.get('data_source', 'REAL_ANALYSIS')
    }
    update_session(session_id, results={'preprocessing': res})
    return res

