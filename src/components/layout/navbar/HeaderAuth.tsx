"use client";

import Link from "next/link";
import { User as UserIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function HeaderAuth() {
  const { data: user, isPending } = useUser();

  if (isPending) {
    return (
      <div className="size-9 sm:size-10 md:size-11 rounded-full bg-muted/60 animate-pulse shrink-0 border border-neutral-200 dark:border-neutral-700" />
    );
  }

  if (user) {
    const initials = user.name ? user.name[0].toUpperCase() : "স্ব";
    const targetUrl = user.isAdmin ? "/admin" : "/dashboard";

    return (
      <Link
        href={targetUrl}
        title={user.name || user.email || "ড্যাশবোর্ড"}
        className="relative flex size-9 sm:size-10 md:size-11 items-center justify-center rounded-full border border-neutral-200 transition-all dark:border-neutral-700 hover:ring-2 hover:ring-emerald-500/40 p-0.5"
      >
        <Avatar className="size-full rounded-full border-0">
          {user.avatarUrl && (
            <AvatarImage
              src={user.avatarUrl}
              alt={user.name || "User"}
              className="rounded-full object-cover"
            />
          )}
          <AvatarFallback className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs sm:text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      aria-label="লগইন করুন"
      title="লগইন করুন"
      className={cn(
        "relative flex size-9 sm:size-10 md:size-11 items-center justify-center rounded-lg border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800",
      )}
    >
      <UserIcon className="size-4 sm:size-5 transition-all ease-in-out hover:scale-110" />
    </Link>
  );
}
