export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: "RELEVANCE" | "BEST_SELLING" | "CREATED_AT" | "PRICE";
  reverse: boolean;
};

export const defaultSort: SortFilterItem = {
  title: "প্রাসঙ্গিকতা (Relevance)",
  slug: null,
  sortKey: "RELEVANCE",
  reverse: false,
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  {
    title: "ট্রেন্ডিং (Trending)",
    slug: "trending-desc",
    sortKey: "BEST_SELLING",
    reverse: false,
  },
  {
    title: "সাম্প্রতিক পণ্য (Latest)",
    slug: "latest-desc",
    sortKey: "CREATED_AT",
    reverse: true,
  },
  {
    title: "দাম: কম থেকে বেশি (Price: Low to High)",
    slug: "price-asc",
    sortKey: "PRICE",
    reverse: false,
  },
  {
    title: "দাম: বেশি থেকে কম (Price: High to Low)",
    slug: "price-desc",
    sortKey: "PRICE",
    reverse: true,
  },
];

export const DEFAULT_OPTION = "Default Title";
