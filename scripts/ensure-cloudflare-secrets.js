const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

// Created only when missing. Later deploys leave edited values alone.
const PLACEHOLDERS = {
  JWT_SECRET: "replace-me",
  OPENAI_API_KEY: "replace-me",
  ADMIN_PASSWORD: "replace-me",
  GMAIL_APP_PASSWORD: "replace-me",
  ADMIN_EMAIL: "replace-me",
  ADMIN_NAME: "replace-me",
  GMAIL_USER: "replace-me",
  NEXT_PUBLIC_SITE_URL: "https://agi-aeronautics.com",
};

function wrangler(args) {
  return spawnSync(path.join("node_modules", ".bin", "wrangler"), args, {
    encoding: "utf8",
    env: process.env,
  });
}

const listed = wrangler(["secret", "list"]);
if (listed.status !== 0) {
  process.stderr.write(listed.stderr || "");
  process.stderr.write(listed.stdout || "");
  process.exit(listed.status ?? 1);
}

const raw = listed.stdout || "";
const start = raw.indexOf("[");
const end = raw.lastIndexOf("]");
if (start === -1 || end === -1) {
  process.stderr.write(raw);
  process.stderr.write(listed.stderr || "");
  process.exit(1);
}

const existing = new Set(JSON.parse(raw.slice(start, end + 1)).map((secret) => secret.name));
const missing = {};
for (const [name, value] of Object.entries(PLACEHOLDERS)) {
  if (!existing.has(name)) missing[name] = value;
}

if (Object.keys(missing).length === 0) {
  console.log("Cloudflare secrets are already set.");
  process.exit(0);
}

const file = path.join(os.tmpdir(), `agi-cloudflare-secrets-${process.pid}.json`);
fs.writeFileSync(file, JSON.stringify(missing));
const created = wrangler(["secret", "bulk", file]);
fs.unlinkSync(file);
process.stderr.write(created.stderr || "");
process.stdout.write(created.stdout || "");
if (created.status !== 0) process.exit(created.status ?? 1);
console.log(`Added Cloudflare secrets to edit: ${Object.keys(missing).join(", ")}`);
