"use client";

import { useState } from "react";
import { Check, Copy, Add as Plus, Tag, Trash2 } from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Coupon } from "@/lib/db/schema";

export function CouponsManager({
  initialCoupons,
}: {
  initialCoupons: Coupon[];
}) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 500,
    maxDiscountAmount: "",
    usageLimit: "",
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "কুপন তৈরি ব্যর্থ হয়েছে।");

      setCoupons((prev) => [data.coupon, ...prev]);
      setIsOpen(false);
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: 10,
        minOrderAmount: 500,
        maxDiscountAmount: "",
        usageLimit: "",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "কুপন তৈরি ব্যর্থ হয়েছে।");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });

      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, isActive: !currentStatus } : c,
          ),
        );
      }
    } catch (err) {
      console.error("Toggle coupon failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই কুপনটি মুছে ফেলতে চান?")) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Delete coupon failed:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            কুপন ও ডিসকাউন্ট ভাউচার
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            মোট {coupons.length}টি কুপন কোড তালিকাভুক্ত আছে।
          </p>
        </div>

        <ResponsiveDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          title="নতুন কুপন কোড তৈরি"
          description="কুপন কোড, ডিসকাউন্টের পরিমাণ ও শর্তাবলী পূরণ করুন।"
          trigger={
            <Button
              size="sm"
              className="rounded-xl bg-emerald-600 font-bold text-white shadow-xs hover:bg-emerald-500"
            >
              <Plus className="size-4" />
              <span>নতুন কুপন</span>
            </Button>
          }
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
            {error && (
              <div className="rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/30 p-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <Label htmlFor="code" className="text-xs sm:text-sm font-semibold text-foreground/90">
                কুপন কোড (যেমন: EID10, HEALTH20)
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="EID10"
                required
                className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs sm:text-sm font-semibold text-foreground/90">ডিসকাউন্ট ধরন</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(val) =>
                    setFormData({ ...formData, discountType: val ?? "percentage" })
                  }
                >
                  <SelectTrigger className="w-full h-10 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="percentage">শতকরা হার (%)</SelectItem>
                      <SelectItem value="fixed">নির্দিষ্ট টাকা (৳)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="discountValue"
                  className="text-xs sm:text-sm font-semibold text-foreground/90"
                >
                  {formData.discountType === "percentage"
                    ? "ডিসকাউন্ট (%)"
                    : "ডিসকাউন্ট (৳)"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountValue: Number(e.target.value),
                    })
                  }
                  required
                  className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="minOrderAmount"
                  className="text-xs sm:text-sm font-semibold text-foreground/90"
                >
                  ন্যূনতম অর্ডার (৳)
                </Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minOrderAmount: Number(e.target.value),
                    })
                  }
                  className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="maxDiscountAmount"
                  className="text-xs sm:text-sm font-semibold text-foreground/90"
                >
                  সর্বোচ্চ ছাড় (৳, ঐচ্ছিক)
                </Label>
                <Input
                  id="maxDiscountAmount"
                  type="number"
                  value={formData.maxDiscountAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDiscountAmount: e.target.value,
                    })
                  }
                  placeholder="সীমাহীন"
                  className="h-10 text-xs sm:text-sm px-3 rounded-lg sm:rounded-xl font-mono"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-10 sm:h-11 w-full rounded-lg sm:rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-500 text-xs sm:text-sm"
            >
              {isLoading ? "তৈরি হচ্ছে..." : "কুপন কোড প্রকাশ করুন"}
            </Button>
          </form>
        </ResponsiveDialog>
      </div>

      {coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 sm:p-12 text-center bg-card">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-3">
            <Tag className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            কোনো কুপন তৈরি করা হয়নি
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            কাস্টমারদের আকৃষ্ট করতে প্রোমোকোড ও ছাড় অফার তৈরি করুন।
          </p>
        </div>
      ) : (
        <Card className="rounded-2xl border-border bg-card shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-bold text-xs">কুপন কোড</TableHead>
                <TableHead className="font-bold text-xs">ডিসকাউন্ট</TableHead>
                <TableHead className="font-bold text-xs">শর্তাবলী</TableHead>
                <TableHead className="font-bold text-xs">স্ট্যাটাস</TableHead>
                <TableHead className="text-right font-bold text-xs">
                  অ্যাকশন
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id} className="border-border">
                  <TableCell className="font-bold">
                    <div className="flex items-center gap-2">
                      <span className="font-mono bg-muted/60 px-2 py-1 rounded-lg border border-border text-xs text-foreground font-extrabold">
                        {coupon.code}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(coupon.code)}
                        className="size-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
                        title="কপি করুন"
                      >
                        {copiedCode === coupon.code ? (
                          <Check className="size-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% ছাড়`
                      : `৳${coupon.discountValue} ছাড়`}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    ন্যূনতম অর্ডার ৳{coupon.minOrderAmount}
                    {coupon.maxDiscountAmount
                      ? ` (সর্বোচ্চ ৳${coupon.maxDiscountAmount})`
                      : ""}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleActive(coupon.id, coupon.isActive)
                      }
                      className={`cursor-pointer rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                        coupon.isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                      }`}
                    >
                      {coupon.isActive ? "সক্রিয় (Active)" : "নিষ্ক্রিয় (Off)"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(coupon.id)}
                      className="size-8 p-0 text-muted-foreground hover:text-red-500 rounded-lg"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
