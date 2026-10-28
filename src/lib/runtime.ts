export function isCloudflare() {
  return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
}
