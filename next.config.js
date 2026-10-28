/** @type {import('next').NextConfig} */
const onCloudflare = process.env.WORKERS_CI === "1" || process.env.CF_PAGES === "1";

const nextConfig = {
  ...(onCloudflare ? {} : { output: "standalone" }),
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: [
    "pdf-parse",
    "mammoth",
    "nodemailer",
    "imapflow",
    "mailparser",
    "@prisma/client",
    ".prisma/client",
    "@prisma/adapter-d1",
  ],
};

module.exports = nextConfig;

if (process.env.NODE_ENV !== "production") {
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}
