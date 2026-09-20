import sys
import os
from pathlib import Path

# Add _backend directory so app and its packages can be imported
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir / "_backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from app.main import app

handler = app
