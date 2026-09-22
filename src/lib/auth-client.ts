"use client";

import { useEffect, useState } from "react";

export interface SessionUser {
  id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  image?: string;
  isAdmin?: boolean;
  phone?: string;
}

export function useSession() {
  const [data, setData] = useState<{ user: SessionUser } | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((json) => {
        if (json.user) {
          setData({
            user: {
              ...json.user,
              image: json.user.avatarUrl,
            },
          });
        } else {
          setData(null);
        }
      })
      .catch(() => {
        setData(null);
      })
      .finally(() => {
        setIsPending(false);
      });
  }, []);

  return {
    data,
    isPending,
  };
}

const authClient = {
  useSession,
};
