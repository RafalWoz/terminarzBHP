import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/content";

export const dynamic = "force-static";

const siteUrl = "https://terminybhp.pl";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/tools`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/templates`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/polityka-prywatnosci`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const posts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.publishedAt || post.date,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...posts];
}
