import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    styledComponents: true
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost']
};

export default nextConfig;
