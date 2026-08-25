import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tidak menggunakan output: "standalone" karena Vercel menangani build otomatis
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
