import { randomUUID } from "node:crypto";
import { hasDatabaseConfiguration, serverConfig } from "./config";
import { getSupabaseAdmin } from "./supabase";

// Owner-only terminal maintenance. No HTTP endpoint, arguments, logs or shell
// history contain the new password. Existing MFA enrollment is preserved.
async function hiddenPrompt(label: string): Promise<string> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("Run this command in your own interactive terminal.");
  process.stdout.write(label);
  const wasRaw = Boolean(process.stdin.isRaw);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise((resolve, reject) => {
    let value = "";
    const cleanup = () => {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(wasRaw);
      process.stdin.pause();
      process.stdout.write("\n");
    };
    const onData = (chunk: Buffer) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003") { cleanup(); reject(new Error("Cancelled. No password changed.")); return; }
        if (char === "\r" || char === "\n") { cleanup(); resolve(value); return; }
        if (char === "\u007f" || char === "\b") value = Array.from(value).slice(0, -1).join("");
        else if (char >= " " && value.length < 256) value += char;
      }
    };
    process.stdin.on("data", onData);
  });
}

async function reset() {
  if (!hasDatabaseConfiguration() || !serverConfig.adminEmail) throw new Error("Configure Supabase server keys and ADMIN_EMAIL first.");
  if (!process.stdin.isTTY) throw new Error("Use your own interactive terminal; passwords cannot be passed as arguments.");
  const api = getSupabaseAdmin().auth.admin;
  let administrator;
  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await api.listUsers({ page, perPage: 100 });
    if (error) throw new Error("Could not read Supabase users. Check project connection.");
    administrator = data.users.find((user) => user.email?.toLowerCase() === serverConfig.adminEmail);
    if (administrator || data.users.length < 100) break;
  }
  if (!administrator || administrator.app_metadata.role !== "admin") throw new Error("The configured email is not an existing administrator. No account was changed.");
  process.stdout.write(`Reset existing administrator: ${administrator.email}\nAll portfolio sessions will be invalidated. MFA stays enabled if enrolled.\n`);
  const password = await hiddenPrompt("New password (12-128 characters, hidden): ");
  if (password.length < 12 || password.length > 128) throw new Error("Password must be 12-128 characters. No password changed.");
  const confirmation = await hiddenPrompt("Confirm new password (hidden): ");
  if (password !== confirmation) throw new Error("Passwords do not match. No password changed.");
  const { error } = await api.updateUserById(administrator.id, { password, app_metadata: { ...administrator.app_metadata, session_version: randomUUID() } });
  if (error) throw new Error("Supabase rejected the update. Check password policy and connection.");
  console.log("Password updated. Sign in with the new password. No password was written to a file.");
}

reset().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Password reset failed."); process.exitCode = 1; });
