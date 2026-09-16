"""SignalX Frame Boundary and Sync Word Detector.
Derives candidate sync words, candidate header offsets, and candidate payload boundaries.
NEVER declares confirmed header without external protocol confirmation.
"""
import numpy as np
from collections import Counter

def detect_frame_boundaries(bits: list, sync_locations: list, pattern_len: int) -> dict:
    if len(sync_locations) < 2:
        return {
            'is_periodic': False,
            'candidates': [],
            'estimated_frame_length': None,
            'period_confidence': 0.0,
            'spacing_stats': None,
            'source': 'DSP_COMPUTED',
            'note': 'Insufficient sync pattern occurrences (<2) to deduce periodic frame boundaries.',
        }

    locs = sorted(sync_locations)
    diffs = np.diff(locs)

    # Pairwise harmonic distance analysis
    all_diffs = []
    for i in range(len(locs)):
        for j in range(i + 1, len(locs)):
            all_diffs.append(locs[j] - locs[i])

    # Find dominant fundamental period in [16..4096]
    best_T = None
    best_count = 0
    best_ratio = 0.0

    delta_counts = Counter(all_diffs)
    candidates_T = [d for d, c in delta_counts.items() if d >= 16]

    for T in candidates_T:
        rem_counts = Counter([loc % T for loc in locs])
        top_rem, count = rem_counts.most_common(1)[0]
        ratio = count / len(locs)
        # Prefer smaller fundamental period if multiples exist
        if count >= 3 and ratio >= 0.5:
            if best_T is None or (ratio > best_ratio + 0.1) or (abs(ratio - best_ratio) <= 0.1 and T < best_T and best_T % T == 0):
                best_T = T
                best_count = count
                best_ratio = ratio

    is_periodic = best_T is not None and best_ratio >= 0.5
    spacing_stats = {
        'min': int(np.min(diffs)),
        'max': int(np.max(diffs)),
        'mean': round(float(np.mean(diffs)), 2),
        'median': int(np.median(diffs)),
        'std': round(float(np.std(diffs)), 2),
    }

    candidates = []
    for loc in locs:
        # Check if peak conforms to the periodic grid
        aligned = is_periodic and (loc % best_T == locs[0] % best_T)
        candidates.append({
            'offset': int(loc),
            'type': 'CANDIDATE_SYNC',
            'periodic_grid_aligned': aligned,
            'confidence': 'HIGH' if aligned else 'LOW',
            'note': 'Correlation peak matches sync sequence.' + (' Aligned with periodic grid.' if aligned else ' Potential random bit cross-correlation.'),
        })
        if loc + pattern_len < len(bits):
            candidates.append({
                'offset': int(loc + pattern_len),
                'type': 'CANDIDATE_HEADER_OR_PAYLOAD',
                'confidence': 'VERY_LOW',
                'note': 'Offset immediately following sync pattern. Analyst confirmation required.',
            })

    return {
        'is_periodic': is_periodic,
        'estimated_frame_length': best_T if is_periodic else int(np.median(diffs)),
        'period_confidence': round(best_ratio * 100.0, 1) if is_periodic else 0.0,
        'spacing_stats': spacing_stats,
        'candidates': candidates[:30],
        'source': 'DSP_COMPUTED',
        'note': 'Correlation peaks indicate evidence of periodic framing; they do not mathematically prove fixed-length packets without higher-layer protocol decoding.',
    }

