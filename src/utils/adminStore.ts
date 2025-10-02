import { events as defaultEvents } from "../data/events";
import type { Event } from "../data/events";
import { teamMembers as defaultTeamMembers } from "../data/team";
import type { SocialLink, TeamMember } from "../data/team";

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

export interface ManagedTeamMember extends TeamMember {
  id: string;
  status: SectionStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedEvent extends Event {
  id: string;
  status: SectionStatus;
  ownerId: string;
  createdAt: string;
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
  teamMembers: ManagedTeamMember[];
  events: ManagedEvent[];
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

const formatDate = (dateISO: string) => {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateISO));
  } catch (error) {
    console.warn("No fue posible formatear la fecha", dateISO, error);
    return dateISO;
  }
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

const buildInitialTeamMembers = (): ManagedTeamMember[] =>
  defaultTeamMembers.map((member, index) => {
    const created = new Date(2023, 1, 15 + index);
    return {
      ...member,
      id: `team-${index + 1}`,
      status: "published",
      ownerId: "user-admin",
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
    } satisfies ManagedTeamMember;
  });

const buildInitialEvents = (): ManagedEvent[] =>
  defaultEvents.map((event, index) => {
    const created = new Date(2023, 5, 10 + index);
    const date = event.date ?? new Date().toISOString();
    return {
      ...event,
      id: `event-${index + 1}`,
      status: "published",
      ownerId: "user-admin",
      createdAt: created.toISOString(),
      updatedAt: created.toISOString(),
      date,
      formattedDate: event.formattedDate || formatDate(date),
    } satisfies ManagedEvent;
  });

const defaultState: AdminState = {
  users: initialUsers,
  sections: initialSections,
  teamMembers: buildInitialTeamMembers(),
  events: buildInitialEvents(),
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
  createTeamMember(data: {
    name: string;
    role: string;
    image: string;
    shortBio: string;
    bio: string[];
    focus: string;
    expertise: string[];
    highlights: string[];
    socials: SocialLink[];
    status: SectionStatus;
  }): ManagedTeamMember;
  updateTeamMember(
    id: string,
    updates: Partial<
      Pick<
        ManagedTeamMember,
        | "name"
        | "role"
        | "image"
        | "shortBio"
        | "bio"
        | "focus"
        | "expertise"
        | "highlights"
        | "socials"
        | "status"
      >
    >
  ): ManagedTeamMember;
  deleteTeamMember(id: string): void;
  createEvent(data: {
    title: string;
    shortDescription: string;
    description: string[];
    date: string;
    image: string;
    location: string;
    tags: string[];
    status: SectionStatus;
  }): ManagedEvent;
  updateEvent(
    id: string,
    updates: Partial<
      Pick<
        ManagedEvent,
        | "title"
        | "shortDescription"
        | "description"
        | "date"
        | "image"
        | "location"
        | "tags"
        | "status"
      >
    >
  ): ManagedEvent;
  deleteEvent(id: string): void;
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

const canEditTeamMember = (
  user: User | null,
  member: ManagedTeamMember,
  capabilities: ReturnType<typeof getCapabilities>
) => {
  if (!user || !capabilities) return false;
  if (capabilities.editAnySection) return true;
  return member.ownerId === user.id;
};

const canDeleteTeamMember = (
  user: User | null,
  member: ManagedTeamMember,
  capabilities: ReturnType<typeof getCapabilities>
) => {
  if (!user || !capabilities) return false;
  if (capabilities.deleteAnySection) return true;
  return member.ownerId === user.id;
};

const canEditEvent = (
  user: User | null,
  event: ManagedEvent,
  capabilities: ReturnType<typeof getCapabilities>
) => {
  if (!user || !capabilities) return false;
  if (capabilities.editAnySection) return true;
  return event.ownerId === user.id;
};

const canDeleteEvent = (
  user: User | null,
  event: ManagedEvent,
  capabilities: ReturnType<typeof getCapabilities>
) => {
  if (!user || !capabilities) return false;
  if (capabilities.deleteAnySection) return true;
  return event.ownerId === user.id;
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
        teamMembers: parsed.teamMembers ?? clone(defaultState.teamMembers),
        events: parsed.events ?? clone(defaultState.events),
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
      state.teamMembers = state.teamMembers.map((member) =>
        member.ownerId === id ? { ...member, ownerId: currentUser!.id } : member
      );
      state.events = state.events.map((event) =>
        event.ownerId === id ? { ...event, ownerId: currentUser!.id } : event
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
    createTeamMember(data) {
      const currentUser = getCurrentUser();
      ensure(!!currentUser, "Debes iniciar sesión para crear integrantes");
      const capabilities = getCapabilities(currentUser);
      ensure(!!capabilities?.createSections, "Sin permisos para crear integrantes");
      const status: SectionStatus = capabilities.publish ? data.status : "draft";
      const now = new Date().toISOString();
      const member: ManagedTeamMember = {
        id: `team-${createId()}`,
        slug: slugify(data.name),
        name: data.name,
        role: data.role,
        image: data.image,
        shortBio: data.shortBio,
        bio: data.bio,
        focus: data.focus,
        expertise: data.expertise,
        highlights: data.highlights,
        socials: data.socials,
        status,
        ownerId: currentUser.id,
        createdAt: now,
        updatedAt: now,
      };
      state.teamMembers = [member, ...state.teamMembers];
      persist();
      return clone(member);
    },
    updateTeamMember(id, updates) {
      const currentUser = getCurrentUser();
      ensure(!!currentUser, "Debes iniciar sesión para editar integrantes");
      const index = state.teamMembers.findIndex((member) => member.id === id);
      ensure(index >= 0, "Integrante no encontrado");
      const member = state.teamMembers[index];
      const capabilities = getCapabilities(currentUser);
      ensure(
        canEditTeamMember(currentUser, member, capabilities),
        "Sin permisos para editar este integrante"
      );
      if (updates.status === "published" && !capabilities?.publish) {
        ensure(false, "Sin permisos para publicar este integrante");
      }
      const newStatus = updates.status ?? member.status;
      ensure(
        newStatus === "draft" || newStatus === "published",
        "Estado del integrante no válido"
      );
      const updated: ManagedTeamMember = {
        ...member,
        ...updates,
        status: newStatus,
        slug: updates.name ? slugify(updates.name) : member.slug,
        updatedAt: new Date().toISOString(),
      };
      state.teamMembers[index] = updated;
      persist();
      return clone(updated);
    },
    deleteTeamMember(id) {
      const currentUser = getCurrentUser();
      ensure(!!currentUser, "Debes iniciar sesión para eliminar integrantes");
      const member = state.teamMembers.find((item) => item.id === id);
      ensure(!!member, "Integrante no encontrado");
      const capabilities = getCapabilities(currentUser);
      ensure(
        canDeleteTeamMember(currentUser, member!, capabilities),
        "Sin permisos para eliminar este integrante"
      );
      state.teamMembers = state.teamMembers.filter((item) => item.id !== id);
      persist();
    },
    createEvent(data) {
      const currentUser = getCurrentUser();
      ensure(!!currentUser, "Debes iniciar sesión para crear eventos");
      const capabilities = getCapabilities(currentUser);
      ensure(!!capabilities?.createSections, "Sin permisos para crear eventos");
      const status: SectionStatus = capabilities.publish ? data.status : "draft";
      const now = new Date().toISOString();
      const formattedDate = formatDate(data.date);
      const event: ManagedEvent = {
        id: `event-${createId()}`,
        slug: slugify(data.title),
        title: data.title,
        shortDescription: data.shortDescription,
        description: data.description,
        date: data.date,
        formattedDate,
        image: data.image,
        location: data.location,
        tags: data.tags,
        status,
        ownerId: currentUser.id,
        createdAt: now,
        updatedAt: now,
      };
      state.events = [event, ...state.events];
      persist();
      return clone(event);
    },
    updateEvent(id, updates) {
      const currentUser = getCurrentUser();
      ensure(!!currentUser, "Debes iniciar sesión para editar eventos");
      const index = state.events.findIndex((event) => event.id === id);
      ensure(index >= 0, "Evento no encontrado");
      const event = state.events[index];
      const capabilities = getCapabilities(currentUser);
      ensure(
        canEditEvent(currentUser, event, capabilities),
        "Sin permisos para editar este evento"
      );
      if (updates.status === "published" && !capabilities?.publish) {
        ensure(false, "Sin permisos para publicar este evento");
      }
      const newStatus = updates.status ?? event.status;
      ensure(
        newStatus === "draft" || newStatus === "published",
        "Estado del evento no válido"
      );
      const date = updates.date ?? event.date;
      const updated: ManagedEvent = {
        ...event,
        ...updates,
        status: newStatus,
        slug: updates.title ? slugify(updates.title) : event.slug,
        date,
        formattedDate: updates.date ? formatDate(updates.date) : event.formattedDate,
        updatedAt: new Date().toISOString(),
      };
      state.events[index] = updated;
      persist();
      return clone(updated);
    },
    deleteEvent(id) {
      const currentUser = getCurrentUser();
      ensure(!!currentUser, "Debes iniciar sesión para eliminar eventos");
      const event = state.events.find((item) => item.id === id);
      ensure(!!event, "Evento no encontrado");
      const capabilities = getCapabilities(currentUser);
      ensure(
        canDeleteEvent(currentUser, event!, capabilities),
        "Sin permisos para eliminar este evento"
      );
      state.events = state.events.filter((item) => item.id !== id);
      persist();
    },
  };
};

export type { AdminState };
