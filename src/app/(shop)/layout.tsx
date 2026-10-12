import type { ReactNode } from "react";
import { Footer, Header } from "@/components/layout";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
