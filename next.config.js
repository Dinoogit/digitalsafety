/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Penting: mysql2 menggunakan native bindings, perlu dikecualikan dari bundling
  experimental: {
    serverComponentsExternalPackages: ['mysql2'],
  },
};

module.exports = nextConfig;
