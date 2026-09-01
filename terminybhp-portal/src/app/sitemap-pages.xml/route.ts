import { renderSitemap, staticPageEntries } from "@/lib/sitemapXml";

export const dynamic = "force-static";

export function GET() {
  return renderSitemap(staticPageEntries);
}
