import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  // Prevent bundling of server-only packages
  serverExternalPackages: ["@prisma/client", "bcryptjs", "twilio"],
};

export default nextConfig;
