import React, { useState } from 'react';
import { X, ArrowLeft, ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';
import { NavMode } from './HeaderNav';
import { WALKTHROUGH_STEPS } from './walkthroughContent';

interface WalkthroughModalProps {
  isOpen: boolean;
  // Called for every way out of the walkthrough (close, skip, finish).
  // App marks the walkthrough as seen there, so it only auto-opens once;
  // it stays re-openable from the Dashboard and the Help section.
  onClose: () => void;
  darkMode: boolean;
  onSelectMode: (mode: NavMode) => void;
}

// First-run guided walkthrough: one step at a time through how Nexus
// works — what it is, buy on Whop → open Nexus → pass syncs, the key
// claim backup, the sample-template catalog, and where perks live.
export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onSelectMode,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  if (!isOpen) return null;

  const step = WALKTHROUGH_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === WALKTHROUGH_STEPS.length - 1;
  const Icon = step.icon;

  const goToStep = (index: number) => {
    setStepIndex(Math.max(0, Math.min(WALKTHROUGH_STEPS.length - 1, index)));
  };

  const handleClose = () => {
    setStepIndex(0);
    onClose();
  };

  const navigate = (mode: NavMode) => {
    onSelectMode(mode);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-xl flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
          darkMode
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Getting started with Nexus Terminal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <BookOpen className="w-3.5 h-3.5 text-[#35A7FF]" />
            <span>Getting started with Nexus</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Close walkthrough"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Step content */}
        <div className="px-6 sm:px-8 py-6 space-y-4 min-h-[300px]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#35A7FF]/15 border border-[#35A7FF]/30 flex items-center justify-center shrink-0">
              <Icon className="w-5.5 h-5.5 text-[#35A7FF]" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#35A7FF]">
                {step.eyebrow}
              </div>
              <h2 className="text-xl font-black tracking-tight leading-tight">
                {step.title}
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {step.body}
          </div>

          {step.actionLabel && step.actionMode && (
            <button
              onClick={() => navigate(step.actionMode!)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#35A7FF]/10 hover:bg-[#35A7FF]/20 border border-[#35A7FF]/30 text-[#35A7FF] text-xs font-bold transition-colors"
            >
              <span>{step.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Footer: progress + navigation */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {WALKTHROUGH_STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goToStep(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex
                    ? 'w-6 bg-[#35A7FF]'
                    : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] text-slate-400 mr-1">
              Step {stepIndex + 1} of {WALKTHROUGH_STEPS.length}
            </span>
            {!isFirst && (
              <button
                onClick={() => goToStep(stepIndex - 1)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            {isFirst && (
              <button
                onClick={handleClose}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Skip tour
              </button>
            )}
            {isLast ? (
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Done
              </button>
            ) : (
              <button
                onClick={() => goToStep(stepIndex + 1)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
