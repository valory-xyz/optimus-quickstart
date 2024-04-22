/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  reactStrictMode: true,
  transpilePackages: [
    'rc-util',
    '@babel/runtime',
    '@ant-design',
    'rc-pagination',
    'rc-picker',
  ],
  env: {
    GNOSIS_RPC:
      process.env.NODE_ENV === 'production'
        ? 'https://lb.nodies.app/v1/b58a5d7d3a3044fca1d069039fa03228'
        : 'http://localhost:8545',
  },
};

export default nextConfig;
