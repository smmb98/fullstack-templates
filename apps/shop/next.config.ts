import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@showcase/api-contract", "@showcase/mocks", "@showcase/ui"],
  poweredByHeader: false,
};

export default nextConfig;
