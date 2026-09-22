import { Suspense } from "react";
import { LoginForm } from "@/components/auth";
import { Spinner } from "@/components/ui/spinner";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  email_account_exists:
    "এই ইমেইলে একটি স্বাস্থ্যকর অ্যাকাউন্ট আগে থেকেই আছে। ম্যাজিক লিংক দিয়ে লগইন করুন।",
  google_email_not_verified: "Google অ্যাকাউন্টের ইমেইল verified নয়।",
  google_cancelled: "Google লগইন বাতিল করা হয়েছে।",
  google_token_error: "Google থেকে token নেওয়া যায়নি। আবার চেষ্টা করুন।",
  google_profile_error: "Google প্রোফাইল লোড করা যায়নি।",
  google_server_error: "Google লগইনে সার্ভার ত্রুটি হয়েছে।",
  google_not_configured: "Google OAuth কনফিগার করা নেই।",
};

export const metadata = {
  title: "লগইন | স্বাস্থ্যকর",
  description: "আপনার স্বাস্থ্যকর অ্যাকাউন্টে লগইন বা সাইন আপ করুন।",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? decodeURIComponent(error))
    : null;

  return (
    <main className="w-full flex min-h-dvh flex-col items-center justify-center p-6 sm:p-10 relative z-10">
      <div className="w-full max-w-md mx-auto">
        {errorMessage && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm leading-relaxed text-center">
            {errorMessage}
          </div>
        )}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-6 text-primary" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
