from fastapi import APIRouter, HTTPException
from ..database import get_session, load_signal
from datetime import datetime

router = APIRouter()

@router.get("/report/{session_id}")
def get_report(session_id: str):
    s = get_session(session_id)
    if not s:
        raise HTTPException(404, "Session not found")

    d = load_signal(session_id)
    ds = s.get('data_source', 'REAL_ANALYSIS')
    source_type = 'DEMO' if ds == 'DEMO_DATA' else 'REAL_UPLOAD'
    ground_truth_available = (source_type == 'DEMO' and d is not None and d.get('known_bits') is not None)

    mod_res = s.get('results', {}).get('modulation', {})
    fec_dec = s.get('results', {}).get('fec_decode', {})
    fec_det = s.get('results', {}).get('fec_detection', {})
    corr_res = s.get('results', {}).get('correlation', {})
    demod_res = s.get('results', {}).get('demodulation', {})
    qual_res = s.get('results', {}).get('quality', {})

    return {
        'report_version': '2.0',
        'generated_at': datetime.utcnow().isoformat(),
        'source_provenance': {
            'data_source': ds,
            'source_type': source_type,
            'ground_truth_available': ground_truth_available,
            'known_modulation': d.get('modulation') if (d and source_type == 'DEMO') else None,
            'configured_snr': d.get('snr_db') if (d and source_type == 'DEMO') else None,
            'provenance_badge': 'DEMO_DATA' if source_type == 'DEMO' else 'REAL_ANALYSIS',
            'label': 'DEMO DATA — SYNTHETIC SIGNAL' if source_type == 'DEMO' else 'REAL ANALYSIS — OPERATIONAL SIGNAL'
        },
        'data_source': ds,
        'data_source_label': 'REAL ANALYSIS' if ds == 'REAL_ANALYSIS' else 'DEMO DATA — SYNTHETIC SIGNAL',
        'case_id': s.get('case_id'),
        'session_id': session_id,
        'file_info': {
            'filename': s.get('filename'),
            'format': s.get('file_format'),
            **s.get('metadata', {}),
        },
        'automatic_manual_status': {
            'amc_classification': 'AUTO_CLASSIFIED',
            'fec_detection': fec_det.get('status', 'NO_RELIABLE_CANDIDATE'),
            'fec_decode': fec_dec.get('status', 'CONFIGURED_MANUAL') if fec_dec else 'UNAVAILABLE',
            'fec_decode_label': fec_dec.get('decode_label', 'Configured/Manual FEC Decode — not automatically detected') if fec_dec else 'Not Executed',
            'frame_correlation': corr_res.get('status', 'VERIFIED' if (source_type == 'DEMO' and corr_res.get('estimated_period') == 128) else 'CONFIGURED_MANUAL'),
            'frame_period_label': corr_res.get('period_label', 'CANDIDATE FRAME PERIOD' if corr_res else 'Not Executed')
        },
        'analysis_results': s.get('results', {}),
        'scientific_evidence': {
            'snr_db': qual_res.get('snr_db'),
            'amc_best': mod_res.get('best'),
            'amc_confidence': mod_res.get('confidence'),
            'amc_evidence': mod_res.get('evidence', []),
            'demod_bits': demod_res.get('bit_count'),
            'ber': demod_res.get('ber'),
            'frame_period': corr_res.get('estimated_period')
        },
        'limitations': [
            'Absolute RF center frequency cannot be recovered from baseband samples without metadata or user specification (marked UNAVAILABLE).',
            'Modulation classification is derived from 4th-order statistical cumulants and phase-entropy features. Continuous-phase FSK constellation and EVM are marked NOT_APPLICABLE.',
            'Automatic FEC identification is probabilistic; if no code matches syndrome thresholds, status is strictly NO_RELIABLE_CANDIDATE without fabrication.',
            'If the Viterbi decoder is executed under manual/demo parameters, it is explicitly designated as "Configured/Manual FEC Decode — not automatically detected".',
            'True BER requires known reference transmitted bit sequences (available in DEMO mode). For unknown real signals, BER is marked NOT AVAILABLE.',
            'Correlation peaks identify CANDIDATE frame/synchronization boundaries; they are not certified protocol frames without higher-layer decoding.'
        ],
        'status': s.get('status'),
    }
