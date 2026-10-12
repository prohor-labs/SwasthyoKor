"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ArrowRight2,
  Box,
  CloseCircle,
  Coffee,
  Drop,
  Home,
  Leaf,
  Menu,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Tree,
  User,
} from "@/components/icons";
import LogoSquare from "@/components/logo-square";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUser } from "@/hooks/use-auth";
import type { Menu as MenuType } from "@/lib/types";
import { cn } from "@/lib/utils";
import Search, { SearchSkeleton } from "./Search";

const POPULAR_CATEGORIES = [
  { label: "খাঁটি মধু", href: "/search?q=মধু", icon: Sparkles },
  { label: "তেল ও গাওয়া ঘি", href: "/search?q=তেল", icon: Drop },
  { label: "অর্গানিক চিয়া সিড", href: "/search/superfoods-wellness", icon: Leaf },
  { label: "ড্রাই ফ্রুটস ও বাদাম", href: "/search?q=বাদাম", icon: Tree },
  { label: "তুলসী গ্রিন টি", href: "/search?q=চা", icon: Coffee },
  { label: "হিমালয়ান পিংক সল্ট", href: "/search?q=লবণ", icon: Box },
];

export default function MobileMenu({ menu }: { menu: MenuType[] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useUser();

  const openMobileMenu = () => setIsOpen(true);
  const closeMobileMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const whatsappNumber = "8801812345678";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("আসসালামু আলাইকুম, আমি স্বাস্থ্যকর থেকে পণ্য কিনতে চাই।")}`;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={openMobileMenu}
        aria-label="মেনু খুলুন"
        className="size-9 sm:size-10 text-foreground md:hidden cursor-pointer"
      >
        <Menu className="size-5 sm:size-6" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="flex h-full w-full max-w-[310px] sm:max-w-xs flex-col bg-background p-0 text-foreground"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-border/60 p-4">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center"
              aria-label="স্বাস্থ্যকর"
            >
              <LogoSquare />
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={closeMobileMenu}
              aria-label="মেনু বন্ধ করুন"
              className="size-8 rounded-full text-muted-foreground hover:text-foreground"
            >
              <CloseCircle className="size-4 sm:size-5" />
            </Button>
          </div>

          <SheetTitle className="sr-only">ন্যাভিগেশন মেনু</SheetTitle>
          <SheetDescription className="sr-only">
            মোবাইল মেনু ও ক্যাটাগরি তালিকা
          </SheetDescription>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 [scrollbar-width:none]">
            {/* Search Input */}
            <div>
              <Suspense fallback={<SearchSkeleton />}>
                <Search />
              </Suspense>
            </div>

            {/* Quick Navigation Links */}
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                মেনু
              </div>
              <ul className="space-y-0.5">
                <li>
                  <Link
                    href="/"
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                      pathname === "/"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "text-foreground/90 hover:bg-muted/70",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Home className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <span>হোম</span>
                    </div>
                    <ArrowRight2 className="size-3.5 text-muted-foreground" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search"
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                      pathname === "/search"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "text-foreground/90 hover:bg-muted/70",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <span>সকল পণ্য</span>
                    </div>
                    <ArrowRight2 className="size-3.5 text-muted-foreground" />
                  </Link>
                </li>
                {menu.map((item: MenuType) => (
                  <li key={item.title}>
                    <Link
                      href={item.path}
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted/70 transition-colors"
                    >
                      <span>{item.title}</span>
                      <ArrowRight2 className="size-3.5 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="bg-border/60" />

            {/* Popular Categories */}
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                জনপ্রিয় ক্যাটাগরি
              </div>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 p-2.5 text-xs font-semibold text-foreground/90 transition-all hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30"
                    >
                      <Icon className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="line-clamp-1">{cat.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* User Account / Orders */}
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                অ্যাকাউন্ট
              </div>
              <ul className="space-y-0.5">
                <li>
                  <Link
                    href={
                      user ? (user.isAdmin ? "/admin" : "/dashboard") : "/login"
                    }
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="size-4 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        {user ? user.name || "ড্যাশবোর্ড" : "লগইন / রেজিস্টার"}
                      </span>
                    </div>
                    <ArrowRight2 className="size-3.5 text-muted-foreground" />
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link
                      href="/dashboard/orders"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Box className="size-4 text-emerald-600 dark:text-emerald-400" />
                        <span>আমার অর্ডারসমূহ</span>
                      </div>
                      <ArrowRight2 className="size-3.5 text-muted-foreground" />
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Support Callout */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5">
              <div className="flex items-center gap-2 mb-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <MessageCircle className="size-4 text-emerald-600" />
                <span>যেকোনো প্রয়োজনে সহায়তা</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2.5">
                অর্ডার বা পণ্য সম্পর্কিত তথ্যের জন্য সরাসরি হোয়াটসঅ্যাপে মেসেজ দিন।
              </p>
              <Button
                render={
                  <Link
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                size="sm"
                className="w-full rounded-lg bg-emerald-600 font-bold text-white shadow-xs hover:bg-emerald-500"
              >
                হোয়াটসঅ্যাপে চ্যাট করুন
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
