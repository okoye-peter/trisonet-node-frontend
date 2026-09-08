import type { NextConfig } from "next";
import { ALLOWED_IMAGE_HOSTS } from "./src/lib/shopUtils";

const nextConfig: NextConfig & { allowedDevOrigins?: string[] } = {
    output: 'standalone',
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        remotePatterns: ALLOWED_IMAGE_HOSTS.map((hostname) => ({
            protocol: 'https' as const,
            hostname,
        })),
    },
    allowedDevOrigins: ["10.175.228.225", "trisonet-project.test", "http://localhost:5000", "trisonet.com", "httsp://trisonet.com"],

    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
    serverActions: {
      allowedOrigins: ['app.trisonet.com', 'trisonet.com', 'www.trisonet.com', 'httsp://trisonet.com'],
    },
  },
};

export default nextConfig;
