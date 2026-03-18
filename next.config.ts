import type { NextConfig } from "next";

const nextConfig: NextConfig & { allowedDevOrigins?: string[] } = {
    experimental: {
        // Some experimental features might be needed here
    },
    allowedDevOrigins: ["10.175.228.225", "trisonet-project.test", "http://localhost:5000"]
};

export default nextConfig;
