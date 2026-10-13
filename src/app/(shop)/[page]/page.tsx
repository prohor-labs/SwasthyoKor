import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Prose } from "@/components/prose";
import { getPage, getPages } from "@/lib/db/queries";

import { baseUrl } from "@/lib/utils";

export async function generateStaticParams() {
  const pages = await getPages();
  return pages.map((page) => ({ page: page.handle }));
}

export async function generateMetadata(props: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page: pageHandle } = await props.params;
  const page = await getPage(pageHandle);

  if (!page) return notFound();

  const title = `${page.seo?.title || page.title} | স্বাস্থ্যকর`;
  const description = page.seo?.description || page.bodySummary;
  const pageUrl = `${baseUrl}/${page.handle}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function CMSPage(props: {
  params: Promise<{ page: string }>;
}) {
  const { page: pageHandle } = await props.params;
  const page = await getPage(pageHandle);

  if (!page) return notFound();

  const pageUrl = `${baseUrl}/${page.handle}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.title,
    description: page.seo?.description || page.bodySummary,
    url: pageUrl,
    datePublished: page.createdAt,
    dateModified: page.updatedAt,
    author: {
      "@type": "Organization",
      name: "SwasthyoKor",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "SwasthyoKor",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon.png`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <div className="container-layout py-8 sm:py-10 max-w-3xl">
        <h1 className="mb-5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {page.title}
        </h1>
        {page.body?.includes("<") ? (
          <Prose className="leading-relaxed" html={page.body} />
        ) : (
          <div className="text-base leading-relaxed text-foreground whitespace-pre-line">
            {page.body}
          </div>
        )}
      </div>
    </>
  );
}
