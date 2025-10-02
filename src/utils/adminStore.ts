export type Role =
  | "Administrador"
  | "Editor"
  | "Autor"
  | "Colaborador"
  | "Moderador";

export type SectionStatus = "draft" | "published";

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  createdAt: string;
}

export interface Section {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: SectionStatus;
  ownerId: string;
  updatedAt: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STORAGE_KEY = "funteco-admin-state";

const ROLE_CAPABILITIES: Record<
  Role,
  {
    manageUsers: boolean;
    createSections: boolean;
    editAnySection: boolean;
    deleteAnySection: boolean;
    publish: boolean;
  }
> = {
  Administrador: {
    manageUsers: true,
    createSections: true,
    editAnySection: true,
    deleteAnySection: true,
    publish: true,
  },
  Editor: {
    manageUsers: false,
    createSections: true,
    editAnySection: true,
    deleteAnySection: true,
    publish: true,
  },
  Autor: {
    manageUsers: false,
    createSections: true,
    editAnySection: false,
    deleteAnySection: false,
    publish: true,
  },
  Colaborador: {
    manageUsers: false,
    createSections: true,
    editAnySection: false,
    deleteAnySection: false,
    publish: false,
  },
  Moderador: {
    manageUsers: true,
    createSections: false,
    editAnySection: true,
    deleteAnySection: false,
    publish: true,
  },
};

interface AdminState {
  users: User[];
  sections: Section[];
  currentUserId: string | null;
}

const memoryStorage = (): StorageLike => {
  const store = new Map<string, string>();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const createId = () => {
  const random = Math.random().toString(36).slice(2, 10);
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return random;
};

const initialUsers: User[] = [
  {
    id: "user-admin",
    username: "admin",
    password: "admin123",
    role: "Administrador",
    createdAt: new Date("2023-01-01").toISOString(),
  },
  {
    id: "user-moderator",
    username: "moderador",
    password: "mod123",
    role: "Moderador",
    createdAt: new Date("2023-01-05").toISOString(),
  },
];

const initialSections: Section[] = [
  {
    id: "section-1",
    title: "Bienvenida",
    slug: "bienvenida",
    content:
      "Mensaje de bienvenida editable desde el módulo de administración.",
    status: "published",
    ownerId: "user-admin",
    updatedAt: new Date("2023-02-01").toISOString(),
  },
  {
    id: "section-2",
    title: "Próximos eventos",
    slug: "proximos-eventos",
    content: "Listado de eventos futuros gestionable por el equipo.",
    status: "draft",
    ownerId: "user-admin",
    updatedAt: new Date("2023-02-10").toISOString(),
  },
];

const defaultState: AdminState = {
  users: initialUsers,
  sections: initialSections,
  currentUserId: null,
};

export const ROLES: Role[] = [
  "Administrador",
  "Editor",
  "Autor",
  "Colaborador",
  "Moderador",
];

const ensure = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

export interface AdminStore {
  getState(): AdminState;
  subscribe(listener: () => void): () => void;
  login(username: string, password: string): User;
  logout(): void;
  canManageUsers(): boolean;
  canPublish(): boolean;
  createUser(data: Omit<User, "id" | "createdAt"> & { password: string }): User;
  updateUser(
    id: string,
    updates: Partial<Pick<User, "password" | "role">>
  ): User;
  deleteUser(id: string): void;
  createSection(data: {
    title: string;
    content: string;
    status: SectionStatus;
  }): Section;
  updateSection(
    id: string,
    updates: Partial<Pick<Section, "title" | "content" | "status">>
  ): Section;
  deleteSection(id: string): void;
}

const getCapabilities = (user: User | null) =>
  user ? ROLE_CAPABILITIES[user.role] : null;

const canEditSection = (
  user: User | null,
  section: Section,
  capabilities: ReturnType<typeof getCapabilities>
) => {
  if (!user || !capabilities) return false;
  if (capabilities.editAnySection) return true;
  return section.ownerId === user.id;
};

const canDeleteSection = (
  user: User | null,
  section: Section,
  capabilities: ReturnType<typeof getCapabilities>
) => {
  if (!user || !capabilities) return false;
  if (capabilities.deleteAnySection) return true;
  return section.ownerId === user.id;
};

export const createAdminStore = (
  storage: StorageLike = memoryStorage()
): AdminStore => {
  let state: AdminState = loadState(storage);
  const listeners = new Set<() => void>();

  function loadState(storage: StorageLike) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return clone(defaultState);
      const parsed = JSON.parse(raw);
      return {
        ...clone(defaultState),
        ...parsed,
        users: parsed.users ?? clone(defaultState.users),
        sections: parsed.sections ?? clone(defaultState.sections),
        currentUserId:
          typeof parsed.currentUserId === "string"
            ? parsed.currentUserId
            : null,
      } satisfies AdminState;
    } catch (error) {
      console.warn("No se pudo cargar el estado del administrador", error);
      return clone(defaultState);
    }
  }

  function persist() {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    listeners.forEach((listener) => listener());
  }

  function getCurrentUser(): User | null {
    return state.users.find((user) => user.id === state.currentUserId) ?? null;
  }

  return {
    getState() {
      return clone(state);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    login(username, password) {
      const user = state.users.find(
        (candidate) =>
          candidate.username === username && candidate.password === password
      );
      ensure(!!user, "Credenciales inválidas");
      state.currentUserId = user!.id;
      persist();
      return clone(user!);
    },
    logout() {
      state.currentUserId = null;
      persist();
    },
    canManageUsers() {
      const user = getCurrentUser();
      const capabilities = getCapabilities(user);
      return Boolean(capabilities?.manageUsers);
    },
    canPublish() {
      const user = getCurrentUser();
      const capabilities = getCapabilities(user);
      return Boolean(capabilities?.publish);
    },
    createUser(data) {
      const currentUser = getCurrentUser();
      const capabilities = getCapabilities(currentUser);
      ensure(!!capabilities?.manageUsers, "Sin permisos para crear usuarios");
      ensure(
        ROLES.includes(data.role),
        "El rol especificado no es válido"
      );
      ensure(
        !state.users.some((user) => user.username === data.username),
        "El nombre de usuario ya existe"
      );

      const newUser: User = {
        id: `user-${createId()}`,
        username: data.username,
        password: data.password,
        role: data.role,
        createdAt: new Date().toISOString(),
      };
      state.users = [...state.users, newUser];
      persist();
      return clone(newUser);
    },
    updateUser(id, updates) {
      const currentUser = getCurrentUser();
      const capabilities = getCapabilities(currentUser);
      ensure(!!capabilities?.manageUsers, "Sin permisos para editar usuarios");
      const userIndex = state.users.findIndex((user) => user.id === id);
      ensure(userIndex >= 0, "Usuario no encontrado");
      const updated: User = {
        ...state.users[userIndex],
        ...updates,
      };
      state.users[userIndex] = updated;
      persist();
      return clone(updated);
    },
    deleteUser(id) {
      const currentUser = getCurrentUser();
      const capabilities = getCapabilities(currentUser);
      ensure(!!capabilities?.manageUsers, "Sin permisos para eliminar usuarios");
      ensure(state.currentUserId !== id, "No puedes eliminar tu propio usuario");
      const before = state.users.length;
      state.users = state.users.filter((user) => user.id !== id);
      ensure(state.users.length !== before, "Usuario no encontrado");
      state.sections = state.sections.map((section) =>
        section.ownerId === id ? { ...section, ownerId: currentUser!.id } : section
      );
      persist();
    },
    createSection(data) {
      const currentUser = getCurrentUser();
      ensure(!!currentUser, "Debes iniciar sesión para crear secciones");
      const capabilities = getCapabilities(currentUser);
      ensure(
        !!capabilities?.createSections,
        "Sin permisos para crear secciones"
      );
      const status: SectionStatus = capabilities.publish
        ? data.status
        : "draft";
      if (!capabilities.publish && data.status === "published") {
        console.warn(
          "El rol actual no puede publicar directamente, se guardará como borrador"
        );
      }
      const now = new Date().toISOString();
      const section: Section = {
        id: `section-${createId()}`,
        title: data.title,
        slug: slugify(data.title),
        content: data.content,
        status,
        ownerId: currentUser.id,
        updatedAt: now,
      };
      state.sections = [section, ...state.sections];
      persist();
      return clone(section);
    },
    updateSection(id, updates) {
      const currentUser = getCurrentUser();
      ensure(!!currentUser, "Debes iniciar sesión para editar secciones");
      const sectionIndex = state.sections.findIndex((section) => section.id === id);
      ensure(sectionIndex >= 0, "Sección no encontrada");
      const section = state.sections[sectionIndex];
      const capabilities = getCapabilities(currentUser);
      ensure(
        canEditSection(currentUser, section, capabilities),
        "Sin permisos para editar esta sección"
      );
      if (updates.status === "published" && !capabilities?.publish) {
        ensure(false, "Sin permisos para publicar esta sección");
      }
      const newStatus = updates.status ?? section.status;
      ensure(
        newStatus === "draft" || newStatus === "published",
        "Estado de sección no válido"
      );
      const updated: Section = {
        ...section,
        ...updates,
        status: newStatus,
        slug: updates.title ? slugify(updates.title) : section.slug,
        updatedAt: new Date().toISOString(),
      };
      state.sections[sectionIndex] = updated;
      persist();
      return clone(updated);
    },
    deleteSection(id) {
      const currentUser = getCurrentUser();
      ensure(!!currentUser, "Debes iniciar sesión para eliminar secciones");
      const section = state.sections.find((item) => item.id === id);
      ensure(!!section, "Sección no encontrada");
      const capabilities = getCapabilities(currentUser);
      ensure(
        canDeleteSection(currentUser, section!, capabilities),
        "Sin permisos para eliminar esta sección"
      );
      state.sections = state.sections.filter((item) => item.id !== id);
      persist();
    },
  };
};

export type { AdminState };
