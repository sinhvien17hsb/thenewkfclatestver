import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3", "bcryptjs"],
  outputFileTracingIncludes: {
    "/api/**/*": ["./dev.db"],
  },
  images: {
    domains: [],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
