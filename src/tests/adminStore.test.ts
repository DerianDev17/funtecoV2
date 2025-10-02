import { describe, expect, it } from "vitest";
import { createAdminStore } from "../utils/adminStore";

function createStorage() {
  const map = new Map<string, string>();
  return {
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
    removeItem(key: string) {
      map.delete(key);
    },
  };
}

describe("adminStore", () => {
  const setup = () => {
    const storage = createStorage();
    const store = createAdminStore(storage);
    return { store, storage };
  };

  it("permite iniciar sesión con credenciales válidas", () => {
    const { store } = setup();
    const user = store.login("admin", "admin123");
    expect(user.username).toBe("admin");
    expect(store.getState().currentUserId).toBe(user.id);
  });

  it("lanza error con credenciales incorrectas", () => {
    const { store } = setup();
    expect(() => store.login("admin", "wrong"))
      .toThrowError(/Credenciales inválidas/);
  });

  it("permite al administrador crear y eliminar usuarios", () => {
    const { store } = setup();
    store.login("admin", "admin123");
    const newUser = store.createUser({
      username: "editor-test",
      password: "secret",
      role: "Editor",
    });
    expect(newUser.role).toBe("Editor");
    expect(store.getState().users.some((user) => user.id === newUser.id)).toBe(
      true
    );

    store.deleteUser(newUser.id);
    expect(store.getState().users.some((user) => user.id === newUser.id)).toBe(
      false
    );
  });

  it("impide a un editor gestionar usuarios", () => {
    const { store } = setup();
    store.login("admin", "admin123");
    store.createUser({ username: "solo-editor", password: "secret", role: "Editor" });
    store.logout();
    store.login("solo-editor", "secret");
    expect(store.canManageUsers()).toBe(false);
    expect(() =>
      store.createUser({ username: "otro", password: "123", role: "Autor" })
    ).toThrowError(/Sin permisos/);
  });

  it("controla las publicaciones de un colaborador", () => {
    const { store } = setup();
    store.login("admin", "admin123");
    store.createUser({ username: "colab", password: "secret", role: "Colaborador" });
    store.logout();
    store.login("colab", "secret");
    const section = store.createSection({
      title: "Borrador colaborador",
      content: "Contenido de prueba",
      status: "published",
    });
    expect(section.status).toBe("draft");
    expect(() =>
      store.updateSection(section.id, { status: "published" })
    ).toThrowError(/Sin permisos/);
  });

  it("evita que un autor edite secciones ajenas", () => {
    const { store } = setup();
    store.login("admin", "admin123");
    store.createUser({ username: "autor", password: "secret", role: "Autor" });
    const foreignSection = store.createSection({
      title: "Sección admin",
      content: "Contenido",
      status: "published",
    });
    store.logout();
    store.login("autor", "secret");
    const ownSection = store.createSection({
      title: "Sección propia",
      content: "Contenido del autor",
      status: "draft",
    });
    expect(ownSection.ownerId).not.toBe(foreignSection.ownerId);
    expect(() =>
      store.updateSection(foreignSection.id, { title: "Hack" })
    ).toThrowError(/Sin permisos/);
  });

  it("impide que un moderador elimine secciones", () => {
    const { store } = setup();
    store.login("moderador", "mod123");
    const state = store.getState();
    const target = state.sections[0];
    expect(() => store.deleteSection(target.id)).toThrowError(/Sin permisos/);
  });

  it("permite a un editor eliminar secciones", () => {
    const { store } = setup();
    store.login("admin", "admin123");
    store.createUser({ username: "editor", password: "secret", role: "Editor" });
    const section = store.createSection({
      title: "Sección a eliminar",
      content: "Contenido",
      status: "published",
    });
    store.logout();
    store.login("editor", "secret");
    expect(() => store.deleteSection(section.id)).not.toThrow();
    expect(store.getState().sections.some((item) => item.id === section.id)).toBe(
      false
    );
  });

  it("persiste los datos en el almacenamiento proporcionado", () => {
    const storage = createStorage();
    const storeA = createAdminStore(storage);
    storeA.login("admin", "admin123");
    storeA.createUser({ username: "persistente", password: "secret", role: "Autor" });
    const section = storeA.createSection({
      title: "Sección persistente",
      content: "Contenido",
      status: "draft",
    });

    const storeB = createAdminStore(storage);
    const state = storeB.getState();
    expect(state.users.some((user) => user.username === "persistente")).toBe(
      true
    );
    expect(state.sections.some((item) => item.id === section.id)).toBe(true);
  });
});
