import React, { useState } from 'react';
import { WhopProduct, ProductCategory } from '../types';
import { Star, Users, CheckCircle2, ShieldCheck, Sparkles, ArrowRight, Lock, MessageSquare, Download, PlayCircle, Zap, HelpCircle, ChevronDown, ChevronUp, CreditCard, Key } from 'lucide-react';
import { OfferCountdownTimer } from './OfferCountdownTimer';

interface MarketplaceViewProps {
  products: WhopProduct[];
  darkMode: boolean;
  onSelectProduct: (product: WhopProduct) => void;
  searchQuery: string;
  userPassProductIds: string[];
}

const CATEGORIES: { id: ProductCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All Categories', icon: '✨' },
  { id: 'trading', label: 'Trading & Signals', icon: '📈' },
  { id: 'saas', label: 'AI & SaaS Tools', icon: '🤖' },
  { id: 'education', label: 'Courses & Playbooks', icon: '🎓' },
  { id: 'sports', label: 'Sports Picks', icon: '⚽' },
  { id: 'coaching', label: 'Coaching & Community', icon: '💪' },
];

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  products,
  darkMode,
  onSelectProduct,
  searchQuery,
  userPassProductIds,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [showGuide, setShowGuide] = useState(false);

  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesSearch =
      prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.shortTagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Featured Whop Hero Banner (Sleek Theme) */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-6 sm:p-10 shadow-lg">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Whop Digital App Marketplace
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Unlock Elite Access Passes, Signals & SaaS.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Browse verified digital access passes, institutional trading signals, interactive video courses, and custom Whop embedded app widgets.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold">
              <span>⚡ 7-Day Free Trial ($0 Today) Available</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
              <span>🎁 First 50 Reviewers Get FREE Lifetime Access (34 Spots Left!)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant Key Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Limited Time Offer Countdown Timer Banner */}
      <OfferCountdownTimer
        variant="card"
        title="7-DAY FREE TRIAL & FREE LIFETIME ACCESS PROMO"
        subtitle="Claim your 7-day $0 trial or write a review for lifetime access before timer expires:"
        darkMode={darkMode}
      />

      {/* Quick "How to Use" Expandable Helper */}
      <div className={`p-4 rounded-2xl border transition-all ${
        darkMode ? 'bg-slate-900/80 border-indigo-500/30' : 'bg-indigo-50/60 border-indigo-200'
      }`}>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span>How to Use Marketplace & Test Purchases</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 font-normal">{showGuide ? 'Hide Guide' : 'Show Instructions'}</span>
            {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showGuide && (
          <div className="mt-3 pt-3 border-t border-indigo-500/20 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300 animate-fade-in">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">Inspect & Read Reviews</strong>
                Click any pass card to open details, inspect features, view star distribution, and read verified member reviews.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">Test Instant Checkout</strong>
                Click "Unlock Pass with Whop", select your tier, try promo codes (<code className="text-indigo-500 font-mono">WHOP2026</code>), and activate pass.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">Launch Embedded Apps</strong>
                Once unlocked, visit <strong className="text-amber-400">My Passes</strong> to open live TradingView, Discord, or Video Vault micro-apps!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : darkMode
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Marketplace Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Featured Access Passes ({filteredProducts.length})
          </h2>
          <span className="text-xs text-slate-500">Instant Access • Secure Whop Checkout</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            <p className="text-sm font-medium">No Whop products found matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const isUnlocked = userPassProductIds.includes(product.id);
              const minPrice = Math.min(...product.plans.map((p) => p.price));
              const defaultPlan = product.plans[0];

              return (
                <div
                  key={product.id}
                  className={`group rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden hover:shadow-lg ${
                    darkMode
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Cover Image & Badge Header */}
                  <div className="relative h-44 overflow-hidden bg-slate-800">
                    <img
                      src={product.coverImage}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                    {product.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-950/80 backdrop-blur-md text-indigo-400 border border-indigo-500/30">
                        {product.badge}
                      </span>
                    )}

                    {isUnlocked && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        Unlocked
                      </span>
                    )}

                    {/* Creator Avatar & Title overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5">
                      <img
                        src={product.creatorAvatar}
                        alt={product.creatorName}
                        className="w-9 h-9 rounded-lg border-2 border-white/80 object-cover shadow-sm"
                      />
                      <div className="text-white text-xs">
                        <div className="font-medium text-slate-300 leading-none">{product.creatorName}</div>
                        <div className="font-bold text-sm tracking-tight text-white drop-shadow truncate max-w-[200px]">
                          {product.title}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <p className={`text-xs line-clamp-2 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {product.shortTagline}
                      </p>

                    {/* Ratings & Member Stats & Promo Chips */}
                      <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{product.rating.toFixed(1)}</span>
                          <span className="text-slate-400 font-normal">({product.reviewCount})</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{product.totalMembers.toLocaleString()} members</span>
                        </div>
                      </div>

                      {/* Growth Feature Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ⚡ 7-Day Free Trial
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                          🎁 Review = Free Lifetime
                        </span>
                        <OfferCountdownTimer variant="badge" />
                      </div>
                    </div>

                    {/* Features list snippets */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {product.features.slice(0, 2).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-slate-400">Starting at</div>
                        <div className={`text-base font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          ${minPrice}
                          <span className="text-xs text-slate-400 font-normal">
                            {defaultPlan.interval === 'monthly' ? '/mo' : defaultPlan.interval === 'one_time' ? ' lifetime' : '/yr'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectProduct(product)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isUnlocked
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        }`}
                      >
                        {isUnlocked ? 'View Pass' : 'Unlock Pass'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
