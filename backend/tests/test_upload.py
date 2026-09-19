import sys
from pathlib import Path
import io
import numpy as np
import scipy.io.wavfile as wav

sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_real_wav_upload_and_provenance():
    # 1. Generate real audio wav bytes
    fs = 48000
    t = np.linspace(0, 1.0, fs, endpoint=False)
    sig = 0.6 * np.sin(2 * np.pi * 1200 * t) + 0.05 * np.random.randn(len(t))
    sig_int16 = (sig * 32767).astype(np.int16)
    
    buffer = io.BytesIO()
    wav.write(buffer, fs, sig_int16)
    buffer.seek(0)

    # 2. Upload to FastAPI endpoint via TestClient
    response = client.post(
        "/api/upload",
        files={"file": ("test_real.wav", buffer, "audio/wav")}
    )
    assert response.status_code == 200, f"Upload failed: {response.text}"
    data = response.json()

    assert data.get("data_source") == "REAL_ANALYSIS"
    assert data.get("sample_rate") == 48000
    assert data.get("sample_rate_source") == "METADATA"

    sid = data.get("session_id")
    assert sid is not None

    # 3. Query parameters and verify strict provenance honesty
    param_res = client.get(f"/api/analyze/parameters/{sid}")
    assert param_res.status_code == 200
    p = param_res.json()

    assert p.get("data_source") == "REAL_ANALYSIS"
    assert p.get("center_frequency_rf", {}).get("source") == "UNAVAILABLE"
    assert p.get("sample_rate", {}).get("source") == "METADATA"
