"use client";

import { useState } from "react";
import {
  CheckCircle as CheckCircle2,
  Save,
  Store,
  Truck,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StoreSettings } from "@/lib/db/schema";

export function StoreSettingsForm({
  initialSettings,
}: {
  initialSettings: StoreSettings;
}) {
  const [formData, setFormData] = useState({
    storeName: initialSettings.storeName,
    storePhone: initialSettings.storePhone,
    whatsappNumber: initialSettings.whatsappNumber,
    storeEmail: initialSettings.storeEmail,
    storeAddress: initialSettings.storeAddress,
    insideDhakaFee: initialSettings.insideDhakaFee,
    outsideDhakaFee: initialSettings.outsideDhakaFee,
    freeShippingMinAmount: initialSettings.freeShippingMinAmount,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 animate-in fade-in-0 duration-200">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>স্টোর সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Store Basic Info Card */}
      <Card className="rounded-2xl border-border bg-card shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Store className="size-5" />
            <CardTitle className="text-base font-bold text-foreground">
              স্টোর সাধারণ তথ্য
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            আপনার ব্র্যান্ড নাম ও কাস্টমারদের জন্য যোগাযোগের তথ্য।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storeName" className="text-xs font-semibold">
                স্টোরের নাম
              </Label>
              <Input
                id="storeName"
                value={formData.storeName}
                onChange={(e) =>
                  setFormData({ ...formData, storeName: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storeEmail" className="text-xs font-semibold">
                সাপোর্ট ইমেইল
              </Label>
              <Input
                id="storeEmail"
                type="email"
                value={formData.storeEmail}
                onChange={(e) =>
                  setFormData({ ...formData, storeEmail: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storePhone" className="text-xs font-semibold">
                হটলাইন / মোবাইল
              </Label>
              <Input
                id="storePhone"
                value={formData.storePhone}
                onChange={(e) =>
                  setFormData({ ...formData, storePhone: e.target.value })
                }
                placeholder="018XXXXXXXX"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whatsappNumber" className="text-xs font-semibold">
                হোয়াটসঅ্যাপ নম্বর (কান্ট্রি কোড সহ)
              </Label>
              <Input
                id="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={(e) =>
                  setFormData({ ...formData, whatsappNumber: e.target.value })
                }
                placeholder="88018XXXXXXXX"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="storeAddress" className="text-xs font-semibold">
              অফিস / গুদামের ঠিকানা
            </Label>
            <Input
              id="storeAddress"
              value={formData.storeAddress}
              onChange={(e) =>
                setFormData({ ...formData, storeAddress: e.target.value })
              }
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Shipping & Delivery Rates Card */}
      <Card className="rounded-2xl border-border bg-card shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Truck className="size-5" />
            <CardTitle className="text-base font-bold text-foreground">
              ডেলিভারি চার্জ ও ফ্রি শিপিং
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            চেকআউটে এলাকা অনুযায়ী স্বয়ংক্রিয়ভাবে শিপিং ফি গণনা হবে।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="insideDhakaFee" className="text-xs font-semibold">
                ঢাকার ভেতরে ডেলিভারি চার্জ (৳)
              </Label>
              <Input
                id="insideDhakaFee"
                type="number"
                value={formData.insideDhakaFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    insideDhakaFee: Number(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="outsideDhakaFee"
                className="text-xs font-semibold"
              >
                ঢাকার বাইরে ডেলিভারি চার্জ (৳)
              </Label>
              <Input
                id="outsideDhakaFee"
                type="number"
                value={formData.outsideDhakaFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    outsideDhakaFee: Number(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="freeShippingMinAmount"
                className="text-xs font-semibold"
              >
                ফ্রি শিপিং ন্যূনতম অর্ডার (৳)
              </Label>
              <Input
                id="freeShippingMinAmount"
                type="number"
                value={formData.freeShippingMinAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    freeShippingMinAmount: Number(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="rounded-xl bg-emerald-600 font-bold text-white shadow-md hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all"
        >
          <Save className="size-4" />
          <span>{isLoading ? "সংরক্ষণ হচ্ছে..." : "সেটিংস সংরক্ষণ করুন"}</span>
        </Button>
      </div>
    </form>
  );
}
