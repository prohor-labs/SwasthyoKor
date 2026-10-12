import {
  BookOpen,
  Box,
  Category,
  Home,
  Receipt,
  ShoppingBag,
  SliderHorizontal,
  Store,
  Tag,
  User,
} from "@/components/icons";
import type { Dictionary, NavItem, SidebarAnnouncement } from "@/types";

export const DEFAULT_NAV_ITEMS: readonly NavItem[] = [
  { name: "ড্যাশবোর্ড", path: "/dashboard", exact: true, icon: Home },
  { name: "অর্ডারসমূহ", path: "/dashboard/orders", exact: false, icon: Box },
  {
    name: "প্রোফাইল ও সেটিংস",
    path: "/dashboard/profile",
    exact: false,
    icon: User,
  },
];

export const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  { name: "ওভারভিউ", path: "/admin", exact: true, icon: Home },
  { name: "পণ্যসমূহ", path: "/admin/products", exact: false, icon: Box },
  { name: "অর্ডারসমূহ", path: "/admin/orders", exact: false, icon: Receipt },
  {
    name: "কালেকশন ও ক্যাটাগরি",
    path: "/admin/collections",
    exact: false,
    icon: Category,
  },
  {
    name: "হিরো ব্যানার",
    path: "/admin/banners",
    exact: false,
    icon: SliderHorizontal,
  },
  { name: "ব্লগ ও কনটেন্ট", path: "/admin/blog", exact: false, icon: BookOpen },
  { name: "কুপন ও প্রোমো", path: "/admin/coupons", exact: false, icon: Tag },
  { name: "গ্রাহকবৃন্দ", path: "/admin/customers", exact: false, icon: User },
  { name: "স্টোর সেটিংস", path: "/admin/settings", exact: false, icon: Store },
  { name: "শপ দেখুন", path: "/", exact: true, icon: ShoppingBag },
];

export function getNavItems(
  _dict?: Dictionary,
  isAdmin: boolean = false,
): readonly NavItem[] {
  if (isAdmin) {
    return ADMIN_NAV_ITEMS;
  }

  return DEFAULT_NAV_ITEMS;
}

export const sidebarAnnouncement: SidebarAnnouncement = {
  imageSrc:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=732",
  imageAlt: "১০০% প্রাকৃতিক পণ্য",
  title: "খাঁটি ও স্বাস্থ্যকর পণ্যের সমাহার",
  subtitle: "আপনার দৈনন্দিন পুষ্টির চাহিদা মেটাতে সেরা মানের অর্গানিক পণ্য কিনুন।",
  href: "/search",
};
