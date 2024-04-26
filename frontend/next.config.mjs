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
        ? 'https://lb.nodies.app/v1/b58a5d7d3a3044fca1d069039fa03228'
        : 'https://rpc.tenderly.co/fork/a383dab0-dcd0-48da-84e9-d282b586b09d',
  },
};

export default nextConfig;
