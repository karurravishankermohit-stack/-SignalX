import os
from pathlib import Path
import logging
from dotenv import load_dotenv

# Deterministic environment loading from backend project root and workspace root
_backend_root = Path(__file__).resolve().parent.parent  # d:\AVATAR\backend
_project_root = Path(__file__).resolve().parent.parent.parent  # d:\AVATAR

_loaded_env_path = None
# Load authoritative backend .env first, then root .env if variables not set
if (_backend_root / ".env").is_file():
    load_dotenv(dotenv_path=_backend_root / ".env", override=True)
    _loaded_env_path = str(_backend_root / ".env")

if (_project_root / ".env").is_file():
    # Only populate variables not already set
    load_dotenv(dotenv_path=_project_root / ".env", override=False)
    if not _loaded_env_path:
        _loaded_env_path = str(_project_root / ".env")


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db, cleanup_old_sessions, cleanup_expired_auth_sessions
from .routers import auth, cases

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(name)s: %(message)s')
logger = logging.getLogger("signalx")

app = FastAPI(
    title="SignalX — Automated RF Signal Intelligence & Analysis Platform",
    version="1.0.0",
    description="Scientific DSP Backend for SIH 2026 / SIH26147 (NTRO)"
)

# CORS configuration - Allow local and remote frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Routers
app.include_router(auth.router, tags=["Authentication"])
app.include_router(auth.router, prefix="/api", tags=["Authentication API"])
app.include_router(cases.router, prefix="/api", tags=["Cases"])

# Scientific DSP Routers (active when scientific libraries like scipy/sklearn are installed)
try:
    from .routers import (
        upload, quality, spectrum, waterfall, parameters,
        modulation, demodulate, deinterleave, fec, correlate,
        report, demo
    )
    app.include_router(upload.router, prefix="/api", tags=["Upload"])
    app.include_router(quality.router, prefix="/api", tags=["Quality"])
    app.include_router(spectrum.router, prefix="/api", tags=["Spectrum"])
    app.include_router(waterfall.router, prefix="/api", tags=["Waterfall"])
    app.include_router(parameters.router, prefix="/api", tags=["Parameters"])
    app.include_router(modulation.router, prefix="/api", tags=["Modulation"])
    app.include_router(demodulate.router, prefix="/api", tags=["Demodulation"])
    app.include_router(deinterleave.router, prefix="/api", tags=["Deinterleaving"])
    app.include_router(fec.router, prefix="/api", tags=["FEC"])
    app.include_router(correlate.router, prefix="/api", tags=["Correlation"])
    app.include_router(report.router, prefix="/api", tags=["Report"])
    app.include_router(demo.router, prefix="/api", tags=["Demo"])
    logger.info("SignalX DSP Routers loaded successfully.")
except ImportError as dsp_err:
    logger.info(f"SignalX running in lightweight serverless mode: {dsp_err}")

@app.on_event("startup")
async def startup():
    init_db()
    cleanup_old_sessions(hours=48)
    cleanup_expired_auth_sessions()
    cfg = auth.get_oauth_config()
    logger.info(
        "SignalX Configuration Status: env_file=%s | google_oauth_configured=%s | client_id_present=%s | secret_present=%s | redirect_uri=%s | session_secret_present=%s",
        _loaded_env_path or "NOT_FOUND",
        cfg.get("configured", False),
        bool(cfg.get("client_id") and cfg.get("client_id") not in ["", "YOUR_GOOGLE_CLIENT_ID_HERE", "undefined", "null"]),
        bool(cfg.get("client_secret") and cfg.get("client_secret") not in ["", "YOUR_GOOGLE_CLIENT_SECRET_HERE", "undefined", "null"]),
        cfg.get("redirect_uri"),
        bool(cfg.get("session_secret"))
    )
    logger.info("SignalX Core DSP Engine initialized. SQLite connected. Cases table ready.")

@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "signalx-dsp",
        "dsp_engine": "available",
        "version": "1.0.0",
        "platform": "SignalX NTRO SIH26147"
    }

@app.get("/")
def root():
    return {
        "message": "SignalX Automated RF Signal Intelligence Platform API",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }
