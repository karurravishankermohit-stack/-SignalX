# SIGNALX — Automated RF Signal Intelligence & Analysis Platform

> **SIH 2026 — Problem Statement SIH26147**  
> **National Technical Research Organisation (NTRO)**  
> **Category:** Software | **Theme:** Space Technology | **Difficulty:** Hard

---

## 1. Executive Summary

**SignalX** is an end-to-end, scientifically rigorous RF signal intelligence analysis platform. Built for intelligence analysts, radar engineers, and space systems researchers, SignalX processes raw `.IQ` and `.WAV` recordings through a complete 17-stage DSP and cryptanalysis pipeline:

```
RAW IQ / WAV FILE
      ↓
FILE VALIDATION & FORMAT PARSING
      ↓
DC OFFSET REMOVAL & RMS NORMALIZATION
      ↓
SIGNAL QUALITY METRICS (SNR, Noise Floor, Dynamic Range)
      ↓
FFT & POWER SPECTRUM (-3 dB / -20 dB Bandwidths)
      ↓
STFT WATERFALL / TIME-FREQUENCY SPECTROGRAM
      ↓
SIGNAL PARAMETER EXTRACTION (Symbol Rate, Carrier Offset)
      ↓
AUTOMATIC MODULATION CLASSIFICATION (AMC)
      ↓
I/Q CONSTELLATION EXTRACTION & CLUSTERING
      ↓
DIGITAL DEMODULATION (FSK, PSK, QAM)
      ↓
AUTOMATIC INTERLEAVING IDENTIFICATION
      ↓
DE-INTERLEAVING (Block, Convolutional, Diagonal, Pseudo-Random)
      ↓
AUTOMATIC FEC IDENTIFICATION
      ↓
FORWARD ERROR CORRECTION DECODING (Viterbi, Reed-Solomon, Concatenated, LDPC)
      ↓
BITSTREAM INSPECTION & RECOVERY
      ↓
BITSTREAM CROSS-CORRELATION & PREAMBLE SEARCH
      ↓
CANDIDATE FRAME / HEADER / PAYLOAD BOUNDARY EXTRACTION
      ↓
EXPORTABLE INTELLIGENCE REPORT
```

---

## 2. Scientific Accuracy & No-Fabrication Principles

SignalX adheres strictly to non-negotiable scientific integrity rules:

1. **Zero Data Fabrication**: No measurement (SNR, bandwidth, symbol rate, modulation confidence, decoded bits, FEC syndrome, or frame offset) is ever hardcoded or mocked for real signals.
2. **Strict Provenance Labeling**: Every parameter indicates its exact source:
   - `METADATA` (e.g. sample rate from WAV headers)
   - `USER_PROVIDED` (e.g. sample rate and format specified by the analyst for raw IQ)
   - `DSP_ESTIMATED` (computed directly from signal arrays)
   - `AUTO_CLASSIFIED` (computed from statistical features, cumulants, and entropy)
   - `DEMO_DATA` (from synthetic known-answer signal generators)
   - `UNAVAILABLE` (when physical evidence is insufficient)
3. **RF Center Frequency Honesty**: Raw baseband IQ does not reveal absolute RF frequency. If metadata or user input is absent, it is marked `UNAVAILABLE`.
4. **True Ground-Truth BER**: Real unknown signals report `GROUND TRUTH UNAVAILABLE`. Only synthetic Demo signals with tracked transmitted bits calculate true BER.
5. **No Silent Fallback**: If real analysis cannot process a signal, an explicit error is returned. It never silently substitutes synthetic demo data.

---

## 3. System Architecture

SignalX is architected as a decoupled, professional workstation:

### Backend: FastAPI + NumPy/SciPy DSP Engine
- **Framework**: FastAPI (Python 3.10+) with Uvicorn
- **DSP Engine**: NumPy 1.26+, SciPy 1.17+, SoundFile 0.14+
- **FEC Engine**: NASA standard rate 1/2 Viterbi decoder, Reed-Solomon (`reedsolo`), Concatenated decoding, LDPC matrix verification
- **Persistence**: SQLite metadata database with on-disk memory-mapped `.npy` signal caches for session safety
- **Location**: `backend/`

### Frontend: React + Tailwind CSS + Plotly.js Workstation
- **Framework**: React 18, Vite 6, Tailwind CSS 3
- **Interactive Visualizers**: Plotly.js (`react-plotly.js`) for peak-preserving FFT spectra, STFT heatmaps, and I/Q constellation scatter plots
- **State Management**: Zustand global store with reactive pipeline tracking
- **File Ingestion**: Drag-and-drop ingestion with multi-parameter raw IQ configuration modal

---

## 4. Quickstart & Local Execution

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Starting the Backend
```bash
# Windows
start_backend.bat

# Or manually:
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- Backend URL: `http://localhost:8000`
- Interactive Swagger API Documentation: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/health`

### Starting the Frontend
```bash
# Windows
start_frontend.bat

# Or manually:
npm install
npm run dev
```
- Frontend Workstation: `http://localhost:3000`

---

## 5. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Backend and DSP engine availability status |
| `POST` | `/api/upload` | Upload `.wav` or raw `.iq` with optional configuration |
| `GET` | `/api/analyze/quality/{session_id}` | Computes SNR, noise floor, dynamic range, and power |
| `GET` | `/api/analyze/spectrum/{session_id}` | Returns peak-preserving FFT spectrum with -3dB/-20dB bandwidth |
| `GET` | `/api/analyze/waterfall/{session_id}` | Computes STFT 2D spectrogram heatmap |
| `GET` | `/api/analyze/parameters/{session_id}` | Extracts symbol rate, carrier offset, and physical parameters |
| `POST` | `/api/classify/modulation/{session_id}` | Automatic Modulation Classification (AMC) with evidence |
| `GET` | `/api/analyze/constellation/{session_id}` | Extracted normalized I/Q symbol constellation points |
| `POST` | `/api/demodulate` | Demodulates BPSK, QPSK, 8PSK, 2FSK, 4FSK, 16QAM, 64QAM |
| `POST` | `/api/detect/interleaving` | Identifies candidate interleaving methods and parameters |
| `POST` | `/api/deinterleave` | De-interleaves via Block, Convolutional, Diagonal, or PRN |
| `POST` | `/api/detect/fec` | Identifies candidate forward error correction schemes |
| `POST` | `/api/fec-decode` | Genuine Viterbi, Reed-Solomon, Concatenated, or LDPC decoding |
| `POST` | `/api/correlate` | Cross-correlation and candidate preamble/sync search |
| `GET` | `/api/report/{session_id}` | Full explainable intelligence report with provenance |
| `POST` | `/api/demo/load` | Synthesizes genuine QPSK, FSK, or 16-QAM signals for verification |

---

## 6. Automated Test Suite

SignalX includes an automated test suite with 29 unit and end-to-end integration tests:

```bash
cd backend
python -m pytest tests/ -v
```

### Verified Test Modules:
- `test_file_parser.py`: WAV header extraction, raw interleaved float32/int16 IQ parsing
- `test_dsp.py`: FFT peak detection, SNR estimation, DC offset removal, RMS power normalization, -3dB bandwidth, peak-preserving decimation
- `test_modulation.py`: AMC on QPSK, FSK, BPSK, 8PSK, 16QAM, short-signal handling
- `test_demod.py`: BPSK known-bits recovery, QPSK Gray slicing, 2FSK tone clustering, 16QAM demodulation
- `test_interleave.py`: Roundtrip block interleaver, convolutional delay lines, diagonal transposition, pseudo-random permutations
- `test_fec.py`: NASA rate 1/2 Viterbi decoder, Reed-Solomon error correction, bit-byte conversions, LDPC reporting
- `test_correlation.py`: Autocorrelation peaks, synchronization pattern search, periodic frame boundary deduction
- `test_end_to_end.py`: Full end-to-end pipeline run from synthetic signal generation to demodulation, interleaving, and FEC; no-fabrication verification

---

## 7. Submission Details

- **Problem Statement ID**: SIH26147
- **Organisation**: National Technical Research Organisation (NTRO)
- **Category**: Software
- **Theme**: Space Technology
- **Project**: SignalX — Automated RF Signal Intelligence & Analysis Platform
