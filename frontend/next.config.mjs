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
        ? 'https://gnosis-rpc.publicnode.com'
        : 'http://localhost:8545',
  },
};

export default nextConfig;
