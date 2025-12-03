import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimized for Vercel Edge/Serverless deployment
  serverExternalPackages: ['@elevenlabs/react'],
  // Enable Turbopack for better performance
  turbopack: {},
};

export default nextConfig;
