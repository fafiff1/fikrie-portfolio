import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      {
        source: "/family",
        destination: "/about/family",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
