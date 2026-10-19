import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Package, Receipt } from "@/components/icons";
import { QuickList, type QuickListItem } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";

export const metadata = {
  title: "আমার অর্ডারসমূহ | স্বাস্থ্যকর",
  description: "আপনার অতীত ও সাম্প্রতিক অর্ডারসমূহের তালিকা ও ট্র্যাকিং।",
};

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "success" | "warning" | "destructive" | "default" | "secondary";
  }
> = {
  confirmed: {
    label: "কনফার্মড",
    variant: "default",
  },
  pending: {
    label: "অপেক্ষমান",
    variant: "warning",
  },
  shipped: {
    label: "ডেলিভারিতে",
    variant: "warning",
  },
  delivered: {
    label: "ডেলিভার্ড",
    variant: "success",
  },
  cancelled: {
    label: "বাতিল",
    variant: "destructive",
  },
};

export default async function UserOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/orders");

  const userOrders = await db.query.orders.findMany({
    where: user.email ? eq(orders.email, user.email) : undefined,
    orderBy: (o, { desc: d }) => [d(o.createdAt)],
  });

  const quickListItems: QuickListItem[] = userOrders.map((ord) => {
    const itemCount = ord.items.reduce((s, i) => s + i.quantity, 0);
    const firstTitle = ord.items[0]?.productTitle ?? "পণ্য";
    const moreCount = ord.items.length - 1;
    const status = STATUS_MAP[ord.status] ?? {
      label: ord.status,
      variant: "secondary" as const,
    };

    return {
      id: ord.id,
      title: `অর্ডার #${ord.id.slice(0, 8).toUpperCase()}`,
      subtitle:
        moreCount > 0 ? `${firstTitle} সহ আরও ${moreCount}টি পণ্য` : firstTitle,
      icon: (
        <Receipt className="size-5 text-emerald-600 dark:text-emerald-400" />
      ),
      badgeText: status.label,
      badgeVariant: status.variant,
      tags: [
        {
          icon: <Calendar className="size-3 text-muted-foreground" />,
          text: new Date(ord.createdAt).toLocaleDateString("bn-BD", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        },
        {
          icon: <Package className="size-3 text-muted-foreground" />,
          text: `${itemCount}টি আইটেম`,
        },
        {
          text: `মোট ৳${ord.totalAmount.toFixed(2)}`,
          variant: "primary",
        },
      ],
      actions: (
        <Link
          href={`/order/${ord.id}`}
          className="inline-flex items-center justify-center h-8 rounded-xl px-3 text-xs font-semibold border border-border bg-background shadow-xs hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          বিস্তারিত দেখুন
        </Link>
      ),
    };
  });

  return (
    <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
            আমার অর্ডারসমূহ
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            আপনার সকল অর্ডার ট্র্যাকিং এবং ডেলিভারি স্ট্যাটাস দেখুন।
          </p>
        </div>
      </div>

      {userOrders.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>এখনো কোনো অর্ডার নেই</EmptyTitle>
            <EmptyDescription>
              আপনার পছন্দের স্বাস্থ্যকর পণ্য অর্ডার করতে শপ ব্রাউজ করুন।
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <QuickList items={quickListItems} />
      )}
    </div>
  );
}
