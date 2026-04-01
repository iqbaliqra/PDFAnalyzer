import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "pdf-parse",
    "pdfjs-dist",
    "jsonwebtoken",
    "bcryptjs",
    "busboy",
    "streamsearch",
  ],
  outputFileTracingIncludes: {
    "/api/analyze-pdf": [
      "./pdf-worker/**/*",
      "./node_modules/pdf-parse/dist/**/*",
      "./node_modules/pdfjs-dist/legacy/build/**/*",
      "./node_modules/pdfjs-dist/cmaps/**/*",
      "./node_modules/pdfjs-dist/standard_fonts/**/*",
      "./node_modules/busboy/**/*",
      "./node_modules/streamsearch/**/*",
    ],
  },
};

export default nextConfig;
