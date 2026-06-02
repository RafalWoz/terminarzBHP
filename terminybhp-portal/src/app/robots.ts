import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/serwis/",
    },
    sitemap: "https://terminybhp.pl/sitemap.xml",
  };
}
