import Link from "next/link";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ListCardMetaItem {
  id?: string;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  value: React.ReactNode;
}

export interface ListCardAction {
  id?: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface ListCardProps {
  id?: string | number;
  title: React.ReactNode;
  icon?: React.ReactNode;
  badges?: Array<{
    id?: string;
    label: React.ReactNode;
    variant?: "default" | "secondary" | "outline" | "destructive";
    className?: string;
  }>;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  metaItems?: ListCardMetaItem[];
  footerNote?: React.ReactNode;
  actions?: ListCardAction[];
  className?: string;
  contentClassName?: string;
  onClick?: () => void;
}

export function ListCard({
  title,
  icon,
  badges = [],
  subtitle,
  description,
  metaItems = [],
  footerNote,
  actions = [],
  className,
  contentClassName,
  onClick,
}: ListCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "py-0 gap-0 border-border/80 shadow-xs hover:border-primary/40 transition-colors bg-card",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <CardContent
        className={cn("p-4 sm:p-5 flex flex-col gap-3.5", contentClassName)}
      >
        {/* Header row: icon + title/badges/meta */}
        <div className="flex items-start gap-3 w-full">
          {icon && <div className="shrink-0 pt-0.5">{icon}</div>}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Title + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              {badges.map((badge, i) => {
                const key =
                  badge.id ??
                  (typeof badge.label === "string"
                    ? `b-${badge.label}`
                    : `b-${i}`);
                return (
                  <Badge
                    key={key}
                    variant={badge.variant ?? "secondary"}
                    className={cn(
                      "text-xs px-2 py-0.5 font-medium",
                      badge.className,
                    )}
                  >
                    {badge.label}
                  </Badge>
                );
              })}
            </div>

            {subtitle && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {subtitle}
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}

            {/* Meta items row */}
            {metaItems.length > 0 && (
              <div className="flex items-center gap-x-4 gap-y-1 text-xs text-muted-foreground flex-wrap">
                {metaItems.map((meta, i) => {
                  const key =
                    meta.id ??
                    (typeof meta.label === "string"
                      ? `m-${meta.label}`
                      : `m-${i}`);
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-1.5 shrink-0"
                    >
                      {meta.icon && (
                        <span className="text-primary shrink-0">
                          {meta.icon}
                        </span>
                      )}
                      <span>
                        {meta.label && (
                          <span className="text-muted-foreground">
                            {meta.label}{" "}
                          </span>
                        )}
                        <strong className="text-foreground font-medium">
                          {meta.value}
                        </strong>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {footerNote && (
              <p className="text-xs text-muted-foreground">{footerNote}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-border/40 flex-wrap">
            {actions.map((action, i) => {
              const key =
                action.id ??
                (typeof action.label === "string"
                  ? `a-${action.label}`
                  : (action.href ?? `a-${i}`));

              const btn = (
                <Button
                  size="sm"
                  variant={
                    action.variant ??
                    (i === actions.length - 1 ? "default" : "outline")
                  }
                  disabled={action.disabled}
                  onClick={action.onClick}
                  className="gap-1.5 font-medium text-xs h-8"
                >
                  {action.icon && (
                    <span className="shrink-0">{action.icon}</span>
                  )}
                  <span>{action.label}</span>
                </Button>
              );

              if (action.href) {
                return (
                  <Button
                    key={key}
                    size="sm"
                    variant={
                      action.variant ??
                      (i === actions.length - 1 ? "default" : "outline")
                    }
                    disabled={action.disabled}
                    className="gap-1.5 font-medium text-xs h-8"
                    render={<Link href={action.href} />}
                  >
                    {action.icon && (
                      <span className="shrink-0">{action.icon}</span>
                    )}
                    <span>{action.label}</span>
                  </Button>
                );
              }

              return <React.Fragment key={key}>{btn}</React.Fragment>;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
