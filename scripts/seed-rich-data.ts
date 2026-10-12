import { config } from "dotenv";
import { resolve } from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";

// Load client environment
config({ path: resolve(process.cwd(), "apps/client/.env.local") });
config({ path: resolve(process.cwd(), "apps/client/.env") });
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import * as schema from "../apps/client/src/lib/db/schema.js";
import {
  users,
  accounts,
  heroBanners,
  blogs,
  coupons,
  orders,
  productReviews,
  storeSettings,
  products,
  collections,
  productCollections,
} from "../apps/client/src/lib/db/schema.js";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Error: DATABASE_URL is not set.");
  process.exit(1);
}

const client = postgres(dbUrl, { prepare: false });
const db = drizzle(client, { schema });

async function seedRichData() {
  console.log("🌱 Starting rich mock data seeding via scripts/seed-rich-data.ts...");

  // 1. Password hash for users
  // admin: mdrokonuzzaman45@gmail.com / mdrokonuzzaman45
  const adminPasswordHash = await hash("mdrokonuzzaman45", {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const defaultUserPasswordHash = await hash("user123456", {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  // 2. Admin & Mock Users
  console.log("👤 Upserting Admin & Mock Users...");
  const mockUsersList = [
    {
      name: "Md Rokonuzzaman",
      email: "mdrokonuzzaman45@gmail.com",
      phone: "01712345678",
      isAdmin: true,
      emailVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      passwordHash: adminPasswordHash,
    },
    {
      name: "Tanzimul Haque",
      email: "tanzim@swasthyokor.com",
      phone: "01819876543",
      isAdmin: true,
      emailVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      passwordHash: adminPasswordHash,
    },
    {
      name: "Nusrat Jahan",
      email: "nusrat.jahan@gmail.com",
      phone: "01987654321",
      isAdmin: false,
      emailVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
      passwordHash: defaultUserPasswordHash,
    },
    {
      name: "Arifur Rahman",
      email: "arif.rahman@gmail.com",
      phone: "01623456789",
      isAdmin: false,
      emailVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      passwordHash: defaultUserPasswordHash,
    },
    {
      name: "Farhana Islam",
      email: "farhana.islam@gmail.com",
      phone: "01755667788",
      isAdmin: false,
      emailVerified: true,
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80",
      passwordHash: defaultUserPasswordHash,
    },
  ];

  const seededUsers: Record<string, string> = {};

  for (const u of mockUsersList) {
    let existingUser = await db.query.users.findFirst({
      where: eq(users.email, u.email),
    });

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
      await db
        .update(users)
        .set({
          name: u.name,
          phone: u.phone,
          isAdmin: u.isAdmin,
          emailVerified: u.emailVerified,
          avatarUrl: u.avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } else {
      userId = crypto.randomUUID();
      await db.insert(users).values({
        id: userId,
        name: u.name,
        email: u.email,
        phone: u.phone,
        isAdmin: u.isAdmin,
        emailVerified: u.emailVerified,
        avatarUrl: u.avatarUrl,
      });
    }

    seededUsers[u.email] = userId;

    // Email account credentials
    const existingAccount = await db.query.accounts.findFirst({
      where: eq(accounts.userId, userId),
    });

    if (existingAccount) {
      await db
        .update(accounts)
        .set({
          passwordHash: u.passwordHash,
          providerAccountId: u.email,
        })
        .where(eq(accounts.id, existingAccount.id));
    } else {
      await db.insert(accounts).values({
        id: crypto.randomUUID(),
        userId,
        provider: "email",
        providerAccountId: u.email,
        providerUsername: u.name,
        passwordHash: u.passwordHash,
      });
    }
  }

  // 3. Store Settings
  console.log("⚙️ Ensuring Store Settings...");
  await db
    .insert(storeSettings)
    .values({
      id: "default",
      storeName: "স্বাস্থ্যকর (SwasthyoKor)",
      storePhone: "01812345678",
      whatsappNumber: "8801812345678",
      storeEmail: "support@swasthyokor.com",
      storeAddress: "বাড়ি ১২, রোড ৪, ধানমন্ডি, ঢাকা - ১২০৫",
      insideDhakaFee: 60,
      outsideDhakaFee: 120,
      freeShippingMinAmount: 1500,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: storeSettings.id,
      set: {
        storeName: "স্বাস্থ্যকর (SwasthyoKor)",
        storePhone: "01812345678",
        whatsappNumber: "8801812345678",
        storeEmail: "support@swasthyokor.com",
        storeAddress: "বাড়ি ১২, রোড ৪, ধানমন্ডি, ঢাকা - ১২০৫",
        insideDhakaFee: 60,
        outsideDhakaFee: 120,
        freeShippingMinAmount: 1500,
        updatedAt: new Date(),
      },
    });

  // 4. Hero Banners
  console.log("🎨 Seeding Hero Banners...");
  const mockHeroBanners = [
    {
      title: "১০০% খাঁটি সুন্দরবনের কাঁচা মধু",
      highlight: "প্রকৃতির খাঁটি উপহার",
      subtitle: "সরাসরি সুন্দরবনের অভিজ্ঞ মৌয়ালদের কাছ থেকে সংগৃহীত। কোনো ভেজাল বা কৃত্রিম সুগারমুক্ত।",
      link: "/search/organic-essentials",
      accentColor: "text-amber-400",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1600&auto=format&fit=crop&q=85",
      position: 0,
      active: true,
    },
    {
      title: "ঘানি ভাঙা সরিষা ও গাওয়া ঘি",
      highlight: "গ্রামের আদি ঘ্রাণ ও স্বাদ",
      subtitle: "কাঠের ঘানিতে ভাঙা খাঁটি সরিষার তেল ও সিরাজগঞ্জের দেশি গরুর দুধের প্রিমিয়াম গাওয়া ঘি।",
      link: "/search/oils-and-ghee",
      accentColor: "text-emerald-400",
      image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=1600&auto=format&fit=crop&q=85",
      position: 1,
      active: true,
    },
    {
      title: "অর্গানিক সুপারফুড ও প্রিমিয়াম বাদাম",
      highlight: "সুস্বাস্থ্যের প্রতিদিনের পুষ্টি",
      subtitle: "চিয়া সিড, স্পিরুলিনা, মোরিঙ্গা এবং প্রিমিয়াম রোস্টেড কাজু-কাঠবাদাম।",
      link: "/search/superfoods-wellness",
      accentColor: "text-teal-400",
      image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=1600&auto=format&fit=crop&q=85",
      position: 2,
      active: true,
    },
  ];

  await db.delete(heroBanners);
  for (const b of mockHeroBanners) {
    await db.insert(heroBanners).values(b);
  }

  // 5. Coupons
  console.log("🎟️ Seeding Coupons...");
  const mockCoupons = [
    {
      code: "SWASTHYO10",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 1000,
      maxDiscountAmount: 300,
      usageLimit: 500,
      usedCount: 24,
      isActive: true,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    },
    {
      code: "WELCOME100",
      discountType: "fixed",
      discountValue: 100,
      minOrderAmount: 800,
      maxDiscountAmount: 100,
      usageLimit: 1000,
      usedCount: 89,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    {
      code: "ORGANIC20",
      discountType: "percentage",
      discountValue: 20,
      minOrderAmount: 2000,
      maxDiscountAmount: 500,
      usageLimit: 200,
      usedCount: 15,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const c of mockCoupons) {
    const existing = await db.query.coupons.findFirst({
      where: eq(coupons.code, c.code),
    });
    if (existing) {
      await db.update(coupons).set(c).where(eq(coupons.id, existing.id));
    } else {
      await db.insert(coupons).values(c);
    }
  }

  // 6. Blogs
  console.log("📰 Seeding Rich Blogs...");
  const mockBlogs = [
    {
      slug: "benefits-of-raw-sundarban-honey",
      title: "খাঁটি সুন্দরবন মধুর বিস্ময়কর উপকারিতা ও চেনার সহজ উপায়",
      description: "প্রাকৃতিক কাঁচা মধুর ঔষধি গুণাগুণ এবং নকল মধুর হাত থেকে নিজেকে বাঁচানোর বৈজ্ঞানিক উপায়গুলো জানুন।",
      category: "মধু ও পুষ্টি",
      readTime: "৫ মিনিট",
      author: "ডাঃ সুমাইয়া আক্তার (নিউট্রিশনিস্ট)",
      coverImage: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1000&auto=format&fit=crop&q=85",
      content: `
## কেন সুন্দরবনের কাঁচা মধু অনন্য?
সুন্দরবনের প্রাকৃতিক বনাঞ্চল থেকে সংগৃহীত মধু অ্যান্টিঅক্সিডেন্ট, এনজাইম এবং মিনারেলের এক অবিশ্বাস্য ভাণ্ডার। বাণিজ্যিকভাবে পরিশোধিত মধুতে তাপ প্রয়োগ করার কারণে উপকারী এনজাইম নষ্ট হয়ে যায়, কিন্তু প্রাকৃতিক কাঁচা মধু থাকে সম্পূর্ণ সক্রিয়।

### প্রধান স্বাস্থ্য উপকারিতা:
1. **রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি:** মধুতে রয়েছে অ্যান্টিব্যাকটেরিয়াল উপাদান যা সর্দি-কাশি ও ঋতু পরিবর্তনের রোগবালাই প্রতিরোধে সহায়তা করে।
2. **হজমে সহায়তা:** কুসুম গরম পানির সাথে মধু খেলে পেটের গ্যাস ও এসিডিটি দ্রুত উপশম হয়।
3. **প্রাকৃতিক শক্তির উৎস:** শরীর দ্রুত শোষণ করতে পারে এমন প্রাকৃতিক ফ্রুক্টোজ ও গ্লুকোজ থাকায় তাৎক্ষণিক ক্লান্তি দূর হয়।

### খাঁটি মধু চেনার ঘরোয়া উপায়:
- এক গ্লাস পানিতে এক চামচ মধু ঢালুন। খাঁটি মধু সহজে না গুলে সরাসরি তলায় জমাট হয়ে পড়ে থাকবে।
- খাঁটি মধুর ঘ্রাণে বুনো ফুলের এক মিষ্টি প্রাকৃতিক সুবাস পাওয়া যায়।
      `.trim(),
      tags: ["মধু", "সুন্দরবন", "অর্গানিক", "স্বাস্থ্য টিপস"],
      faqs: [
        {
          question: "শীতকালে মধু জমে গেলে কি তা নকল?",
          answer: "না, সরিষা বা নির্দিষ্ট ফুলের কাঁচা মধু শীতকালে প্রাকৃতিক গ্লুকোজের কারণে জমে স্ফটিক বা ক্রিস্টালাইজ হতে পারে। এটি খাঁটি মধুর অন্যতম বৈশিষ্ট্য।",
        },
        {
          question: "শিশুদের মধু খাওয়ানো কি নিরাপদ?",
          answer: "এক বছরের নিচের শিশুদের কাঁচা মধু খাওয়ানো উচিত নয়। তবে এক বছর বা তার বেশি বয়সীদের জন্য এটি অত্যন্ত উপকারী।",
        },
      ],
      relatedProductHandles: ["swasthyo-organic-honey"],
      published: true,
    },
    {
      slug: "cold-pressed-mustard-oil-health-benefits",
      title: "কাঠের ঘানি ভাঙা সরিষার তেল রান্নায় কেন ব্যবহার করবেন?",
      description: "বাজারের পরিশোধিত সয়াবিন তেলের তুলনায় কাঠের ঘানি ভাঙা সরিষার তেল কেন আপনার হৃদযন্ত্র ও পরিবারের জন্য নিরাপদ।",
      category: "তেল ও ঘি",
      readTime: "৬ মিনিট",
      author: "স্বাস্থ্যকর রিসার্চ টিম",
      coverImage: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1000&auto=format&fit=crop&q=85",
      content: `
## ঐতিহ্যবাহী কাঠের ঘানির বিশেষত্ব
কাঠের ঘানিতে তেল ভাঙার সময় তাপমাত্রা কখনোই বেশি বাড়ে না। ফলে তেলের প্রাকৃতিক ফ্যাটি অ্যাসিড, অ্যান্টিঅক্সিডেন্ট ও ভিটামিন 'ই' অটুট থাকে। কোনো কৃত্রিম কেমিক্যাল বা ব্লিচিং এজেন্ট ছাড়া এটি প্রস্তুত হয়।

### প্রধান উপকারিতা:
1. **হার্টের সুরক্ষা:** এতে পর্যাপ্ত ওমেগা-৩ ও ওমেগা-৬ ফ্যাটি অ্যাসিড থাকে যা খারাপ কোলেস্টেরল (LDL) কমাতে সাহায্য করে।
2. **খাবারের আসল স্বাদ:** প্রতিটি রান্নায় দেশি ঐতিহ্যের খাঁটি ঝাঁঝ ও অতুলনীয় সুবাস যুক্ত করে।
3. **প্রদাহনাশক ক্ষমতা:** সরিষার তেলের প্রাকৃতিক গুণ বাত ও জয়েন্টের ব্যথা প্রশমনে যুগ যুগ ধরে ব্যবহৃত।
      `.trim(),
      tags: ["সরিষার তেল", "ঘানি ভাঙা", "রান্না", "স্বাস্থ্য"],
      faqs: [
        {
          question: "ঘানি ভাঙা তেল কতদিন ভালো থাকে?",
          answer: "স্বাভাবিক তাপমাত্রায় কাচের বোতল বা মুখবন্ধ পাত্রে রাখলে এটি ৬ মাস থেকে ১ বছর পর্যন্ত টাটকা থাকে।",
        },
      ],
      relatedProductHandles: ["swasthyo-cold-pressed-mustard-oil"],
      published: true,
    },
    {
      slug: "superfood-chia-seeds-guide",
      title: "চিয়া সিড খাওয়ার সঠিক নিয়ম ও ওজন নিয়ন্ত্রণের উপায়",
      description: "সুপারফুড চিয়া সিড কখন এবং কিভাবে খেলে সর্বাধিক পুষ্টি ও ওজন নিয়ন্ত্রণের সুবিধা পাওয়া যায়।",
      category: "সুপারফুড",
      readTime: "৪ মিনিট",
      author: "পুষ্টিবিদ তানভীন আলম",
      coverImage: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=1000&auto=format&fit=crop&q=85",
      content: `
## পুষ্টির পাওয়ারহাউস: চিয়া সিড
চিয়া সিডে রয়েছে প্রচুর দ্রবণীয় ফাইবার, ওমেগা-৩ ফ্যাটি অ্যাসিড, প্রোটিন, ক্যালসিয়াম এবং অ্যান্টিঅক্সিডেন্ট। পানিতে ভিজিয়ে রাখলে এটি জেলির মতো রূপ ধারণ করে যা পেটে দীর্ঘক্ষণ পূর্ণতার অনুভূতি দেয়।

### খাওয়ার সর্বোত্তম নিয়ম:
- ১ থেকে ২ চা চামচ চিয়া সিড পানিতে অন্তত ২০-৩০ মিনিট ভিজিয়ে রেখে সকালে খালি পেটে বা লেবুর রসের সাথে খান।
- স্মুদি, ওটস, বা টক দইয়ের সাথে মিশিয়ে পুষ্টিকর ব্রেকফাস্ট হিসেবেও গ্রহণ করতে পারেন।
      `.trim(),
      tags: ["চিয়া সিড", "ওজন নিয়ন্ত্রণ", "সুপারফুড"],
      faqs: [
        {
          question: "শুকনো চিয়া সিড খাওয়া কি নিরাপদ?",
          answer: "না, চিয়া সিড সবসময় পানিতে ভিজিয়ে জেল তৈরি করে খাওয়া উচিত, কারণ শুকনো চিয়া সিড গলায় আটকে যেতে পারে।",
        },
      ],
      relatedProductHandles: ["swasthyo-chia-seeds"],
      published: true,
    },
  ];

  for (const b of mockBlogs) {
    const existing = await db.query.blogs.findFirst({
      where: eq(blogs.slug, b.slug),
    });
    if (existing) {
      await db.update(blogs).set(b).where(eq(blogs.id, existing.id));
    } else {
      await db.insert(blogs).values({
        id: crypto.randomUUID(),
        ...b,
      });
    }
  }

  // 7. Orders
  console.log("📦 Seeding Rich Orders...");
  const mockOrders = [
    {
      id: "ORD-2026-1001",
      email: "farhana.islam@gmail.com",
      phone: "01755667788",
      customerName: "Farhana Islam",
      shippingAddress: "বাড়ি ১৫, রোড ৭, সেক্টর ৪, উত্তরা, ঢাকা",
      paymentMethod: "online",
      paymentStatus: "paid",
      paymentInvoiceId: "INV-BKASH-982145",
      paymentTrxId: "TRX9823485791",
      paymentSenderNumber: "01755667788",
      couponCode: "WELCOME100",
      discountAmount: 100,
      totalAmount: 1200,
      totalCurrency: "BDT",
      status: "delivered",
      items: [
        {
          productHandle: "swasthyo-organic-honey",
          productTitle: "খাঁটি সুন্দরবন মধু (Pure Sundarban Raw Honey)",
          variantTitle: "১ কেজি",
          quantity: 1,
          priceAmount: 850,
          priceCurrency: "BDT",
        },
        {
          productHandle: "swasthyo-cold-pressed-mustard-oil",
          productTitle: "ঘানি ভাঙা সরিষার তেল (Cold Pressed Mustard Oil)",
          variantTitle: "১ লিটার",
          quantity: 1,
          priceAmount: 360,
          priceCurrency: "BDT",
        },
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      id: "ORD-2026-1002",
      email: "arif.rahman@gmail.com",
      phone: "01623456789",
      customerName: "Arifur Rahman",
      shippingAddress: "প্লট ৯২, ব্লক সি, বনানী, ঢাকা",
      paymentMethod: "cod",
      paymentStatus: "paid",
      paymentInvoiceId: "INV-COD-481923",
      totalAmount: 1450,
      totalCurrency: "BDT",
      status: "delivered",
      items: [
        {
          productHandle: "swasthyo-organic-ghee",
          productTitle: "গাওয়া ঘি (Pure Grass-fed Cow Ghee)",
          variantTitle: "৫০০ গ্রাম",
          quantity: 1,
          priceAmount: 1450,
          priceCurrency: "BDT",
        },
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      id: "ORD-2026-1003",
      email: "nusrat.jahan@gmail.com",
      phone: "01987654321",
      customerName: "Nusrat Jahan",
      shippingAddress: "হোল্ডিং নং ৮/এ, কাজীর দেউড়ি, চট্টগ্রাম",
      paymentMethod: "online",
      paymentStatus: "paid",
      paymentInvoiceId: "INV-NAGAD-382910",
      paymentTrxId: "TRX8472910482",
      paymentSenderNumber: "01987654321",
      couponCode: "SWASTHYO10",
      discountAmount: 127,
      totalAmount: 1143,
      totalCurrency: "BDT",
      status: "shipping",
      items: [
        {
          productHandle: "swasthyo-chia-seeds",
          productTitle: "অর্গানিক চিয়া সিড (Premium Organic Chia Seeds)",
          variantTitle: "৫০০ গ্রাম",
          quantity: 2,
          priceAmount: 420,
          priceCurrency: "BDT",
        },
        {
          productHandle: "swasthyo-moringa-powder",
          productTitle: "সজিনা পাতা গুঁড়ো (Organic Moringa Leaf Powder)",
          variantTitle: "২০০ গ্রাম",
          quantity: 1,
          priceAmount: 450,
          priceCurrency: "BDT",
        },
      ],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: "ORD-2026-1004",
      email: "mdrokonuzzaman45@gmail.com",
      phone: "01712345678",
      customerName: "Md Rokonuzzaman",
      shippingAddress: "ধানমন্ডি ৪/এ, ঢাকা",
      paymentMethod: "online",
      paymentStatus: "pending",
      paymentInvoiceId: "INV-UPAY-592019",
      totalAmount: 2300,
      totalCurrency: "BDT",
      status: "confirmed",
      items: [
        {
          productHandle: "swasthyo-organic-honey",
          productTitle: "খাঁটি সুন্দরবন মধু (Pure Sundarban Raw Honey)",
          variantTitle: "১ কেজি",
          quantity: 2,
          priceAmount: 850,
          priceCurrency: "BDT",
        },
        {
          productHandle: "swasthyo-almonds-badam",
          productTitle: "আমেরিকান প্রিমিয়াম কাঠবাদাম (California Almonds)",
          variantTitle: "৫০০ গ্রাম",
          quantity: 1,
          priceAmount: 620,
          priceCurrency: "BDT",
        },
      ],
      createdAt: new Date(),
    },
  ];

  for (const o of mockOrders) {
    const existing = await db.query.orders.findFirst({
      where: eq(orders.id, o.id),
    });
    if (existing) {
      await db.update(orders).set(o).where(eq(orders.id, o.id));
    } else {
      await db.insert(orders).values(o);
    }
  }

  // 8. Product Reviews
  console.log("⭐ Seeding Product Reviews...");
  const sampleProducts = await db.query.products.findMany({ limit: 10 });
  const honeyProd = sampleProducts.find((p) => p.handle === "swasthyo-organic-honey");
  const gheeProd = sampleProducts.find((p) => p.handle === "swasthyo-organic-ghee");
  const mustardProd = sampleProducts.find((p) => p.handle === "swasthyo-cold-pressed-mustard-oil");
  const chiaProd = sampleProducts.find((p) => p.handle === "swasthyo-chia-seeds");

  const reviewsToInsert = [];
  if (honeyProd) {
    reviewsToInsert.push(
      {
        productId: honeyProd.id,
        userId: seededUsers["farhana.islam@gmail.com"],
        userName: "ফারহানা ইসলাম",
        userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
        rating: 5,
        comment: "সুন্দরবনের আসল কাঁচা মধু! স্বাদ ও সুবাস অসাধারণ। পরিবারের সবাই খুব পছন্দ করেছে।",
        approved: true,
      },
      {
        productId: honeyProd.id,
        userId: seededUsers["arif.rahman@gmail.com"],
        userName: "আরিফুর রহমান",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        rating: 5,
        comment: "প্যাকেজিং এবং ডেলিভারি খুব দ্রুত ছিল। বাজারজাত ভেজাল মধুর সাথে কোনো তুলনাই চলে না।",
        approved: true,
      }
    );
  }

  if (gheeProd) {
    reviewsToInsert.push({
      productId: gheeProd.id,
      userId: seededUsers["nusrat.jahan@gmail.com"],
      userName: "নুসরাত জাহান",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      rating: 5,
      comment: "ঘিয়ের সুঘ্রাণে পুরো ঘর ভরে যায়। গরম ভাতে এই ঘি যেন অমৃত! ধন্যবাদ স্বাস্থ্যকর।",
      approved: true,
    });
  }

  if (mustardProd) {
    reviewsToInsert.push({
      productId: mustardProd.id,
      userId: seededUsers["farhana.islam@gmail.com"],
      userName: "ফারহানা ইসলাম",
      userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
      rating: 5,
      comment: "আসল ঝাঁঝালো সরিষার তেল। ভর্তা আর ইলিশ ভাজায় একদম পারফেক্ট টেস্ট।",
      approved: true,
    });
  }

  if (chiaProd) {
    reviewsToInsert.push({
      productId: chiaProd.id,
      userId: seededUsers["arif.rahman@gmail.com"],
      userName: "আরিফুর রহমান",
      userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      rating: 5,
      comment: "প্রিমিয়াম কোয়ালিটি চিয়া সিড। কোনো বালু বা ময়লা নেই, একদম ফ্রেশ।",
      approved: true,
    });
  }

  for (const r of reviewsToInsert) {
    await db.insert(productReviews).values({
      id: crypto.randomUUID(),
      ...r,
    });
  }

  // 9. Update Collections to showOnHomepage = true
  console.log("📂 Setting Collections for Homepage Showcase & Slider...");
  const homepageCategoryConfigs = [
    {
      handle: "organic-essentials",
      title: "খাঁটি পণ্য",
      subtitle: "মধু, ঘি, তেল ও দৈনন্দিন অর্গানিক প্রয়োজনীয় খাদ্য",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80",
      showOnHomepage: true,
      displayOrder: 1,
      maxProducts: 4,
    },
    {
      handle: "superfoods-wellness",
      title: "সুপারফুড ও সুস্থতা",
      subtitle: "চিয়া সিড, মোরিঙ্গা, স্পিরুলিনা ও স্বাস্থ্যকর খাবার",
      image: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=500&auto=format&fit=crop&q=80",
      showOnHomepage: true,
      displayOrder: 2,
      maxProducts: 4,
    },
    {
      handle: "nuts-dry-fruits",
      title: "বাদাম ও খেজুর",
      subtitle: "আমেরিকান কাঠবাদাম, কাজুবাদাম ও মদিনার মরিয়ম খেজুর",
      image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&auto=format&fit=crop&q=80",
      showOnHomepage: true,
      displayOrder: 3,
      maxProducts: 4,
    },
    {
      handle: "oils-and-ghee",
      title: "তেল ও ঘি",
      subtitle: "ঘানি ভাঙা খাঁটি সরিষার তেল ও সিরাজগঞ্জের গাওয়া ঘি",
      image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&auto=format&fit=crop&q=80",
      showOnHomepage: true,
      displayOrder: 4,
      maxProducts: 4,
    },
  ];

  for (const cat of homepageCategoryConfigs) {
    await db
      .update(collections)
      .set({
        showOnHomepage: cat.showOnHomepage,
        displayOrder: cat.displayOrder,
        subtitle: cat.subtitle,
        image: cat.image,
        maxProducts: cat.maxProducts,
        updatedAt: new Date(),
      })
      .where(eq(collections.handle, cat.handle));
  }

  console.log("✅ Rich Mock Data successfully seeded!");
  console.log("--------------------------------------------------");
  console.log("👑 ADMIN CREDENTIALS:");
  console.log("Email: mdrokonuzzaman45@gmail.com");
  console.log("Password: mdrokonuzzaman45");
  console.log("Role: Admin (isAdmin: true)");
  console.log("--------------------------------------------------");
  console.log("👥 NORMAL USER CREDENTIALS:");
  console.log("Email: farhana.islam@gmail.com | Password: user123456");
  console.log("Email: arif.rahman@gmail.com    | Password: user123456");
  console.log("Email: nusrat.jahan@gmail.com   | Password: user123456");
  console.log("--------------------------------------------------");

  process.exit(0);
}

seedRichData().catch((err) => {
  console.error("❌ Error seeding rich mock data:", err);
  process.exit(1);
});
