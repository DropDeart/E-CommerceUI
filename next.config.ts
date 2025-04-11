import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '7220',
        pathname: '/uploads/**',
      },
    ],
    // Aşağıdaki ayarı ekleyin
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Node.js TLS doğrulamasını devre dışı bırak
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:7220'],
    },
  },
};

export default nextConfig;
