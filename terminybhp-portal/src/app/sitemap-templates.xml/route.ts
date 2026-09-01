import { canonicalUrl } from "@/lib/seo";
import { renderSitemap } from "@/lib/sitemapXml";

export const dynamic = "force-static";

export function GET() {
  return renderSitemap([
    { url: canonicalUrl("/templates/"), changeFrequency: "monthly", priority: 0.5 },
  ]);
}
