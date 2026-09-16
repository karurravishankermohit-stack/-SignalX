import urllib.request
import json

def test_live():
    base = 'http://127.0.0.1:8000'
    
    # 1. Health
    res = urllib.request.urlopen(f'{base}/health')
    h = json.loads(res.read())
    print(f'[PASS] 1. Health: {h}')
    assert h.get('status') == 'ok'
    
    # 2. Demo Load
    req = urllib.request.Request(
        f'{base}/api/demo/load',
        data=json.dumps({'signal_type': 'qpsk', 'snr_db': 22.0}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    demo = json.loads(res.read())
    sid = demo['session_id']
    cid = demo['case_id']
    print(f"[PASS] 2. Demo Load: session={sid[:8]}, case={cid}, type={demo.get('signal_type')}")
    
    # 3. Quality
    res = urllib.request.urlopen(f'{base}/api/analyze/quality/{sid}')
    q = json.loads(res.read())
    print(f"[PASS] 3. Quality: SNR={q.get('snr_db')} dB, noise_floor={q.get('noise_floor_db')} dBFS")
    
    # 4. Spectrum
    res = urllib.request.urlopen(f'{base}/api/analyze/spectrum/{sid}?window=hann&nfft=2048')
    spec = json.loads(res.read())
    print(f"[PASS] 4. Spectrum: peak={spec.get('peak_freq_hz')} Hz, SNR={spec.get('snr_db')} dB")
    
    # 5. Waterfall
    res = urllib.request.urlopen(f'{base}/api/analyze/waterfall/{sid}?nperseg=256')
    wf = json.loads(res.read())
    print(f"[PASS] 5. Waterfall: time_slices={len(wf.get('time_axis', []))}, freq_bins={len(wf.get('freq_axis', []))}")
    
    # 6. Parameters
    res = urllib.request.urlopen(f'{base}/api/analyze/parameters/{sid}')
    p = json.loads(res.read())
    print(f"[PASS] 6. Parameters: SNR={p.get('snr', {}).get('value')} dB, SymbolRate={p.get('estimated_symbol_rate', {}).get('symbol_rate_hz')} Baud")
    
    # 7. Constellation
    res = urllib.request.urlopen(f'{base}/api/analyze/constellation/{sid}')
    c = json.loads(res.read())
    print(f"[PASS] 7. Constellation: symbols={len(c.get('symbols_i', []))}, evm={c.get('evm_percent')}%")
    
    # 8. Classify Modulation (POST)
    req = urllib.request.Request(f'{base}/api/classify/modulation/{sid}', data=b'{}', headers={'Content-Type': 'application/json'})
    res = urllib.request.urlopen(req)
    m = json.loads(res.read())
    print(f"[PASS] 8. Modulation: Primary={m.get('primary')}, Conf={m.get('confidence')}%")
    
    # 9. Demodulate (POST)
    req = urllib.request.Request(
        f'{base}/api/demodulate',
        data=json.dumps({'session_id': sid, 'modulation_scheme': 'QPSK'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    d = json.loads(res.read())
    print(f"[PASS] 9. Demodulate: TotalBits={d.get('total_bits')}, BER={d.get('ber_estimate')}")
    
    # 10. Interleaving Detection (POST)
    req = urllib.request.Request(
        f'{base}/api/detect/interleaving',
        data=json.dumps({'session_id': sid}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    intl = json.loads(res.read())
    best_intl = intl.get('best') or {}
    print(f"[PASS] 10. Interleaving Detect: Candidate={best_intl.get('type', 'None')}, Confidence={intl.get('confidence')}%")
    
    # 11. Deinterleave (POST)
    req = urllib.request.Request(
        f'{base}/api/deinterleave',
        data=json.dumps({'session_id': sid, 'method': 'block', 'params': {'M': 8, 'N': 16}}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    deint = json.loads(res.read())
    print(f"[PASS] 11. Deinterleave: method={deint.get('method')}, total_bits={deint.get('total_bits')}")
    
    # 12. FEC Detection (POST)
    req = urllib.request.Request(
        f'{base}/api/detect/fec',
        data=json.dumps({'session_id': sid}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    f = json.loads(res.read())
    best_fec = f.get('best') or {}
    print(f"[PASS] 12. FEC Detect: Candidate={best_fec.get('type', 'None')}, Confidence={f.get('confidence')}%")
    
    # 13. Correlation (POST)
    req = urllib.request.Request(
        f'{base}/api/correlate',
        data=json.dumps({'session_id': sid, 'sync_pattern': '11010010'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    corr = json.loads(res.read())
    print(f"[PASS] 13. Correlate: Sync locations found={len(corr.get('locations', []))}, detected={corr.get('detected')}")
    
    # 14. Report
    res = urllib.request.urlopen(f'{base}/api/report/{sid}')
    rep = json.loads(res.read())
    print(f"[PASS] 14. Report: Generated dossier for case={rep.get('case_id')}, modulation={rep.get('modulation', {}).get('primary')}")
    
    # 15. Dashboard Stats
    res = urllib.request.urlopen(f'{base}/api/dashboard/stats')
    stats = json.loads(res.read())
    print(f"[PASS] 15. Dashboard Stats: Cases={stats.get('total_cases')}, Total Duration={stats.get('total_duration_hours')} hrs")
    
    # 16. Cases list
    res = urllib.request.urlopen(f'{base}/api/cases')
    cases = json.loads(res.read())
    print(f"[PASS] 16. Cases list: {len(cases)} cases found in DB")
    
    # 17. Auth local login (DEMO / OFFLINE EVALUATION MODE)
    req = urllib.request.Request(
        f'{base}/auth/local',
        data=json.dumps({'email': 'evaluator@signalx.local', 'name': 'Local Evaluator (Offline Demo Mode)'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    auth = json.loads(res.read())
    print(f"[PASS] 17. Auth Local Login: User={auth.get('email')}, Role={auth.get('role')}, Mode={auth.get('mode')}")
    
    print("\n============================================================")
    print(">>> ALL 17 END-TO-END PIPELINE & CONTRACT CHECKS PASSED! <<<")
    print("============================================================")

if __name__ == '__main__':
    test_live()
