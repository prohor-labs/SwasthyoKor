"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { GoogleIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  loginWithPasswordAction,
  requestMagicLinkAction,
} from "@/lib/actions/auth";

type Mode = "magic" | "password" | "register";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [mode, setMode] = useState<Mode>("magic");
  const [isGooglePending, setIsGooglePending] = useState(false);

  const [magicState, magicFormAction] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return await requestMagicLinkAction(formData);
    },
    null,
  );

  const [passwordState, passwordFormAction] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const res = await loginWithPasswordAction(formData);
      if (res.success) {
        router.push(callbackUrl);
        return null;
      }
      return res;
    },
    null,
  );

  const handleGoogleClick = () => {
    setIsGooglePending(true);
    window.location.href = `/api/auth/oauth/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-6 mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="relative size-14 overflow-hidden flex items-center justify-center">
          <Image
            src="/icon.png"
            alt="স্বাস্থ্যকর"
            width={56}
            height={56}
            className="size-full object-contain"
            priority
          />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground mt-1">
          {mode === "register"
            ? "নতুন অ্যাকাউন্ট তৈরি করুন"
            : mode === "password"
              ? "পাসওয়ার্ড দিয়ে লগইন"
              : "আপনার অ্যাকাউন্টে লগইন করুন"}
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          {mode === "register" ? (
            <>
              ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
              <button
                type="button"
                onClick={() => setMode("magic")}
                className="text-foreground font-semibold hover:underline cursor-pointer"
              >
                লগইন করুন
              </button>
            </>
          ) : (
            <>
              নতুন ব্যবহারকারী?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-foreground font-semibold hover:underline cursor-pointer"
              >
                অ্যাকাউন্ট তৈরি করুন
              </button>
            </>
          )}
        </p>
      </div>

      {/* ─── Magic Link / Form ─── */}
      {mode === "magic" && (
        <form action={magicFormAction} className="w-full flex flex-col gap-4">
          {magicState && !magicState.success && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription className="text-center text-xs">
                {magicState.error}
              </AlertDescription>
            </Alert>
          )}

          {magicState?.success && (
            <div className="w-full px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center leading-relaxed">
              {magicState.message}
            </div>
          )}

          <FieldGroup className="gap-4">
            <Field>
              <Input
                id="login-email"
                name="email"
                className="w-full rounded-xl px-4 py-6 text-sm bg-background border-border"
                placeholder="আপনার ইমেইল ঠিকানা"
                type="email"
                required
              />
            </Field>
          </FieldGroup>

          <SubmitButton
            pendingText="পাঠানো হচ্ছে..."
            className="w-full rounded-xl px-4 py-6 text-sm font-semibold cursor-pointer active:scale-[0.98] shadow-xs"
          >
            ম্যাজিক লিংক পাঠান
          </SubmitButton>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setMode("password")}
            className="w-full text-muted-foreground hover:text-foreground py-4 text-xs cursor-pointer font-medium"
          >
            পাসওয়ার্ড দিয়ে লগইন করুন
          </Button>
        </form>
      )}

      {/* ─── Password Mode ─── */}
      {mode === "password" && (
        <form
          action={passwordFormAction}
          className="w-full flex flex-col gap-4"
        >
          {passwordState && !passwordState.success && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription className="text-center text-xs">
                {passwordState.error}
              </AlertDescription>
            </Alert>
          )}

          <FieldGroup className="gap-4">
            <Field>
              <Input
                id="pw-email"
                name="email"
                type="email"
                className="w-full rounded-xl px-4 py-6 text-sm bg-background border-border"
                placeholder="আপনার ইমেইল ঠিকানা"
                required
              />
            </Field>
            <Field>
              <PasswordInput
                id="pw-password"
                name="password"
                className="w-full rounded-xl px-4 py-6 text-sm bg-background border-border"
                placeholder="পাসওয়ার্ড লিখুন"
                required
              />
            </Field>
          </FieldGroup>

          <SubmitButton
            pendingText="যাচাই করা হচ্ছে..."
            className="w-full rounded-xl px-4 py-6 text-sm font-semibold cursor-pointer active:scale-[0.98] shadow-xs"
          >
            লগইন করুন
          </SubmitButton>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setMode("magic")}
            className="w-full text-muted-foreground hover:text-foreground py-4 text-xs cursor-pointer font-medium"
          >
            ← ম্যাজিক লিংকে ফিরুন
          </Button>
        </form>
      )}

      {/* ─── Register Mode (Magic Link) ─── */}
      {mode === "register" && (
        <form action={magicFormAction} className="w-full flex flex-col gap-4">
          {magicState && !magicState.success && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription className="text-center text-xs">
                {magicState.error}
              </AlertDescription>
            </Alert>
          )}

          <FieldGroup className="gap-4">
            <Field>
              <Input
                id="reg-email"
                name="email"
                className="w-full rounded-xl px-4 py-6 text-sm bg-background border-border"
                placeholder="আপনার ইমেইল ঠিকানা"
                type="email"
                required
              />
            </Field>
          </FieldGroup>

          <SubmitButton
            pendingText="পাঠানো হচ্ছে..."
            className="w-full rounded-xl px-4 py-6 text-sm font-semibold cursor-pointer active:scale-[0.98] shadow-xs"
          >
            ম্যাজিক লিংক দিয়ে সাইন আপ
          </SubmitButton>
        </form>
      )}

      {/* ─── Social Login Divider ─── */}
      <div className="w-full flex items-center gap-4 py-1 opacity-60">
        <div className="h-[1px] flex-1 bg-border" />
        <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
          অথবা
        </span>
        <div className="h-[1px] flex-1 bg-border" />
      </div>

      {/* ─── Google OAuth Button ─── */}
      <div className="w-full flex flex-col gap-2">
        <SubmitButton
          type="button"
          variant="outline"
          isPending={isGooglePending}
          onClick={handleGoogleClick}
          className="w-full rounded-xl bg-card hover:bg-accent hover:text-foreground px-4 py-6 text-sm font-medium flex items-center justify-center gap-3 cursor-pointer shadow-xs border border-border"
        >
          <GoogleIcon className="size-5 shrink-0" />
          <span>গুগল দিয়ে চালিয়ে যান</span>
        </SubmitButton>
      </div>

      <p className="w-11/12 text-pretty text-center text-muted-foreground text-[11px] leading-relaxed">
        এগিয়ে যাওয়ার মাধ্যমে আপনি আমাদের{" "}
        <Link
          href="/terms-conditions"
          className="underline hover:text-foreground"
        >
          শর্তাবলী
        </Link>{" "}
        এবং{" "}
        <Link
          href="/privacy-policy"
          className="underline hover:text-foreground"
        >
          গোপনীয়তা নীতিতে
        </Link>{" "}
        সম্মত হচ্ছেন।
      </p>
    </div>
  );
}
