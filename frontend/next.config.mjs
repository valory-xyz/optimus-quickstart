/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
     domains: ['*'],
  },
  reactStrictMode: true,
  transpilePackages: [
    "rc-util",
    "@babel/runtime",
    "@ant-design",
    "rc-pagination",
    "rc-picker",
  ],
};

export default nextConfig;
