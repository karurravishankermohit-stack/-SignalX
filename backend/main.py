"""
SignalX FastAPI Backend Entrypoint
Allows importing `app` via both `backend.main` and `app.main`.
"""
import sys
from pathlib import Path

# Ensure backend root is in sys.path
_backend_dir = Path(__file__).resolve().parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from app.main import app

__all__ = ["app"]
