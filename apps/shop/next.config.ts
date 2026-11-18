import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@fullstack-templates/api-contract", "@fullstack-templates/mocks", "@fullstack-templates/ui"],
  poweredByHeader: false,
};

export default nextConfig;
