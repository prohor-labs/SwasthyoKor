"use client";

import Image from "next/image";
import type * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface QuickListTag {
  icon?: React.ReactNode;
  text: React.ReactNode;
  variant?: "destructive" | "secondary" | "default";
}

export interface QuickListItem {
  id?: string | number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  logoUrl?: string | null;
  badgeText?: React.ReactNode;
  badgeVariant?:
    | "success"
    | "destructive"
    | "warning"
    | "default"
    | "secondary";
  tags?: QuickListTag[];
  actions?: React.ReactNode;
  onClick?: () => void;
}

export interface QuickListProps {
  items: QuickListItem[];
  className?: string;
  emptyMessage?: string;
}

export function QuickList({ items, className, emptyMessage }: QuickListProps) {
  if (items.length === 0 && emptyMessage) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground bg-muted/20 border border-dashed rounded-2xl">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      {items.map((item) => {
        const isSuccess = item.badgeVariant === "success";
        const isDestructive = item.badgeVariant === "destructive";
        const itemKey =
          item.id != null
            ? String(item.id)
            : typeof item.title === "string"
              ? item.title
              : "item";

        return (
          <Card
            key={itemKey}
            onClick={item.onClick}
            className={cn(
              "py-0 gap-0 border shadow-2xs transition-all duration-200 rounded-2xl",
              isSuccess &&
                "border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10 hover:border-emerald-500/50",
              isDestructive &&
                "border-border bg-card hover:border-destructive/30",
              !isSuccess &&
                !isDestructive &&
                "border-border bg-card hover:border-emerald-500/40",
              item.onClick && "cursor-pointer",
            )}
          >
            <CardContent className="p-3 sm:p-4 flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {item.logoUrl ? (
                    <div
                      className={cn(
                        "relative size-12 sm:size-14 rounded-xl overflow-hidden border border-border bg-muted shrink-0 shadow-2xs",
                        isSuccess && "border-emerald-500/30",
                        isDestructive && "border-destructive/20",
                      )}
                    >
                      <Image
                        src={item.logoUrl}
                        alt={
                          typeof item.title === "string"
                            ? item.title
                            : "Product"
                        }
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative size-12 sm:size-14 rounded-xl border border-border bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 shadow-2xs">
                      পণ্য
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-sm sm:text-base text-foreground leading-snug break-words line-clamp-2">
                      {item.title}
                    </h5>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground font-mono leading-tight break-words line-clamp-1 mt-1">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {item.badgeText && (
                    <span
                      className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-xl border shrink-0",
                        isSuccess &&
                          "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                        isDestructive &&
                          "text-destructive bg-destructive/10 border-destructive/20",
                        !isSuccess &&
                          !isDestructive &&
                          "text-primary bg-primary/10 border-primary/20",
                      )}
                    >
                      {item.badgeText}
                    </span>
                  )}
                  {item.actions}
                </div>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
                  {item.tags.map((tag, tagIndex) => {
                    const tagKey =
                      typeof tag.text === "string"
                        ? tag.text
                        : `tag-${tagIndex}`;
                    return (
                      <span
                        key={tagKey}
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-lg border",
                          tag.variant === "destructive" || isDestructive
                            ? "text-destructive bg-destructive/5 border-destructive/15"
                            : "text-muted-foreground bg-muted/50 border-border/60",
                        )}
                      >
                        {tag.icon}
                        {tag.text}
                      </span>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
