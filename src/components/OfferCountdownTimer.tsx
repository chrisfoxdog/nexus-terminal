import React, { useState, useEffect } from 'react';
import { Timer, Zap, Flame } from 'lucide-react';

interface OfferCountdownTimerProps {
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
  title?: string;
  subtitle?: string;
  variant?: 'banner' | 'card' | 'compact' | 'badge';
  darkMode?: boolean;
  onExpire?: () => void;
}

export const OfferCountdownTimer: React.FC<OfferCountdownTimerProps> = ({
  initialHours = 14,
  initialMinutes = 32,
  initialSeconds = 45,
  title = 'LIMITED TIME PROMO',
  subtitle = '7-Day Free Trial + Lifetime Review Upgrade Promo ends in:',
  variant = 'banner',
  darkMode = true,
  onExpire,
}) => {
  // Store target end timestamp in localStorage so timer doesn't reset on refresh
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds,
  });

  useEffect(() => {
    const STORAGE_KEY = 'whop_promo_countdown_target';
    let targetTime = localStorage.getItem(STORAGE_KEY);

    if (!targetTime) {
      const now = new Date().getTime();
      // default 14h 32m 45s from now
      const durationMs = (initialHours * 3600 + initialMinutes * 60 + initialSeconds) * 1000;
      targetTime = (now + durationMs).toString();
      localStorage.setItem(STORAGE_KEY, targetTime);
    }

    const calculateRemaining = () => {
      const now = new Date().getTime();
      const diff = parseInt(targetTime!, 10) - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [initialHours, initialMinutes, initialSeconds, onExpire]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (variant === 'badge') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-[11px]">
        <Timer className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
        <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
        <span>Offer ends in:</span>
        <div className="flex items-center gap-1 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 text-amber-300">
          <span>{pad(timeLeft.hours)}h</span>
          <span>:</span>
          <span>{pad(timeLeft.minutes)}m</span>
          <span>:</span>
          <span>{pad(timeLeft.seconds)}s</span>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-2xl border ${
        darkMode ? 'bg-slate-900/90 border-amber-500/30' : 'bg-amber-50/80 border-amber-200'
      } flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-1">
              <span>{title}</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <div className="flex flex-col items-center">
            <span className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 font-black text-base flex items-center justify-center border border-amber-500/30 shadow-inner">
              {pad(timeLeft.hours)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 uppercase">Hrs</span>
          </div>
          <span className="text-amber-500 font-bold text-lg mb-3">:</span>
          <div className="flex flex-col items-center">
            <span className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 font-black text-base flex items-center justify-center border border-amber-500/30 shadow-inner">
              {pad(timeLeft.minutes)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 uppercase">Mins</span>
          </div>
          <span className="text-amber-500 font-bold text-lg mb-3">:</span>
          <div className="flex flex-col items-center">
            <span className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 font-black text-base flex items-center justify-center border border-amber-500/30 shadow-inner">
              {pad(timeLeft.seconds)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 uppercase">Secs</span>
          </div>
        </div>
      </div>
    );
  }

  // Banner variant (Full width promo strip)
  return (
    <div className="bg-gradient-to-r from-slate-950 via-amber-950/60 to-slate-950 border-y border-amber-500/30 px-4 py-2.5 text-white flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
      <div className="flex items-center gap-2.5">
        <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black uppercase text-[10px] tracking-wider animate-pulse">
          FLASH PROMO
        </span>
        <span className="font-semibold text-slate-200">
          7-Day Free Trial + Review for FREE Lifetime Access
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-slate-400 font-medium hidden sm:inline">Offer ends in:</span>
        <div className="flex items-center gap-1.5 font-mono font-bold text-amber-400 bg-slate-900/90 px-3 py-1 rounded-xl border border-amber-500/40">
          <Timer className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span>{pad(timeLeft.hours)}</span>
          <span className="text-amber-500/60">:</span>
          <span>{pad(timeLeft.minutes)}</span>
          <span className="text-amber-500/60">:</span>
          <span className="text-amber-300">{pad(timeLeft.seconds)}</span>
        </div>
      </div>
    </div>
  );
};
