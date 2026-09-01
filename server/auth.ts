import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";

import { hasAuthConfiguration, serverConfig } from "./config";
import { createSupabaseAuthClient, getSupabaseAdmin, isDatabaseReady } from "./supabase";

export const SESSION_COOKIE = serverConfig.production
  ? "__Host-portfolio_admin_session"
  : "portfolio_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const ADMIN_DISPLAY_NAME = "Ahmed Hatem";

type AuthenticatedRequest = Request & {
  admin?: { id: string; email: string; displayName: string };
};

function sessionKey() {
  if (!serverConfig.sessionSecret) {
    throw new Error("SESSION_SECRET is required for administrator sessions.");
  }
  return new TextEncoder().encode(serverConfig.sessionSecret);
}

function isAdministrator(user: { app_metadata?: Record<string, unknown> }) {
  return user.app_metadata?.role === "admin";
}

function displayNameFor(user: { user_metadata?: Record<string, unknown> }) {
  const name = user.user_metadata?.display_name;
  return typeof name === "string" && name.trim() ? name : ADMIN_DISPLAY_NAME;
}

export async function createSessionToken(user: {
  id: string;
  email: string;
  displayName: string;
}) {
  return new SignJWT({ email: user.email, name: user.displayName, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(sessionKey());
}

export function setSessionCookie(response: Response, token: string) {
  response.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: serverConfig.production,
    sameSite: "strict",
    path: "/",
    priority: "high",
    maxAge: SESSION_TTL_SECONDS * 1000,
  });
}

export function clearSessionCookie(response: Response) {
  response.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: serverConfig.production,
    sameSite: "strict",
    path: "/",
    priority: "high",
  });
}

export async function requireAdmin(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) {
  if (!isDatabaseReady() || !hasAuthConfiguration()) {
    response.status(503).json({ error: "Administration is not configured." });
    return;
  }

  const token = request.cookies?.[SESSION_COOKIE];
  if (typeof token !== "string") {
    response.status(401).json({ error: "Authentication required." });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, sessionKey(), {
      algorithms: ["HS256"],
    });
    if (!payload.sub) throw new Error("Missing session subject.");

    const { data, error } = await getSupabaseAdmin().auth.admin.getUserById(payload.sub);
    const user = data.user;
    if (error || !user || !user.email || !isAdministrator(user)) {
      throw new Error("Administrator is inactive or missing.");
    }

    request.admin = {
      id: user.id,
      email: user.email,
      displayName: displayNameFor(user),
    };
    next();
  } catch {
    clearSessionCookie(response);
    response.status(401).json({ error: "Session expired or invalid." });
  }
}

export function requireTrustedOrigin(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  response.vary("Origin");
  response.vary("Sec-Fetch-Site");

  const fetchSite = request.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    response.status(403).json({ error: "Untrusted request origin." });
    return;
  }

  const origin = request.get("origin");
  const referer = request.get("referer");
  let sourceOrigin = origin;
  if (!sourceOrigin && referer) {
    try {
      sourceOrigin = new URL(referer).origin;
    } catch {
      sourceOrigin = undefined;
    }
  }
  if (!sourceOrigin || sourceOrigin !== serverConfig.appOrigin) {
    response.status(403).json({ error: "Untrusted request origin." });
    return;
  }
  next();
}

export async function seedAdministrator() {
  if (!isDatabaseReady() || !hasAuthConfiguration() || !serverConfig.adminEmail || !serverConfig.adminPassword) {
    return false;
  }

  const admin = getSupabaseAdmin().auth.admin;
  const { data: listed, error: listError } = await admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw new Error(`Unable to inspect Supabase administrators: ${listError.message}`);
  const existing = listed.users.find((user) => user.email?.toLowerCase() === serverConfig.adminEmail);

  if (existing) {
    if (!isAdministrator(existing) || displayNameFor(existing) !== ADMIN_DISPLAY_NAME) {
      const { error } = await admin.updateUserById(existing.id, {
        app_metadata: { ...existing.app_metadata, role: "admin" },
        user_metadata: { ...existing.user_metadata, display_name: ADMIN_DISPLAY_NAME },
      });
      if (error) throw new Error(`Unable to update the Supabase administrator: ${error.message}`);
    }
    return true;
  }

  const { error } = await admin.createUser({
    email: serverConfig.adminEmail,
    password: serverConfig.adminPassword,
    email_confirm: true,
    app_metadata: { role: "admin" },
    user_metadata: { display_name: ADMIN_DISPLAY_NAME },
  });
  if (error) throw new Error(`Unable to create the Supabase administrator: ${error.message}`);
  return true;
}

export async function verifyCredentials(email: string, password: string) {
  if (!isDatabaseReady()) return null;
  const { data, error } = await createSupabaseAuthClient().auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });
  const user = data.user;
  if (error || !user || !user.email || !isAdministrator(user)) return null;

  return {
    id: user.id,
    email: user.email,
    displayName: displayNameFor(user),
  };
}

export type AdminRequest = AuthenticatedRequest;
