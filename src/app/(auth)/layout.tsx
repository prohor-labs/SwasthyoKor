import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-background text-foreground selection:bg-emerald-300 dark:selection:bg-emerald-800">
      {children}
    </div>
  );
}
