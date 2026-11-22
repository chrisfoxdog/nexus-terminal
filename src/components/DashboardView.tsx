import React from 'react';
import {
  Key,
  ShoppingBag,
  Zap,
  Code,
  HelpCircle,
  PlayCircle,
  RefreshCw,
  CheckCircle2,
  Circle,
  ArrowRight,
  ShieldCheck,
  Layers,
  LayoutDashboard,
} from 'lucide-react';
import { AccessPass, WhopProduct } from '../types';
import { NavMode } from './HeaderNav';

interface DashboardViewProps {
  userPasses: AccessPass[];
  products: WhopProduct[];
  darkMode: boolean;
  onSelectMode: (mode: NavMode) => void;
  onOpenWalkthrough: () => void;
}

// Same renewal-label rules as the pass cards in My Passes: a 2099 date
// means lifetime, an unparseable date shows a dash rather than a guess.
function renewalLabel(pass: AccessPass): string {
  if (pass.expiresAt && pass.expiresAt.startsWith('2099')) {
    return 'Lifetime Pass';
  }
  if (!pass.expiresAt || Number.isNaN(Date.parse(pass.expiresAt))) {
    return '—';
  }
  return new Date(pass.expiresAt).toLocaleDateString();
}

// The signed-in home. Everything shown here is derived from the member's
// real pass data (the same state My Passes renders, fed by /api/v1/passes
// and the membership sync) and from the local catalog — no sales figures,
// no activity feeds, no invented metrics.
export const DashboardView: React.FC<DashboardViewProps> = ({
  userPasses,
  products,
  darkMode,
  onSelectMode,
  onOpenWalkthrough,
}) => {
  const activePasses = userPasses.filter((p) => p.status === 'active');
  const primaryPass = activePasses[0] ?? userPasses[0] ?? null;
  const hasActivePass = activePasses.length > 0;

  const cardClass = `rounded-2xl border ${
    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
  }`;

  const quickLinks: {
    mode: NavMode;
    icon: typeof ShoppingBag;
    title: string;
    description: string;
  }[] = [
    {
      mode: 'passes',
      icon: Key,
      title: 'My Passes',
      description:
        'Your synced passes, license key claim, and the launch buttons for embedded member apps.',
    },
    {
      mode: 'marketplace',
      icon: ShoppingBag,
      title: 'Marketplace',
      description:
        'Browse the catalog — shipped as labeled sample templates a creator customizes with their own products.',
    },
    {
      mode: 'creator',
      icon: Zap,
      title: 'Creator Studio',
      description:
        'Where creators arrange their own catalog content and listing material.',
    },
    {
      mode: 'developer',
      icon: Code,
      title: 'API Validator',
      description:
        'Developer tools for testing webhook events and API wiring.',
    },
    {
      mode: 'help',
      icon: HelpCircle,
      title: 'How to Use',
      description:
        'The step-by-step guide: pass sync, key claim, catalog templates, and where perks live.',
    },
  ];

  const gettingStarted: { label: string; done: boolean; hint: string }[] = [
    {
      label: 'Buy on Whop',
      done: userPasses.length > 0,
      hint: 'Checkout happens on Whop — Nexus never takes card details.',
    },
    {
      label: 'Sync your pass',
      done: hasActivePass,
      hint: 'Open My Passes signed in as the buyer; your membership activates the pass automatically.',
    },
    {
      label: 'Launch your member app',
      done: false,
      hint: 'From the pass card in My Passes, choose "Launch Embedded Whop App".',
    },
    {
      label: 'Explore the sample catalog',
      done: false,
      hint: 'Marketplace items are labeled SAMPLE templates — examples, not live offers.',
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Hero */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 ${
          darkMode
            ? 'bg-gradient-to-br from-[#081426] via-slate-900 to-slate-950 border-[#35A7FF]/25'
            : 'bg-gradient-to-br from-sky-50 via-white to-white border-sky-200'
        }`}
      >
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#35A7FF]/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#35A7FF]">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Member Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 text-slate-900 dark:text-white">
              Your Whop access, in one place.
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Nexus Terminal tracks the passes from your real Whop
              memberships — what is active, when it renews, and where to
              launch each member app. No key needed for most products: buy
              on Whop, open Nexus, and your pass syncs.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <button
                onClick={() => onSelectMode('passes')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
              >
                {hasActivePass ? (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Open My Passes</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Sync my pass</span>
                  </>
                )}
              </button>
              <button
                onClick={onOpenWalkthrough}
                className={`px-5 py-2.5 rounded-xl border font-bold text-xs transition-colors flex items-center gap-2 ${
                  darkMode
                    ? 'border-[#35A7FF]/40 text-[#35A7FF] hover:bg-[#35A7FF]/10'
                    : 'border-sky-300 text-sky-700 hover:bg-sky-50'
                }`}
              >
                <PlayCircle className="w-4 h-4" />
                <span>Take the guided tour</span>
              </button>
            </div>
          </div>

          {/* At a glance — counts of the member's own real data only */}
          <div
            className={`grid grid-cols-3 lg:grid-cols-1 gap-3 shrink-0 w-full lg:w-52 ${
              darkMode ? 'text-slate-200' : 'text-slate-800'
            }`}
          >
            <div
              className={`rounded-2xl border px-4 py-3 ${
                darkMode
                  ? 'bg-slate-950/60 border-slate-800'
                  : 'bg-white/80 border-slate-200'
              }`}
            >
              <div className="text-xl font-black leading-none">
                {activePasses.length}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Active passes
              </div>
            </div>
            <div
              className={`rounded-2xl border px-4 py-3 ${
                darkMode
                  ? 'bg-slate-950/60 border-slate-800'
                  : 'bg-white/80 border-slate-200'
              }`}
            >
              <div className="text-xl font-black leading-none">
                {userPasses.length}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Passes on account
              </div>
            </div>
            <div
              className={`rounded-2xl border px-4 py-3 ${
                darkMode
                  ? 'bg-slate-950/60 border-slate-800'
                  : 'bg-white/80 border-slate-200'
              }`}
            >
              <div className="text-xl font-black leading-none">
                {products.length}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Sample templates in catalog
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pass status + getting started */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pass status */}
        <div className={`${cardClass} p-6 lg:col-span-3`}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#35A7FF]" />
              Pass status
            </h2>
            {primaryPass ? (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 ${
                  hasActivePass
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-slate-950'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {hasActivePass ? 'Active' : primaryPass.status}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-300">
                Not synced yet
              </span>
            )}
          </div>

          {primaryPass ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{primaryPass.icon}</span>
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-400">
                    {primaryPass.creatorName}
                  </div>
                  <div className="font-bold text-base text-slate-900 dark:text-white truncate">
                    {primaryPass.productTitle}
                  </div>
                  <div className="text-xs text-amber-500 font-semibold">
                    {primaryPass.planName}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block">
                    Whop Access
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {hasActivePass ? 'Verified' : 'Not currently active'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block">
                    Renewal Date
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {renewalLabel(primaryPass)}
                  </span>
                </div>
              </div>

              {activePasses.length > 1 && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  + {activePasses.length - 1} more active{' '}
                  {activePasses.length - 1 === 1 ? 'pass' : 'passes'} — see
                  them all in My Passes.
                </p>
              )}

              {!hasActivePass && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  This pass is not active right now. If you renewed on Whop,
                  reopen My Passes to re-sync — pass status follows your real
                  membership.
                </p>
              )}

              <button
                onClick={() => onSelectMode('passes')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors inline-flex items-center gap-2"
              >
                <span>View pass &amp; launch app</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                No pass is synced to this account yet. If you already bought
                on Whop, it takes three steps:
              </p>
              <ol className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    <strong className="text-slate-900 dark:text-white block">
                      Buy on Whop
                    </strong>
                    Checkout happens on Whop, with the account you intend to
                    use here.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    <strong className="text-slate-900 dark:text-white block">
                      Open Nexus inside Whop, signed in as the buyer
                    </strong>
                    Your pass is tied to that account's memberships — a
                    different account syncs nothing.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    <strong className="text-slate-900 dark:text-white block">
                      Open My Passes — sync is automatic
                    </strong>
                    Nexus reads your memberships and activates the pass. Were
                    you given a license key instead? Claim it from the same
                    page via "Have a license key instead?".
                  </span>
                </li>
              </ol>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  onClick={() => onSelectMode('passes')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Go to My Passes to sync</span>
                </button>
                <button
                  onClick={() => onSelectMode('marketplace')}
                  className={`px-5 py-2.5 rounded-xl border font-bold text-xs transition-colors ${
                    darkMode
                      ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Browse the catalog
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Getting started checklist */}
        <div className={`${cardClass} p-6 lg:col-span-2`}>
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-[#35A7FF]" />
            Getting started
          </h2>
          <ul className="space-y-3.5">
            {gettingStarted.map((item) => (
              <li key={item.label} className="flex items-start gap-2.5">
                {item.done ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4.5 h-4.5 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div
                    className={`text-xs font-bold ${
                      item.done
                        ? 'text-slate-400 line-through decoration-slate-500/60'
                        : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.hint}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={() => onSelectMode('help')}
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
          >
            <span>Read the full how-to guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
          Jump to a section
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.mode}
                onClick={() => onSelectMode(link.mode)}
                className={`text-left ${cardClass} p-5 hover:border-[#35A7FF]/50 transition-colors group`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#35A7FF]/15 border border-[#35A7FF]/30 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#35A7FF]" />
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  {link.title}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#35A7FF] transition-all" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  {link.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
