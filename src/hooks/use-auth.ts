"use client";

import { useSession } from "@/lib/auth-client";

export function useUser() {
  const { data, isPending } = useSession();
  return {
    data: data?.user ?? null,
    isPending,
  };
}

export function useLogout() {
  return {
    mutate: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    },
    isPending: false,
  };
}
