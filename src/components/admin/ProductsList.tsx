"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, SearchNormal, Trash2 } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  deleteProductAction,
  toggleProductAvailabilityAction,
} from "@/lib/actions/admin";
import { calculateTotalStock, getProductUnitLabel } from "@/lib/types";
import { EditProductDialog, type EditProductItem } from "./EditProductDialog";
import { QuickList, type QuickListItem } from "./QuickList";

export function ProductsList({
  products,
  collections = [],
}: {
  products: EditProductItem[];
  collections?: { id: string; title: string }[];
}) {
  const [query, setQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<
    "all" | "in_stock" | "low_stock" | "out_of_stock"
  >("all");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?")) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteProductAction(id);
      setDeletingId(null);
    });
  };

  const handleToggleStock = (id: string, currentAvailable: boolean) => {
    setTogglingId(id);
    startTransition(async () => {
      await toggleProductAvailabilityAction(id, !currentAvailable);
      setTogglingId(null);
    });
  };

  const collectionMap = useMemo(
    () => new Map(collections.map((c) => [c.id, c.title])),
    [collections],
  );

  const inStockCount = useMemo(
    () =>
      products.filter((p) => {
        const qty = p.inventoryQuantity ?? 15;
        return p.available && qty > 5;
      }).length,
    [products],
  );
  const lowStockCount = useMemo(
    () =>
      products.filter((p) => {
        const qty = p.inventoryQuantity ?? 15;
        return p.available && qty > 0 && qty <= 5;
      }).length,
    [products],
  );
  const outOfStockCount = useMemo(
    () =>
      products.filter((p) => {
        const qty = p.inventoryQuantity ?? 15;
        return !p.available || qty <= 0;
      }).length,
    [products],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.handle.toLowerCase().includes(query.toLowerCase()) ||
        item.price.includes(query);

      const matchCategory =
        selectedCollection === "all" ||
        item.collectionId === selectedCollection;

      const qty = item.inventoryQuantity ?? 15;
      const isAvailable = item.available && qty > 0;

      const matchStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && isAvailable && qty > 5) ||
        (stockFilter === "low_stock" && isAvailable && qty <= 5) ||
        (stockFilter === "out_of_stock" && !isAvailable);

      return matchSearch && matchCategory && matchStock;
    });
  }, [products, query, selectedCollection, stockFilter]);

  const items: QuickListItem[] = filteredProducts.map((item) => {
    const colTitle = item.collectionId
      ? collectionMap.get(item.collectionId)
      : undefined;

    const qty = item.inventoryQuantity ?? 15;
    const isAvailable = item.available && qty > 0;

    let badgeText = "ইন স্টক";
    let badgeVariant: QuickListItem["badgeVariant"] = "success";

    if (!isAvailable) {
      badgeText = `স্টক শেষ (${qty})`;
      badgeVariant = "destructive";
    } else if (qty <= 5) {
      badgeText = `⚡ মাত্র ${qty}টি বাকি`;
      badgeVariant = "default";
    } else {
      badgeText = `ইন স্টক (${qty} টি)`;
      badgeVariant = "success";
    }

    const priceLabel = `৳${item.price}`;

    return {
      id: item.id,
      title: item.title,
      subtitle: `/${item.handle}`,
      logoUrl: item.imageUrl,
      badgeText,
      badgeVariant,
      tags: [
        {
          text: priceLabel,
          variant: "default",
        },
        ...(item.unit
          ? [
              {
                text: getProductUnitLabel(item.unit),
                variant: "secondary" as const,
              },
            ]
          : []),
        ...(item.compareAtPrice &&
        Number(item.compareAtPrice) > Number(item.price)
          ? [
              {
                text: `পূর্বের: ৳${item.compareAtPrice}`,
                variant: "secondary" as const,
              },
            ]
          : []),
        ...(item.variants && item.variants.length > 0
          ? [
              {
                text: `${item.variants.length}টি প্যাক (${item.variants
                  .map((v) => `${v.title || "প্যাক"}: ${v.inventoryQuantity ?? 0}`)
                  .join(", ")}) — মোট স্টক: ${
                  calculateTotalStock(
                    item.variants,
                    (item.unit as any) || "gram",
                  ).totalBulkFormatted
                }`,
                variant: "secondary" as const,
              },
            ]
          : []),
        ...(colTitle
          ? [
              {
                text: colTitle,
                variant: "secondary" as const,
              },
            ]
          : []),
      ],

      actions: (
        <div className="flex items-center gap-1.5 flex-wrap justify-end">

          {/* Quick Stock Toggle Button */}
          <Button
            type="button"
            variant={isAvailable ? "default" : "outline"}
            size="sm"
            disabled={isPending && togglingId === item.id}
            onClick={() => handleToggleStock(item.id, isAvailable)}
            className={`h-7 px-2.5 rounded-full text-xs font-semibold cursor-pointer ${
              isAvailable
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "text-muted-foreground"
            }`}
            title={isAvailable ? "স্টক শেষ মার্ক করুন" : "ইন স্টক মার্ক করুন"}
          >
            {togglingId === item.id ? (
              <Spinner className="size-3 mr-1" />
            ) : isAvailable ? (
              <Check className="size-3 mr-1" />
            ) : null}
            <span>{isAvailable ? "ইন স্টক" : "স্টক শেষ"}</span>
          </Button>

          <EditProductDialog product={item} collections={collections} />

          <Button
            variant="ghost"
            size="sm"
            disabled={isPending && deletingId === item.id}
            onClick={() => handleDelete(item.id)}
            className="text-destructive hover:bg-destructive/10 cursor-pointer rounded-xl h-8 w-8 p-0"
            title="মুছে ফেলুন"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    };
  });

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Search, Category & Stock Filter Bar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <SearchNormal className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="পণ্য খুঁজুন (নাম, হ্যান্ডেল অথবা মূল্য)..."
            className="pl-10 rounded-xl bg-card"
          />
        </div>

        {collections.length > 0 && (
          <Select
            value={selectedCollection}
            onValueChange={(val) => setSelectedCollection(val ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl bg-card text-sm">
              <SelectValue placeholder="সকল ক্যাটাগরি" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">সকল ক্যাটাগরি</SelectItem>
                {collections.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* ─── Stock Status Filter Tabs ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Button
          type="button"
          variant={stockFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStockFilter("all")}
          className="rounded-full text-xs h-7 px-3 cursor-pointer"
        >
          সকল পণ্য ({products.length})
        </Button>
        <Button
          type="button"
          variant={stockFilter === "in_stock" ? "default" : "outline"}
          size="sm"
          onClick={() => setStockFilter("in_stock")}
          className="rounded-full text-xs h-7 px-3 cursor-pointer"
        >
          ইন স্টক ({inStockCount})
        </Button>
        <Button
          type="button"
          variant={stockFilter === "low_stock" ? "default" : "outline"}
          size="sm"
          onClick={() => setStockFilter("low_stock")}
          className="rounded-full text-xs h-7 px-3 cursor-pointer border-amber-500/40 text-amber-600 dark:text-amber-400"
        >
          ⚡ কম স্টক ({lowStockCount})
        </Button>
        <Button
          type="button"
          variant={stockFilter === "out_of_stock" ? "default" : "outline"}
          size="sm"
          onClick={() => setStockFilter("out_of_stock")}
          className="rounded-full text-xs h-7 px-3 cursor-pointer"
        >
          স্টক শেষ ({outOfStockCount})
        </Button>
      </div>

      {/* ─── Products QuickList ─── */}
      <QuickList
        items={items}
        emptyMessage={
          query || selectedCollection !== "all" || stockFilter !== "all"
            ? "অনুসন্ধানের সাথে মেলে এমন কোনো পণ্য পাওয়া যায়নি।"
            : "কোনো পণ্য পাওয়া যায়নি। আপনার স্টোরে পণ্য যোগ করতে 'নতুন পণ্য যোগ করুন' বাটনে ক্লিক করুন।"
        }
      />
    </div>
  );
}
