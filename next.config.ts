import type { NextConfig } from "next";

const nextConfig: NextConfig & { allowedDevOrigins?: string[] } = {
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    allowedDevOrigins: ["10.175.228.225", "trisonet-project.test", "http://localhost:5000"],

    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
    serverActions: {
      allowedOrigins: ['app.trisonet.com'],
    },
  },
};

export default nextConfig;
