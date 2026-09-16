import React from 'react';
import { motion } from 'framer-motion';

export default function MotionButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary', // 'primary' | 'cyan' | 'secondary' | 'glass' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  type = 'button',
  glow = false,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs font-mono',
    md: 'px-3.5 py-1.5 text-xs font-mono',
    lg: 'px-5 py-2.5 text-sm font-sans font-semibold',
  }[size] || 'px-3.5 py-1.5 text-xs font-mono';

  const variantClasses = {
    cyan: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border border-cyan-400 shadow-glow-cyan-sm hover:shadow-glow-cyan',
    primary: 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold border border-cyan-400/40 shadow-glow-cyan-sm',
    secondary: 'bg-[#0E1424] hover:bg-[#151F36] text-slate-200 border border-[#22314E] hover:border-cyan-500/50',
    glass: 'bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-md text-slate-200 border border-white/10 hover:border-cyan-400/40',
    danger: 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border border-rose-600/40 hover:border-rose-500',
  }[variant] || 'bg-cyan-500 text-slate-950';

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`inline-flex items-center justify-center gap-2 rounded-sm cursor-pointer select-none transition-colors ${sizeClasses} ${variantClasses} ${glow ? 'shadow-glow-cyan' : ''} ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
