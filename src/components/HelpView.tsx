import React from 'react';
import {
  HelpCircle,
  PlayCircle,
  BookOpen,
  ArrowRight,
  Key,
  RefreshCw,
} from 'lucide-react';
import { NavMode } from './HeaderNav';
import { WALKTHROUGH_STEPS } from './walkthroughContent';

interface HelpViewProps {
  darkMode: boolean;
  onSelectMode: (mode: NavMode) => void;
  onOpenWalkthrough: () => void;
  onOpenFeatureGuide: () => void;
}

// Permanent "How to Use" section, reachable from the top navigation.
// Renders the same steps as the first-run walkthrough (shared content in
// walkthroughContent.tsx) as a reference page, plus entry points to the
// guided tour and the full feature guide.
export const HelpView: React.FC<HelpViewProps> = ({
  darkMode,
  onSelectMode,
  onOpenWalkthrough,
  onOpenFeatureGuide,
}) => {
  const cardClass = `p-5 rounded-2xl border ${
    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
  }`;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1
          className={`text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}
        >
          <HelpCircle className="w-7 h-7 text-[#35A7FF]" />
          How to Use Nexus Terminal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl">
          How passes activate, the backup key claim, what the catalog
          templates are, and where every section lives. The same steps as
          the guided walkthrough — kept here as a permanent reference.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onOpenWalkthrough}
          className={`text-left ${cardClass} hover:border-[#35A7FF]/50 transition-colors group`}
        >
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mb-1">
            <PlayCircle className="w-4 h-4 text-[#35A7FF]" />
            Replay the guided walkthrough
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The step-by-step first-run tour: buy on Whop, sync your pass,
            claim a key, and find your perks.
          </p>
          <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-[#35A7FF]">
            Start the tour
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>

        <button
          onClick={onOpenFeatureGuide}
          className={`text-left ${cardClass} hover:border-[#35A7FF]/50 transition-colors group`}
        >
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mb-1">
            <BookOpen className="w-4 h-4 text-[#35A7FF]" />
            Open the full feature guide
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            A deeper tour of every feature area — marketplace, reviews,
            checkout, the pass vault, Creator Studio, and the API validator.
          </p>
          <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-[#35A7FF]">
            Open the guide
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>
      </div>

      {/* The steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WALKTHROUGH_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className={cardClass}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#35A7FF]/15 border border-[#35A7FF]/30 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#35A7FF]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#35A7FF]">
                    {step.eyebrow}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {step.title}
                  </h3>
                </div>
              </div>
              <div className="space-y-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {step.body}
              </div>
              {step.actionLabel && step.actionMode && (
                <button
                  onClick={() => onSelectMode(step.actionMode!)}
                  className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                >
                  <span>{step.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Troubleshooting */}
      <div
        className={`p-5 rounded-2xl border ${
          darkMode
            ? 'bg-slate-900/80 border-indigo-500/30'
            : 'bg-indigo-50/60 border-indigo-200'
        }`}
      >
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-indigo-500" />
          Bought on Whop but no pass here yet?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            <strong className="text-slate-900 dark:text-white block mb-0.5">
              1. Same account?
            </strong>
            Passes sync to the Whop account you bought with. Open Nexus from
            inside Whop signed in as that buyer — opening it signed out or as
            a different account syncs nothing.
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white block mb-0.5">
              2. Reopen My Passes
            </strong>
            Sync runs whenever you open <strong>My Passes</strong>. If a
            purchase just completed, give Whop a moment and open the page
            again.
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white block mb-0.5">
              3. Got a key instead?
            </strong>
            <Key className="w-3 h-3 inline -mt-0.5 mr-1 text-amber-500" />
            Some products issue a license key. Claim it from My Passes via
            "Have a license key instead?" — it is verified with Whop before
            anything activates.
          </p>
        </div>
        <button
          onClick={() => onSelectMode('passes')}
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
        >
          Go to My Passes
        </button>
      </div>
    </div>
  );
};
