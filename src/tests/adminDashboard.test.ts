import { describe, expect, it, vi } from "vitest";
import { JSDOM } from "jsdom";
import { setupAdminDashboard } from "../scripts/adminDashboard";
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

const adminHtml = `
<!DOCTYPE html>
<html lang="es">
  <body>
    <div id="admin-app" class="hidden opacity-0" data-auth-state="pending">
      <section id="dashboard">
        <header>
          <span id="current-user"></span>
          <button id="logout-btn" type="button">Cerrar sesión</button>
        </header>
        <nav>
          <button data-view="content-types" data-active="true" aria-pressed="true"></button>
        </nav>
        <div data-view-panel="content-types"></div>
      </section>
    </div>
  </body>
</html>
`;

const originalGlobals = {
  FormData: globalThis.FormData,
  confirm: globalThis.confirm,
  alert: globalThis.alert,
};

const setupDom = () => {
  const dom = new JSDOM(adminHtml, { url: "https://funteco.test/admin" });
  (globalThis as unknown as { window: Window }).window = dom.window as unknown as Window;
  (globalThis as unknown as { document: Document }).document = dom.window.document;
  (globalThis as unknown as { FormData: typeof FormData }).FormData = dom.window.FormData;
  (globalThis as unknown as { confirm: (message?: string) => boolean }).confirm = () => true;
  (globalThis as unknown as { alert: (message?: string) => void }).alert = () => undefined;
  return dom;
};

const cleanupDom = (dom: JSDOM) => {
  dom.window.close();
  delete (globalThis as { window?: Window }).window;
  delete (globalThis as { document?: Document }).document;
  (globalThis as unknown as { FormData: typeof FormData | undefined }).FormData = originalGlobals.FormData;
  (globalThis as unknown as { confirm: ((message?: string) => boolean) | undefined }).confirm = originalGlobals.confirm;
  (globalThis as unknown as { alert: ((message?: string) => void) | undefined }).alert = originalGlobals.alert;
};

describe("admin dashboard", () => {
  it("redirige a la pantalla de acceso cuando no hay sesión", () => {
    const dom = setupDom();
    const storage = createStorage();
    const navigate = vi.fn();

    setupAdminDashboard({ storage, navigate, suppressRender: true });

    expect(navigate).toHaveBeenCalledWith("/admin/login");
    const root = dom.window.document.querySelector<HTMLElement>("#admin-app");
    expect(root?.classList.contains("hidden")).toBe(true);

    cleanupDom(dom);
  });

  it("muestra el nombre del usuario autenticado y revela el panel", () => {
    const dom = setupDom();
    const storage = createStorage();
    const store = createStrapiAdmin(storage);
    const user = store.login("admin", "admin123");
    const navigate = vi.fn();

    setupAdminDashboard({ storage, navigate, suppressRender: true });

    const root = dom.window.document.querySelector<HTMLElement>("#admin-app");
    const currentUser = dom.window.document.querySelector<HTMLElement>("#current-user");

    expect(navigate).not.toHaveBeenCalled();
    expect(root?.dataset.authState).toBe("ready");
    expect(root?.classList.contains("hidden")).toBe(false);
    expect(currentUser?.textContent).toBe(user.username);

    cleanupDom(dom);
  });

  it("cierra la sesión y redirige al pulsar cerrar sesión", () => {
    const dom = setupDom();
    const storage = createStorage();
    const store = createStrapiAdmin(storage);
    store.login("admin", "admin123");
    const navigate = vi.fn();

    setupAdminDashboard({ storage, navigate, suppressRender: true });

    const logoutBtn = dom.window.document.querySelector<HTMLButtonElement>("#logout-btn");
    expect(logoutBtn).not.toBeNull();
    logoutBtn!.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

    expect(navigate).toHaveBeenLastCalledWith("/admin/login");
    const freshStore = createStrapiAdmin(storage);
    expect(freshStore.modules.usersRolesPermissions.currentUser()).toBeNull();
    const root = dom.window.document.querySelector<HTMLElement>("#admin-app");
    expect(root?.dataset.authState).toBe("signed-out");

    cleanupDom(dom);
  });
});
