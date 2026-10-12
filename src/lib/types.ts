export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type SEO = {
  title: string;
  description: string;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export const PRODUCT_UNITS = [
  "packet",
  "jar",
  "bottle",
  "piece",
  "box",
  "kg",
  "gram",
  "litre",
  "ml",
] as const;

export type ProductUnit = (typeof PRODUCT_UNITS)[number];


export const PRODUCT_UNIT_DETAILS: Record<
  ProductUnit,
  { labelBn: string; labelEn: string; category: "count" | "weight" | "volume" }
> = {
  jar: { labelBn: "জার", labelEn: "Jar", category: "count" },
  bottle: { labelBn: "বোতল", labelEn: "Bottle", category: "count" },
  piece: { labelBn: "পিস", labelEn: "Piece", category: "count" },
  packet: { labelBn: "প্যাকেট", labelEn: "Pack", category: "count" },
  box: { labelBn: "বক্স", labelEn: "Box", category: "count" },
  gram: { labelBn: "গ্রাম", labelEn: "Gram", category: "weight" },
  kg: { labelBn: "কেজি", labelEn: "Kg", category: "weight" },
  ml: { labelBn: "মি.লি.", labelEn: "ml", category: "volume" },
  litre: { labelBn: "লিটার", labelEn: "Litre", category: "volume" },
};

export function getProductUnitLabel(unit?: string | null): string {
  if (!unit) return "পিস";
  if (unit in PRODUCT_UNIT_DETAILS) {
    return PRODUCT_UNIT_DETAILS[unit as ProductUnit].labelBn;
  }
  return unit;
}

export function getProductUnitCategory(
  unit?: string | null,
): "count" | "weight" | "volume" {
  if (unit && unit in PRODUCT_UNIT_DETAILS) {
    return PRODUCT_UNIT_DETAILS[unit as ProductUnit].category;
  }
  return "count";
}

const BN_DIGITS: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
  ".": ".",
};

const EN_DIGITS: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

export function toBnDigits(val: number | string): string {
  return String(val)
    .split("")
    .map((c) => BN_DIGITS[c] || c)
    .join("");
}

export function toEnDigits(val: string): string {
  return String(val)
    .split("")
    .map((c) => EN_DIGITS[c] || c)
    .join("");
}

export function formatPackTitle(
  amount: number | string,
  unit: ProductUnit = "piece",
): string {
  const num =
    typeof amount === "string"
      ? parseFloat(toEnDigits(amount)) || 0
      : amount;
  if (!num || num <= 0) return "";

  if (unit === "jar") {
    if (num === 1) return "১ জার";
    if (num === 2) return "২ জার (কম্বো)";
    return `${toBnDigits(num)} জার`;
  }

  if (unit === "bottle") {
    if (num === 1) return "১ বোতল";
    if (num === 2) return "২ বোতল (কম্বো)";
    return `${toBnDigits(num)} বোতল`;
  }

  if (unit === "piece") {
    if (num === 1) return "১ পিস";
    if (num === 2) return "২ পিস (কম্বো)";
    return `${toBnDigits(num)} পিস`;
  }

  if (unit === "packet") {
    if (num === 1) return "১ প্যাকেট";
    if (num === 2) return "২ প্যাকেট";
    return `${toBnDigits(num)} প্যাকেট`;
  }

  if (unit === "box") {
    if (num === 1) return "১ বক্স";
    return `${toBnDigits(num)} বক্স`;
  }

  if (unit === "gram") {
    if (num >= 1000) {
      const kgVal = num / 1000;
      const formattedKg = Number.isInteger(kgVal)
        ? String(kgVal)
        : kgVal.toFixed(2).replace(/\.?0+$/, "");
      return `${toBnDigits(formattedKg)} কেজি`;
    }
    return `${toBnDigits(num)} গ্রাম`;
  }

  if (unit === "kg") {
    const formattedKg = Number.isInteger(num)
      ? String(num)
      : num.toFixed(2).replace(/\.?0+$/, "");
    return `${toBnDigits(formattedKg)} কেজি`;
  }

  if (unit === "ml") {
    if (num >= 1000) {
      const lVal = num / 1000;
      const formattedL = Number.isInteger(lVal)
        ? String(lVal)
        : lVal.toFixed(2).replace(/\.?0+$/, "");
      return `${toBnDigits(formattedL)} লিটার`;
    }
    return `${toBnDigits(num)} মি.লি.`;
  }

  if (unit === "litre") {
    const formattedL = Number.isInteger(num)
      ? String(num)
      : num.toFixed(2).replace(/\.?0+$/, "");
    return `${toBnDigits(formattedL)} লিটার`;
  }

  return `${toBnDigits(num)} ${getProductUnitLabel(unit)}`;
}

export function getDefaultAmountForUnit(unit: ProductUnit): number {
  if (unit === "gram") return 500;
  if (unit === "ml") return 500;
  return 1;
}

export function parseAmountFromTitle(
  title: string,
  unit: ProductUnit = "piece",
): number {
  if (!title) return getDefaultAmountForUnit(unit);
  const enTitle = toEnDigits(title);
  const match = enTitle.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!match) return getDefaultAmountForUnit(unit);
  const val = parseFloat(match[1]);
  if (isNaN(val)) return getDefaultAmountForUnit(unit);

  if (
    unit === "gram" &&
    (title.includes("কেজি") || title.toLowerCase().includes("kg"))
  ) {
    return val * 1000;
  }
  if (
    unit === "ml" &&
    (title.includes("লিটার") ||
      title.toLowerCase().includes("liter") ||
      title.toLowerCase().includes("litre"))
  ) {
    return val * 1000;
  }
  return val;
}

export function calculateTotalStock(
  variants: {
    amount?: number;
    inventoryQuantity: number;
    title?: string;
  }[],
  unit: ProductUnit = "piece",
): {
  totalPacks: number;
  totalBulkFormatted: string;
  totalRawAmount: number;
  unitCategory: "count" | "weight" | "volume";
} {
  const unitCategory = getProductUnitCategory(unit);
  const totalPacks = variants.reduce(
    (acc, v) => acc + (Number(v.inventoryQuantity) || 0),
    0,
  );

  let totalRawAmount = 0;
  for (const v of variants) {
    const amt =
      v.amount !== undefined && v.amount !== null && !isNaN(v.amount)
        ? v.amount
        : v.title
          ? parseAmountFromTitle(v.title, unit)
          : getDefaultAmountForUnit(unit);
    const qty = Number(v.inventoryQuantity) || 0;
    totalRawAmount += amt * qty;
  }

  let totalBulkFormatted = "";

  if (unitCategory === "count") {
    const unitLabel = getProductUnitLabel(unit);
    // If total raw amount is same as total packs (meaning all packs are 1 unit each)
    if (totalRawAmount === totalPacks) {
      totalBulkFormatted = `${toBnDigits(totalRawAmount)} টি ${unitLabel}`;
    } else {
      totalBulkFormatted = `${toBnDigits(totalRawAmount)} টি ${unitLabel} (${toBnDigits(totalPacks)}টি প্যাকে)`;
    }
  } else if (unitCategory === "weight") {
    if (unit === "gram") {
      if (totalRawAmount >= 1000) {
        const kg = totalRawAmount / 1000;
        const formattedKg = Number.isInteger(kg)
          ? String(kg)
          : kg.toFixed(2).replace(/\.?0+$/, "");
        totalBulkFormatted = `${toBnDigits(formattedKg)} কেজি (${toBnDigits(totalPacks)}টি প্যাকে)`;
      } else {
        totalBulkFormatted = `${toBnDigits(totalRawAmount)} গ্রাম (${toBnDigits(totalPacks)}টি প্যাকে)`;
      }
    } else {
      const formatted = Number.isInteger(totalRawAmount)
        ? String(totalRawAmount)
        : totalRawAmount.toFixed(2).replace(/\.?0+$/, "");
      totalBulkFormatted = `${toBnDigits(formatted)} কেজি (${toBnDigits(totalPacks)}টি প্যাকে)`;
    }
  } else if (unitCategory === "volume") {
    if (unit === "ml") {
      if (totalRawAmount >= 1000) {
        const l = totalRawAmount / 1000;
        const formattedL = Number.isInteger(l)
          ? String(l)
          : l.toFixed(2).replace(/\.?0+$/, "");
        totalBulkFormatted = `${toBnDigits(formattedL)} লিটার (${toBnDigits(totalPacks)}টি প্যাকে)`;
      } else {
        totalBulkFormatted = `${toBnDigits(totalRawAmount)} মি.লি. (${toBnDigits(totalPacks)}টি প্যাকে)`;
      }
    } else {
      const formatted = Number.isInteger(totalRawAmount)
        ? String(totalRawAmount)
        : totalRawAmount.toFixed(2).replace(/\.?0+$/, "");
      totalBulkFormatted = `${toBnDigits(formatted)} লিটার (${toBnDigits(totalPacks)}টি প্যাকে)`;
    }
  }

  return { totalPacks, totalBulkFormatted, totalRawAmount, unitCategory };
}

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  inventoryQuantity: number;
  unit?: ProductUnit | string;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice?: Money;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  tags: string[];
  availableForSale: boolean;
  brand?: string;
  productType?: string;
  deliveryInfo?: string;
  rating?: number;
  reviewCount?: number;
  category?: {
    id: string;
    handle: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  compareAtPriceRange?: {
    minVariantPrice?: Money;
    maxVariantPrice?: Money;
  };
  featuredImage?: Image;
  images: Image[];
  variants: ProductVariant[];
  options: ProductOption[];
  seo: SEO;
};

export type Collection = {
  id?: string;
  handle: string;
  title: string;
  description: string;
  image?: string | null;
  seo: SEO;
  path: string;
  updatedAt: string;
};

export type Menu = {
  title: string;
  path: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type CartItem = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOption[];
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage?: Image;
    };
  };
};

export type Cart = {
  id: string;
  totalQuantity: number;
  lines: CartItem[];
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
};

export type OrderItem = {
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  quantity: number;
  priceAmount: number;
  priceCurrency: string;
};

export type Order = {
  id: string;
  email: string | null;
  phone?: string | null;
  customerName?: string | null;
  shippingAddress?: string | null;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentInvoiceId?: string | null;
  paymentTrxId?: string | null;
  paymentSenderNumber?: string | null;
  couponCode?: string | null;
  discountAmount?: number | null;
  totalAmount: number;
  totalCurrency: string;
  status: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
};
