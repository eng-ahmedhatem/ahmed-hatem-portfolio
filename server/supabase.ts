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
  const { error } = await getSupabaseAdmin()
    .from("content_records")
    .select("entity_id")
    .limit(1);
  if (error) {
    databaseReady = false;
    throw new Error(`Supabase schema is unavailable: ${error.message}`);
  }
  databaseReady = true;
  return true;
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
