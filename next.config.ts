import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },

  serverExternalPackages: ["@prisma/client", "bcryptjs", "twilio"],

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;