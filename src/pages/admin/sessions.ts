// src/pages/admin/sessions.ts
import type { APIRoute } from "astro";
import {
  authenticateUser,
  getSessionCookieAttributes,
  SESSION_COOKIE_NAME,
} from "../../utils/admin/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const ct = request.headers.get("content-type")?.toLowerCase() ?? "";

  let email = "";
  let password = "";
  let remember = false;

  try {
    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const formData = await request.formData();
      email = String(formData.get("email") ?? "");
      password = String(formData.get("password") ?? "");
      const rememberValue = formData.get("remember");
      // <input type="checkbox" name="remember" /> -> "on"
      // <input type="hidden"   name="remember" value="true" />
      remember = rememberValue === "true" || rememberValue === "on";
    } else if (ct.includes("application/json")) {
      const data = await request.json();
      email = String(data?.email ?? "");
      password = String(data?.password ?? "");
      remember = Boolean(data?.remember ?? false);
    } else {
      return new Response("Unsupported Content-Type", { status: 415 });
    }
  } catch (err) {
    // Si Undici se queja del body, devuelve 400
    return new Response("Bad Request", { status: 400 });
  }

  const result = authenticateUser(email, password, { remember });

  if (!result.ok) {
    cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
    return new Response(null, {
      status: 303,
      headers: { Location: "/admin/login?error=credentials" },
    });
  }

  const { token, maxAge } = result;
  cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieAttributes(maxAge));

  return new Response(null, {
    status: 303,
    headers: { Location: "/admin" },
  });
};
