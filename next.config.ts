import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },

  serverExternalPackages: ["@prisma/client", "bcryptjs", "twilio"],

  // Add this block to ignore TypeScript errors on production build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;