import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, ShieldCheck } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBlogs } from "@/lib/db/queries";
import { baseUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "স্বাস্থ্য ও পুষ্টি গাইড (Health Blog) | স্বাস্থ্যকর",
  description:
    "খাঁটি সুন্দরবন মধু, কাঠের ঘানির সরিষার তেল, ঘি ও অর্গানিক সুপারফুডের পুষ্টিগুণ, ব্যবহার বিধি ও বিশেষজ্ঞ স্বাস্থ্য টিপস।",
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
  openGraph: {
    title: "স্বাস্থ্য ও পুষ্টি গাইড (Health Blog) | স্বাস্থ্যকর",
    description:
      "খাঁটি সুন্দরবন মধু, কাঠের ঘানির সরিষার তেল, ঘি ও অর্গানিক সুপারফুডের পুষ্টিগুণ, ব্যবহার বিধি ও বিশেষজ্ঞ স্বাস্থ্য টিপস।",
    url: `${baseUrl}/blog`,
    type: "website",
  },
};

export default async function BlogListingPage() {
  const blogs = await getBlogs();
  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "স্বাস্থ্যকর ব্লগ ও পুষ্টি গাইড",
    description:
      "খাঁটি অর্গানিক খাদ্যের স্বাস্থ্য উপকারিতা, খাঁটি খাদ্য চেনার উপায় ও পুষ্টি সংক্রান্ত বৈজ্ঞানিক গাইড।",
    url: `${baseUrl}/blog`,
    publisher: {
      "@type": "Organization",
      name: "SwasthyoKor",
      url: baseUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogListSchema),
        }}
      />
      <div className="container-layout py-8 sm:py-12">
        {/* Header Banner */}
        <div className="mb-10 text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
          <Badge variant="secondary" className="gap-1.5 px-3 py-1">
            <ShieldCheck data-icon="inline-start" />
            <span>১০০% খাঁটি তথ্য ও গবেষণা</span>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            স্বাস্থ্য ও পুষ্টি ব্লগ
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            প্রাকৃতিক খাদ্য, রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি ও খাঁটি খাদ্য চেনার নির্ভরযোগ্য বৈজ্ঞানিক
            গাইডলাইন।
          </p>
        </div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {blogs.map((post) => (
            <Card
              key={post.slug}
              className="flex flex-col justify-between overflow-hidden p-0 py-0 transition hover:shadow-md hover:border-emerald-500/40"
            >
              {/* Cover Image */}
              <Link
                href={`/blog/${post.slug}`}
                className="relative aspect-video w-full overflow-hidden bg-muted block group"
              >
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              <CardHeader className="px-5 pt-4 pb-1">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline">{post.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {post.readTime}
                  </span>
                </div>
                <CardTitle className="line-clamp-2 hover:text-emerald-600 transition text-lg font-bold">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </CardTitle>
              </CardHeader>

              <CardContent className="px-5 py-2">
                <CardDescription className="line-clamp-3 leading-relaxed text-xs sm:text-sm">
                  {post.description}
                </CardDescription>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-border/40 px-5 py-3 mt-auto">
                <span className="text-xs font-medium text-muted-foreground">
                  {post.author}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto"
                  render={
                    <Link
                      href={`/blog/${post.slug}`}
                      className="gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                    >
                      সম্পূর্ণ পড়ুন
                      <ArrowRight data-icon="inline-end" />
                    </Link>
                  }
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
