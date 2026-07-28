import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // @ts-expect-error
    turbopack: {
      root: ".",
    },
  },
};

export default nextConfig;
