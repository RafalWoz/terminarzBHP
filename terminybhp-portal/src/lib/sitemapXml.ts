import { canonicalUrl, siteUrl } from "@/lib/seo";

type SitemapEntry = {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

type SitemapIndexEntry = {
  url: string;
  lastModified?: string | Date;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(value: string | Date | undefined) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function xmlResponse(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-cache, must-revalidate",
    },
  });
}

export function renderSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((entry) => {
    const lastModified = formatDate(entry.lastModified);
    return [
      "  <url>",
      `    <loc>${escapeXml(entry.url)}</loc>`,
      lastModified ? `    <lastmod>${lastModified}</lastmod>` : undefined,
      entry.changeFrequency ? `    <changefreq>${entry.changeFrequency}</changefreq>` : undefined,
      typeof entry.priority === "number" ? `    <priority>${entry.priority.toFixed(1)}</priority>` : undefined,
      "  </url>",
    ].filter(Boolean).join("\n");
  }).join("\n");

  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
}

export function renderSitemapIndex(entries: SitemapIndexEntry[]) {
  const sitemaps = entries.map((entry) => {
    const lastModified = formatDate(entry.lastModified);
    return [
      "  <sitemap>",
      `    <loc>${escapeXml(entry.url)}</loc>`,
      lastModified ? `    <lastmod>${lastModified}</lastmod>` : undefined,
      "  </sitemap>",
    ].filter(Boolean).join("\n");
  }).join("\n");

  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps}\n</sitemapindex>\n`);
}

export const sitemapLocations = {
  pages: `${siteUrl}/sitemap-pages.xml`,
  blog: `${siteUrl}/sitemap-blog.xml`,
};

export const staticPageEntries: SitemapEntry[] = [
  { url: canonicalUrl("/"), changeFrequency: "weekly", priority: 1 },
  { url: canonicalUrl("/blog/"), changeFrequency: "weekly", priority: 0.9 },
  { url: canonicalUrl("/polityka-prywatnosci/"), changeFrequency: "yearly", priority: 0.3 },
];
