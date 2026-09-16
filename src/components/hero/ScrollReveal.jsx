import React, { useEffect, useRef } from 'react';

/**
 * useScrollReveal — attaches IntersectionObserver to elements with
 * class "reveal-on-scroll" within the given root ref.
 */
export function useScrollReveal(rootRef) {
  useEffect(() => {
    const root = rootRef?.current ?? document;
    const targets = root.querySelectorAll('.reveal-on-scroll');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/**
 * ScrollRevealSection — wraps children with reveal-on-scroll class + delay.
 */
export function ScrollRevealSection({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const delayClass = delay ? `delay-${delay}` : '';
  return (
    <Tag className={`reveal-on-scroll ${delayClass} ${className}`}>
      {children}
    </Tag>
  );
}
