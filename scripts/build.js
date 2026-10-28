const path = require("path");
const { spawnSync } = require("child_process");

function run(name, args, extraEnv = {}) {
  const bin = path.join("node_modules", ".bin", name);
  const result = spawnSync(bin, args, {
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const onCloudflare = process.env.WORKERS_CI === "1" || process.env.CF_PAGES === "1";

if (onCloudflare && process.env.OPENNEXT_BUILDING !== "1") {
  run("opennextjs-cloudflare", ["build"], { OPENNEXT_BUILDING: "1" });
} else {
  run("prisma", ["generate"]);
  run("next", ["build"]);
}
