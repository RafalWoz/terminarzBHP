import { renderSitemapIndex, sitemapLocations } from "@/lib/sitemapXml";

export const dynamic = "force-static";

export function GET() {
  return renderSitemapIndex([
    { url: sitemapLocations.pages },
    { url: sitemapLocations.blog },
  ]);
}
