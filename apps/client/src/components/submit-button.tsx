"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface SubmitButtonProps extends ComponentProps<typeof Button> {
  pendingText?: string;
  isPending?: boolean;
}

export function SubmitButton({
  children,
  pendingText,
  isPending: manualIsPending,
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus();
  const isPending =
    manualIsPending !== undefined ? manualIsPending : formPending;

  return (
    <Button
      type="submit"
      disabled={isPending || disabled}
      className={cn("relative", className)}
      {...props}
    >
      <span
        className={cn(
          "flex items-center justify-center gap-2 transition-opacity",
          isPending ? "opacity-0" : "opacity-100",
        )}
      >
        {children}
      </span>
      {isPending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner className="size-4" />
        </span>
      )}
    </Button>
  );
}
