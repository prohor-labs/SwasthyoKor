"use client";

import { Coins, Gift, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";
import { LOYALTY_CONFIG } from "@/config/loyalty";

export function LoyaltyPointsCard() {
  const confettiRef = useRef<ConfettiRef>(null);

  const handleCelebrate = () => {
    confettiRef.current?.fire({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <Card className="relative overflow-hidden rounded-2xl border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 via-background to-amber-50/30 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/10 shadow-xs">
      <Confetti
        ref={confettiRef}
        manualstart
        className="pointer-events-none absolute inset-0 z-50 size-full"
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Coins className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                রিওয়ার্ড ও ক্যাশব্যাক পয়েন্ট
              </CardTitle>
              <CardDescription className="text-xs">
                স্বাস্থ্যকর লয়ালটি কয়েন ওয়ালেট
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-bold px-2.5 py-0.5">
            সক্রিয় অফার
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Current Balance / Welcome Banner */}
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 sm:p-4">
          <div>
            <span className="text-xs text-muted-foreground font-medium">
              আপনার বর্তমান ব্যালেন্স
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {LOYALTY_CONFIG.signupRewardPoints}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                পয়েন্ট (৳
                {LOYALTY_CONFIG.signupRewardPoints *
                  LOYALTY_CONFIG.pointToBdtRate}{" "}
                সমমূল্য)
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCelebrate}
            className="rounded-xl border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 gap-1.5 cursor-pointer text-xs font-semibold"
          >
            <Sparkles className="size-3.5" />
            বোনাস উদযাপন
          </Button>
        </div>

        {/* Benefits Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-muted-foreground">
          <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5 border border-border/50">
            <Gift className="size-4 shrink-0 text-amber-500 mt-0.5" />
            <span>
              <strong>সাইনআপ গিফট:</strong> প্রোফাইল খোলার সাথে সাথেই ফ্রি{" "}
              {LOYALTY_CONFIG.signupRewardPoints} পয়েন্ট উপহার!
            </span>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5 border border-border/50">
            <Coins className="size-4 shrink-0 text-emerald-500 mt-0.5" />
            <span>
              <strong>প্রতি অর্ডারে লাভ:</strong> প্রতি ১০০ টাকা কেনাকাটায় ১ পয়েন্ট (১%)
              রিওয়ার্ড পয়েন্ট জমা হবে।
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
