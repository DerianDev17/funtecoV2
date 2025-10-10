import type { APIRoute } from "astro";
import {
  authenticateUser,
  getSessionCookieAttributes,
  SESSION_COOKIE_NAME,
} from "../../utils/admin/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const rememberValue = formData.get("remember");
  const remember = rememberValue === "true" || rememberValue === "on";

  const result = authenticateUser(email, password, { remember });

  if (!result.ok) {
    cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/admin/login?error=credentials",
      },
    });
  }

  const { token, maxAge } = result;
  cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieAttributes(maxAge));

  return new Response(null, {
    status: 303,
    headers: {
      Location: "/admin",
    },
  });
};
