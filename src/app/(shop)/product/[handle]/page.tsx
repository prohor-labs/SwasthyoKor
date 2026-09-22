import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Gallery, ProductDescription } from "@/components/product";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getProduct,
  getProductRecommendations,
  getProductReviews,
} from "@/lib/db/queries";
import type { Image as ImageType } from "@/lib/types";
import { baseUrl } from "@/lib/utils";

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await props.params;
  const product = await getProduct(handle);

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const productUrl = `${baseUrl}/product/${handle}`;

  return {
    title: `${product.seo.title || product.title} | স্বাস্থ্যকর`,
    description: product.seo.description || product.description,
    alternates: {
      canonical: productUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      title: product.title,
      description: product.seo.description || product.description,
      url: productUrl,
      type: "website",
      images: url
        ? [
            {
              url,
              width: width || 800,
              height: height || 800,
              alt: alt || product.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.seo.description || product.description,
      images: url ? [url] : [],
    },
  };
}

import { ProductReviews } from "@/components/product/ProductReviews";

export default async function ProductPage(props: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await props.params;
  const product = await getProduct(handle);

  if (!product) return notFound();

  const dbReviews = await getProductReviews(product.id);
  const formattedReviews = dbReviews.map((r) => ({
    id: r.id,
    userName: r.userName,
    userAvatar: r.userAvatar,
    rating: r.rating,
    date: new Date(r.createdAt).toLocaleDateString("bn-BD"),
    comment: r.comment,
  }));

  const productUrl = `${baseUrl}/product/${product.handle}`;

  const schemas = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "হোম",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "পণ্যসমূহ",
            item: `${baseUrl}/search`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.title,
            item: productUrl,
          },
        ],
      },
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: product.title,
        description: product.description,
        image: product.featuredImage?.url
          ? [product.featuredImage.url]
          : product.images?.map((img) => img.url),
        brand: {
          "@type": "Brand",
          name: "SwasthyoKor (স্বাস্থ্যকর)",
        },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: product.priceRange.minVariantPrice.currencyCode,
          highPrice: product.priceRange.maxVariantPrice.amount,
          lowPrice: product.priceRange.minVariantPrice.amount,
          offerCount: product.variants?.length || 1,
          availability: product.availableForSale
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: productUrl,
          seller: {
            "@type": "Organization",
            name: "SwasthyoKor",
          },
        },
        ...(formattedReviews.length > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: (
                  formattedReviews.reduce((sum, r) => sum + r.rating, 0) /
                  formattedReviews.length
                ).toFixed(1),
                reviewCount: formattedReviews.length.toString(),
                bestRating: "5",
                worstRating: "1",
              },
            }
          : {}),
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `${product.title}-এর বিশুদ্ধতা এবং মানের নিশ্চয়তা কী?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: "স্বাস্থ্যকর (SwasthyoKor)-এর প্রতিটি পণ্য প্রাকৃতিক ও ভেজালমুক্ত। আমরা সরাসরি কৃষক ও নিজস্ব তত্ত্বাবধানে সংগৃহীত উপাদান মান যাচাইয়ের পর গ্রাহকদের কাছে পৌঁছে দেই।",
            },
          },
          {
            "@type": "Question",
            name: "ডেলিভারি পেতে কত সময় লাগে?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "ঢাকা সিটির ভেতরে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২ থেকে ৩ কার্যদিবসের মধ্যে ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধাসহ ডেলিভারি সম্পন্ন হয়।",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas),
        }}
      />
      <div className="container-layout page-section-spacing">
        <div className="flex flex-col border-0 sm:border sm:border-border/60 bg-transparent sm:bg-card sm:rounded-3xl sm:p-6 md:p-8 sm:shadow-sm lg:flex-row lg:gap-12">
          <div className="size-full basis-full lg:basis-4/6">
            <Suspense
              fallback={
                <Skeleton className="aspect-square size-full max-h-[400px] sm:max-h-[550px] rounded-2xl md:rounded-3xl" />
              }
            >
              <Gallery
                images={product.images.slice(0, 5).map((image: ImageType) => ({
                  src: image.url,
                  altText: image.altText,
                }))}
              />
            </Suspense>
          </div>

          <div className="basis-full pt-4 lg:pt-0 lg:basis-2/6">
            <Suspense fallback={null}>
              <ProductDescription product={product} />
            </Suspense>
          </div>
        </div>

        {/* Customer Reviews & Ratings Section */}
        <ProductReviews
          productTitle={product.title}
          productHandle={product.handle}
          initialReviews={formattedReviews}
        />

        <Suspense fallback={null}>
          <RelatedProducts id={product.id} />
        </Suspense>
      </div>
    </>
  );
}

import { ProductCard } from "@/components/product";

async function RelatedProducts({ id }: { id: string }) {
  const relatedProducts = await getProductRecommendations(id);

  if (!relatedProducts.length) return null;

  return (
    <div className="py-8 sm:py-12 border-t border-border/40">
      <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
        সম্পর্কিত অন্যান্য পণ্য
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {relatedProducts.slice(0, 4).map((product) => (
          <ProductCard key={product.handle} product={product} />
        ))}
      </div>
    </div>
  );
}
