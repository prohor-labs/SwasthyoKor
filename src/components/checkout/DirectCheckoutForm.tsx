"use client";

import { useState } from "react";
import { BagShopping, CheckCircle, CloseCircle, Tag } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { checkoutDirectProduct } from "@/lib/actions/checkout";

interface DirectCheckoutFormProps {
  handle: string;
  quantity: number;
  finalTotal: number;
  initialName?: string;
  initialPhone?: string;
}

export function DirectCheckoutForm({
  handle,
  quantity,
  finalTotal,
  initialName = "",
  initialPhone = "",
}: DirectCheckoutFormProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const payableAmount = appliedCoupon ? appliedCoupon.finalAmount : finalTotal;

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplying(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          orderAmount: finalTotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "কুপন কোডটি সঠিক নয়।");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          finalAmount: data.finalAmount,
          message: data.message,
        });
        setCouponError("");
      }
    } catch {
      setCouponError("কুপন যাচাই করতে সমস্যা হয়েছে।");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  return (
    <form action={checkoutDirectProduct} className="space-y-3 sm:space-y-4">
      <input type="hidden" name="handle" value={handle} />
      <input type="hidden" name="quantity" value={quantity.toString()} />
      <input type="hidden" name="paymentMethod" value="online" />
      <input
        type="hidden"
        name="couponCode"
        value={appliedCoupon ? appliedCoupon.code : ""}
      />

      <div className="space-y-1">
        <Label
          htmlFor="name"
          className="text-xs sm:text-sm font-semibold text-foreground/90"
        >
          আপনার পুরো নাম
        </Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={initialName}
          placeholder="যেমন: মোঃ সাকিব হাসান"
          className="rounded-lg sm:rounded-xl h-10 text-sm px-3 bg-background"
        />
      </div>

      <div className="space-y-1">
        <Label
          htmlFor="phone"
          className="text-xs sm:text-sm font-semibold text-foreground/90"
        >
          মোবাইল নম্বর
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={initialPhone}
          placeholder="যেমন: 017XXXXXXXX"
          className="rounded-lg sm:rounded-xl h-10 text-sm px-3 bg-background"
        />
      </div>

      <div className="space-y-1">
        <Label
          htmlFor="address"
          className="text-xs sm:text-sm font-semibold text-foreground/90"
        >
          সম্পূর্ণ ডেলিভারি ঠিকানা
        </Label>
        <Input
          id="address"
          name="address"
          required
          placeholder="বাড়ি/ফ্ল্যাট নং, রাস্তা, এলাকা, থানা ও জেলা"
          className="rounded-lg sm:rounded-xl h-10 text-sm px-3 bg-background"
        />
      </div>

      {/* Coupon Application Box */}
      <div className="pt-0.5">
        <div className="rounded-lg sm:rounded-xl border border-border/80 bg-neutral-50/60 dark:bg-neutral-900/40 p-2.5 sm:p-3.5 space-y-2">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Tag className="size-3.5 text-emerald-600 shrink-0" />
            <span>কুপন বা ডিসকাউন্ট ভাউচার কোড</span>
          </Label>

          {appliedCoupon ? (
            <div className="flex items-center justify-between p-2 rounded-md sm:rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-1.5 min-w-0">
                <CheckCircle className="size-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">
                  কুপন{" "}
                  <strong className="font-mono uppercase">
                    {appliedCoupon.code}
                  </strong>{" "}
                  যুক্ত হয়েছে (-৳
                  {appliedCoupon.discountAmount.toLocaleString("bn-BD")})
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-muted-foreground hover:text-red-600 transition-colors p-1 shrink-0"
                title="কুপন মুছুন"
              >
                <CloseCircle className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="প্রোমোকোড লিখুন (যেমন: SWAS10)"
                className="rounded-md sm:rounded-lg h-9 text-xs font-mono uppercase bg-background"
              />
              <Button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isApplying || !couponCode.trim()}
                variant="outline"
                size="sm"
                className="rounded-md sm:rounded-lg h-9 px-3.5 text-xs font-semibold shrink-0 cursor-pointer border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                {isApplying ? <Spinner className="size-3" /> : "প্রয়োগ করুন"}
              </Button>
            </div>
          )}

          {couponError ? (
            <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
              {couponError}
            </p>
          ) : null}

          {appliedCoupon ? (
            <div className="pt-1 text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>মূল মূল্য:</span>
                <span>৳{finalTotal.toLocaleString("bn-BD")}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>কুপন ছাড়:</span>
                <span>
                  -৳{appliedCoupon.discountAmount.toLocaleString("bn-BD")}
                </span>
              </div>
              <div className="flex justify-between font-bold text-foreground border-t border-border/50 pt-1 text-sm">
                <span>পরিশোধযোগ্য মূল্য:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ৳{payableAmount.toLocaleString("bn-BD")}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Online Payment Method Banner */}
      <div className="rounded-lg sm:rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5 sm:p-3 space-y-1">
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            পেমেন্ট পদ্ধতি: ১০০% অনলাইন
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
            অগ্রিম পরিশোধ
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-normal">
          বিকাশ, নগদ, রকেট অথবা কার্ডের মাধ্যমে সম্পূর্ণ মূল্য অগ্রিম পরিশোধযোগ্য।
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-lg sm:rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700 h-11 sm:h-12 text-sm sm:text-base shadow-xs mt-1 cursor-pointer"
      >
        <BagShopping className="size-4 shrink-0" />
        <span>পেমেন্ট করুন — ৳{payableAmount.toLocaleString("bn-BD")}</span>
      </Button>

      <p className="text-[10px] sm:text-[11px] text-center text-muted-foreground">
        অর্ডার নিশ্চিত করতে আপনাকে UddoktaPay সুরক্ষিত গেটওয়েতে নিয়ে যাওয়া হবে।
      </p>
    </form>
  );
}
