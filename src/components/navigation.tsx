"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Category, User as UserIcon } from "@/components/icons";
import { ThemeToggler } from "@/components/theme-toggler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useLogout, useUser } from "@/hooks/use-auth";
import { getNavItems, sidebarAnnouncement } from "@/lib/navigation";
import type { Dictionary, SidebarProps } from "@/types";

export function Sidebar({ onClose, dict, lang: _lang }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: user } = useUser();
  const logoutMutation = useLogout();

  const d = dict?.sidebar ?? { collapse: "সংকোচন" };
  const isAdmin = pathname.startsWith("/admin");
  const navItems = getNavItems(dict, isAdmin);

  return (
    <aside
      className={`w-full h-full lg:h-[calc(100vh-40px)] lg:m-[20px] shrink-0 z-10 flex flex-col pt-0 lg:pt-[16px] gap-4 overflow-x-hidden overflow-y-auto no-scrollbar transition-all duration-[300ms] ease-[cubic-bezier(0.83,0,0.17,1)] ${isCollapsed ? "lg:w-[40px]" : "lg:w-[192px]"}`}
    >
      <div className="flex flex-col gap-[24px]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[48px] lg:gap-0">
          <div className="flex items-center justify-between w-full">
            <Link
              href="/dashboard"
              onClick={onClose}
              aria-label="স্বাস্থ্যকর ড্যাশবোর্ড"
              className="flex items-center px-[8px] py-[4px] rounded-[8px] hover:bg-accent transition-colors overflow-hidden shrink-0"
            >
              <div className="relative flex size-6 items-center justify-center shrink-0 overflow-hidden">
                <Image
                  src="/icon.png"
                  alt="স্বাস্থ্যকর"
                  width={24}
                  height={24}
                  className="size-full object-contain"
                  priority
                />
              </div>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex lg:hidden w-fit p-[4px] rounded-[8px] hover:bg-accent transition-colors h-auto"
            >
              <svg
                className="size-7"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Close Sidebar</title>
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="14"
                  rx="4"
                  stroke="currentColor"
                  strokeWidth="1.29"
                />
                <path
                  d="M15 19L15 5"
                  stroke="currentColor"
                  strokeWidth="1.29"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-start px-[8px] py-[4px] rounded-[8px] hover:bg-accent transition-colors text-muted-foreground overflow-hidden -mt-[8px] h-auto w-full shrink-0 cursor-pointer"
        >
          <div
            className={`shrink-0 mr-[12px] transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Collapse</title>
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
          </div>
          <span
            className={`text-[14px] whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? "opacity-0" : "opacity-100"}`}
          >
            {d.collapse || "সংকোচন"}
          </span>
        </Button>

        <nav className="flex flex-col gap-[4px] lg:-mt-[16px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.path
              : pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={onClose}
                className={`relative flex items-center px-[8px] py-[4px] rounded-[8px] transition-colors overflow-hidden shrink-0 ${
                  isActive ? "bg-accent" : "hover:bg-accent"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <div className="flex items-center gap-[8px]">
                  <Icon size={24} className="shrink-0" />
                  <span
                    className={`text-[14px] text-foreground whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? "opacity-0" : "opacity-100"}`}
                  >
                    {item.name}
                  </span>
                </div>
                {item.count && (
                  <div
                    className={`absolute right-[8px] bg-success-badge rounded-[8px] px-[8px] py-[2px] flex items-center transition-opacity duration-200 ${isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                  >
                    <span className="text-success-badge-foreground text-[12px] font-[600]">
                      {item.count}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}

          {user?.isAdmin && !isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className="relative flex items-center px-[8px] py-[4px] rounded-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors overflow-hidden shrink-0 mt-2 font-bold"
              title={isCollapsed ? "অ্যাডমিন প্যানেল" : undefined}
            >
              <div className="flex items-center gap-[8px]">
                <Image
                  src="/icon.png"
                  alt="অ্যাডমিন"
                  width={20}
                  height={20}
                  className="size-5 object-contain shrink-0"
                />
                <span
                  className={`text-[14px] whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? "opacity-0" : "opacity-100"}`}
                >
                  অ্যাডমিন প্যানেল
                </span>
              </div>
            </Link>
          )}
        </nav>

        <Link
          href={sidebarAnnouncement.href}
          onClick={onClose}
          className={`hidden lg:flex flex-col gap-[8px] bg-background border-[0.5px] border-border rounded-[16px] hover:bg-muted transition-all duration-300 overflow-hidden shrink-0 ${
            isCollapsed
              ? "max-h-0 opacity-0 p-0 border-0 mb-0 pointer-events-none"
              : "max-h-[280px] opacity-100 p-[8px] pb-[12px] mb-[4px]"
          }`}
        >
          <Image
            src={sidebarAnnouncement.imageSrc}
            alt={sidebarAnnouncement.imageAlt}
            width={732}
            height={420}
            className="w-full aspect-[732/420] object-cover rounded-[12px]"
            priority
          />
          <div className="flex flex-col gap-[2px] px-[4px]">
            <h4 className="text-[14px] text-foreground font-semibold">
              {sidebarAnnouncement.title}
            </h4>
            <h6 className="text-[10px] text-muted-foreground leading-normal">
              {sidebarAnnouncement.subtitle}
            </h6>
          </div>
        </Link>
      </div>

      <div
        className={`flex flex-col gap-2 border-t border-border/50 pt-2.5 mt-1 transition-all duration-300 ${
          isCollapsed ? "items-center px-0" : "px-[8px]"
        }`}
      >
        <div className="flex items-center justify-between">
          <ThemeToggler variant="circle" />
        </div>

        {user ? (
          <div
            className={`flex items-center gap-2.5 p-1.5 rounded-xl bg-accent/50 hover:bg-accent transition-all ${
              isCollapsed ? "justify-center p-1" : ""
            }`}
          >
            <Avatar className="size-8 rounded-full border border-border shrink-0">
              {user.avatarUrl && (
                <AvatarImage
                  src={user.avatarUrl}
                  alt={user.name || "User"}
                  className="rounded-full object-cover"
                />
              )}
              <AvatarFallback className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                {user.name ? user.name[0].toUpperCase() : "স্ব"}
              </AvatarFallback>
            </Avatar>

            <div
              className={`flex flex-col min-w-0 transition-opacity duration-200 ${
                isCollapsed ? "hidden opacity-0" : "flex-1 opacity-100"
              }`}
            >
              <span className="text-xs font-bold text-foreground truncate">
                {user.name || "গ্রাহক"}
              </span>
              <button
                type="button"
                onClick={() => logoutMutation.mutate()}
                className="text-[10px] text-destructive hover:underline text-left cursor-pointer font-medium"
              >
                লগআউট
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className={`flex items-center gap-2 py-[4px] px-[6px] rounded-[8px] hover:bg-accent transition-all text-xs font-semibold text-foreground ${
              isCollapsed ? "justify-center p-1" : ""
            }`}
          >
            <UserIcon className="size-4 shrink-0" />
            <span
              className={`whitespace-nowrap transition-opacity duration-200 ${
                isCollapsed ? "hidden opacity-0" : "opacity-100"
              }`}
            >
              লগইন করুন
            </span>
          </Link>
        )}
      </div>
    </aside>
  );
}

interface MobileBottomNavProps {
  readonly dict?: Dictionary;
}

export function MobileBottomNav({ dict }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");
  const allNavItems = getNavItems(dict, isAdmin);

  const primaryNavItems = allNavItems.slice(0, 4);
  const moreNavItems = allNavItems.slice(4);

  const isMoreActive = moreNavItems.some((item) =>
    item.exact ? pathname === item.path : pathname.startsWith(item.path),
  );

  return (
    <div className="lg:hidden fixed bottom-[12px] left-[12px] right-[12px] sm:left-[16px] sm:right-[16px] z-30 flex justify-center pointer-events-none">
      <div className="flex items-center justify-between bg-background/90 backdrop-blur-xl border border-border/80 rounded-[24px] p-[5px] shadow-xl pointer-events-auto w-full max-w-[430px]">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.path
            : pathname.startsWith(item.path);

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-1 flex-col items-center justify-center py-[7px] px-[2px] rounded-[18px] transition-all duration-200 ${
                isActive
                  ? "bg-foreground text-background shadow-xs font-bold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon size={22} className="mb-[3px]" />
              <span className="text-[11px] tracking-tight whitespace-nowrap">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* 5th Tab: 'আরো' (More) Drawer Trigger */}
        {moreNavItems.length > 0 && (
          <Drawer open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <DrawerTrigger
              type="button"
              className={`flex flex-1 flex-col items-center justify-center py-[7px] px-[2px] rounded-[18px] transition-all duration-200 outline-none cursor-pointer ${
                isMoreActive || isMoreOpen
                  ? "bg-foreground text-background shadow-xs font-bold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Category size={22} className="mb-[3px]" />
              <span className="text-[11px] tracking-tight whitespace-nowrap">
                আরো
              </span>
            </DrawerTrigger>

            <DrawerContent className="px-5 pb-8 pt-3 bg-card border-t border-border rounded-t-[28px] max-w-lg mx-auto">
              <DrawerHeader className="px-0 pt-1 pb-3 text-left">
                <DrawerTitle className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <Category className="size-5 text-primary" />
                  অন্যান্য মেনু ও ফিচার
                </DrawerTitle>
              </DrawerHeader>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {moreNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.path
                    : pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setIsMoreOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                        isActive
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-2xs"
                          : "bg-muted/40 border-border/70 text-foreground hover:bg-accent"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground shadow-2xs"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate">
                          {item.name}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </div>
  );
}
