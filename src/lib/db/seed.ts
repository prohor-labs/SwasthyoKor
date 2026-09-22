import "dotenv/config";
import { db } from "./index";
import {
  cartItems,
  carts,
  collections,
  menus,
  pages,
  productCollections,
  productImages,
  productOptions,
  products,
  productVariants,
} from "./schema";

type SeedProduct = {
  handle: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  availableForSale?: boolean;
  sizes?: string[];
  imageUrls: string[];
};

const PRODUCTS: SeedProduct[] = [
  {
    handle: "swasthyo-organic-honey",
    title: "খাঁটি সুন্দরবন মধু (Pure Sundarban Raw Honey)",
    description:
      "১০০% খাঁটি ও প্রাকৃতিক সুন্দরবনের কাঁচা মধু। কোনো কৃত্রিম মিষ্টি বা প্রিজারভেটিভ ছাড়া সংগৃহীত উচ্চ পুষ্টিগুণ সমৃদ্ধ অর্গানিক মধু।",
    price: 850,
    tags: ["organic", "honey", "food", "best-seller"],
    sizes: ["৫০০ গ্রাম", "১ কেজি"],
    imageUrls: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-organic-ghee",
    title: "গাওয়া ঘি (Pure Grass-fed Cow Ghee)",
    description:
      "দেশি গরুর খাঁটি দুধের মালাই থেকে ঐতিহ্যবাহী পদ্ধতিতে তৈরি সুগন্ধি দানাদার গাওয়া ঘি।",
    price: 1450,
    tags: ["dairy", "ghee", "food", "best-seller"],
    sizes: ["৫০০ গ্রাম", "১ কেজি"],
    imageUrls: [
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-cold-pressed-mustard-oil",
    title: "ঘানি ভাঙা সরিষার তেল (Cold Pressed Mustard Oil)",
    description:
      "কাঠের ঘানিতে ভাঙা খাঁটি দেশি সরিষার তেল। খাঁটি ঝাঁঝ ও প্রাকৃতিক পুষ্টিতে ভরপুর স্বাস্থ্যকর রান্নার তেল।",
    price: 360,
    tags: ["oil", "organic", "food", "best-seller"],
    sizes: ["১ লিটার", "২ লিটার", "৫ লিটার"],
    imageUrls: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-chia-seeds",
    title: "অর্গানিক চিয়া সিড (Premium Organic Chia Seeds)",
    description:
      "ওমেগা-৩ ফ্যাটি অ্যাসিড, ফাইবার ও অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ প্রিমিয়াম গ্রেডের অর্গানিক চিয়া সিড।",
    price: 420,
    tags: ["superfood", "chia", "weight-management", "best-seller"],
    sizes: ["২৫০ গ্রাম", "৫০০ গ্রাম"],
    imageUrls: [
      "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-moringa-powder",
    title: "সজিনা পাতা গুঁড়ো (Organic Moringa Leaf Powder)",
    description:
      "প্রাকৃতিক মাল্টিভিটামিন ও সুপারফুড। রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি ও শারীরিক শক্তি যোগাতে অতুলনীয়।",
    price: 450,
    tags: ["superfood", "moringa", "wellness"],
    sizes: ["২০০ গ্রাম", "৪০০ গ্রাম"],
    imageUrls: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-mixed-dry-fruits",
    title: "প্রিমিয়াম নাটস ও ড্রাই ফ্রুটস মিক্স (Mixed Dry Fruits)",
    description:
      "কাঠবাদাম, কাজুবাদাম, পেস্তা, আখরোট ও কিশমিশের সেরা মিশ্রণ। স্বাস্থ্যকর স্ন্যাক্স হিসেবে আদর্শ।",
    price: 950,
    tags: ["nuts", "snack", "dry-fruits", "best-seller"],
    sizes: ["৫০০ গ্রাম", "১ কেজি"],
    imageUrls: [
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1536591375315-1b838865f24a?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-black-seed-oil",
    title: "কালোজিরা তেল (Cold-pressed Black Seed Oil)",
    description:
      "১০০% খাঁটি কোল্ড-প্রেসড কালোজিরা তেল। প্রাকৃতিক আরোগ্য ও ইমিউনিটি বৃদ্ধির মহৌষধ।",
    price: 580,
    tags: ["oil", "wellness", "herbal"],
    sizes: ["১০০ মি.লি.", "২৫০ মি.লি."],
    imageUrls: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-khejur-gur",
    title: "যশোরের খাঁটি ঝোলা ও পাটালি খেজুরের গুড় (Pure Date Molasses)",
    description:
      "ঐতিহ্যবাহী যশোরের গাছিদের সংগৃহীত শতভাগ খাঁটি ও সুগন্ধযুক্ত প্রাকৃতিক খেজুরের গুড়। কোনো চিনি বা রাসায়নিক নেই।",
    price: 550,
    tags: ["organic", "sweet", "seasonal"],
    sizes: ["১ কেজি", "২ কেজি"],
    imageUrls: [
      "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1606913084603-3e7702b01627?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-cashew-nuts",
    title: "রোস্টেড প্রিমিয়াম কাজুবাদাম (Roasted Salted Cashews)",
    description:
      "কুড়মুড়ে ও পুষ্টিকর রোস্টেড কাজুবাদাম। হালকা লবণাক্ত স্বাদে স্ন্যাকস বা শক্তির সেরা উৎস।",
    price: 680,
    tags: ["nuts", "snack"],
    sizes: ["২৫০ গ্রাম", "৫০০ গ্রাম"],
    imageUrls: [
      "https://images.unsplash.com/photo-1536591375315-1b838865f24a?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-almonds-badam",
    title: "আমেরিকান প্রিমিয়াম কাঠবাদাম (California Almonds)",
    description:
      "উচ্চমানের ক্যালিফোর্নিয়া অ্যালমন্ড। মস্তিষ্ক ও হার্টের সুস্বাস্থ্যের জন্য প্রতিদিনের আবশ্যক পুষ্টি।",
    price: 620,
    tags: ["nuts", "superfood"],
    sizes: ["২৫০ গ্রাম", "৫০০ গ্রাম"],
    imageUrls: [
      "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-mariyum-dates",
    title: "মদিনার প্রিমিয়াম মরিয়ম খেজুর (Ajwa & Maryam Dates)",
    description:
      "সৌদি আরবের মদিনা থেকে সরাসরি সংগৃহীত রসালো ও সুস্বাদু মরিয়ম খেজুর। উচ্চ শক্তি ও পুষ্টিতে ভরপুর।",
    price: 850,
    tags: ["dates", "dry-fruits", "superfood"],
    sizes: ["৫০০ গ্রাম", "১ কেজি"],
    imageUrls: [
      "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-extra-virgin-olive-oil",
    title: "এক্সট্রা ভার্জিন অলিভ অয়েল (Extra Virgin Spanish Olive Oil)",
    description:
      "স্পেন থেকে আমদানিকৃত কোল্ড-প্রেসড এক্সট্রা ভার্জিন অলিভ অয়েল। সালাদ, রান্না ও ত্বক চর্চার জন্য সেরা।",
    price: 1250,
    tags: ["oil", "imported", "wellness"],
    sizes: ["৫০০ মি.লি.", "১ লিটার"],
    imageUrls: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-coconut-oil",
    title: "এক্সট্রা ভার্জিন নারিকেল তেল (Extra Virgin Cold Pressed Coconut Oil)",
    description:
      "তাজা নারিকেলের দুধ থেকে কোল্ড-প্রেসড প্রক্রিয়ায় তৈরি ১০০% খাঁটি খাবার উপযোগী ভার্জিন কোকোনাট অয়েল।",
    price: 480,
    tags: ["oil", "wellness"],
    sizes: ["২৫০ মি.লি.", "৫০০ মি.লি."],
    imageUrls: [
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-pink-himalayan-salt",
    title: "হিমালয়ান পিংক সল্ট (Himalayan Pink Rock Salt)",
    description:
      "৮৪টি প্রাকৃতিক খনিজ সমৃদ্ধ খাঁটি হিমালয়ান পিংক রক সল্ট। সাধারণ লবণের স্বাস্থ্যকর প্রাকৃতিক বিকল্প।",
    price: 250,
    tags: ["grocery", "wellness", "salt"],
    sizes: ["৫০০ গ্রাম", "১ কেজি"],
    imageUrls: [
      "https://images.unsplash.com/photo-1607672632458-9eb56696346b?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-apple-cider-vinegar",
    title: "কাঁচা অ্যাপল সিডার ভিনেগার (Raw Apple Cider Vinegar with Mother)",
    description:
      "অর্গানিক আপেল থেকে তৈরি আনফিল্টার্ড এবং কাঁচা অ্যাপল সিডার ভিনেগার যাতে উইথ দ্য মাদার বিদ্যমান।",
    price: 750,
    tags: ["wellness", "organic", "beverage"],
    sizes: ["৫০০ মি.লি."],
    imageUrls: [
      "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1568651779193-e60136e1d2b4?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-spirulina-powder",
    title: "অর্গানিক স্পিরুলিনা গুঁড়ো (Organic Spirulina Superfood Powder)",
    description:
      "প্রোটিন, আয়রন ও ভিটামিন সমৃদ্ধ নীল-সবুজ শৈবাল। শক্তি ও মেটাবলিজম বৃদ্ধির আল্টিমেট সুপারফুড।",
    price: 650,
    tags: ["superfood", "wellness"],
    sizes: ["১০০ গ্রাম", "২০০ গ্রাম"],
    imageUrls: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-turmeric-powder",
    title: "পাহাড়ি কাঁচা হলুদ গুঁড়ো (Organic Raw Turmeric Powder)",
    description:
      "পার্বত্য অঞ্চল থেকে সংগৃহীত প্রাকৃতিক কারকিউমিন সমৃদ্ধ খাঁটি পাহাড়ি কাঁচা হলুদ গুঁড়ো।",
    price: 280,
    tags: ["spices", "organic", "grocery"],
    sizes: ["২৫০ গ্রাম", "৫০০ গ্রাম"],
    imageUrls: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-isabgol-bhusi",
    title: "খাঁটি ইসবগুলের ভুসি (Pure Psyllium Husk)",
    description:
      "১০০% প্রাকৃতিক ও পরিষ্কার ইসবগুলের ভুসি। হজম স্বাস্থ্য ও পেটের সুরক্ষায় অত্যন্ত কার্যকরী।",
    price: 320,
    tags: ["wellness", "herbal"],
    sizes: ["১০০ গ্রাম", "২৫০ গ্রাম"],
    imageUrls: [
      "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-herbal-tulsi-green-tea",
    title: "তুলসী অর্গানিক গ্রিন টি (Organic Tulsi Herbal Green Tea)",
    description:
      "অর্গানিক গ্রিন টি এবং রাম, কৃষ্ণ ও বন তুলসীর সংমিশ্রণ। মানসিক প্রশান্তি ও সতেজতার জন্য সেরা।",
    price: 380,
    tags: ["tea", "beverage", "herbal"],
    sizes: ["১০০ গ্রাম"],
    imageUrls: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=85",
    ],
  },
  {
    handle: "swasthyo-triphala-powder",
    title: "হার্বাল ত্রিফলা চূর্ণ (Triphala Digestive Herbal Powder)",
    description:
      "আমলকী, হরিতকী ও বহেড়ার সমপরিমাণ মিশ্রণে প্রস্তুত ঐতিহ্যবাহী আয়ুর্বেদিক হজম সহায়ক চূর্ণ।",
    price: 350,
    tags: ["herbal", "wellness"],
    sizes: ["২০০ গ্রাম"],
    imageUrls: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=85",
    ],
  },
];

const COLLECTIONS = [
  {
    handle: "hidden-homepage-featured-items",
    title: "হোমপেজ ফিচার্ড",
    description: "হোমপেজে ফিচার্ড পণ্যসমূহ।",
    hidden: true,
    productHandles: [
      "swasthyo-organic-honey",
      "swasthyo-organic-ghee",
      "swasthyo-cold-pressed-mustard-oil",
    ],
  },
  {
    handle: "hidden-homepage-carousel",
    title: "হোমপেজ ক্যারাউজেল",
    description: "হোমপেজ ক্যারাউজেলে দেখানো পণ্যসমূহ।",
    hidden: true,
    productHandles: PRODUCTS.map((p) => p.handle),
  },
  {
    handle: "organic-essentials",
    title: "খাঁটি পণ্য (Essentials)",
    description: "মধু, ঘি, তেল সহ দৈনন্দিন জীবনের খাঁটি খাদ্যপণ্য।",
    hidden: false,
    productHandles: [
      "swasthyo-organic-honey",
      "swasthyo-organic-ghee",
      "swasthyo-cold-pressed-mustard-oil",
      "swasthyo-khejur-gur",
      "swasthyo-pink-himalayan-salt",
      "swasthyo-turmeric-powder",
    ],
  },
  {
    handle: "superfoods-wellness",
    title: "সুপারফুড ও সুস্থতা (Superfoods)",
    description: "রোগ প্রতিরোধ ক্ষমতা ও শারীরিক শক্তির জন্য স্বাস্থ্যকর সুপারফুড।",
    hidden: false,
    productHandles: [
      "swasthyo-moringa-powder",
      "swasthyo-chia-seeds",
      "swasthyo-spirulina-powder",
      "swasthyo-black-seed-oil",
      "swasthyo-apple-cider-vinegar",
      "swasthyo-isabgol-bhusi",
      "swasthyo-triphala-powder",
      "swasthyo-herbal-tulsi-green-tea",
    ],
  },
  {
    handle: "nuts-dry-fruits",
    title: "ড্রাই ফ্রুটস ও বাদাম (Nuts & Dates)",
    description: "কাজু, কাঠবাদাম, পেস্তা ও মদিনার সুস্বাদু খেজুর।",
    hidden: false,
    productHandles: [
      "swasthyo-mixed-dry-fruits",
      "swasthyo-cashew-nuts",
      "swasthyo-almonds-badam",
      "swasthyo-mariyum-dates",
    ],
  },
  {
    handle: "oils-and-ghee",
    title: "তেল ও ঘি (Pure Oils & Ghee)",
    description: "ঘানি ভাঙা সরিষা, নারিকেল, কালোজিরা তেল ও খাঁটি গাওয়া ঘি।",
    hidden: false,
    productHandles: [
      "swasthyo-cold-pressed-mustard-oil",
      "swasthyo-organic-ghee",
      "swasthyo-black-seed-oil",
      "swasthyo-extra-virgin-olive-oil",
      "swasthyo-coconut-oil",
    ],
  },
];

const MENUS = [
  {
    handle: "main-menu",
    title: "সকল পণ্য",
    path: "/search",
    position: 0,
  },
  {
    handle: "main-menu",
    title: "খাঁটি পণ্য",
    path: "/search/organic-essentials",
    position: 1,
  },
  {
    handle: "main-menu",
    title: "সুপারফুড",
    path: "/search/superfoods-wellness",
    position: 2,
  },
  {
    handle: "main-menu",
    title: "বাদাম ও খেজুর",
    path: "/search/nuts-dry-fruits",
    position: 3,
  },
  {
    handle: "main-menu",
    title: "তেল ও ঘি",
    path: "/search/oils-and-ghee",
    position: 4,
  },
  {
    handle: "footer",
    title: "আমাদের সম্পর্কে",
    path: "/about",
    position: 0,
  },
  {
    handle: "footer",
    title: "যোগাযোগ",
    path: "/contact",
    position: 1,
  },
  {
    handle: "footer",
    title: "শর্তাবলী",
    path: "/terms",
    position: 2,
  },
  {
    handle: "footer",
    title: "গোপনীয়তা নীতি",
    path: "/privacy",
    position: 3,
  },
];

const PAGES = [
  {
    handle: "about",
    title: "আমাদের সম্পর্কে",
    body: "স্বাস্থ্যকর (SwasthyoKor) — The Symbol of Faith and Trust. আমরা বাংলাদেশের প্রতিটি পরিবারে নিরাপদ, খাঁটি ও অর্গানিক পুষ্টিকর খাদ্য পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।",
    bodySummary: "স্বাস্থ্যকর এর পরিচিতি ও মিশন।",
    seoTitle: "আমাদের সম্পর্কে | স্বাস্থ্যকর",
    seoDescription: "স্বাস্থ্যকর এর লক্ষ্য, উদ্দেশ্য এবং খাঁটি পণ্যের সরবরাহ ব্যবস্থা।",
  },
  {
    handle: "contact",
    title: "যোগাযোগ",
    body: "আমাদের সাথে যোগাযোগের হটলাইন: ০১৮১২৩৪৫৬৭৮। ইমেইল: support@swasthyokor.com। ঠিকানা: ঢাকা, বাংলাদেশ।",
    bodySummary: "স্বাস্থ্যকর কাস্টমার কেয়ার ও সাপোর্ট।",
    seoTitle: "যোগাযোগ | স্বাস্থ্যকর",
    seoDescription: "স্বাস্থ্যকর হটলাইন ও সাপোর্ট টিম।",
  },
  {
    handle: "terms",
    title: "শর্তাবলী",
    body: "আমাদের প্ল্যাটফর্ম ব্যবহারের সাধারণ নিয়মাবলী ও শর্তাবলী। পণ্যের ডেলিভারি ও রিটার্ন নীতি।",
    bodySummary: "ব্যবহারের শর্তাবলী।",
    seoTitle: "শর্তাবলী | স্বাস্থ্যকর",
    seoDescription: "স্বাস্থ্যকর এর শর্তাবলী।",
  },
  {
    handle: "privacy",
    title: "গোপনীয়তা নীতি",
    body: "আমরা আপনার তথ্যের সর্বোচ্চ নিরাপত্তা বজায় রাখি। আপনার কোনো ব্যক্তিগত তথ্য তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।",
    bodySummary: "ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা।",
    seoTitle: "গোপনীয়তা নীতি | স্বাস্থ্যকর",
    seoDescription: "স্বাস্থ্যকর প্রাইভেসি পলিসি।",
  },
];

async function seed() {
  console.log("পুরনো ডেটা মুছে ফেলা হচ্ছে...");
  await db.delete(cartItems);
  await db.delete(carts);
  await db.delete(productCollections);
  await db.delete(productVariants);
  await db.delete(productOptions);
  await db.delete(productImages);
  await db.delete(products);
  await db.delete(collections);
  await db.delete(menus);
  await db.delete(pages);

  console.log("পণ্য সিড করা হচ্ছে...");
  const productIdMap = new Map<string, string>();

  for (const item of PRODUCTS) {
    const prodId = crypto.randomUUID();
    const [createdProduct] = await db
      .insert(products)
      .values({
        id: prodId,
        handle: item.handle,
        title: item.title,
        description: item.description,
        descriptionHtml: `<p>${item.description}</p>`,
        tags: item.tags,
        availableForSale: item.availableForSale ?? true,
      })
      .returning();

    productIdMap.set(item.handle, createdProduct.id);

    // Images
    for (let i = 0; i < item.imageUrls.length; i++) {
      await db.insert(productImages).values({
        id: crypto.randomUUID(),
        productId: createdProduct.id,
        url: item.imageUrls[i],
        altText: `${item.title} - Image ${i + 1}`,
        width: 800,
        height: 800,
        position: i,
      });
    }

    // Sizes / Variants
    const sizes = item.sizes || ["স্ট্যান্ডার্ড প্যাক"];
    await db.insert(productOptions).values({
      id: crypto.randomUUID(),
      productId: createdProduct.id,
      name: "পরিমাণ",
      position: 0,
      values: sizes,
    });

    for (let i = 0; i < sizes.length; i++) {
      const sizeName = sizes[i];
      const multiplier = i === 0 ? 1 : i === 1 ? 1.85 : 4.5;
      const variantPrice = Math.round(item.price * multiplier);

      await db.insert(productVariants).values({
        id: crypto.randomUUID(),
        productId: createdProduct.id,
        title: sizeName,
        priceAmount: variantPrice,
        priceCurrency: "BDT",
        availableForSale: true,
        position: i,
        selectedOptions: [{ name: "পরিমাণ", value: sizeName }],
      });
    }
  }

  console.log("কালেকশন সিড করা হচ্ছে...");
  for (const col of COLLECTIONS) {
    const [createdCollection] = await db
      .insert(collections)
      .values({
        id: crypto.randomUUID(),
        handle: col.handle,
        title: col.title,
        description: col.description,
        hidden: col.hidden,
      })
      .returning();

    for (const pHandle of col.productHandles) {
      const pId = productIdMap.get(pHandle);
      if (pId) {
        await db.insert(productCollections).values({
          productId: pId,
          collectionId: createdCollection.id,
        });
      }
    }
  }

  console.log("মেনু এবং পেজ সিড করা হচ্ছে...");
  for (const m of MENUS) {
    await db.insert(menus).values({
      id: crypto.randomUUID(),
      handle: m.handle,
      title: m.title,
      path: m.path,
      position: m.position,
    });
  }

  for (const p of PAGES) {
    await db.insert(pages).values({
      id: crypto.randomUUID(),
      handle: p.handle,
      title: p.title,
      body: p.body,
      bodySummary: p.bodySummary,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
    });
  }

  console.log(
    `সিড সম্পন্ন: ${PRODUCTS.length}টি পণ্য, ${COLLECTIONS.length}টি কালেকশন, ${MENUS.length}টি মেনু আইটেম, ${PAGES.length}টি পেজ।`,
  );
  console.log("PostgreSQL সিডিং সম্পন্ন হয়েছে।");
  process.exit(0);
}

seed().catch((err) => {
  console.error("সিডিং ত্রুটি:", err);
  process.exit(1);
});
