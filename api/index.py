import sys
import os
from pathlib import Path

current_dir = Path(__file__).resolve().parent
candidates = [
    current_dir.parent / "backend",
    current_dir / "backend",
    Path(os.getcwd()) / "backend",
    current_dir.parent,
    current_dir
]

for c in candidates:
    s = str(c)
    if c.is_dir() and s not in sys.path:
        sys.path.insert(0, s)

from app.main import app

__all__ = ['app']
