import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Shell from "@/components/shell";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isAdmin) {
    redirect("/dashboard");
  }

  return <Shell lang="bn">{children}</Shell>;
}
