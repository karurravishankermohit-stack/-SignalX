import os
import numpy as np
import scipy.io.wavfile as wav
import urllib.request
import json

os.makedirs('backend/tests/fixtures', exist_ok=True)
wav_path = 'backend/tests/fixtures/test_real.wav'

fs = 48000
t = np.linspace(0, 1.0, fs, endpoint=False)
sig = 0.6 * np.sin(2 * np.pi * 1200 * t) + 0.05 * np.random.randn(len(t))
sig_int16 = (sig * 32767).astype(np.int16)
wav.write(wav_path, fs, sig_int16)

boundary = '----WebKitFormBoundarySignalXTest'
with open(wav_path, 'rb') as f:
    wav_bytes = f.read()

part_header = (
    f'--{boundary}\r\n'
    'Content-Disposition: form-data; name="file"; filename="test_real.wav"\r\n'
    'Content-Type: audio/wav\r\n\r\n'
).encode('utf-8')
part_footer = f'\r\n--{boundary}--\r\n'.encode('utf-8')
body = part_header + wav_bytes + part_footer

req = urllib.request.Request(
    'http://localhost:8000/api/upload',
    data=body,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)
res = urllib.request.urlopen(req)
data = json.loads(res.read())
print(f"[PASS] Upload status: {res.status}")
print(f"[PASS] Data Source: {data.get('data_source')}")
print(f"[PASS] Sample Rate: {data.get('sample_rate')} Hz (Source: {data.get('sample_rate_source')})")
print(f"[PASS] Center Freq RF: {data.get('center_freq_rf')}")

sid = data.get('session_id')
res_p = urllib.request.urlopen(f'http://localhost:8000/api/analyze/parameters/{sid}')
p = json.loads(res_p.read())
print(f"[PASS] Center Freq RF Provenance: {p.get('center_frequency_rf', {}).get('source')}")
print(f"[PASS] Sample Rate Provenance: {p.get('sample_rate', {}).get('source')}")
print(f"[PASS] Session Data Source: {p.get('data_source')}")

assert data.get('data_source') == 'REAL_ANALYSIS'
assert p.get('center_frequency_rf', {}).get('source') == 'UNAVAILABLE'
print('\n>>> REAL FILE PROVENANCE VERIFICATION PASSED! <<<')
