import { describe, expect, it } from "vitest";
import { createStrapiAdmin } from "../utils/strapiAdmin";

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

describe("strapiAdmin", () => {
  const setup = () => {
    const storage = createStorage();
    const store = createStrapiAdmin(storage);
    return { store, storage };
  };

  it("permite iniciar sesión con credenciales válidas", () => {
    const { store } = setup();
    const user = store.login("admin", "admin123");
    expect(user.username).toBe("admin");
    expect(store.getState().currentUserId).toBe(user.id);
  });

  it("gestiona el constructor de tipos de contenido", () => {
    const { store } = setup();
    store.login("admin", "admin123");

    const created = store.modules.contentTypeBuilder.create({
      displayName: "Aliados",
      description: "Directorio de organizaciones aliadas",
      category: "Relaciones",
      icon: "handshake",
    });
    expect(created.uid).toBe("aliados");
    expect(created.configurable).toBe(true);

    const field = store.modules.contentTypeBuilder.addField(created.uid, {
      name: "Nombre",
      type: "string",
      required: true,
      configurable: true,
    });
    expect(field.id).toBe("nombre");

    const updated = store.modules.contentTypeBuilder.update(created.uid, {
      description: "Red de cooperación interinstitucional",
    });
    expect(updated.description).toMatch(/cooperación/);

    expect(() =>
      store.modules.contentTypeBuilder.delete("sections")
    ).toThrowError(/No es posible eliminar/);
  });

  it("respeta los permisos de publicación por rol", () => {
    const { store } = setup();
    store.login("admin", "admin123");
    const eventEntry = store.modules.contentManager.createEntry("events", {
      title: "Concierto comunitario",
      shortDescription: "Encuentro cultural",
      description: ["Programación musical"],
      date: "2026-08-15",
      image: "https://example.com/concierto.jpg",
      location: "Centro cultural",
      tags: ["cultura"],
      status: "published",
    });
    expect(eventEntry.status).toBe("published");

    const collaborator = store.modules.usersRolesPermissions.createUser({
      username: "colab",
      password: "secret",
      role: "Colaborador",
    });
    store.logout();
    store.login(collaborator.username, "secret");

    const draftEvent = store.modules.contentManager.createEntry("events", {
      title: "Taller comunitario",
      shortDescription: "Sesión participativa",
      description: ["Descripción"],
      date: "2026-09-01",
      image: "https://example.com/taller.jpg",
      location: "Quito",
      tags: ["formación"],
      status: "published",
    });
    expect(draftEvent.status).toBe("draft");

    expect(() =>
      store.modules.contentManager.updateEntry("events", draftEvent.id, {
        status: "published",
      })
    ).toThrowError(/Sin permisos/);
  });

  it("administra la biblioteca multimedia", () => {
    const { store } = setup();
    store.login("admin", "admin123");
    const initial = store.modules.mediaLibrary.list().length;
    const asset = store.modules.mediaLibrary.upload({
      name: "Guía metodológica",
      url: "https://example.com/guias/metodologia.pdf",
      type: "document",
      size: 1024,
    });
    expect(asset.type).toBe("document");

    const updated = store.modules.mediaLibrary.update(asset.id, {
      altText: "Manual de trabajo comunitario",
    });
    expect(updated.altText).toMatch(/Manual/);

    store.modules.mediaLibrary.remove(asset.id);
    expect(store.modules.mediaLibrary.list().length).toBe(initial);
  });

  it("gestiona colecciones personalizadas", () => {
    const { store } = setup();
    store.login("admin", "admin123");

    const partnersType = store.modules.contentTypeBuilder.create({
      displayName: "Programas",
      description: "Listado de programas estratégicos",
      icon: "layout",
      fields: [
        {
          id: "titulo",
          name: "Título",
          type: "string",
          required: true,
          configurable: true,
        },
        {
          id: "resumen",
          name: "Resumen",
          type: "text",
          required: false,
          configurable: true,
        },
      ],
    });

    const entry = store.modules.contentManager.createEntry(partnersType.uid, {
      titulo: "Escuela de saberes",
      resumen: "Formación popular y memoria viva",
      status: "draft",
    });
    expect(entry.status).toBe("draft");

    const published = store.modules.contentManager.setStatus(
      partnersType.uid,
      entry.id,
      "published"
    );
    expect(published.status).toBe("published");

    const updated = store.modules.contentManager.updateEntry(partnersType.uid, entry.id, {
      resumen: "Formación popular afrodescendiente",
    });
    expect(updated.attributes.resumen).toMatch(/afrodescendiente/);

    store.modules.contentManager.deleteEntry(partnersType.uid, entry.id);
    expect(
      store.modules.contentManager.listEntries(partnersType.uid).length
    ).toBe(0);
  });

  it("persiste la configuración de los módulos", () => {
    const storage = createStorage();
    const storeA = createStrapiAdmin(storage);
    storeA.login("admin", "admin123");
    const type = storeA.modules.contentTypeBuilder.create({
      displayName: "Aliados territoriales",
      description: "Organizaciones acompañantes",
      icon: "map",
    });
    storeA.modules.contentManager.createEntry(type.uid, {
      nombre: "Red de Mujeres del Pacífico",
      status: "draft",
    });
    storeA.modules.mediaLibrary.upload({
      name: "Logo Aliado",
      url: "https://example.com/logo.png",
    });

    const storeB = createStrapiAdmin(storage);
    storeB.login("admin", "admin123");
    const collections = storeB.modules.contentManager.listCollections();
    expect(collections.some((item) => item.uid === type.uid)).toBe(true);
    const entries = storeB.modules.contentManager.listEntries(type.uid);
    expect(entries.length).toBe(1);
    expect(storeB.modules.mediaLibrary.list().some((asset) => asset.url.endsWith("logo.png"))).toBe(true);
  });
});
