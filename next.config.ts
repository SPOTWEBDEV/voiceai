import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  // Prevent bundling of heavy server-only packages
  serverExternalPackages: ["@prisma/client", "bcryptjs", "twilio", "nodemailer"],

  // Reduce webpack memory usage
  webpack: (config, { isServer }) => {
    // Reduce parallelism to save memory
    config.parallelism = 1;

    // Disable source maps in production to save memory
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          maxSize: 200000, // 200kb chunks max
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: "framework",
              chunks: "all",
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            commons: {
              name: "commons",
              chunks: "all",
              minChunks: 2,
              priority: 20,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
