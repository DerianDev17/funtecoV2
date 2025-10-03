import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import { setupAdminLogin } from "../scripts/adminLogin";
import { createStrapiAdmin } from "../utils/strapiAdmin";
import type { StorageLike } from "../utils/adminStore";

const createStorage = (): StorageLike => {
  const map = new Map<string, string>();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
    removeItem(key) {
      map.delete(key);
    },
  };
};

const loginHtml = `
<!DOCTYPE html>
<html lang="es">
  <body>
    <section id="admin-login-app">
      <form id="login-form">
        <input name="username" />
        <input name="password" type="password" />
        <button type="submit">Entrar</button>
      </form>
      <p id="login-error" class="hidden"></p>
    </section>
  </body>
</html>
`;

const createDom = () => new JSDOM(loginHtml, { url: "https://funteco.test/admin/login" });

const originalFormData = globalThis.FormData;

describe("admin login", () => {
  it("redirecciona al dashboard cuando ya existe una sesión", () => {
    const dom = createDom();
    const storage = createStorage();
    const store = createStrapiAdmin(storage);
    store.login("admin", "admin123");
    const navigate = vi.fn();
    (globalThis as unknown as { FormData: typeof FormData }).FormData = dom.window.FormData;

    setupAdminLogin({ document: dom.window.document, storage, navigate });

    expect(navigate).toHaveBeenCalledWith("/admin");
    dom.window.close();
    (globalThis as unknown as { FormData: typeof FormData | undefined }).FormData = originalFormData;
  });

  it("muestra un error cuando faltan credenciales", () => {
    const dom = createDom();
    const storage = createStorage();
    const navigate = vi.fn();
    (globalThis as unknown as { FormData: typeof FormData }).FormData = dom.window.FormData;

    setupAdminLogin({ document: dom.window.document, storage, navigate });

    const form = dom.window.document.querySelector<HTMLFormElement>("#login-form");
    const error = dom.window.document.querySelector<HTMLElement>("#login-error");
    expect(form).not.toBeNull();
    expect(error).not.toBeNull();

    form!.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));

    expect(navigate).not.toHaveBeenCalled();
    expect(error!.textContent).toContain("Introduce un usuario");
    expect(error!.classList.contains("hidden")).toBe(false);

    dom.window.close();
    (globalThis as unknown as { FormData: typeof FormData | undefined }).FormData = originalFormData;
  });

  it("inicia sesión con credenciales válidas y redirige", () => {
    const dom = createDom();
    const storage = createStorage();
    const navigate = vi.fn();
    (globalThis as unknown as { FormData: typeof FormData }).FormData = dom.window.FormData;

    setupAdminLogin({ document: dom.window.document, storage, navigate });

    const form = dom.window.document.querySelector<HTMLFormElement>("#login-form");
    const username = dom.window.document.querySelector<HTMLInputElement>("input[name='username']");
    const password = dom.window.document.querySelector<HTMLInputElement>("input[name='password']");
    const error = dom.window.document.querySelector<HTMLElement>("#login-error");
    expect(form && username && password && error).not.toBeNull();

    username!.value = "admin";
    password!.value = "admin123";

    form!.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));

    expect(navigate).toHaveBeenCalledWith("/admin");
    expect(error!.classList.contains("hidden")).toBe(true);

    dom.window.close();
    (globalThis as unknown as { FormData: typeof FormData | undefined }).FormData = originalFormData;
  });
});
