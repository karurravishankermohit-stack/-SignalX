import sys
import os
from pathlib import Path

# Add _backend and api directories to sys.path
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir / "_backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

try:
    from app.main import app
except ImportError:
    from _backend.app.main import app

handler = app
app = app
