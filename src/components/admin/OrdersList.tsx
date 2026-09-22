"use client";

import { useMemo, useState } from "react";
import { Calendar, Package, SearchNormal, Sms } from "@/components/icons";
import { ListCard } from "@/components/shared";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type AdminOrderItem, ManageOrderDialog } from "./ManageOrderDialog";

const STATUS_MAP: Record<
  string,
  {
    label: string;
    className: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  confirmed: {
    label: "কনফার্মড",
    variant: "outline",
    className:
      "border bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  },
  shipped: {
    label: "ডেলিভারিতে",
    variant: "outline",
    className:
      "border bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  },
  delivered: {
    label: "ডেলিভার্ড",
    variant: "outline",
    className:
      "border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  },
  cancelled: {
    label: "বাতিল",
    variant: "destructive",
    className:
      "border bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  },
};

export function OrdersList({ orders }: { orders: AdminOrderItem[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(
    () =>
      orders.filter((ord) => {
        const q = query.toLowerCase();
        const matchSearch =
          ord.id.toLowerCase().includes(q) ||
          ord.email?.toLowerCase().includes(q) ||
          String(ord.totalAmount).includes(q);
        const matchStatus =
          statusFilter === "all" || ord.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [orders, query, statusFilter],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <SearchNormal className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="অর্ডার খুঁজুন (আইডি, ইমেইল বা পরিমাণ)..."
            className="pl-10 rounded-xl bg-card"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl bg-card text-sm">
            <SelectValue placeholder="স্ট্যাটাস ফিল্টার" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">সকল স্ট্যাটাস</SelectItem>
              <SelectItem value="confirmed">কনফার্মড</SelectItem>
              <SelectItem value="shipped">ডেলিভারিতে</SelectItem>
              <SelectItem value="delivered">ডেলিভার্ড</SelectItem>
              <SelectItem value="cancelled">বাতিল</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
          {query || statusFilter !== "all"
            ? "অনুসন্ধানের সাথে মেলে এমন কোনো অর্ডার পাওয়া যায়নি।"
            : "এখনো কোনো অর্ডার আসেনি। গ্রাহকরা পণ্য অর্ডার করলে তা এখানে প্রদর্শিত হবে।"}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => {
            const status = STATUS_MAP[order.status] ?? {
              label: order.status,
              variant: "outline" as const,
              className: "",
            };

            return (
              <div key={order.id} className="relative">
                <ListCard
                  title={`অর্ডার #${order.id.slice(0, 8).toUpperCase()}`}
                  badges={[
                    {
                      label: status.label,
                      variant: status.variant,
                      className: cn("font-semibold", status.className),
                    },
                  ]}
                  subtitle={`৳${order.totalAmount.toLocaleString("bn-BD")}`}
                  metaItems={[
                    {
                      icon: <Sms className="size-3.5" />,
                      value: order.email ?? "অতিথি গ্রাহক",
                    },
                    {
                      icon: <Package className="size-3.5" />,
                      label: "পণ্য:",
                      value: `${order.itemsCount}টি`,
                    },
                    {
                      icon: <Calendar className="size-3.5" />,
                      value: new Date(order.createdAt).toLocaleDateString(
                        "bn-BD",
                        { year: "numeric", month: "short", day: "numeric" },
                      ),
                    },
                  ]}
                  contentClassName="pr-14"
                />
                {/* Manage button sits at the top-right of the card */}
                <div className="absolute top-3 right-3">
                  <ManageOrderDialog order={order} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
