import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "jsonwebtoken", "bcryptjs"],
  outputFileTracingIncludes: {
    "/api/analyze-pdf": [
      "./node_modules/pdf-parse/dist/**/*",
      "./node_modules/pdfjs-dist/legacy/build/**/*",
    ],
  },
};

export default nextConfig;
