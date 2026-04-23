/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/tools',
  trailingSlash: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
