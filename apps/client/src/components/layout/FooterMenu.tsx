"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Menu } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FooterMenuItem({ item }: { item: Menu }) {
  const pathname = usePathname();
  const [active, setActive] = useState(pathname === item.path);

  useEffect(() => {
    setActive(pathname === item.path);
  }, [pathname, item.path]);

  return (
    <li>
      <Link
        href={item.path}
        className={cn(
          "inline-block py-1 text-sm underline-offset-4 hover:text-black hover:underline dark:hover:text-neutral-300",
          {
            "text-black dark:text-neutral-100 font-semibold": active,
          },
        )}
      >
        {item.title}
      </Link>
    </li>
  );
}

export function FooterMenu({ menu }: { menu: Menu[] }) {
  if (!menu.length) return null;

  return (
    <nav>
      <ul className="flex flex-col gap-2 py-2">
        {menu.map((item: Menu) => (
          <FooterMenuItem key={`${item.path}-${item.title}`} item={item} />
        ))}
      </ul>
    </nav>
  );
}
