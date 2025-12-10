/** @type {import('next').NextConfig} */
const nextConfig = {
  // In Next.js 15 & 16, this MUST be at the top level
  serverExternalPackages: ["pino", "thread-stream", "pino-worker"],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.seadn.io', 
      },
      {
        protocol: 'https',
        hostname: 'openseauserdata.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', 
      },
    ],
  },
};

module.exports = nextConfig;