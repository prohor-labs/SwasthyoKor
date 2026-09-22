"use client";

import { useState, useTransition } from "react";
import { Edit } from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { updateOrderStatusAction } from "@/lib/actions/admin";

export interface OrderDetailItem {
  productHandle: string;
  productTitle: string;
  variantTitle?: string;
  quantity: number;
  priceAmount: number;
  priceCurrency: string;
}

export interface AdminOrderItem {
  id: string;
  email?: string | null;
  phone?: string | null;
  customerName?: string | null;
  shippingAddress?: string | null;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentTrxId?: string | null;
  paymentSenderNumber?: string | null;
  totalAmount: number;
  totalCurrency: string;
  status: string;
  createdAt: Date;
  itemsCount: number;
  items: OrderDetailItem[];
}

export function ManageOrderDialog({ order }: { order: AdminOrderItem }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await updateOrderStatusAction(order.id, status);
      if (res.success) {
        setOpen(false);
      } else {
        setError(res.error || "অর্ডার স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
      }
    });
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "confirmed":
        return <Badge variant="default">কনফার্মড</Badge>;
      case "shipped":
        return <Badge variant="secondary">ডেলিভারিতে</Badge>;
      case "delivered":
        return (
          <Badge variant="default" className="bg-emerald-600">
            ডেলিভার্ড
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">বাতিল</Badge>;
      default:
        return <Badge variant="outline">{st}</Badge>;
    }
  };

  const isPaid = order.paymentStatus === "paid";

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      title={`অর্ডার #${order.id.slice(0, 8)} পরিচালনা`}
      description="অর্ডারের বিস্তারিত বিবরণ দেখুন ও স্ট্যাটাস পরিবর্তন করুন।"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="text-foreground hover:bg-muted cursor-pointer rounded-xl"
          title="অর্ডার পরিচালনা করুন"
        >
          <Edit className="size-4" />
        </Button>
      }
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleUpdate} className="flex flex-col gap-3 sm:gap-4">
        {/* ─── Order Summary ─── */}
        <div className="rounded-xl sm:rounded-2xl border border-border bg-muted/40 p-2.5 sm:p-3.5 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">অর্ডার তারিখ:</span>
            <span className="font-semibold text-foreground">
              {new Date(order.createdAt).toLocaleString("bn-BD")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">গ্রাহকের নাম:</span>
            <span className="font-medium text-foreground">
              {order.customerName || "উল্লেখ নেই"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">মোবাইল নম্বর:</span>
            <span className="font-mono text-foreground">
              {order.phone || "উল্লেখ নেই"}
            </span>
          </div>
          {order.shippingAddress ? (
            <div className="flex items-start justify-between">
              <span className="text-muted-foreground">ঠিকানা:</span>
              <span className="font-medium text-right text-foreground max-w-[180px] sm:max-w-[240px]">
                {order.shippingAddress}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">পেমেন্ট মেথড:</span>
            <span className="font-semibold uppercase text-[10px] sm:text-xs px-2 py-0.5 rounded bg-muted">
              {order.paymentMethod || "ONLINE"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">পেমেন্ট স্ট্যাটাস:</span>
            <span
              className={`font-semibold text-[10px] sm:text-xs px-2 py-0.5 rounded ${
                isPaid
                  ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
              }`}
            >
              {isPaid ? "পরিশোধিত (Paid)" : "বকেয়া (Pending)"}
            </span>
          </div>
          {order.paymentTrxId ? (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trx ID:</span>
              <span className="font-mono text-[11px] sm:text-xs font-bold text-foreground">
                {order.paymentTrxId}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">বর্তমান স্ট্যাটাস:</span>
            <span>{getStatusBadge(order.status)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-2">
            <span className="font-bold text-foreground">সর্বমোট মূল্য:</span>
            <span className="font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
              ৳{order.totalAmount.toLocaleString("bn-BD")}
            </span>
          </div>
        </div>

        {/* ─── Order Items List ─── */}
        <div>
          <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            অর্ডারের আইটেমসমূহ ({order.items.length})
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-border/40 rounded-lg sm:rounded-xl border border-border bg-card p-2">
            {order.items.map((item, idx) => (
              <div
                key={`${item.productHandle}-${idx}`}
                className="flex items-center justify-between pt-1.5 first:pt-0 text-xs sm:text-sm"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="font-semibold text-foreground truncate">
                    {item.productTitle}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                    পরিমাণ: {item.quantity} | মূল্য: ৳{item.priceAmount}
                  </p>
                </div>
                <div className="font-bold text-foreground shrink-0 text-xs sm:text-sm">
                  ৳{(item.priceAmount * item.quantity).toLocaleString("bn-BD")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Status Update Select ─── */}
        <FieldGroup className="gap-2">
          <Field>
            <FieldLabel
              htmlFor={`order-status-${order.id}`}
              className="text-xs sm:text-sm font-semibold text-foreground/90"
            >
              স্ট্যাটাস পরিবর্তন করুন
            </FieldLabel>
            <Select
              value={status}
              onValueChange={(val) => {
                if (val) setStatus(val);
              }}
            >
              <SelectTrigger
                id={`order-status-${order.id}`}
                className="w-full h-10 rounded-lg sm:rounded-xl text-xs sm:text-sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="confirmed">কনফার্মড (Confirmed)</SelectItem>
                  <SelectItem value="shipped">ডেলিভারিতে পাঠানো হয়েছে (Shipped)</SelectItem>
                  <SelectItem value="delivered">ডেলিভার্ড সম্পন্ন (Delivered)</SelectItem>
                  <SelectItem value="cancelled">অর্ডার বাতিল (Cancelled)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="h-10 text-xs sm:text-sm rounded-lg sm:rounded-xl px-4"
          >
            বাতিল
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="h-10 text-xs sm:text-sm rounded-lg sm:rounded-xl px-5 cursor-pointer"
          >
            {isPending ? (
              <>
                <Spinner data-icon="inline-start" className="size-4" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              "আপডেট করুন"
            )}
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
