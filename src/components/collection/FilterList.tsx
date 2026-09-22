"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { SortFilterItem } from "@/lib/constants";
import { cn, createUrl } from "@/lib/utils";

type PathFilterItem = { title: string; path: string };
type Item = SortFilterItem | PathFilterItem;

function isPathFilterItem(item: Item): item is PathFilterItem {
  return "path" in item;
}

export function FilterList({ list, title }: { list: Item[]; title?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav className="w-full">
      {title ? (
        <h3 className="hidden text-xs font-bold uppercase tracking-wider text-muted-foreground md:block mb-3">
          {title}
        </h3>
      ) : null}

      {/* Mobile Horizontal Pill Scroll */}
      <ul className="flex md:hidden gap-1.5 overflow-x-auto pb-1.5 pt-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {list.map((item: Item) => {
          let href = "";
          let active = false;

          if (isPathFilterItem(item)) {
            href = item.path;
            active = pathname === item.path;
          } else {
            const q = searchParams.get("q");
            const newParams = new URLSearchParams(searchParams.toString());
            if (item.slug) {
              newParams.set("sort", item.slug);
            } else {
              newParams.delete("sort");
            }
            if (q) newParams.set("q", q);
            href = createUrl(pathname, newParams);
            active = searchParams.get("sort") === item.slug;
          }

          return (
            <li key={"path" in item ? item.path : (item.slug ?? "default")}>
              <Link
                prefetch={true}
                href={href}
                className={cn(
                  "inline-block whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold border transition-all duration-150",
                  active
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-muted/40 text-foreground/80 border-border/80 hover:bg-muted hover:text-foreground",
                )}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Desktop Vertical List */}
      <ul className="hidden md:flex flex-col gap-1.5 py-1">
        {list.map((item: Item) => {
          let href = "";
          let active = false;

          if (isPathFilterItem(item)) {
            href = item.path;
            active = pathname === item.path;
          } else {
            const q = searchParams.get("q");
            const newParams = new URLSearchParams(searchParams.toString());
            if (item.slug) {
              newParams.set("sort", item.slug);
            } else {
              newParams.delete("sort");
            }
            if (q) newParams.set("q", q);
            href = createUrl(pathname, newParams);
            active = searchParams.get("sort") === item.slug;
          }

          return (
            <li key={"path" in item ? item.path : (item.slug ?? "default")}>
              <Link
                prefetch={true}
                href={href}
                className={cn(
                  "block rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
