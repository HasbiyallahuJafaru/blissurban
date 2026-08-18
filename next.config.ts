import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Without this, Turbopack walks up to C:\Users\User and picks up a stray lockfile.
  turbopack: { root: __dirname },
};

export default nextConfig;
