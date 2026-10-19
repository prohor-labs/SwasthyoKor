import Link from "next/link";
import { Suspense } from "react";
import { CopyrightDate } from "@/components/copyright-date";
import {
  FacebookIcon,
  Heart,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/icons";
import { FooterMenu } from "@/components/layout/FooterMenu";
import { siteConfig } from "@/config";
import { getMenu } from "@/lib/db/queries";

export async function Footer() {
  const skeleton =
    "w-full h-6 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700";
  const menu = await getMenu("footer");
  const siteName = siteConfig.name;
  const copyrightName = siteConfig.companyName || siteName;

  return (
    <footer className="border-t border-neutral-200 bg-background text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 text-sm sm:px-6 sm:py-12 md:flex-row md:gap-12 min-[1320px]:px-0">
        <div>
          <Link
            className="inline-block md:pt-1 transition-opacity hover:opacity-90"
            href="/"
            aria-label={siteName}
          >
            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              স্বাস্থ্য<span className="text-primary">কর</span>
            </span>
          </Link>
          <p className="mt-2 max-w-xs text-xs text-muted-foreground leading-relaxed">
            ১০০% খাঁটি, প্রাকৃতিক ও অর্গানিক স্বাস্থ্যকর খাদ্যের নির্ভরযোগ্য ঠিকানা।
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://www.facebook.com/SwasthyoKor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:scale-110 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
              aria-label="Facebook"
            >
              <FacebookIcon className="size-4" />
            </a>
            <a
              href="https://www.instagram.com/SwasthyoKor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:scale-110 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
              aria-label="Instagram"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href="https://youtube.com/@swasthyokor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:scale-110 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
              aria-label="YouTube"
            >
              <YoutubeIcon className="size-4" />
            </a>
          </div>
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
          <p className="flex items-center text-xs text-neutral-500">
            Made with{" "}
            <Heart className="inline size-3.5 text-rose-500 fill-rose-500 mx-1" />{" "}
            by{" "}
            <a
              href="mailto:frostfoe@gmail.com"
              className="ml-1 font-mono font-medium text-foreground hover:text-emerald-600 transition-colors"
            >
              &lt;/ Prohor &gt;
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
