"use client";

import { useEffect, useState } from "react";

export function CopyrightDate() {
  const [year, setYear] = useState<string>("");

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return <span suppressHydrationWarning>{year || "2026"}</span>;
}
