import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "192.168.1.104",
    "192.168.1.104:3000",
    "localhost:3000",
  ],
};

export default nextConfig;
