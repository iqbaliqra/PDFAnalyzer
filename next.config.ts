import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "jsonwebtoken", "bcryptjs"],
};

export default nextConfig;
