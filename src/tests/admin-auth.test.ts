import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  authenticateUser,
  clearSessions,
  getConfiguredCredentials,
  getSession,
  validateSession,
} from "../utils/admin/auth";

describe("autenticación administrativa", () => {
  const email = "admin@test.org";
  const password = "clave-super-secreta";

  beforeEach(() => {
    process.env.ADMIN_EMAIL = email;
    process.env.ADMIN_PASSWORD = password;
    clearSessions();
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    clearSessions();
  });

  it("lee las credenciales configuradas", () => {
    const credentials = getConfiguredCredentials();
    expect(credentials).toEqual({ email, password });
  });

  it("rechaza credenciales incorrectas", () => {
    const result = authenticateUser("otra@cuenta.com", "0000");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Credenciales inválidas");
    }
  });

  it("crea una sesión válida para credenciales correctas", () => {
    const result = authenticateUser(email, password);
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(typeof result.token).toBe("string");
      expect(result.token).toHaveLength(64);
      expect(result.email).toBe(email);
      expect(result.maxAge).toBeGreaterThan(0);
      expect(validateSession(result.token)).toBe(true);

      const session = getSession(result.token);
      expect(session?.email).toBe(email);
      expect(session?.remember).toBe(false);
    }
  });

  it("respeta la opción de recordar sesión prolongada", () => {
    const result = authenticateUser(email, password, { remember: true });
    expect(result.ok).toBe(true);

    if (result.ok) {
      const session = getSession(result.token);
      expect(session?.remember).toBe(true);
      expect(result.maxAge).toBeGreaterThan(60 * 60 * 24);
    }
  });
});
