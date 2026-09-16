import sys
from pathlib import Path
import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.interleave import (
    deinterleave_block, interleave_block,
    deinterleave_convolutional, deinterleave_diagonal,
    deinterleave_pseudorandom, interleave_pseudorandom
)

def test_block_roundtrip():
    bits = [i % 2 for i in range(64)]
    il = interleave_block(bits, 8, 8)
    di = deinterleave_block(il, 8, 8)
    assert len(di) == 64

def test_pseudorandom_roundtrip():
    bits = [i % 2 for i in range(120)]
    il = interleave_pseudorandom(bits, seed=42)
    di = deinterleave_pseudorandom(il, seed=42)
    assert di == bits

def test_diagonal_interleaver():
    bits = [i % 2 for i in range(64)]
    di = deinterleave_diagonal(bits, 8, 8)
    assert len(di) == 64

def test_convolutional_interleaver():
    bits = [i % 2 for i in range(100)]
    di = deinterleave_convolutional(bits, depth=5)
    assert len(di) == 100
