/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS bootstrap must run before tsx loads. */
const { spawn } = require("node:child_process");
const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env.local"), quiet: true });
dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });

const preload = path.resolve(__dirname, "tsx-runtime.cjs").replaceAll("\\", "/");
const existingOptions = process.env.NODE_OPTIONS ? `${process.env.NODE_OPTIONS} ` : "";
const child = spawn(
  process.execPath,
  [path.resolve(__dirname, "../node_modules/tsx/dist/cli.mjs"), ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: { ...process.env, NODE_OPTIONS: `${existingOptions}-r ${preload}` },
  },
);

let stopping = false;
function stopChild(signal) {
  if (stopping || child.exitCode !== null) return;
  stopping = true;
  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
    });
    killer.on("exit", () => process.exit(signal === "SIGINT" ? 130 : 143));
  } else {
    child.kill(signal);
  }
}

process.on("SIGINT", () => stopChild("SIGINT"));
process.on("SIGTERM", () => stopChild("SIGTERM"));

child.on("exit", (code, signal) => {
  if (stopping) return;
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
