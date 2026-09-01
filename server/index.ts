import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { seedAdministrator } from "./auth";
import { hasDatabaseConfiguration, serverConfig } from "./config";
import { seedContent } from "./content";
import { apiRouter } from "./routes";
import { connectSupabase, isDatabaseReady } from "./supabase";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
app.use(cors({ origin: serverConfig.appOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use("/api/v1", apiRouter);
app.use((_request, response) => response.status(404).json({ error: "Not found." }));
app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  void _next;
  console.error(error);
  response.status(500).json({ error: "Unexpected server error." });
});

let databaseAttemptRunning = false;

async function initializeSupabase() {
  if (databaseAttemptRunning) return;
  databaseAttemptRunning = true;
  try {
    const connected = await connectSupabase();
    if (connected) {
      await seedContent();
      await seedAdministrator();
      console.log("Supabase connected; database, auth, and storage are ready.");
    } else {
      console.warn("Supabase keys are not set; content will use the bundled fallback and administration will return 503.");
    }
  } catch (error) {
    console.error(
      "Supabase connection failed; serving bundled public content and retrying in 30 seconds.",
      error instanceof Error ? error.message : error,
    );
  } finally {
    databaseAttemptRunning = false;
    if (hasDatabaseConfiguration() && !isDatabaseReady()) {
      setTimeout(() => void initializeSupabase(), 30_000);
    }
  }
}

function start() {
  app.listen(serverConfig.port, () => {
    console.log(`Portfolio API listening on http://localhost:${serverConfig.port}/api/v1`);
  });
  void initializeSupabase();
}

start();
