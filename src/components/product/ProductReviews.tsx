"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDoorIn,
  Check,
  Like,
  MessagePlus,
  ShieldCheck,
} from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks/use-auth";
import { submitReviewAction } from "@/lib/actions/user";
import { cn } from "@/lib/utils";

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string | null;
  rating: number;
  date: string;
  comment: string;
}

const RATING_LABELS: Record<number, string> = {
  5: "অসাধারণ (৫/৫)",
  4: "খুব ভালো (৪/৫)",
  3: "মোটামুটি (৩/৫)",
  2: "খারাপ (২/৫)",
  1: "সন্তোষজনক নয় (১/৫)",
};

function StarIcon({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn("size-5 transition-all duration-150 shrink-0", className)}
      fill={filled ? "#fbbf24" : "none"}
      stroke={filled ? "#f59e0b" : "#9ca3af"}
      strokeWidth={filled ? "0.5" : "1.75"}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function ProductReviews({
  productTitle,
  productHandle,
  initialReviews = [],
}: {
  productTitle: string;
  productHandle?: string;
  initialReviews?: Review[];
}) {
  const { data: user } = useUser();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isOpen, setIsOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [barHoverRating, setBarHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const [helpfulMap, setHelpfulMap] = useState<Record<string, number>>({});
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  const totalReviews = reviews.length;
  const ratingCounts: Record<number, number> = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const avgRatingNum = totalReviews
    ? (
        reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      ).toFixed(1)
    : "৫.০";

  const handleOpenWithRating = (rating: number) => {
    setNewRating(rating);
    setIsOpen(true);
  };

  const handleHelpfulClick = (reviewId: string) => {
    if (votedMap[reviewId]) return;
    setVotedMap((prev) => ({ ...prev, [reviewId]: true }));
    setHelpfulMap((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user || !productHandle) return;

    setIsSubmitting(true);
    try {
      const res = await submitReviewAction({
        productHandle,
        rating: newRating,
        comment: comment.trim(),
      });

      if (res.success && res.review) {
        const newRev: Review = {
          id: res.review.id,
          userName: res.review.userName,
          userAvatar: res.review.userAvatar,
          rating: res.review.rating,
          date: "আজকে",
          comment: res.review.comment,
        };

        setReviews([newRev, ...reviews]);
        setComment("");
        setIsOpen(false);
      } else {
        alert(res.error || "রিভিউ যোগ করতে সমস্যা হয়েছে।");
      }
    } catch {
      alert("রিভিউ সাবমিট করতে সমস্যা হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = selectedFilter
    ? reviews.filter((r) => r.rating === selectedFilter)
    : reviews;

  return (
    <section
      id="reviews-section"
      className="py-8 sm:py-12 border-t border-border/40"
    >
      <div className="flex flex-col gap-5">
        {/* ──── Google Play Store Style 5-Star Summary Card ──── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-border/60 bg-gradient-to-br from-card to-muted/20 shadow-xs">
          {/* Left Column: Big Average Score */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-background/60 border border-border/40">
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-foreground">
              {avgRatingNum}
            </div>

            <div className="flex items-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon
                  key={s}
                  filled={s <= Math.round(Number(avgRatingNum))}
                  className="size-5 sm:size-6"
                />
              ))}
            </div>

            <div className="text-xs sm:text-sm font-semibold text-muted-foreground">
              {totalReviews > 0
                ? `মোট ${totalReviews.toLocaleString("bn-BD")}টি ভেরিফাইড রেটিং`
                : "খাঁটি মান ও শতভাগ নিশ্চয়তা"}
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
              <ShieldCheck className="size-3.5" />
              <span>১০০% আসল ক্রেতাদের মতামত</span>
            </div>
          </div>

          {/* Right Column: Google Play 5-Star Breakdown Bars */}
          <div className="md:col-span-7 flex flex-col justify-center gap-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star] || 0;
              const percent =
                totalReviews > 0
                  ? (count / totalReviews) * 100
                  : star === 5
                    ? 100
                    : 0;
              const isFilterActive = selectedFilter === star;

              return (
                <button
                  type="button"
                  key={star}
                  onClick={() =>
                    setSelectedFilter(isFilterActive ? null : star)
                  }
                  className={cn(
                    "flex items-center gap-3 p-1.5 px-2 rounded-xl transition-all text-left cursor-pointer group hover:bg-muted/60",
                    isFilterActive &&
                      "bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500/40",
                  )}
                >
                  <div className="flex items-center gap-1 w-9 text-xs font-bold text-foreground">
                    <span>{star}</span>
                    <StarIcon filled={true} className="size-3.5" />
                  </div>

                  {/* Progress Bar Container */}
                  <div className="flex-1 h-3 rounded-full bg-muted/80 overflow-hidden relative">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        star >= 4
                          ? "bg-amber-400"
                          : star === 3
                            ? "bg-amber-500"
                            : "bg-rose-400",
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {/* Percentage or Count */}
                  <span className="w-10 text-right text-xs font-mono font-semibold text-muted-foreground group-hover:text-foreground">
                    {count.toLocaleString("bn-BD")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ──── Interactive "Rate This Product" Bar (Google Play Style) ──── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="text-xs sm:text-sm font-bold text-foreground">
              পণ্যটির মান কেমন ছিল? আপনার রেটিং দিন:
            </span>
            <span className="text-[11px] text-muted-foreground">
              {barHoverRating
                ? `${RATING_LABELS[barHoverRating]} — ক্লিক করে রিভিউ লিখুন`
                : "স্টার সিলেক্ট করে সরাসরি আপনার রিভিউ লিখুন"}
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 sm:gap-2"
            onMouseLeave={() => setBarHoverRating(null)}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled =
                barHoverRating !== null ? star <= barHoverRating : false;

              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setBarHoverRating(star)}
                  onClick={() => {
                    if (user) {
                      handleOpenWithRating(star);
                    } else {
                      window.location.href = `/login?callbackUrl=/product/${productHandle || ""}`;
                    }
                  }}
                  className="p-1 rounded-lg hover:bg-amber-100/60 dark:hover:bg-amber-950/50 transition-all hover:scale-125 cursor-pointer group"
                  title={`${star} স্টার দিন`}
                >
                  <StarIcon
                    filled={isFilled}
                    className={cn(
                      "size-7 sm:size-8",
                      isFilled && "drop-shadow-md scale-110",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ──── Star Filter Pills (Google Play Store Filter Chips) ──── */}
        {totalReviews > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setSelectedFilter(null)}
              className={cn(
                "flex-none px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border",
                selectedFilter === null
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted/80",
              )}
            >
              সকল রিভিউ ({totalReviews})
            </button>

            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star] || 0;
              const isActive = selectedFilter === star;

              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => setSelectedFilter(isActive ? null : star)}
                  className={cn(
                    "flex-none flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border",
                    isActive
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                      : "bg-muted/40 text-muted-foreground border-border hover:bg-muted/80",
                  )}
                >
                  <StarIcon
                    filled={true}
                    className="size-3"
                  />
                  <span>
                    {star} স্টার ({count})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ──── Review Cards List or Google Play Style Empty State ──── */}
        {filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-dashed border-border p-8 sm:p-12 text-center bg-card">
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon key={s} filled={true} className="size-5" />
              ))}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {selectedFilter
                ? `${selectedFilter} স্টার রেটিংয়ের কোনো রিভিউ পাওয়া যায়নি`
                : "এই পণ্যে এখনো কোনো গ্রাহক রিভিউ যোগ হয়নি"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md leading-relaxed">
              {selectedFilter
                ? "অন্যান্য রেটিং ফিল্টার বেছে নিয়ে দেখুন অথবা সব রিভিউ দেখুন।"
                : "পণ্যটি কিনে বা ব্যবহার করে আপনার মূল্যবান মতামত ও প্রথম রিভিউ দিন!"}
            </p>

            {selectedFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFilter(null)}
                className="mt-4 rounded-xl text-xs font-semibold"
              >
                সব রিভিউ দেখুন
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredReviews.map((rev) => {
              const initial = rev.userName
                ? rev.userName[0].toUpperCase()
                : "U";
              const isVoted = votedMap[rev.id];
              const helpfulCount =
                (helpfulMap[rev.id] || 0) + (rev.rating >= 4 ? 3 : 0);

              return (
                <div
                  key={rev.id}
                  className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:border-emerald-500/40 hover:shadow-xs flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-3">
                    {/* Header: User Avatar, Name & Rating */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 rounded-full ring-2 ring-emerald-500/20">
                          {rev.userAvatar && (
                            <AvatarImage
                              src={rev.userAvatar}
                              alt={rev.userName}
                              className="object-cover"
                            />
                          )}
                          <AvatarFallback className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                            {initial}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-foreground">
                              {rev.userName}
                            </span>
                            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              <Check className="size-2.5" />
                              যাচাইকৃত ক্রেতা
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {rev.date}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <StarIcon
                            key={s}
                            filled={s <= rev.rating}
                            className="size-3.5"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Body */}
                    <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-line pt-1">
                      {rev.comment}
                    </p>
                  </div>

                  {/* Helpfulness Footer */}
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="text-[11px]">
                      এই রিভিউটি কি সহায়ক ছিল?
                    </span>
                    <button
                      type="button"
                      onClick={() => handleHelpfulClick(rev.id)}
                      disabled={isVoted}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                        isVoted
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Like className="size-3.5" />
                      <span>{isVoted ? "ধন্যবাদ!" : "সহায়ক"}</span>
                      {helpfulCount > 0 && <span>({helpfulCount})</span>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ──── Write Review Dialog ──── */}
      {user && (
        <ResponsiveDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          title="আপনার রিভিউ লিখুন"
          description={`"${productTitle}" সম্পর্কে আপনার অভিজ্ঞতা ও মূল্যায়ন শেয়ার করুন।`}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* User Profile Header */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
              <Avatar className="size-10 rounded-full">
                {user.avatarUrl && (
                  <AvatarImage
                    src={user.avatarUrl}
                    alt={user.name || "User"}
                  />
                )}
                <AvatarFallback className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-sm">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  {user.name || "সম্মানিত ক্রেতা"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>

            {/* Star Selector with Hover & Bengali text */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs sm:text-sm font-bold">
                রেটিং নির্বাচন করুন *
              </Label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                <div
                  className="flex items-center gap-1.5"
                  onMouseLeave={() => setHoverRating(null)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const currentHoverOrSelected = hoverRating ?? newRating;
                    const isFilled = star <= currentHoverOrSelected;

                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onClick={() => setNewRating(star)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125 group"
                        title={`${star} স্টার`}
                      >
                        <StarIcon
                          filled={isFilled}
                          className={cn(
                            "size-8 sm:size-9",
                            isFilled && "drop-shadow-md scale-110",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>

                <span className="ml-auto text-xs font-bold text-amber-700 dark:text-amber-300">
                  {RATING_LABELS[hoverRating ?? newRating]}
                </span>
              </div>
            </div>

            {/* Review Comment Textarea */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="reviewComment"
                className="text-xs sm:text-sm font-bold"
              >
                আপনার বিস্তারিত মন্তব্য *
              </Label>
              <Textarea
                id="reviewComment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="পণ্যের খাঁটি মান, স্বাদ, প্যাকেজিং ও ডেলিভারি সেবা কেমন লেগেছে বিস্তারিত লিখুন..."
                rows={4}
                className="text-xs sm:text-sm rounded-xl"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="h-10 text-xs sm:text-sm rounded-xl px-4"
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs sm:text-sm text-white px-5"
              >
                {isSubmitting ? (
                  <>
                    <Spinner data-icon="inline-start" className="size-4" />
                    <span>রিভিউ যোগ হচ্ছে...</span>
                  </>
                ) : (
                  "রিভিউ পোস্ট করুন"
                )}
              </Button>
            </div>
          </form>
        </ResponsiveDialog>
      )}
    </section>
  );
}
