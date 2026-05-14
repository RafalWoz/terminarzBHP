import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/serwis/:path*',
        // Adres LH.pl. Zależnie od struktury konta, może wymagać usunięcia "/terminybhp"
        destination: 'https://serwer50635.lh.pl/terminybhp/serwis/:path*',
      },
      {
        source: '/serwis',
        destination: 'https://serwer50635.lh.pl/terminybhp/serwis/index.html',
      }
    ];
  },
};

export default nextConfig;
