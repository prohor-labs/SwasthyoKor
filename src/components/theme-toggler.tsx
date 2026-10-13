"use client";

import {
  AnimatedThemeToggler,
  type TransitionVariant,
} from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";

interface ThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: TransitionVariant;
}

export function ThemeToggler({
  className,
  variant = "circle",
  ...props
}: ThemeTogglerProps) {
  return (
    <AnimatedThemeToggler
      variant={variant}
      className={cn(
        "relative flex size-9 sm:size-10 md:size-11 items-center justify-center rounded-lg border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer shrink-0 [&_svg]:size-4 sm:[&_svg]:size-5",
        className,
      )}
      {...props}
    />
  );
}
