"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons";

export function FloatingWhatsApp() {
  const pathname = usePathname();

  // Hide in admin panel
  const isAdmin = pathname?.startsWith("/admin");
  if (isAdmin) return null;

  const phone = "8801982027508";
  const defaultMsg = encodeURIComponent(
    "আসসালামু আলাইকুম, আমি স্বাস্থ্যকর (SwasthyoKor) থেকে পণ্য সম্পর্কে জানতে চাই।",
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${defaultMsg}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Tooltip on hover */}
      <span className="pointer-events-none absolute right-16 hidden rounded-xl bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition-all duration-200 group-hover:block dark:bg-neutral-100 dark:text-neutral-900 whitespace-nowrap">
        হোয়াটসঅ্যাপে চ্যাট করুন
      </span>

      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex size-14 items-center justify-center rounded-full bg-white p-2.5 shadow-xl ring-1 ring-black/5 transition-all duration-300 hover:scale-110 active:scale-95 dark:bg-neutral-900 hover:shadow-emerald-500/25"
      >
        <WhatsAppIcon className="size-full transition-transform duration-300 group-hover:rotate-6" />
      </Link>
    </div>
  );
}
