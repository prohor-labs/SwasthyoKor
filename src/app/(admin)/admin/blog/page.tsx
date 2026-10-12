import type { Metadata } from "next";
import { AdminBlogManager } from "@/components/admin";
import { getBlogs } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "ব্লগ ও কনটেন্ট পরিচালনা | অ্যাডমিন",
  description: "স্বাস্থ্যকর অর্গানিক ফুড হেলথ গাইড ও ব্লগ আর্টিকেল পরিচালনা।",
};

export default async function AdminBlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            ব্লগ ও কনটেন্ট পরিচালনা
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            এসইও ও এআই সার্চ (GEO) এর জন্য হেলথ গাইড আর্টিকেল লিখুন, সম্পাদনা করুন ও
            পরিচালনা করুন।
          </p>
        </div>
      </div>

      <AdminBlogManager initialPosts={blogs} />
    </div>
  );
}
