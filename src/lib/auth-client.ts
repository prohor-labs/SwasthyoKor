"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "./api";

export function useSession() {
  const { data, isPending, refetch } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getMe,
  });

  return {
    data: data?.user ? { user: data.user } : null,
    isPending,
    refetch,
  };
}
