import { getAllPosts } from "@/lib/content";
import { canonicalUrl } from "@/lib/seo";
import { renderSitemap } from "@/lib/sitemapXml";

export const dynamic = "force-static";

export function GET() {
  return renderSitemap(getAllPosts().map((post) => ({
    url: canonicalUrl(`/blog/${post.slug}/`),
    lastModified: post.publishedAt || post.date,
    changeFrequency: "monthly",
    priority: 0.8,
  })));
}
