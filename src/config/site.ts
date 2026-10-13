export interface SiteConfig {
  name: string;
  shortName: string;
  companyName: string;
  description: string;
  url: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  address: string;
  meta: {
    title: string;
    description: string;
    ogImage: string;
    keywords: string[];
  };
}

export const siteConfig: SiteConfig = {
  name: "স্বাস্থ্যকর",
  shortName: "SwasthyoKor",
  companyName: "স্বাস্থ্যকর (SwasthyoKor)",
  description: "The Symbol of Faith and Trust. ১০০% খাঁটি সুন্দরবন মধু, কাঠের ঘানি ভাঙা তেল, গাওয়া ঘি ও অর্গানিক সুপারফুড।",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://swasthyokor.prohor.dev",
  supportEmail: "support@swasthyokor.com",
  supportPhone: "01812345678",
  whatsappNumber: "8801812345678",
  address: "বাড়ি ১২, রোড ৪, ধানমন্ডি, ঢাকা - ১২০৫",
  meta: {
    title: "স্বাস্থ্যকর | The Symbol of Faith and Trust",
    description: "খাঁটি সুন্দরবন মধু, ঘানি ভাঙা সরিষার তেল, গাওয়া ঘি ও সেরা অর্গানিক সুপারফুডের বিশ্বস্ত শপ।",
    ogImage: "/icon.png",
    keywords: [
      "স্বাস্থ্যকর",
      "SwasthyoKor",
      "মধু",
      "সুন্দরবন মধু",
      "সরিষার তেল",
      "গাওয়া ঘি",
      "অর্গানিক ফুড",
      "খেজুর",
      "মসলা",
      "সুপারফুড",
    ],
  },
};
