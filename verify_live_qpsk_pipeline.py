import json
import urllib.request
import urllib.error
import sys

BASE_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:3000"

def request_json(url, method="GET", data=None):
    headers = {"Content-Type": "application/json"} if data else {}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {"error": err_body}
    except Exception as e:
        return 500, {"error": str(e)}

def run_audit():
    print("=" * 75)
    print("SIGNALX LIVE RUNTIME AUDIT & END-TO-END PIPELINE VALIDATION")
    print("=" * 75)

    # 1. Health check via backend
    status, health_be = request_json(f"{BASE_URL}/health")
    print(f"\n[1] Backend /health: HTTP {status}")
    print(f"    Payload: {health_be}")
    assert status == 200 and health_be.get("status") == "ok", "Backend health failed"

    # 2. Health check via Vite Proxy (frontend -> backend)
    status, health_fe = request_json(f"{FRONTEND_URL}/health")
    print(f"\n[2] Frontend Proxy /health: HTTP {status}")
    print(f"    Payload: {health_fe}")
    assert status == 200 and health_fe.get("status") == "ok", "Frontend proxy health failed"

    # 3. Stage 1 & 2: QPSK Demo -> Create Session & Generate Actual Synthetic IQ
    print("\n[3] Stage: QPSK Demo Session Creation & Synthetic IQ Generation")
    status, demo_res = request_json(f"{BASE_URL}/api/demo/load", method="POST", data={"signal_type": "qpsk"})
    print(f"    HTTP {status}")
    assert status == 200, f"Demo creation failed: {demo_res}"
    session_id = demo_res["session_id"]
    case_id = demo_res["case_id"]
    print(f"    Session ID : {session_id}")
    print(f"    Case ID    : {case_id}")
    print(f"    Modulation : {demo_res.get('modulation')}")
    print(f"    Sample Rate: {demo_res.get('sample_rate')} Hz")
    print(f"    Samples    : {demo_res.get('n_samples')}")
    print(f"    Data Source: {demo_res.get('data_source')}")

    # 4. Stage: Preprocessing
    print(f"\n[4] Stage: Preprocessing (Session: {session_id})")
    status, prep_res = request_json(f"{BASE_URL}/api/preprocess/{session_id}", method="POST")
    print(f"    HTTP {status}")
    print(f"    Steps: {prep_res.get('steps')}")
    print(f"    Effective Sample Rate: {prep_res.get('effective_sample_rate')} Hz")
    print(f"    Processed Samples: {prep_res.get('n_samples')}")
    assert status == 200, "Preprocessing failed"

    # 5. Stage: Quality
    print(f"\n[5] Stage: Signal Quality Assessment (Session: {session_id})")
    status, qual_res = request_json(f"{BASE_URL}/api/analyze/quality/{session_id}")
    print(f"    HTTP {status}")
    print(f"    SNR: {qual_res.get('snr_db')} dB (Source: {qual_res.get('snr_source')})")
    print(f"    Noise Floor: {qual_res.get('noise_floor_db')} dBFS (Source: {qual_res.get('noise_floor_source')})")
    print(f"    Peak Power: {qual_res.get('peak_power_db')} dBFS")
    print(f"    Dynamic Range: {qual_res.get('dynamic_range_db')} dB")
    print(f"    Bandwidth (-3dB): {qual_res.get('bandwidth_3db')} Hz")
    assert status == 200, "Quality analysis failed"
    assert qual_res.get('noise_floor_db') is not None, "Noise floor not computed"

    # 6. Stage: FFT / Spectrum
    print(f"\n[6] Stage: FFT / Spectrum Analysis (Session: {session_id})")
    status, spec_res = request_json(f"{BASE_URL}/api/analyze/spectrum/{session_id}")
    print(f"    HTTP {status}")
    print(f"    Peak Frequency: {spec_res.get('peak_freq_hz')} Hz")
    print(f"    SNR: {spec_res.get('snr_db')} dB")
    print(f"    Spectrum Points: {len(spec_res.get('freqs', []))} freqs, {len(spec_res.get('power_db', []))} dB values")
    assert status == 200 and len(spec_res.get('freqs', [])) > 0, "Spectrum failed"

    # 7. Stage: Waterfall
    print(f"\n[7] Stage: Spectrogram / Waterfall (Session: {session_id})")
    status, wfall_res = request_json(f"{BASE_URL}/api/analyze/waterfall/{session_id}")
    print(f"    HTTP {status}")
    print(f"    Time Bins: {wfall_res.get('n_time_bins')}, Freq Bins: {wfall_res.get('n_freq_bins')}")
    assert status == 200 and wfall_res.get('n_time_bins', 0) > 0, "Waterfall failed"

    # 8. Stage: Parameters
    print(f"\n[8] Stage: Parameter Estimation (Session: {session_id})")
    status, param_res = request_json(f"{BASE_URL}/api/analyze/parameters/{session_id}")
    print(f"    HTTP {status}")
    sym_rate = param_res.get('estimated_symbol_rate', {}).get('symbol_rate_hz')
    sym_conf = param_res.get('estimated_symbol_rate', {}).get('confidence')
    print(f"    DSP-Estimated Symbol Rate: {sym_rate} Hz (Confidence: {sym_conf})")
    print(f"    Bandwidth (-3dB): {param_res.get('bandwidth_3db_hz')} Hz")
    print(f"    Center Freq Source: {param_res.get('center_frequency', {}).get('source')}")
    assert status == 200, "Parameters estimation failed"

    # 9. Stage: Modulation Classification
    print(f"\n[9] Stage: Modulation Classification (Session: {session_id})")
    status, mod_res = request_json(f"{BASE_URL}/api/classify/modulation/{session_id}", method="POST")
    print(f"    HTTP {status}")
    print(f"    Classified Best: {mod_res.get('best')} ({mod_res.get('best_family')})")
    print(f"    Confidence: {mod_res.get('confidence')}%")
    print(f"    Top Candidates: {[(c.get('modulation'), c.get('confidence')) for c in mod_res.get('candidates', [])[:3]]}")
    assert status == 200, "Modulation classification failed"
    assert mod_res.get('best') is not None, "Modulation classification returned null"
    assert mod_res.get('confidence', 0) > 0, "Confidence is zero"

    # 10. Stage: Constellation
    print(f"\n[10] Stage: Constellation (Session: {session_id})")
    status, const_res = request_json(f"{BASE_URL}/api/analyze/constellation/{session_id}")
    print(f"    HTTP {status}")
    print(f"    Constellation Points: {const_res.get('n_points')} (I-range: [{min(const_res.get('i', [0])):.2f}, {max(const_res.get('i', [0])):.2f}])")
    assert status == 200 and const_res.get('n_points', 0) > 0, "Constellation failed"

    # 11. Stage: Demodulation
    print(f"\n[11] Stage: Demodulation (Session: {session_id})")
    demod_payload = {
        "session_id": session_id,
        "modulation": "QPSK",
        "symbol_rate": sym_rate or 4800.0,
        "freq_offset": 0.0,
        "phase_offset": 0.0
    }
    status, demod_res = request_json(f"{BASE_URL}/api/demodulate", method="POST", data=demod_payload)
    print(f"    HTTP {status}")
    bits = demod_res.get('bits', [])
    bit_count = demod_res.get('total_bits') or demod_res.get('bit_count') or len(bits)
    print(f"    Recovered Bits: {bit_count} bits")
    print(f"    Bits Preview (first 32): {''.join(str(b) for b in bits[:32])}")
    print(f"    BER: {demod_res.get('ber')}")
    assert status == 200, "Demodulation failed"
    assert bit_count > 0, "Demodulation produced 0 bits"

    # 12. Stage: Bitstream Retrieval
    print(f"\n[12] Stage: Bitstream Retrieval (Session: {session_id})")
    status, bit_res = request_json(f"{BASE_URL}/api/bitstream/{session_id}")
    print(f"    HTTP {status}")
    recovered_bits = bit_res.get('bits', [])
    print(f"    Total Bits from DB: {bit_res.get('total_bits', len(recovered_bits))}")
    print(f"    BER Information   : {bit_res.get('ber')}")
    assert status == 200, "Bitstream retrieval failed"
    assert len(recovered_bits) > 0, "Bitstream retrieval returned 0 bits"

    # 13. Stage: Interleaving Detection
    print(f"\n[13] Stage: Interleaving Detection (Session: {session_id})")
    status, il_res = request_json(f"{BASE_URL}/api/detect/interleaving", method="POST", data={"session_id": session_id})
    print(f"    HTTP {status}")
    print(f"    Status: {il_res.get('status', 'OK')}")
    print(f"    Best Candidate: {il_res.get('best')}")
    print(f"    Confidence: {il_res.get('confidence')}")
    print(f"    Evidence: {il_res.get('evidence')}")
    assert status == 200, "Interleaving detection returned error status"

    # 14. Stage: FEC Detection
    print(f"\n[14] Stage: FEC Detection (Session: {session_id})")
    status, fec_res = request_json(f"{BASE_URL}/api/detect/fec", method="POST", data={"session_id": session_id})
    print(f"    HTTP {status}")
    print(f"    Status: {fec_res.get('status', 'OK')}")
    print(f"    Best Candidate: {fec_res.get('best')}")
    print(f"    Confidence: {fec_res.get('confidence')}")
    print(f"    Evidence: {fec_res.get('evidence')}")
    assert status == 200, "FEC detection returned error status"

    # 15. Stage: Correlation & Framing
    print(f"\n[15] Stage: Correlation & Framing (Session: {session_id})")
    correlate_payload = {
        "session_id": session_id,
        "sync_pattern": [1, 1, 0, 1, 0, 0, 1, 0]
    }
    status, corr_res = request_json(f"{BASE_URL}/api/correlate", method="POST", data=correlate_payload)
    print(f"    HTTP {status}")
    print(f"    Sync Detected: {corr_res.get('detected')}")
    print(f"    Sync Count: {corr_res.get('count')}")
    print(f"    Locations: {corr_res.get('locations')[:5]}")
    frame_analysis = corr_res.get('frame_analysis', {})
    print(f"    Frame Periodic: {frame_analysis.get('is_periodic')}")
    print(f"    Estimated Frame Length: {frame_analysis.get('estimated_frame_length_bits')} bits")
    print(f"    Framing Evidence Note: Correlation peaks indicate evidence of periodic framing; they do not mathematically prove fixed-length packets.")
    assert status == 200, "Correlation failed"

    # 16. Stage: Intelligence Dossier / Report
    print(f"\n[16] Stage: Intelligence Dossier / Report (Session: {session_id})")
    status, rep_res = request_json(f"{BASE_URL}/api/report/{session_id}")
    print(f"    HTTP {status}")
    print(f"    Report Version: {rep_res.get('report_version')}")
    print(f"    Case ID: {rep_res.get('case_id')}")
    print(f"    Data Source: {rep_res.get('data_source_label')}")
    print(f"    Scientific Limitations Listed: {len(rep_res.get('limitations', []))}")
    assert status == 200, "Report generation failed"

    print("\n" + "=" * 75)
    print("ALL 16 PIPELINE STAGES PASSED WITH THE SAME SESSION ID!")
    print(f"SESSION ID: {session_id}")
    print("=" * 75)

if __name__ == "__main__":
    try:
        run_audit()
    except AssertionError as e:
        print(f"\n[FAILED]: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"\n[EXCEPTION]: {e}", file=sys.stderr)
        sys.exit(1)
