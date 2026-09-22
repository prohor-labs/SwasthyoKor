"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "@/components/icons";
import { cn } from "@/lib/utils";

interface ThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "circle" | "square";
}

export function ThemeToggler({
  className,
  variant = "circle",
  ...props
}: ThemeTogglerProps) {
  const [isDark, setIsDark] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = useCallback(() => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      title={isDark ? "লাইট মোড" : "ডার্ক মোড"}
      className={cn(
        "relative flex size-9 sm:size-10 md:size-11 items-center justify-center rounded-lg border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer shrink-0",
        className,
      )}
      {...props}
    >
      {isDark ? (
        <Sun className="size-4 sm:size-5 transition-all ease-in-out hover:scale-110" />
      ) : (
        <Moon className="size-4 sm:size-5 transition-all ease-in-out hover:scale-110" />
      )}
    </button>
  );
}
