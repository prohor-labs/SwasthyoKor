import type { ReactNode } from "react";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-neutral-50/50 text-foreground selection:bg-emerald-300 dark:bg-neutral-950 dark:selection:bg-emerald-800">
      {children}
    </div>
  );
}
