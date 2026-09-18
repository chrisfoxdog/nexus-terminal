import React, { useEffect, useMemo, useState } from 'react';
import { WhopProduct, ProductPlan, AccessPass } from '../types';
import { OfferCountdownTimer } from './OfferCountdownTimer';
import {
  X,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: WhopProduct | null;
  plan: ProductPlan | null;
  darkMode: boolean;
  onCompleteCheckout: (newPass: AccessPass) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  product,
  plan,
  darkMode,
}) => {
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsOpeningCheckout(false);
    }
  }, [isOpen]);

  const isSubscription = useMemo(() => {
    if (!plan) return false;
    return plan.interval === 'monthly' || plan.interval === 'yearly';
  }, [plan]);

  const isRealWhopPlan = useMemo(() => {
    if (!plan?.id) return false;
    return /^plan_[A-Za-z0-9_-]+$/.test(plan.id);
  }, [plan]);

  if (!isOpen || !product || !plan) return null;

  const handleOpenWhopCheckout = () => {
    if (!isRealWhopPlan) return;

    setIsOpeningCheckout(true);

    const checkoutUrl =
      'https://whop.com/checkout/' + encodeURIComponent(plan.id);

    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');

    window.setTimeout(() => {
      setIsOpeningCheckout(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className={
          'relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 ' +
          (darkMode
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900')
        }
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800/20 text-slate-400 hover:text-white transition-colors"
          aria-label="Close checkout"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-5">
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Whop Checkout</span>
          </div>

          <OfferCountdownTimer variant="compact" />

          <div
            className={
              'p-4 rounded-2xl border flex items-center gap-3 ' +
              (darkMode
                ? 'bg-slate-950 border-slate-800'
                : 'bg-slate-50 border-slate-200')
            }
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800">
              <img
                src={product.coverImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">
                {product.title}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                {plan.name} · {plan.interval}
              </div>
            </div>

            <div className="text-right font-black text-sm text-indigo-600 dark:text-indigo-400">
              ${plan.price.toFixed(2)}
            </div>
          </div>

          <div
            className={
              'p-4 rounded-2xl border ' +
              (darkMode
                ? 'bg-slate-950/60 border-slate-800'
                : 'bg-slate-50 border-slate-200')
            }
          >
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
              Plan Details
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              {plan.description}
            </p>

            {isSubscription && plan.trialDays && plan.trialDays > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {plan.trialDays}-day trial configured for this plan
              </div>
            )}
          </div>

          {!isRealWhopPlan ? (
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />

                <div>
                  <div className="text-sm font-bold text-amber-500">
                    Whop plan not configured yet
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    This app is connected to the Whop app interface, but this
                    product does not have a live Whop plan ID configured yet.
                    Create the real Whop product and plan before accepting
                    payments.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />

                <div>
                  <div className="text-sm font-bold text-emerald-500">
                    Live Whop plan configured
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Payment will be handled by Whop. Access is granted only
                    after the purchase is verified by the app backend.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">
                  {isSubscription ? 'Plan Price' : 'Purchase Price'}
                </div>

                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  ${plan.price.toFixed(2)}
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400">
                <div>Processed securely by Whop</div>
                <div>Payment details stay with Whop</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!isRealWhopPlan || isOpeningCheckout}
            onClick={handleOpenWhopCheckout}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isOpeningCheckout ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Opening Whop Checkout...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>
                  {isRealWhopPlan
                    ? 'Continue to Whop Checkout'
                    : 'Whop Checkout Not Configured'}
                </span>

                {isRealWhopPlan && (
                  <ExternalLink className="w-4 h-4" />
                )}
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <ShieldCheck className="w-3 h-3" />
            <span>
              No card information is collected or stored by this app.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
