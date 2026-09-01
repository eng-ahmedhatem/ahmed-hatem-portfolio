import { seedAdministrator } from "./auth-core";
import { hasDatabaseConfiguration } from "./config";
import { seedContent } from "./content";
import { connectSupabase, isDatabaseReady } from "./supabase";

let initialization: Promise<boolean> | undefined;

export function ensureBackendReady() {
  if (!hasDatabaseConfiguration()) return Promise.resolve(false);
  if (!initialization) {
    initialization = (async () => {
      await connectSupabase();
      await seedContent();
      await seedAdministrator();
      return isDatabaseReady();
    })().catch((error) => {
      initialization = undefined;
      throw error;
    });
  }
  return initialization;
}
