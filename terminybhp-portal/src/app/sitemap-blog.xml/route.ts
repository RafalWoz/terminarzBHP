import { getAllCategories, getAllPosts, getPostModifiedDate } from "@/lib/content";
import { canonicalUrl } from "@/lib/seo";
import { renderSitemap } from "@/lib/sitemapXml";

export const dynamic = "force-static";

export function GET() {
  const postEntries = getAllPosts().map((post) => ({
    url: canonicalUrl(`/blog/${post.slug}/`),
    lastModified: getPostModifiedDate(post),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  const categoryEntries = getAllCategories().map((category) => ({
    url: canonicalUrl(`/blog/kategoria/${category.slug}/`),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return renderSitemap([...postEntries, ...categoryEntries]);
}
