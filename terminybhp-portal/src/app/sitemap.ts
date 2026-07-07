import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/content";

export const dynamic = "force-static";

const siteUrl = "https://terminybhp.pl";

function canonicalUrl(path = "/") {
  return `${siteUrl}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: canonicalUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: canonicalUrl("/blog/"), changeFrequency: "weekly", priority: 0.9 },
    { url: canonicalUrl("/tools/"), changeFrequency: "monthly", priority: 0.5 },
    { url: canonicalUrl("/templates/"), changeFrequency: "monthly", priority: 0.5 },
    { url: canonicalUrl("/polityka-prywatnosci/"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const posts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: canonicalUrl(`/blog/${post.slug}/`),
    lastModified: post.publishedAt || post.date,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...posts];
}
