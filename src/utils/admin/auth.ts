import { randomBytes } from "node:crypto";

type AuthSuccess = {
  ok: true;
  token: string;
  email: string;
  maxAge: number;
};

type AuthError = {
  ok: false;
  error: string;
};

export type AuthResult = AuthSuccess | AuthError;

type SessionRecord = {
  email: string;
  createdAt: Date;
  remember: boolean;
};

const DEFAULT_EMAIL = "admin@funteco.org";
const DEFAULT_PASSWORD = "funteco123";
const SESSION_TTL = 60 * 60 * 4; // 4 hours
const SESSION_TTL_EXTENDED = 60 * 60 * 24 * 30; // 30 days

export const SESSION_COOKIE_NAME = "admin_session";

const sessions = new Map<string, SessionRecord>();

function readRuntimeEnv(key: string): string | undefined {
  // Support Astro's import.meta.env at runtime and Vitest's process.env
  const metaEnv = typeof import.meta !== "undefined" ? (import.meta as any).env : undefined;
  if (metaEnv && typeof metaEnv[key] === "string" && metaEnv[key].length > 0) {
    return metaEnv[key] as string;
  }

  if (typeof process !== "undefined" && typeof process.env?.[key] === "string") {
    const value = process.env[key];
    if (value && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

export function getConfiguredCredentials() {
  const email = readRuntimeEnv("ADMIN_EMAIL") ?? DEFAULT_EMAIL;
  const password = readRuntimeEnv("ADMIN_PASSWORD") ?? DEFAULT_PASSWORD;

  return {
    email,
    password,
  };
}

function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

function createSessionToken() {
  return randomBytes(32).toString("hex");
}

function registerSession(email: string, remember: boolean) {
  const token = createSessionToken();
  sessions.set(token, {
    email,
    createdAt: new Date(),
    remember,
  });

  return token;
}

export function authenticateUser(
  emailInput: string,
  passwordInput: string,
  options: { remember?: boolean } = {}
): AuthResult {
  const { email, password } = getConfiguredCredentials();
  const remember = Boolean(options.remember);

  if (normaliseEmail(emailInput) !== normaliseEmail(email) || passwordInput !== password) {
    return {
      ok: false,
      error: "Credenciales inválidas",
    };
  }

  const token = registerSession(email, remember);

  return {
    ok: true,
    token,
    email,
    maxAge: remember ? SESSION_TTL_EXTENDED : SESSION_TTL,
  };
}

export function getSession(token: string) {
  const record = sessions.get(token);
  if (!record) {
    return undefined;
  }

  return {
    token,
    ...record,
  };
}

export function validateSession(token: string) {
  return sessions.has(token);
}

export function revokeSession(token: string) {
  sessions.delete(token);
}

export function clearSessions() {
  sessions.clear();
}

export function getSessionCookieAttributes(maxAge: number) {
  const metaEnv = typeof import.meta !== "undefined" ? (import.meta as any).env : undefined;
  const mode = (metaEnv?.MODE as string | undefined) ?? process.env.NODE_ENV ?? "development";

  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: mode === "production",
    maxAge,
  };
}
