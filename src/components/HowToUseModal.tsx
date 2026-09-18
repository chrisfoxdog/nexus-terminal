import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ShoppingBag,
  Star,
  CreditCard,
  Key,
  TrendingUp,
  Users,
  Tag,
  Sparkles,
  Code,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Play,
  Layers,
  ShieldCheck,
  Zap,
  Bot
} from 'lucide-react';
import { NavMode } from './HeaderNav';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onSelectMode: (mode: NavMode) => void;
}

type FeatureTab =
  | 'overview'
  | 'marketplace'
  | 'reviews'
  | 'checkout'
  | 'passes'
  | 'analytics'
  | 'affiliates'
  | 'ai'
  | 'developer';

export const HowToUseModal: React.FC<HowToUseModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onSelectMode,
}) => {
  const [activeTab, setActiveTab] = useState<FeatureTab>('overview');

  if (!isOpen) return null;

  const navigateAndClose = (mode: NavMode) => {
    onSelectMode(mode);
    onClose();
  };

  const tabs = [
    { id: 'overview' as FeatureTab, label: 'Platform Overview', icon: BookOpen },
    { id: 'marketplace' as FeatureTab, label: '1. Marketplace & Search', icon: ShoppingBag },
    { id: 'reviews' as FeatureTab, label: '2. Ratings & Verified Reviews', icon: Star },
    { id: 'checkout' as FeatureTab, label: '3. Checkout & Promo Codes', icon: CreditCard },
    { id: 'passes' as FeatureTab, label: '4. Pass Vault & Micro-Apps', icon: Key },
    { id: 'analytics' as FeatureTab, label: '5. Creator Recharts Analytics', icon: TrendingUp },
    { id: 'affiliates' as FeatureTab, label: '6. Affiliates & Coupons', icon: Users },
    { id: 'ai' as FeatureTab, label: '7. Gemini AI Content Studio', icon: Sparkles },
    { id: 'developer' as FeatureTab, label: '8. Webhooks & API Validator', icon: Code },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Whop Business — Interactive Feature Guide
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete walkthrough on how to use every tool, analytics widget, review system, and micro-app.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Layout: Left Nav Tabs + Right Scrollable Details */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Vertical Nav Tabs */}
          <div className="w-full md:w-64 p-3 border-r border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 overflow-y-auto space-y-1 shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : darkMode
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Scrollable Content Pane */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
            
            {/* TAB 0: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Welcome Guide</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Whop Business Digital Ecosystem</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    This platform mirrors the full modern Whop digital marketplace experience. You can act as a 
                    <strong className="text-indigo-500"> Buyer</strong> (discovering products, reading verified reviews, purchasing access passes, launching embedded micro-apps) or a 
                    <strong className="text-emerald-500"> Creator/Developer</strong> (analyzing sales performance with Recharts, managing affiliate splits, issuing promo codes, generating AI copy, and testing webhooks).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-2 font-bold text-sm text-indigo-600 dark:text-indigo-400 mb-1">
                      <ShoppingBag className="w-4 h-4" /> Buyer Journey
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                      Discover trading indicators, Discord pass memberships, software, & video courses. Read verified reviews, apply promo codes, and launch live apps.
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-1">
                      <Zap className="w-4 h-4" /> Creator Studio
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                      Track revenue, churn rate, and channel acquisition with interactive Recharts diagrams, manage affiliate partners, and generate AI marketing materials.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 space-y-2">
                  <span className="font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-4 h-4" /> Quick Navigation Tip:
                  </span>
                  <p>
                    Use the top navigation bar at any time to switch between <strong>Marketplace</strong>, <strong>My Passes</strong>, <strong>Creator Studio</strong>, and <strong>API Validator</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 1: MARKETPLACE */}
            {activeTab === 'marketplace' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Feature Walkthrough</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">1. Marketplace & Discovery</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    How to browse, filter, search, and get AI recommendations for digital products.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                      Category & Price Filter Buttons
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Select categories such as <strong>Trading Signals</strong>, <strong>Discord Communities</strong>, <strong>Software Tools</strong>, or <strong>Video Courses</strong>. Toggle billing filters (All, Monthly, One-Time, Lifetime) to refine your view.
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                      Live Search Bar
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Use the top search input in the header navigation bar to instantly search product titles, creator handles, or perk tags.
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                      Floating Gemini AI Product Advisor
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Click the floating <strong>AI Assistant badge</strong> in the bottom-right corner of the screen. Tell Gemini your budget or learning goals (e.g., "Find me a trading indicator under $100"), and it will suggest tailored passes.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigateAndClose('marketplace')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <span>Go to Marketplace Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB 2: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Feature Walkthrough</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">2. Ratings & Verified Review System</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    How verified pass holders leave star ratings, written feedback, and vote on reviews.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      Viewing Ratings & Star Distribution
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Click any product card to open the detail modal. Scroll down to see the average score (e.g. 4.9 / 5.0) and the percentage breakdown for 5★ down to 1★ reviews.
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Submitting a Verified Buyer Review
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1">
                      <li>Click the <strong>"Write a Review"</strong> button.</li>
                      <li>Hover and click over the 5 star icons to set your rating.</li>
                      <li>If you haven't bought the pass yet, click <strong>"[Enable Test Buyer Mode]"</strong> to simulate verification.</li>
                      <li>Type your review text and click <strong>"Submit Verified Review"</strong>.</li>
                    </ol>
                  </div>

                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      Filter & Sort Feedback
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Use the filter pills (e.g., 5★, 4★) to isolate specific ratings, or use the dropdown to sort by <em>Most Recent</em>, <em>Highest Rated</em>, or <em>Lowest Rated</em>. Click "Helpful 👍" to vote on feedback.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigateAndClose('marketplace')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <span>Open Marketplace to Test Reviews</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB 3: CHECKOUT */}
            {activeTab === 'checkout' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Feature Walkthrough</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">3. Instant Checkout & Promo Codes</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    How pass plan selection, order bumps, promo discounts, and instant license generation work.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-500" />
                      Applying Test Promo Codes
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                      In the checkout modal, enter any of these active test codes to calculate instant discounts:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                      <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-center">
                        WHOP2026 (20% OFF)
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-center">
                        VIP50 ($50 OFF)
                      </div>
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-center">
                        SUMMER2026 (30% OFF)
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Order Bumps & One-Click Activation
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Check the <strong>"VIP 1-on-1 Onboarding Call"</strong> order bump checkbox to add an extra service to your pass. Click <strong>"Complete Order & Activate Pass"</strong> to simulate instant credit card payment and receive your unique license key.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PASS VAULT & MICRO APPS */}
            {activeTab === 'passes' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Feature Walkthrough</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">4. My Pass Vault & Embedded Micro-Apps</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    How to manage active pass keys and launch live embedded Whop micro-apps.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-500" />
                      License Keys & Renewal Status
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Navigate to <strong>"My Passes"</strong> in the top header. Each active pass displays its unique license key (e.g. <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">WHOP-PRO-9821</code>), renewal date, and Discord sync status.
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Play className="w-4 h-4 text-emerald-500" />
                      3 Live Embedded Whop Micro-Apps
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                      Click <strong>"Launch Embedded Whop App"</strong> on any pass to interact with full functional micro-apps:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1">
                      <li>📈 <strong>TradingView Indicator Terminal</strong>: Live candlestick chart, RSI/MACD indicators, buy/sell signal alerts.</li>
                      <li>💬 <strong>Private Discord VIP Community</strong>: Live channel chat simulator with member list.</li>
                      <li>🎥 <strong>Video Course Vault</strong>: Interactive streaming video player with lesson progress tracking and downloadable PDF study guides.</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => navigateAndClose('passes')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <span>Open My Passes Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB 5: CREATOR ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Feature Walkthrough</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">5. Creator Analytics (Recharts)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    How to inspect revenue trends, acquisition channels, conversion funnels, and export CSV reports.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-500" />
                      Dynamic View Focus Modes
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      In <strong>Creator Studio</strong>, click the top view focus buttons:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1">
                      <li><strong>Sales & Revenue ($)</strong>: Recharts Area Chart comparing gross sales vs creator payouts.</li>
                      <li><strong>Member Acquisition</strong>: Recharts Bar Chart showing monthly new pass activations vs total active members.</li>
                      <li><strong>Churn & ARPU (%)</strong>: Recharts Line Chart mapping monthly churn rate percentage alongside Average Revenue Per User.</li>
                    </ul>
                  </div>

                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-500" />
                      Stacked Acquisition Channels & Conversion Funnel
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Analyze traffic sources across Whop Marketplace, Affiliates, YouTube/Socials, and Paid Ads. The Storefront Conversion Funnel tracks drop-off from initial impressions to final checkout completion.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigateAndClose('creator')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <span>Open Creator Studio Analytics</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB 6: AFFILIATES & COUPONS */}
            {activeTab === 'affiliates' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Feature Walkthrough</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">6. Affiliate Program & Coupon Engine</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    How to recruit affiliate partners, set commission percentage splits, and create promo codes.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" />
                      Affiliate Links & Commission Splits
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      In Creator Studio, switch to the <strong>"Affiliates & Referrals"</strong> sub-tab. Copy unique referral links (e.g., <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">https://whop.com/pass?aff=@trader_mark</code>) and configure custom commission splits (e.g. 30%).
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-500" />
                      Creating Custom Coupons & Promo Codes
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Switch to the <strong>"Coupons & Discounts"</strong> sub-tab. Type a new code string, select discount percentage (e.g. 25%), set redemption limits, and click <strong>"Create Coupon Code"</strong>.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigateAndClose('creator')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <span>Go to Affiliates & Coupons</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB 7: AI CONTENT STUDIO */}
            {activeTab === 'ai' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Feature Walkthrough</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">7. Gemini AI Copywriting Studio</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    How to generate high-converting product descriptions, launch emails, and social media hooks.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Bot className="w-4 h-4 text-indigo-500" />
                      Generating High-Converting Sales Copy
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1">
                      <li>In Creator Studio, click the <strong>"Gemini AI Studio"</strong> sub-tab.</li>
                      <li>Choose your product niche (e.g., Trading Signals, E-commerce Course).</li>
                      <li>Select output style (Sales Copy, Email Sequence, Twitter/X Thread).</li>
                      <li>Click <strong>"Generate AI Marketing Assets"</strong> to stream generated marketing copy.</li>
                    </ol>
                  </div>
                </div>

                <button
                  onClick={() => navigateAndClose('creator')}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <span>Test Gemini AI Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* TAB 8: DEVELOPER & WEBHOOKS */}
            {activeTab === 'developer' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Feature Walkthrough</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">8. Webhooks & API Validator Playground</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    How to test Whop webhook events, inspect JSON payloads, and view API authentication headers.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Code className="w-4 h-4 text-purple-500" />
                      Testing Real-Time Whop Webhook Triggers
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      Click <strong>"API Validator"</strong> in the top header. Select a test event type:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1">
                      <li><code className="text-emerald-500 font-mono">membership.went_valid</code> (New purchase or subscription renewal)</li>
                      <li><code className="text-red-500 font-mono">membership.went_invalid</code> (Subscription cancelled or expired)</li>
                      <li><code className="text-indigo-500 font-mono">payment.succeeded</code> (Payout or invoice payment)</li>
                    </ul>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                      Click <strong>"Trigger Webhook Test"</strong> to send the event and view formatted JSON payloads and HTTP status responses in real time.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigateAndClose('developer')}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                >
                  <span>Open API Validator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Whop Business Engine • Ready for live simulation</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
