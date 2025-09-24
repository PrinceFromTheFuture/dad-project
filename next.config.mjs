import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "100mb" },
    reactCompiler: false,
  },

  // ✅ Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

// Wrap with Payload
export default withPayload(nextConfig);
