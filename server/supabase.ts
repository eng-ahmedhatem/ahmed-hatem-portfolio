import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { hasDatabaseConfiguration, serverConfig } from "./config";

const serverClientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
} as const;

let adminClient: SupabaseClient | undefined;
let databaseReady = false;

export function getSupabaseAdmin() {
  if (!hasDatabaseConfiguration() || !serverConfig.supabaseUrl || !serverConfig.supabaseSecretKey) {
    throw new Error("Supabase server configuration is missing.");
  }
  adminClient ??= createClient(
    serverConfig.supabaseUrl,
    serverConfig.supabaseSecretKey,
    serverClientOptions,
  );
  return adminClient;
}

export function createSupabaseAuthClient() {
  if (!serverConfig.supabaseUrl || !serverConfig.supabasePublishableKey) {
    throw new Error("Supabase Auth configuration is missing.");
  }
  return createClient(
    serverConfig.supabaseUrl,
    serverConfig.supabasePublishableKey,
    serverClientOptions,
  );
}

export async function connectSupabase(): Promise<boolean> {
  if (!hasDatabaseConfiguration()) return false;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { error } = await getSupabaseAdmin()
      .from("content_records")
      .select("entity_id")
      .limit(1);

    if (!error) {
      databaseReady = true;
      return true;
    }

    const retryableClockSkew = error.message.toLowerCase().includes("jwt issued at future");
    if (!retryableClockSkew || attempt === 2) {
      databaseReady = false;
      throw new Error(`Supabase schema is unavailable: ${error.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
  }

  return false;
}

export function isDatabaseReady() {
  return databaseReady;
}

export function markDatabaseUnavailable() {
  databaseReady = false;
}

export function getAssetBucketName() {
  return serverConfig.supabaseStorageBucket;
}
