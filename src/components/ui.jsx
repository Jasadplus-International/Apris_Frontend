import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/* ---------- Animated count-up ---------- */
export function CountUp({ value, decimals = 0, duration = 1.1 }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) { setDisplay(value); return; }
    let raf; const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduce]);
  return <>{display.toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}</>;
}

/* ---------- Page header ---------- */
export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <div className="flex items-center gap-2 mb-2">
            <span className="h-px w-6 bg-seal inline-block" aria-hidden="true" />
            <span className="font-mono text-[11.5px] text-mute">{eyebrow}</span>
          </div>
        )}
        <h1 className="font-display text-3xl font-semibold text-ink leading-tight">{title}</h1>
        {subtitle && <p className="text-mute mt-1.5 max-w-prose">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}

/* ---------- Stat card ---------- */
export function StatCard({ icon: Icon, label, value, note, accent = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white border border-line rounded-xl p-5 flex gap-4 items-start hover:border-[#c8d0dd] hover:shadow-[0_10px_28px_-14px_rgba(16,30,56,0.18)] transition-shadow"
    >
      {Icon && (
        <div className={`mt-0.5 grid place-items-center w-10 h-10 rounded-lg ${accent ? 'bg-seal/10 text-seal' : 'bg-ink/5 text-ink'}`}>
          <Icon size={19} strokeWidth={2} />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[12.5px] font-medium text-mute">{label}</div>
        <div className="font-display text-[30px] leading-tight font-semibold text-ink tabular-nums">
          <CountUp value={value} />
        </div>
        {note && <div className="text-[11.5px] text-mute mt-0.5 truncate">{note}</div>}
      </div>
    </motion.div>
  );
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, wide = false }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink/45 backdrop-blur-[3px]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 26, scale: 0.965 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: 'spring', bounce: 0.28, duration: 0.5 }}
            className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[88vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-line sticky top-0 bg-white z-10">
              <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg text-mute hover:text-ink hover:bg-paper transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-7">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Buttons ---------- */
export function Button({ children, variant = 'primary', icon: Icon, className = '', ...props }) {
  const styles = {
    primary: 'bg-seal text-white hover:bg-seal-2 shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_6px_14px_-6px_rgba(138,40,55,0.45)]',
    ghost: 'bg-white text-ink border border-line hover:border-ink/25 hover:bg-paper',
    subtle: 'text-mute hover:text-ink hover:bg-paper',
    danger: 'bg-fail text-white hover:brightness-110',
  }[variant];
  return (
    <motion.button
      whileTap={{ scale: 0.975 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-55 disabled:pointer-events-none ${styles} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={2.2} />}
      {children}
    </motion.button>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="text-center py-16 select-none">
      {Icon && (
        <div className="mx-auto w-12 h-12 grid place-items-center rounded-full bg-ink/5 text-mute mb-4">
          <Icon size={22} strokeWidth={1.8} />
        </div>
      )}
      <p className="font-display text-lg text-ink font-medium">{title}</p>
      {hint && <p className="text-sm text-mute mt-1">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- Spinner ---------- */
export function Spinner({ label = 'Working…' }) {
  return (
    <div className="flex items-center justify-center py-20 text-mute">
      <div className="text-center">
        <div className="animate-spin rounded-full h-9 w-9 border-[2.5px] border-line border-t-seal mx-auto mb-3" />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}

/* ---------- Table row reveal wrapper ---------- */
export function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}