"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Loader, Search as SearchIcon } from "@/components/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import type { Product } from "@/lib/types";
import { createUrl } from "@/lib/utils";

export default function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams?.get("q") || "");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(searchParams?.get("q") || "");
  }, [searchParams]);

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
          setIsOpen(true);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Live search error:", err);
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsOpen(false);
    const newParams = new URLSearchParams(searchParams?.toString() || "");

    if (searchTerm.trim()) {
      newParams.set("q", searchTerm.trim());
    } else {
      newParams.delete("q");
    }

    router.push(createUrl("/search", newParams));
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={onSubmit} className="w-full">
        <InputGroup className="rounded-xl border bg-card text-sm shadow-xs transition-colors focus-within:border-emerald-500">
          <InputGroupInput
            type="search"
            name="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.trim().length >= 2) setIsOpen(true);
            }}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder="পণ্য খুঁজুন (Search products...)"
            autoComplete="off"
            className="px-3.5 py-2 placeholder:text-muted-foreground"
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

      {/* Live Search Autocomplete Dropdown */}
      {isOpen && searchTerm.trim().length >= 2 && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-2xl border border-border/80 bg-popover text-popover-foreground shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150">
          {results.length > 0 ? (
            <div className="flex flex-col p-1.5">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
                তাৎক্ষণিক ফলাফল:
              </div>
              <ul className="divide-y divide-border/40">
                {results.map((product) => (
                  <li key={product.handle}>
                    <Link
                      href={`/product/${product.handle}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/60"
                    >
                      <div className="relative size-11 flex-none overflow-hidden rounded-lg border border-border/60 bg-muted">
                        {product.featuredImage?.url ? (
                          <Image
                            src={product.featuredImage.url}
                            alt={product.title}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col overflow-hidden">
                        <span className="line-clamp-1 text-xs font-semibold text-foreground">
                          {product.title}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          ৳{product.priceRange.minVariantPrice.amount}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border/60 p-1.5 mt-1">
                <button
                  type="button"
                  onClick={onSubmit as unknown as React.MouseEventHandler}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-muted/40 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 dark:text-emerald-400 transition-colors cursor-pointer"
                >
                  <span>&quot;{searchTerm}&quot; এর সকল ফলাফল দেখুন</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          ) : !isLoading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              &quot;{searchTerm}&quot; দিয়ে কোনো পণ্য পাওয়া যায়নি
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="w-full">
      <InputGroup className="rounded-xl border bg-card text-sm">
        <InputGroupInput
          placeholder="পণ্য খুঁজুন..."
          disabled
          className="px-3.5 py-2"
        />
        <InputGroupAddon align="inline-end" className="pr-3">
          <SearchIcon className="size-4 text-muted-foreground" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
