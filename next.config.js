/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "mammoth", "nodemailer", "imapflow", "mailparser"],
  },
};

module.exports = nextConfig;
