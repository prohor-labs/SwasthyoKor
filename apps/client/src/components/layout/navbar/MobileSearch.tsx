"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Loader,
  Search as SearchIcon,
  TrendUp,
} from "@/components/icons";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { Product } from "@/lib/types";
import { createUrl } from "@/lib/utils";

const POPULAR_SEARCHES = [
  { label: "খাঁটি মধু", query: "মধু" },
  { label: "সরিষার তেল", query: "তেল" },
  { label: "গাওয়া ঘি", query: "ঘি" },
  { label: "চিয়া সিড", query: "চিয়া" },
  { label: "ড্রাই ফ্রুটস", query: "বাদাম" },
  { label: "কালোজিরা তেল", query: "কালোজিরা" },
];

export function MobileSearch() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Mobile live search error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchTerm]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (searchTerm.trim()) {
      const newParams = new URLSearchParams();
      newParams.set("q", searchTerm.trim());
      router.push(createUrl("/search", newParams));
      setOpen(false);
    }
  }

  const handlePopularClick = (query: string) => {
    const newParams = new URLSearchParams();
    newParams.set("q", query);
    router.push(createUrl("/search", newParams));
    setOpen(false);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      title="পণ্য অনুসন্ধান"
      description="আপনার প্রয়োজনীয় খাঁটি অর্গানিক পণ্য খুঁজুন"
      trigger={
        <button
          type="button"
          aria-label="পণ্য খুঁজুন"
          className="relative flex size-9 sm:size-10 md:size-11 items-center justify-center rounded-lg border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer shrink-0 md:hidden"
        >
          <SearchIcon className="size-4 sm:size-5 transition-all ease-in-out hover:scale-110" />
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <form onSubmit={onSubmit} className="w-full">
          <InputGroup className="rounded-xl border bg-background text-sm shadow-xs focus-within:border-emerald-500">
            <InputGroupInput
              type="search"
              name="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="পণ্য খুঁজুন (যেমন: মধু, ঘি, তেল)..."
              autoFocus
              className="px-3.5 py-2.5"
            />
            <InputGroupAddon align="inline-end" className="pr-3">
              {isLoading ? (
                <Loader className="size-4 animate-spin text-emerald-600" />
              ) : (
                <button
                  type="submit"
                  aria-label="Search"
                  className="cursor-pointer"
                >
                  <SearchIcon className="size-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </InputGroupAddon>
          </InputGroup>
        </form>

        {/* Live Search Results */}
        {searchTerm.trim().length >= 2 ? (
          <div>
            {results.length > 0 ? (
              <div className="flex flex-col">
                <div className="mb-2 text-xs font-bold text-muted-foreground">
                  তাৎক্ষণিক ফলাফল:
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1.5 [scrollbar-width:none]">
                  {results.map((product) => (
                    <Link
                      key={product.handle}
                      href={`/product/${product.handle}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-2 transition-colors hover:border-emerald-500/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30"
                    >
                      <div className="relative size-12 flex-none overflow-hidden rounded-lg border border-border/60 bg-muted">
                        {product.featuredImage?.url ? (
                          <Image
                            src={product.featuredImage.url}
                            alt={product.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col overflow-hidden">
                        <span className="line-clamp-1 text-xs font-semibold text-foreground">
                          {product.title}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          ৳{product.priceRange.minVariantPrice.amount}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={onSubmit as unknown as React.MouseEventHandler}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  <span>&quot;{searchTerm}&quot; এর সকল ফলাফল দেখুন</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            ) : !isLoading ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                &quot;{searchTerm}&quot; দিয়ে কোনো পণ্য পাওয়া যায়নি
              </div>
            ) : null}
          </div>
        ) : (
          /* Popular Search Suggestions */
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <TrendUp className="size-3.5" />
              <span>জনপ্রিয় সার্চ:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SEARCHES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handlePopularClick(item.query)}
                  className="rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ResponsiveDialog>
  );
}
