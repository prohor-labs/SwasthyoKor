import Link from "next/link";
import { Suspense } from "react";
import { CartModal } from "@/components/cart";
import LogoSquare from "@/components/logo-square";
import { ThemeToggler } from "@/components/theme-toggler";
import { getMenu } from "@/lib/db/queries";
import type { Menu } from "@/lib/types";
import { HeaderAuth } from "./HeaderAuth";
import MobileMenu from "./MobileMenu";
import { MobileSearch } from "./MobileSearch";
import Search, { SearchSkeleton } from "./Search";

export async function Header() {
  const menu = await getMenu("header");
  const siteName = process.env.SITE_NAME || "স্বাস্থ্যকর";

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/85 px-3 py-2 sm:px-4 sm:py-3 backdrop-blur-md lg:px-6">
      {/* Left: Mobile Menu + Logo & Brand Title */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className="block flex-none md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
        </div>
        <Link
          href="/"
          prefetch={true}
          className="flex items-center"
          aria-label={siteName}
        >
          <LogoSquare />
        </Link>
        {menu.length ? (
          <ul className="hidden gap-6 text-sm font-medium md:flex md:items-center ml-4 lg:ml-6">
            {menu.map((item: Menu) => (
              <li key={item.title}>
                <Link
                  href={item.path}
                  prefetch={true}
                  className="text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Center: Desktop Search */}
      <div className="hidden md:flex md:max-w-xs lg:max-w-md xl:max-w-lg w-full mx-4 justify-center">
        <Suspense fallback={<SearchSkeleton />}>
          <Search />
        </Suspense>
      </div>

      {/* Right: Mobile Search + ThemeToggler + Profile/Auth + Cart */}
      <div className="flex items-center gap-1 sm:gap-2">
        <MobileSearch />
        <ThemeToggler />
        <HeaderAuth />
        <CartModal />
      </div>
    </nav>
  );
}

