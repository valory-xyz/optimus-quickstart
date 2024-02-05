/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: "export",
  transpilePackages: ["antd", "rc-util", "@babel/runtime", "@ant-design", "rc-pagination", "rc-picker"],
};

export default nextConfig;
