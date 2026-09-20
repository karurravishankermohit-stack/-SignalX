"""SignalX Interleaving / De-interleaving Engine.
Four real methods: Block, Convolutional, Diagonal, and Pseudo-Random.
"""
import numpy as np

def deinterleave_block(bits: list, M: int, N: int) -> list:
    total = M * N
    if len(bits) < total:
        bits = bits + [0] * (total - len(bits))
    matrix = np.array(bits[:total]).reshape(M, N)
    return matrix.T.flatten().tolist()

def interleave_block(bits: list, M: int, N: int) -> list:
    total = M * N
    if len(bits) < total:
        bits = bits + [0] * (total - len(bits))
    matrix = np.array(bits[:total]).reshape(M, N, order='F')
    return matrix.flatten().tolist()

def deinterleave_convolutional(bits: list, depth: int, delay: int = None) -> list:
    if delay is None:
        delay = depth
    n = len(bits)
    bufs = [[] for _ in range(depth)]
    out = []

    for i, bit in enumerate(bits):
        br = i % depth
        bufs[br].append(bit)
        d = (depth - 1 - br) * delay
        if len(bufs[br]) > d:
            out.append(bufs[br][-1 - d])
        else:
            out.append(0)

    return out[:n]

def deinterleave_diagonal(bits: list, rows: int, cols: int) -> list:
    total = rows * cols
    if len(bits) < total:
        bits = bits + [0] * (total - len(bits))
    m = np.zeros((rows, cols), dtype=int)
    idx = 0
    for d in range(rows + cols - 1):
        for r in range(min(d + 1, rows)):
            c = d - r
            if 0 <= c < cols and idx < total:
                m[r][c] = bits[idx]
                idx += 1
    return m.flatten().tolist()

def deinterleave_pseudorandom(bits: list, seed: int = 42) -> list:
    n = len(bits)
    rng = np.random.RandomState(seed)
    perm = rng.permutation(n)
    out = np.zeros(n, dtype=int)
    out[perm] = np.array(bits)
    return out.tolist()

def interleave_pseudorandom(bits: list, seed: int = 42) -> list:
    n = len(bits)
    rng = np.random.RandomState(seed)
    perm = rng.permutation(n)
    return np.array(bits)[perm].tolist()
