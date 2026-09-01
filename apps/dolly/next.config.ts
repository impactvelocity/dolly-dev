import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@webmcp-sdk/experience"],
};

export default nextConfig;
