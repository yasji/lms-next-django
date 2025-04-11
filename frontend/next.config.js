/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' as it's incompatible with middleware
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
