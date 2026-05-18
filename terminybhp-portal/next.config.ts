import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: "/serwis/:path*",
        destination: "https://serwer50635.lh.pl/terminybhp/serwis/:path*",
      },
      {
        source: "/serwis",
        destination: "https://serwer50635.lh.pl/terminybhp/serwis/index.html",
      },
    ];
  },
};

export default nextConfig;
