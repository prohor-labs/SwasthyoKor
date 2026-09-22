import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/api/*", "/checkout/*"],
      },
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
          "Applebot",
        ],
        allow: "/",
        disallow: ["/admin", "/admin/*", "/api/*", "/checkout/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
