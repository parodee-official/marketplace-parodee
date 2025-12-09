/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Use ** to allow i.seadn.io, i2c.seadn.io, raw.seadn.io, etc.
        hostname: '**.seadn.io', 
      },
      {
        protocol: 'https',
        hostname: 'openseauserdata.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Often used for older collections/avatars
      },
    ],
  },
};

module.exports = nextConfig;