import React, { useEffect, useState, useRef } from 'react';

/**
 * Animated number ticker that counts up from 0 (or previous value) to the target value.
 */
export default function NumberTicker({
  value,
  duration = 1200, // ms
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  placeholder = '--'
}) {
  const numValue = typeof value === 'number' ? value : parseFloat(value);
  const isInvalid = isNaN(numValue) || value === null || value === undefined;

  const [displayValue, setDisplayValue] = useState(isInvalid ? 0 : 0);
  const startValRef = useRef(0);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (isInvalid) return;

    const startVal = startValRef.current;
    const targetVal = numValue;
    startTimeRef.current = null;

    // Quartic ease out curve for smooth aerospace instrument deceleration
    const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

    const step = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      const current = startVal + (targetVal - startVal) * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetVal);
        startValRef.current = targetVal;
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [numValue, duration, isInvalid]);

  if (isInvalid) {
    return <span className={className}>{placeholder}</span>;
  }

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`inline-block tabular-nums font-mono ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
