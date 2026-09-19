import sys
from pathlib import Path
import json

sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_live_all_17_stages():
    # 1. Health
    res = client.get('/health')
    assert res.status_code == 200
    h = res.json()
    assert h.get('status') == 'ok'
    assert h.get('service') == 'SignalX DSP Engine'

    # 2. Demo Load (QPSK)
    res = client.post('/api/demo/load', json={'signal_type': 'qpsk', 'snr_db': 22.0})
    assert res.status_code == 200
    demo = res.json()
    sid = demo['session_id']
    cid = demo['case_id']
    assert sid and cid

    # 3. Quality
    res = client.get(f'/api/analyze/quality/{sid}')
    assert res.status_code == 200
    q = res.json()
    assert 'snr_db' in q and 'noise_floor_db' in q

    # 4. Spectrum
    res = client.get(f'/api/analyze/spectrum/{sid}?window=hann&nfft=2048')
    assert res.status_code == 200
    spec = res.json()
    assert 'peak_freq_hz' in spec

    # 5. Waterfall
    res = client.get(f'/api/analyze/waterfall/{sid}?nperseg=256')
    assert res.status_code == 200
    wf = res.json()
    assert len(wf.get('times', [])) > 0 or len(wf.get('time_axis', [])) > 0

    # 6. Parameters
    res = client.get(f'/api/analyze/parameters/{sid}')
    assert res.status_code == 200
    p = res.json()
    assert 'snr' in p

    # 7. Constellation
    res = client.get(f'/api/analyze/constellation/{sid}')
    assert res.status_code == 200
    c = res.json()
    assert len(c.get('I', [])) > 0 or len(c.get('symbols_i', [])) > 0

    # 8. Classify Modulation
    res = client.post(f'/api/classify/modulation/{sid}')
    assert res.status_code == 200
    m = res.json()
    assert 'best' in m or 'primary' in m

    # 9. Demodulate
    res = client.post('/api/demodulate', json={'session_id': sid, 'modulation_scheme': 'QPSK'})
    assert res.status_code == 200
    d = res.json()
    assert d.get('total_bits', 0) > 0

    # 10. Interleaving Detection
    res = client.post('/api/detect/interleaving', json={'session_id': sid})
    assert res.status_code == 200
    intl = res.json()
    assert 'confidence' in intl

    # 11. Deinterleave
    res = client.post('/api/deinterleave', json={'session_id': sid, 'method': 'block', 'params': {'M': 8, 'N': 16}})
    assert res.status_code == 200
    deint = res.json()
    assert deint.get('total_bits', 0) > 0

    # 12. FEC Detection
    res = client.post('/api/detect/fec', json={'session_id': sid})
    assert res.status_code == 200
    f = res.json()
    assert 'confidence' in f

    # 13. Correlation
    res = client.post('/api/correlate', json={'session_id': sid, 'sync_pattern': '11010010'})
    assert res.status_code == 200
    corr = res.json()
    assert 'detected' in corr

    # 14. Report
    res = client.get(f'/api/report/{sid}')
    assert res.status_code == 200
    rep = res.json()
    assert rep.get('case_id') == cid

    # 15. Dashboard Stats
    res = client.get('/api/dashboard/stats')
    assert res.status_code == 200

    # 16. Cases list
    res = client.get('/api/cases')
    assert res.status_code == 200
    cases = res.json()
    assert len(cases) > 0

    # 17. Auth local login (DEMO / OFFLINE EVALUATION MODE)
    res = client.post('/auth/local', json={'email': 'evaluator@signalx.local', 'name': 'Local Evaluator (Offline Demo Mode)'})
    assert res.status_code == 200
    auth = res.json()
    assert auth.get('email') == 'evaluator@signalx.local'
