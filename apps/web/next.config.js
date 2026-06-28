/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@sentinel/schemas"],
};

export default nextConfig;
