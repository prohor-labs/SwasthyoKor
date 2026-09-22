import type { MetadataRoute } from "next";
import {
  getBlogs,
  getCollections,
  getPages,
  getProducts,
} from "@/lib/db/queries";
import { baseUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routesMap = ["", "search", "blog", "faq"].map((route) => ({
    url: `${baseUrl}/${route}`,
    lastModified: new Date().toISOString(),
  }));

  const blogsPromise = getBlogs().then((blogsList) =>
    blogsList.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
    })),
  );

  const collectionsPromise = getCollections().then((collections) =>
    collections.map((collection) => ({
      url: `${baseUrl}${collection.path}`,
      lastModified: collection.updatedAt,
    })),
  );

  const productsPromise = getProducts({}).then((products) =>
    products.map((product) => ({
      url: `${baseUrl}/product/${product.handle}`,
      lastModified: product.updatedAt,
    })),
  );

  const pagesPromise = getPages().then((pages) =>
    pages.map((page) => ({
      url: `${baseUrl}/${page.handle}`,
      lastModified: page.updatedAt,
    })),
  );

  const [blogsList, collections, products, pages] = await Promise.all([
    blogsPromise,
    collectionsPromise,
    productsPromise,
    pagesPromise,
  ]);

  return [...routesMap, ...blogsList, ...collections, ...products, ...pages];
}
