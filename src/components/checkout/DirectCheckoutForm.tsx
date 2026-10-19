"use client";

import { useEffect, useState } from "react";
import { BagShopping, CheckCircle, CloseCircle, Tag } from "@/components/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { siteConfig } from "@/config";
import { checkoutDirectProduct } from "@/lib/actions/checkout";
import { sendPhoneOtpAction, verifyPhoneOtpAction } from "@/lib/actions/otp";

interface DirectCheckoutFormProps {
  handle: string;
  quantity: number;
  finalTotal: number;
  initialName?: string;
  initialPhone?: string;
  initialPhoneVerified?: boolean;
  allowCoupons?: boolean;
}

export function DirectCheckoutForm({
  handle,
  quantity,
  finalTotal,
  initialName = "",
  initialPhone = "",
  initialPhoneVerified = false,
  allowCoupons = true,
}: DirectCheckoutFormProps) {
  // Coupon States
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  // Phone Verification & OTP States (Feature gated via siteConfig)
  const isVerificationEnabled = Boolean(
    siteConfig.features?.enablePhoneVerification,
  );
  const [phone, setPhone] = useState(initialPhone);
  const [isPhoneVerified, setIsPhoneVerified] = useState(
    isVerificationEnabled ? initialPhoneVerified : true,
  );
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [mockHint, setMockHint] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Resend Timer Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const payableAmount = appliedCoupon ? appliedCoupon.finalAmount : finalTotal;

  // Handle phone changes: if number is changed from verified one, reset verification
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhone(val);
    if (isVerificationEnabled && isPhoneVerified && val !== initialPhone) {
      setIsPhoneVerified(false);
      setOtpSent(false);
      setOtpCode("");
      setOtpMessage(null);
      setMockHint(null);
    }
  };

  // Send OTP handler
  const handleSendOtp = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!phone || phone.trim().length < 11) {
      setOtpError("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)");
      return;
    }

    setIsSendingOtp(true);
    setOtpError(null);
    setOtpMessage(null);

    try {
      const res = await sendPhoneOtpAction(phone);
      if (res.success) {
        setOtpSent(true);
        setOtpMessage(res.message || "ওটিপি পাঠানো হয়েছে।");
        if (res.mockOtp) {
          setMockHint(`[মক ওটিপি কোড: ${res.mockOtp}]`);
        }
        setCountdown(45);
      } else {
        setOtpError(res.error || "ওটিপি পাঠাতে সমস্যা হয়েছে।");
      }
    } catch {
      setOtpError("ওটিপি রিকোয়েস্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (otpCode.length < 4) {
      setOtpError("ওটিপি কোডটি লিখুন");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await verifyPhoneOtpAction(phone, otpCode);
      if (res.success) {
        setIsPhoneVerified(true);
        setOtpSent(false);
        setOtpMessage("মোবাইল নম্বর সফলভাবে যাচাই করা হয়েছে!");
        setMockHint(null);
      } else {
        setOtpError(res.error || "ভুল ওটিপি কোড।");
      }
    } catch {
      setOtpError("যাচাইকরণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

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
          productHandle: handle,
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

      {/* Customer Name */}
      <div className="space-y-1">
        <Label
          htmlFor="name"
          className="text-xs sm:text-sm font-semibold text-foreground/90"
        >
          আপনার নাম
        </Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={initialName}
          placeholder="আপনার পূর্ণ নাম"
          className="rounded-lg sm:rounded-xl h-10 text-sm px-3 bg-background"
        />
      </div>

      {/* Phone Number with OTP Verification */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="phone"
            className="text-xs sm:text-sm font-semibold text-foreground/90 flex items-center gap-1.5"
          >
            <span>মোবাইল নম্বর</span>
            {isVerificationEnabled && isPhoneVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle className="size-3" /> যাচাইকৃত
              </span>
            )}
          </Label>
          {isVerificationEnabled && !isPhoneVerified && !otpSent && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSendingOtp || !phone || phone.length < 11}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
            >
              {isSendingOtp ? "ওটিপি পাঠানো হচ্ছে..." : "ওটিপি পাঠান"}
            </button>
          )}
        </div>

        <div className="relative">
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            value={phone}
            onChange={handlePhoneChange}
            placeholder="যেমন: 017XXXXXXXX"
            className="rounded-lg sm:rounded-xl h-10 text-sm px-3 bg-background"
          />
        </div>

        {/* OTP Input Card when OTP is sent */}
        {isVerificationEnabled && !isPhoneVerified && otpSent && (
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2.5 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                ৬ ডিজিটের ওটিপি কোড লিখুন
              </span>
              <span className="text-[11px] text-muted-foreground">
                {countdown > 0 ? (
                  `পুনরায় পাঠান (${countdown}s)`
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-medium"
                  >
                    পুনরায় পাঠান
                  </button>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={(val) => setOtpCode(val)}
              >
                <InputOTPGroup className="gap-1 sm:gap-1.5">
                  <InputOTPSlot
                    index={0}
                    className="size-8 sm:size-9 rounded-lg"
                  />
                  <InputOTPSlot
                    index={1}
                    className="size-8 sm:size-9 rounded-lg"
                  />
                  <InputOTPSlot
                    index={2}
                    className="size-8 sm:size-9 rounded-lg"
                  />
                  <InputOTPSlot
                    index={3}
                    className="size-8 sm:size-9 rounded-lg"
                  />
                  <InputOTPSlot
                    index={4}
                    className="size-8 sm:size-9 rounded-lg"
                  />
                  <InputOTPSlot
                    index={5}
                    className="size-8 sm:size-9 rounded-lg"
                  />
                </InputOTPGroup>
              </InputOTP>

              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp || otpCode.length < 4}
                size="sm"
                className="h-8 sm:h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 cursor-pointer shrink-0"
              >
                {isVerifyingOtp ? <Spinner className="size-3" /> : "যাচাই করুন"}
              </Button>
            </div>

            {mockHint && (
              <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
                {mockHint}
              </p>
            )}
          </div>
        )}

        {/* Status / Error Alerts for OTP */}
        {isVerificationEnabled && otpError && (
          <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
            {otpError}
          </p>
        )}
        {isVerificationEnabled && otpMessage && !otpError && (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {otpMessage}
          </p>
        )}
      </div>

      {/* Address */}
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
      {allowCoupons ? (
        <div className="pt-0.5">
          {!isCouponOpen && !appliedCoupon ? (
            <button
              type="button"
              onClick={() => setIsCouponOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline cursor-pointer transition-colors"
            >
              <Tag className="size-3.5 shrink-0" />
              <span>আপনার কি কোনো কুপন বা প্রোমোকোড আছে?</span>
            </button>
          ) : (
            <div className="rounded-lg sm:rounded-xl border border-border/80 bg-neutral-50/60 dark:bg-neutral-900/40 p-2.5 sm:p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Tag className="size-3.5 text-emerald-600 shrink-0" />
                  <span>কুপন বা ডিসকাউন্ট কোড</span>
                </Label>
                {!appliedCoupon && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCouponOpen(false);
                      setCouponError("");
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>
                )}
              </div>

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
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
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
          )}
        </div>
      ) : null}

      <div className="rounded-lg sm:rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-2.5 sm:p-3 text-center">
        <p className="text-[11px] sm:text-xs text-muted-foreground font-medium leading-normal">
          অর্ডারটি কনফার্ম করার পর ডেলিভারিম্যান থেকে পণ্যটি বুঝে নিয়ে মূল্য পরিশোধ করুন।
        </p>
      </div>

      {/* Checkout Submit Button - requires OTP verification if enabled */}
      {isVerificationEnabled && !isPhoneVerified ? (
        <Button
          type="button"
          onClick={handleSendOtp}
          disabled={isSendingOtp || !phone || phone.length < 11}
          size="lg"
          className="w-full rounded-lg sm:rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700 h-11 sm:h-12 text-sm sm:text-base shadow-xs mt-1 cursor-pointer"
        >
          {isSendingOtp ? (
            <Spinner className="size-4" />
          ) : (
            <span>মোবাইল নম্বর ওটিপি দিয়ে যাচাই করুন</span>
          )}
        </Button>
      ) : (
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-lg sm:rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700 h-11 sm:h-12 text-sm sm:text-base shadow-xs mt-1 cursor-pointer"
        >
          <BagShopping className="size-4 shrink-0" />
          <span>অর্ডার কনফার্ম করুন — ৳{payableAmount.toLocaleString("bn-BD")}</span>
        </Button>
      )}

      <p className="text-[10px] sm:text-[11px] text-center text-muted-foreground">
        অর্ডারটি নিশ্চিত করার পর আমাদের প্রতিনিধি আপনাকে কল দিয়ে কনফার্ম করবেন।
      </p>
    </form>
  );
}
