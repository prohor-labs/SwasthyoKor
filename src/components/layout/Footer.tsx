import Link from "next/link";
import { Suspense } from "react";
import { CopyrightDate } from "@/components/copyright-date";
import { FooterMenu } from "@/components/layout/FooterMenu";
import LogoSquare from "@/components/logo-square";
import { getMenu } from "@/lib/db/queries";

export async function Footer() {
  const skeleton =
    "w-full h-6 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700";
  const menu = await getMenu("footer");
  const siteName = process.env.SITE_NAME || "স্বাস্থ্যকর";
  const copyrightName = process.env.COMPANY_NAME || siteName;

  return (
    <footer className="border-t border-neutral-200 bg-background text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 text-sm sm:px-6 sm:py-12 md:flex-row md:gap-12 min-[1320px]:px-0">
        <div>
          <Link
            className="flex items-center text-black md:pt-1 dark:text-white"
            href="/"
            aria-label={siteName}
          >
            <LogoSquare size="sm" />
          </Link>
          <p className="mt-2 max-w-xs text-xs text-muted-foreground">
            ১০০% খাঁটি, প্রাকৃতিক ও অর্গানিক স্বাস্থ্যকর খাদ্যের নির্ভরযোগ্য ঠিকানা।
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-2">
            জরুরি লিংক
          </h3>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                href="/blog"
                className="hover:text-foreground transition underline-offset-4 hover:underline"
              >
                স্বাস্থ্য ও পুষ্টি ব্লগ
              </Link>
            </li>
            <li>
              <Link
                href="/faq"
                className="hover:text-foreground transition underline-offset-4 hover:underline"
              >
                সচরাচর জিজ্ঞাসা (FAQ)
              </Link>
            </li>
          </ul>
        </div>
        <Suspense
          fallback={
            <div className="flex h-[188px] w-[200px] flex-col gap-2">
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
              <div className={skeleton} />
            </div>
          }
        >
          <FooterMenu menu={menu} />
        </Suspense>
      </div>
      <div className="border-t border-neutral-200 py-4 sm:py-6 text-xs sm:text-sm dark:border-neutral-800">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 md:flex-row min-[1320px]:px-0">
          <p>
            &copy; <CopyrightDate /> {copyrightName}. সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="text-xs text-neutral-500">
            Powered by Next.js 16 & PostgreSQL
          </p>
        </div>
      </div>
    </footer>
  );
}
