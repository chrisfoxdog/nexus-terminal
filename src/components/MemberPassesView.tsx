import React, { useState } from 'react';
import { AccessPass, WhopProduct } from '../types';
import { EmbeddedAppViewer } from './EmbeddedAppViewer';
import {
  Key,
  Copy,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MemberPassesViewProps {
  userPasses: AccessPass[];
  darkMode: boolean;
  onBrowseMarketplace: () => void;
  products: WhopProduct[];
  onRedeemKey?: (newPass: AccessPass) => void;
}

export const MemberPassesView: React.FC<MemberPassesViewProps> = ({
  userPasses,
  darkMode,
  onBrowseMarketplace,
  products,
  onRedeemKey,
}) => {
  const [activeAppPass, setActiveAppPass] = useState<AccessPass | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [redeemKeyInput, setRedeemKeyInput] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(
    products[0]?.id || 'prod_apex_signals'
  );
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState('');
  const [redeemErrorMsg, setRedeemErrorMsg] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleCopyKey = (pass: AccessPass) => {
    navigator.clipboard.writeText(pass.licenseKey);
    setCopiedKeyId(pass.id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleExecuteRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemErrorMsg('');
    setRedeemSuccessMsg('');

    const key = redeemKeyInput.trim();

    if (!key) {
      setRedeemErrorMsg('Please enter a valid Whop license key.');
      return;
    }

    const matchedProd =
      products.find((p) => p.id === selectedProductId) || products[0];

    if (!matchedProd) {
      setRedeemErrorMsg('Selected product not found.');
      return;
    }

    setIsRedeeming(true);

    try {
      const valRes = await fetch('/api/v1/licenses/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: key,
          product_id: matchedProd.id,
        }),
      });

      const valData = await valRes.json();

      if (!valRes.ok || !valData.valid) {
        setRedeemErrorMsg(
          valData.message ||
            'The entered Whop license key is invalid or expired.'
        );
        setIsRedeeming(false);
        return;
      }

      const claimRes = await fetch('/api/v1/passes/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-whop-user-id': 'usr_998124',
        },
        body: JSON.stringify({
          license_key: key,
          product_id: matchedProd.id,
          product_title: matchedProd.title,
          creator_name: matchedProd.creatorName,
          icon: matchedProd.icon,
          cover_image: matchedProd.coverImage,
          app_type: matchedProd.perks.appType,
          price_paid: matchedProd.plans[0]?.price || 0,
        }),
      });

      const claimData = await claimRes.json();
      const serverPass = claimData.pass;

      const newPass: AccessPass = {
        id: serverPass
          ? serverPass.id
          : `pass_redeemed_${Date.now()}`,
        productId: matchedProd.id,
        productTitle: matchedProd.title,
        creatorName: matchedProd.creatorName,
        icon: matchedProd.icon,
        coverImage: matchedProd.coverImage,
        licenseKey: key,
        status: 'active',
        planName: matchedProd.plans[0]?.name || 'Standard Pass',
        pricePaid: matchedProd.plans[0]?.price || 0,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + 365 * 86400 * 1000
        ).toISOString(),
        discordConnected: true,
        appType: matchedProd.perks.appType,
      };

      if (onRedeemKey) {
        onRedeemKey(newPass);
      }

      setRedeemSuccessMsg(
        `Successfully verified & activated Whop license key (${
          valData.verified_source || 'Verified'
        })!`
      );
      setRedeemKeyInput('');

      setTimeout(() => {
        setRedeemSuccessMsg('');
        setIsRedeemOpen(false);
      }, 2500);
    } catch (err: any) {
      setRedeemErrorMsg(
        'Failed to connect to verification server. Please try again.'
      );
    } finally {
      setIsRedeeming(false);
    }
  };

  if (activeAppPass) {
    return (
      <EmbeddedAppViewer
        pass={activeAppPass}
        darkMode={darkMode}
        onBack={() => setActiveAppPass(null)}
      />
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            My Access Passes ({userPasses.length})
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your active Whop subscriptions, license keys, and launch
            embedded Whop Apps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsRedeemOpen(!isRedeemOpen)}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Key className="w-4 h-4" />
            <span>
              {isRedeemOpen ? 'Close Key Import' : 'Redeem Whop Key'}
            </span>
          </button>

          <button
            onClick={onBrowseMarketplace}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Explore Marketplace
          </button>
        </div>
      </div>

      {isRedeemOpen && (
        <div
          className={`p-5 rounded-2xl border ${
            darkMode
              ? 'bg-slate-900 border-indigo-500/30'
              : 'bg-white border-indigo-200'
          } shadow-md animate-fade-in`}
        >
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-500" />
            Redeem Existing Whop License Key
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Enter a key purchased from Whop.com or created in Creator Studio to
            unlock access immediately in your account.
          </p>

          <form onSubmit={handleExecuteRedeem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">
                  Whop License Key
                </label>

                <input
                  type="text"
                  value={redeemKeyInput}
                  onChange={(e) => setRedeemKeyInput(e.target.value)}
                  placeholder="e.g. whop_live_key_88921_apex_trader"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    darkMode
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">
                  Target Product
                </label>

                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    darkMode
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.creatorName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {redeemErrorMsg && (
              <div className="text-xs text-red-400 font-bold bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                {redeemErrorMsg}
              </div>
            )}

            {redeemSuccessMsg && (
              <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                {redeemSuccessMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isRedeeming}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isRedeeming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying with Whop API...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Activate License Pass</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <div
        className={`p-4 rounded-2xl border transition-all ${
          darkMode
            ? 'bg-slate-900/80 border-indigo-500/30'
            : 'bg-indigo-50/60 border-indigo-200'
        }`}
      >
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span>How to Use Your Passes & Embedded Apps</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 font-normal">
              {showGuide ? 'Hide Guide' : 'Show Instructions'}
            </span>

            {showGuide ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showGuide && (
          <div className="mt-3 pt-3 border-t border-indigo-500/20 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300 animate-fade-in">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>

              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">
                  Copy License Key
                </strong>
                Click the copy icon on any pass card to copy your unique
                license key to clipboard.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>

              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">
                  Launch Embedded App
                </strong>
                Click <strong>"Launch Embedded Whop App"</strong> to open live
                candlestick charts, Discord channels, or video course modules.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>

              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">
                  Discord Sync
                </strong>
                Verify your connected Discord account to claim automated role
                permissions across Whop servers.
              </div>
            </div>
          </div>
        )}
      </div>

      {userPasses.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border ${
            darkMode
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          } space-y-4`}
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Key className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Active Whop Passes Yet
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse the marketplace to unlock trading signals, AI tools, and
              video courses.
            </p>
          </div>

          <button
            onClick={onBrowseMarketplace}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-xs"
          >
            Browse Whop Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {userPasses.map((pass) => {
            const isCopied = copiedKeyId === pass.id;

            return (
              <div
                key={pass.id}
                className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="relative h-32 bg-slate-800 overflow-hidden">
                    <img
                      src={pass.coverImage}
                      alt={pass.productTitle}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        {pass.status}
                      </span>

                      {pass.isTrialActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 backdrop-blur-md flex items-center gap-1 shadow-sm">
                          ⚡ 7-Day Free Trial
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5">
                      <span className="text-3xl">{pass.icon}</span>

                      <div className="text-white min-w-0">
                        <div className="text-[11px] text-slate-300">
                          {pass.creatorName}
                        </div>

                        <h3 className="font-bold text-base truncate text-white">
                          {pass.productTitle}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-semibold uppercase">
                          Whop License Key
                        </span>

                        <span className="text-amber-500 font-semibold">
                          {pass.planName}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 font-mono text-xs text-amber-400">
                        <span className="truncate">{pass.licenseKey}</span>

                        <button
                          onClick={() => handleCopyKey(pass)}
                          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {isCopied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 space-y-0.5">
                        <span className="text-slate-400 text-[10px] block">
                          Discord Sync
                        </span>

                        <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Role Assigned
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 space-y-0.5">
                        <span className="text-slate-400 text-[10px] block">
                          Renewal Date
                        </span>

                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {pass.expiresAt.startsWith('2099')
                            ? 'Lifetime Pass'
                            : new Date(
                                pass.expiresAt
                              ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-transparent">
                  <button
                    onClick={() => setActiveAppPass(pass)}
                    className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Launch Embedded Whop App</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};