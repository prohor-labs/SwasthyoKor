import type { ReactNode } from "react";
import Shell from "@/components/shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <Shell lang="bn">{children}</Shell>;
}
