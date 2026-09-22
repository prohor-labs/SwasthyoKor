"use client";

import * as React from "react";
import { Eye, EyeClosed } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends React.ComponentProps<typeof Input> {}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative w-full">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-0.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        tabIndex={-1}
        aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
      >
        {showPassword ? (
          <EyeClosed size={16} className="shrink-0" />
        ) : (
          <Eye size={16} className="shrink-0" />
        )}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";
