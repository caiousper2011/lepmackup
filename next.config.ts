import type { NextConfig } from "next";

const envAppHost = process.env.NEXT_PUBLIC_APP_URL
  ? (() => {
      try {
        return new URL(process.env.NEXT_PUBLIC_APP_URL).hostname;
      } catch {
        return undefined;
      }
    })()
  : undefined;

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.trycloudflare.com",
    ...(envAppHost ? [envAppHost] : []),
  ],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
