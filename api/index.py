import sys
from pathlib import Path

# Add backend directory to sys.path so app and its packages can be imported
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent / 'backend'

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(current_dir.parent) not in sys.path:
    sys.path.insert(0, str(current_dir.parent))

from app.main import app

__all__ = ['app']
