/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DEV_DIST_DIR ?? '.next',
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_MODE !== 'real') {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
