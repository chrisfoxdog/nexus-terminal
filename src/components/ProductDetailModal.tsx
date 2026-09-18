import React, { useEffect, useMemo, useState } from 'react';
import { WhopProduct, ProductPlan } from '../types';
import { OfferCountdownTimer } from './OfferCountdownTimer';
import {
  X,
  Star,
  Users,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  ThumbsUp,
  MessageSquarePlus,
  Filter,
  Send,
  AlertCircle,
  UserCheck,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: WhopProduct | null;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onStartCheckout: (product: WhopProduct, plan: ProductPlan) => void;
  isAlreadyUnlocked: boolean;
  onLaunchAppWidget: (product: WhopProduct) => void;
  onSubmitReview?: (
    productId: string,
    review: {
      userName: string;
      userAvatar: string;
      rating: number;
      comment: string;
      date: string;
    }
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  darkMode,
  onStartCheckout,
  isAlreadyUnlocked,
  onLaunchAppWidget,
  onSubmitReview,
}) => {
  /*
   * IMPORTANT:
   * All hooks are declared before any conditional return.
   * This prevents the React Rules-of-Hooks error that was
   * present in the previous version of this component.
   */

  const [selectedPlan, setSelectedPlan] = useState<ProductPlan | null>(null);

  const [ratingFilter, setRatingFilter] = useState<
    'all' | '5' | '4' | '3' | '2' | '1'
  >('all');

  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>(
    'newest'
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('Alex Rivera');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const [helpfulVotes, setHelpfulVotes] = useState<Record<number, number>>({
    0: 12,
    1: 8,
    2: 5,
  });

  const [userVoted, setUserVoted] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (product) {
      setSelectedPlan(product.plans?.[0] ?? null);
      setRatingFilter('all');
      setSortBy('newest');
      setIsFormOpen(false);
      setSubmittedSuccess(false);
    }
  }, [product]);

  const filteredReviews = useMemo(() => {
    if (!product) return [];

    let reviews = [...product.sampleReviews];

    if (ratingFilter !== 'all') {
      reviews = reviews.filter(
        (review) => review.rating === Number(ratingFilter)
      );
    }

    if (sortBy === 'highest') {
      reviews.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      reviews.sort((a, b) => a.rating - b.rating);
    }

    return reviews;
  }, [product, ratingFilter, sortBy]);

  const averageRating = product?.rating ?? 0;

  const handleHelpful = (index: number) => {
    if (userVoted[index]) return;

    setHelpfulVotes((current) => ({
      ...current,
      [index]: (current[index] ?? 0) + 1,
    }));

    setUserVoted((current) => ({
      ...current,
      [index]: true,
    }));
  };

  const handleSubmitReview = async () => {
    if (!product || !newComment.trim()) return;

    setIsSubmitting(true);

    try {
      const review = {
        userName: reviewerName.trim() || 'Whop Member',
        userAvatar:
          'https://api.dicebear.com/7.x/initials/svg?seed=' +
          encodeURIComponent(reviewerName.trim() || 'Whop Member'),
        rating: newRating,
        comment: newComment.trim(),
        date: new Date().toLocaleDateString(),
      };

      if (onSubmitReview) {
        onSubmitReview(product.id, review);
      }

      setNewComment('');
      setNewRating(5);
      setSubmittedSuccess(true);
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) {
    return null;
  }

  const activePlan = selectedPlan ?? product.plans?.[0];

  if (!activePlan) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close product details"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border shadow-2xl ${
          darkMode
            ? 'border-slate-700 bg-slate-950 text-white'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b px-6 py-4 ${
            darkMode ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={product.icon || product.coverImage}
              alt=""
              className="h-10 w-10 rounded-xl object-cover"
              onError={(event) => {
                event.currentTarget.src =
                  product.coverImage ||
                  'https://placehold.co/80x80/111827/ffffff?text=W';
              }}
            />

            <div className="min-w-0">
              <div className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                {product.creatorName}
              </div>

              <h2 className="truncate text-lg font-bold">
                {product.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-2 transition ${
              darkMode
                ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Hero */}
          <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="relative overflow-hidden rounded-2xl border border-slate-700/50">
                <img
                  src={product.coverImage}
                  alt={product.title}
                  className="h-64 w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {product.badge && (
                  <div className="absolute left-4 top-4 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    {product.badge}
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-white">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{averageRating.toFixed(1)}</span>
                    <span className="text-white/70">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    {product.title}
                  </h3>

                  <p className="mt-1 text-sm text-white/80">
                    {product.shortTagline}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div
                  className={`rounded-xl border p-3 ${
                    darkMode
                      ? 'border-slate-800 bg-slate-900/60'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Star size={14} />
                    Rating
                  </div>
                  <div className="mt-1 font-bold">{averageRating.toFixed(1)}</div>
                </div>

                <div
                  className={`rounded-xl border p-3 ${
                    darkMode
                      ? 'border-slate-800 bg-slate-900/60'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users size={14} />
                    Members
                  </div>
                  <div className="mt-1 font-bold">
                    {product.totalMembers.toLocaleString()}
                  </div>
                </div>

                <div
                  className={`rounded-xl border p-3 ${
                    darkMode
                      ? 'border-slate-800 bg-slate-900/60'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck size={14} />
                    Access
                  </div>
                  <div className="mt-1 font-bold">Whop</div>
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div
              className={`rounded-2xl border p-5 ${
                darkMode
                  ? 'border-slate-800 bg-slate-900/60'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" />
                <h3 className="font-bold">Choose your access</h3>
              </div>

              <div className="space-y-3">
                {product.plans.map((plan) => {
                  const isSelected = activePlan.id === plan.id;

                  return (
                    <button
                      type="button"
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                          : darkMode
                            ? 'border-slate-700 bg-slate-950 hover:border-slate-600'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-bold">{plan.name}</div>

                          <div className="mt-1 text-xs text-slate-400">
                            {plan.description}
                          </div>

                          {plan.trialDays && plan.trialDays > 0 && (
                            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-400">
                              <Clock size={12} />
                              {plan.trialDays}-day trial
                            </div>
                          )}
                        </div>

                        <div className="whitespace-nowrap text-right">
                          <div className="text-xl font-bold">
                            ${plan.price}
                          </div>

                          {plan.interval !== 'one_time' && (
                            <div className="text-xs text-slate-400">
                              /{plan.interval === 'monthly' ? 'mo' : 'yr'}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Offer */}
              <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-indigo-300">
                  <Clock size={14} />
                  Current offer
                </div>

                <OfferCountdownTimer />
              </div>

              {/* Security */}
              <div className="mt-4 flex items-start gap-2 text-xs text-slate-400">
                <ShieldCheck
                  size={15}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />
                <span>
                  Checkout is handled through the selected Whop access plan.
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="px-6 pb-6">
            <div
              className={`rounded-2xl border p-5 ${
                darkMode
                  ? 'border-slate-800 bg-slate-900/40'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <h3 className="text-lg font-bold">About this pass</h3>

              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-400">
                {product.fullDescription}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {product.features.map((feature, index) => (
                  <div
                    key={`${feature}-${index}`}
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="px-6 pb-6">
            <div
              className={`rounded-2xl border p-5 ${
                darkMode
                  ? 'border-slate-800 bg-slate-900/40'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MessageSquarePlus size={19} className="text-indigo-400" />
                    <h3 className="text-lg font-bold">Reviews</h3>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                    <Star size={15} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-white">
                      {averageRating.toFixed(1)}
                    </span>
                    <span>from {product.reviewCount} reviews</span>
                  </div>
                </div>

                {isAlreadyUnlocked && (
                  <button
                    type="button"
                    onClick={() => setIsFormOpen((current) => !current)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-500/40 px-4 py-2 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/10"
                  >
                    <MessageSquarePlus size={16} />
                    Write a review
                  </button>
                )}
              </div>

              {submittedSuccess && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                  <CheckCircle2 size={17} />
                  Your review was submitted.
                </div>
              )}

              {isFormOpen && (
                <div className="mt-5 rounded-xl border border-slate-700 p-4">
                  <div className="grid gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-400">
                        Your name
                      </label>

                      <input
                        value={reviewerName}
                        onChange={(event) => setReviewerName(event.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-400">
                        Rating
                      </label>

                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            type="button"
                            key={rating}
                            onMouseEnter={() => setHoverRating(rating)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setNewRating(rating)}
                            className="p-1"
                            aria-label={`${rating} stars`}
                          >
                            <Star
                              size={22}
                              className={
                                rating <= (hoverRating || newRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-slate-600'
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-400">
                        Review
                      </label>

                      <textarea
                        value={newComment}
                        onChange={(event) => setNewComment(event.target.value)}
                        rows={4}
                        placeholder="Share your experience..."
                        className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={isSubmitting || !newComment.trim()}
                        onClick={handleSubmitReview}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send size={15} />
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Review controls */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-2">
                  <Filter size={15} className="text-slate-400" />

                  <select
                    value={ratingFilter}
                    onChange={(event) =>
                      setRatingFilter(
                        event.target.value as
                          | 'all'
                          | '5'
                          | '4'
                          | '3'
                          | '2'
                          | '1'
                      )
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs"
                  >
                    <option value="all">All ratings</option>
                    <option value="5">5 stars</option>
                    <option value="4">4 stars</option>
                    <option value="3">3 stars</option>
                    <option value="2">2 stars</option>
                    <option value="1">1 star</option>
                  </select>
                </div>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value as 'newest' | 'highest' | 'lowest'
                    )
                  }
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs"
                >
                  <option value="newest">Newest</option>
                  <option value="highest">Highest rated</option>
                  <option value="lowest">Lowest rated</option>
                </select>
              </div>

              {/* Review list */}
              <div className="mt-5 space-y-4">
                {filteredReviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
                    <AlertCircle className="mx-auto mb-2" size={20} />
                    No reviews match this filter.
                  </div>
                ) : (
                  filteredReviews.map((review, index) => (
                    <div
                      key={`${review.userName}-${review.date}-${index}`}
                      className="rounded-xl border border-slate-800 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={review.userAvatar}
                            alt=""
                            className="h-9 w-9 rounded-full"
                          />

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {review.userName}
                              </span>

                              <UserCheck
                                size={14}
                                className="text-emerald-400"
                              />
                            </div>

                            <div className="text-xs text-slate-500">
                              {review.date}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-slate-700'
                              }
                            />
                          ))}
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        {review.comment}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleHelpful(index)}
                        className={`mt-3 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs transition ${
                          userVoted[index]
                            ? 'text-indigo-300'
                            : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                        }`}
                      >
                        <ThumbsUp size={14} />
                        Helpful ({helpfulVotes[index] ?? 0})
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FIXED CHECKOUT FOOTER */}
        <div
          className={`shrink-0 border-t px-6 py-4 ${
            darkMode
              ? 'border-slate-800 bg-slate-950'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-medium text-slate-400">
                Total Due Today
              </div>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black">
                  ${activePlan.price}
                </span>

                {activePlan.interval !== 'one_time' && (
                  <span className="text-sm text-slate-500">
                    /{activePlan.interval === 'monthly' ? 'mo' : 'yr'}
                  </span>
                )}
              </div>

              {activePlan.trialDays && activePlan.trialDays > 0 ? (
                <div className="mt-1 text-xs text-emerald-400">
                  {activePlan.trialDays}-day trial included
                </div>
              ) : (
                <div className="mt-1 text-xs text-slate-500">
                  One-time payment for the selected plan
                </div>
              )}
            </div>

            {isAlreadyUnlocked ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLaunchAppWidget(product);
                }}
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-500"
              >
                <CheckCircle2 size={18} />
                Launch Embedded Whop App
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onStartCheckout(product, activePlan)}
                className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
              >
                Unlock Pass with Whop
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;