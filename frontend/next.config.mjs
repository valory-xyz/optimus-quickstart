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
        ? process.env.FORK_URL
        : process.env.DEV_RPC,
  },
};

export default nextConfig;
