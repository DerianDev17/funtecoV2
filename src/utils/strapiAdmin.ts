import {
  createAdminStore,
  ROLES,
  ROLE_CAPABILITIES,
  type AdminStore,
  type ManagedEvent,
  type ManagedTeamMember,
  type Role,
  type Section,
  type SectionStatus,
  type StorageLike,
  type User,
} from "./adminStore";
import type { SocialLink } from "../data/team";

export type MediaType = "image" | "video" | "document";

export type ContentFieldType =
  | "string"
  | "text"
  | "richtext"
  | "uid"
  | "media"
  | "enumeration"
  | "json"
  | "date"
  | "datetime"
  | "boolean"
  | "number"
  | "relation";

export type ContentTypeUID = "sections" | "team-members" | "events" | (string & {});

export interface ContentTypeField {
  id: string;
  name: string;
  type: ContentFieldType;
  required: boolean;
  configurable: boolean;
  defaultValue?: unknown;
  options?: Record<string, unknown>;
}

export interface ContentTypeDefinition {
  uid: ContentTypeUID;
  displayName: string;
  description: string;
  category: string;
  icon: string;
  draftAndPublish: boolean;
  kind: "collectionType";
  configurable: boolean;
  fields: ContentTypeField[];
}

export interface ContentEntry<TAttributes = Record<string, unknown>> {
  id: string;
  contentType: ContentTypeUID;
  status: SectionStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  attributes: TAttributes;
}

export type CustomEntry = ContentEntry<Record<string, unknown>>;

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: MediaType;
  size: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  altText?: string;
}

const MODULE_STORAGE_KEY = "funteco-strapi-modules";
const BUILT_IN_COLLECTIONS = new Set<ContentTypeUID>([
  "sections",
  "team-members",
  "events",
]);
const FIELD_TYPES = new Set<ContentFieldType>([
  "string",
  "text",
  "richtext",
  "uid",
  "media",
  "enumeration",
  "json",
  "date",
  "datetime",
  "boolean",
  "number",
  "relation",
]);

const SYSTEM_CATEGORY = "Colecciones FunTeco";
const CUSTOM_CATEGORY = "Colecciones personalizadas";

interface ModuleState {
  contentTypes: ContentTypeDefinition[];
  customCollections: Record<string, CustomEntry[]>;
  mediaLibrary: MediaAsset[];
}

const clone = <T>(value: T): T => structuredClone(value);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const createId = () =>
  typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const mapSectionToEntry = (section: Section): ContentEntry<Omit<Section, "id">> => ({
  id: section.id,
  contentType: "sections",
  status: section.status,
  ownerId: section.ownerId,
  createdAt: section.updatedAt,
  updatedAt: section.updatedAt,
  attributes: {
    title: section.title,
    slug: section.slug,
    content: section.content,
    status: section.status,
    ownerId: section.ownerId,
    updatedAt: section.updatedAt,
  },
});

const mapTeamMemberToEntry = (
  member: ManagedTeamMember
): ContentEntry<Omit<ManagedTeamMember, "id" | "status" | "ownerId" | "createdAt" | "updatedAt">> => ({
  id: member.id,
  contentType: "team-members",
  status: member.status,
  ownerId: member.ownerId,
  createdAt: member.createdAt,
  updatedAt: member.updatedAt,
  attributes: {
    slug: member.slug,
    name: member.name,
    role: member.role,
    image: member.image,
    shortBio: member.shortBio,
    bio: member.bio,
    focus: member.focus,
    expertise: member.expertise,
    highlights: member.highlights,
    socials: member.socials,
  },
});

const mapEventToEntry = (
  event: ManagedEvent
): ContentEntry<Omit<ManagedEvent, "id" | "status" | "ownerId" | "createdAt" | "updatedAt">> => ({
  id: event.id,
  contentType: "events",
  status: event.status,
  ownerId: event.ownerId,
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
  attributes: {
    slug: event.slug,
    title: event.title,
    shortDescription: event.shortDescription,
    description: event.description,
    date: event.date,
    formattedDate: event.formattedDate,
    image: event.image,
    location: event.location,
    tags: event.tags,
  },
});

const createDefaultContentTypes = (): ContentTypeDefinition[] => [
  {
    uid: "sections",
    displayName: "Secciones del sitio",
    description:
      "Componentes editoriales que alimentan el hero, llamados a la acción y otros bloques informativos.",
    category: SYSTEM_CATEGORY,
    icon: "align-left",
    draftAndPublish: true,
    kind: "collectionType",
    configurable: false,
    fields: [
      {
        id: "title",
        name: "Título",
        type: "string",
        required: true,
        configurable: true,
      },
      {
        id: "slug",
        name: "Slug",
        type: "uid",
        required: true,
        configurable: false,
      },
      {
        id: "content",
        name: "Contenido",
        type: "richtext",
        required: true,
        configurable: true,
      },
      {
        id: "status",
        name: "Estado",
        type: "enumeration",
        required: true,
        configurable: true,
        options: { values: ["draft", "published"] },
      },
    ],
  },
  {
    uid: "team-members",
    displayName: "Integrantes del equipo",
    description:
      "Perfiles con biografías ampliadas, galerías multimedia y enlaces a redes sociales.",
    category: SYSTEM_CATEGORY,
    icon: "users",
    draftAndPublish: true,
    kind: "collectionType",
    configurable: false,
    fields: [
      { id: "name", name: "Nombre", type: "string", required: true, configurable: true },
      { id: "slug", name: "Slug", type: "uid", required: true, configurable: false },
      { id: "role", name: "Rol", type: "string", required: true, configurable: true },
      { id: "image", name: "Imagen", type: "media", required: true, configurable: true },
      { id: "shortBio", name: "Resumen", type: "text", required: true, configurable: true },
      { id: "bio", name: "Biografía", type: "json", required: true, configurable: true },
      { id: "focus", name: "Enfoque", type: "string", required: true, configurable: true },
      { id: "expertise", name: "Experticias", type: "json", required: true, configurable: true },
      { id: "highlights", name: "Logros", type: "json", required: true, configurable: true },
      { id: "socials", name: "Redes", type: "json", required: false, configurable: true },
      {
        id: "status",
        name: "Estado",
        type: "enumeration",
        required: true,
        configurable: true,
        options: { values: ["draft", "published"] },
      },
    ],
  },
  {
    uid: "events",
    displayName: "Eventos y actividades",
    description: "Agenda programática y experiencias formativas de la fundación.",
    category: SYSTEM_CATEGORY,
    icon: "calendar",
    draftAndPublish: true,
    kind: "collectionType",
    configurable: false,
    fields: [
      { id: "title", name: "Título", type: "string", required: true, configurable: true },
      { id: "slug", name: "Slug", type: "uid", required: true, configurable: false },
      { id: "shortDescription", name: "Descripción corta", type: "text", required: true, configurable: true },
      { id: "description", name: "Descripción", type: "json", required: true, configurable: true },
      { id: "date", name: "Fecha", type: "date", required: true, configurable: true },
      { id: "image", name: "Imagen", type: "media", required: true, configurable: true },
      { id: "location", name: "Ubicación", type: "string", required: true, configurable: true },
      { id: "tags", name: "Etiquetas", type: "json", required: false, configurable: true },
      {
        id: "status",
        name: "Estado",
        type: "enumeration",
        required: true,
        configurable: true,
        options: { values: ["draft", "published"] },
      },
    ],
  },
];

const createDefaultMediaLibrary = (
  teamMembers: ManagedTeamMember[],
  events: ManagedEvent[],
  author: string
): MediaAsset[] => {
  const assets = new Map<string, MediaAsset>();
  const register = (url: string, name: string) => {
    if (!url || assets.has(url)) return;
    assets.set(url, {
      id: `asset-${assets.size + 1}`,
      name,
      url,
      type: "image",
      size: 0,
      createdAt: new Date(2023, 0, assets.size + 1).toISOString(),
      updatedAt: new Date(2023, 0, assets.size + 1).toISOString(),
      createdBy: author,
    });
  };
  teamMembers.forEach((member) => register(member.image, member.name));
  events.forEach((event) => register(event.image, event.title));
  return Array.from(assets.values());
};

const createDefaultModuleState = (legacyState: ReturnType<AdminStore["getState"]>): ModuleState => ({
  contentTypes: createDefaultContentTypes(),
  customCollections: {},
  mediaLibrary: createDefaultMediaLibrary(
    legacyState.teamMembers,
    legacyState.events,
    legacyState.users[0]?.username ?? "admin"
  ),
});

const loadModuleState = (
  storage: StorageLike | undefined,
  legacyState: ReturnType<AdminStore["getState"]>
): ModuleState => {
  const defaults = createDefaultModuleState(legacyState);
  if (!storage) return defaults;
  try {
    const raw = storage.getItem(MODULE_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<ModuleState>;
    const storedTypes = Array.isArray(parsed.contentTypes)
      ? (parsed.contentTypes as ContentTypeDefinition[])
      : [];
    const typeMap = new Map<string, ContentTypeDefinition>();
    defaults.contentTypes.forEach((type) => typeMap.set(type.uid, type));
    storedTypes.forEach((type) => {
      const base = typeMap.get(type.uid);
      typeMap.set(type.uid, {
        ...base,
        ...type,
        configurable: base?.configurable ?? type.configurable ?? true,
        fields: Array.isArray(type.fields) ? type.fields : base?.fields ?? [],
      } as ContentTypeDefinition);
    });
    const contentTypes = Array.from(typeMap.values());
    const customCollections = parsed.customCollections
      ? Object.fromEntries(
          Object.entries(parsed.customCollections).map(([uid, entries]) => [
            uid,
            Array.isArray(entries)
              ? (entries as CustomEntry[])
              : defaults.customCollections[uid] ?? [],
          ])
        )
      : defaults.customCollections;
    const mediaLibrary = Array.isArray(parsed.mediaLibrary)
      ? (parsed.mediaLibrary as MediaAsset[])
      : defaults.mediaLibrary;
    return { contentTypes, customCollections, mediaLibrary };
  } catch (error) {
    console.warn("No se pudo cargar el estado de los módulos Strapi", error);
    return defaults;
  }
};

const persistModuleState = (storage: StorageLike | undefined, state: ModuleState) => {
  if (!storage) return;
  storage.setItem(MODULE_STORAGE_KEY, JSON.stringify(state));
};

const ensure = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const toSectionStatus = (value: unknown, fallback: SectionStatus = "draft"): SectionStatus => {
  if (value === "published" || value === "draft") {
    return value;
  }
  return fallback;
};

const sanitizeFieldId = (name: string, existing: ContentTypeField[]): string => {
  const base = slugify(name);
  let candidate = base || `field-${existing.length + 1}`;
  let index = 1;
  while (existing.some((field) => field.id === candidate)) {
    candidate = `${base}-${index++}`;
  }
  return candidate;
};

const getCurrentUser = (store: AdminStore): User | null => {
  const state = store.getState();
  return state.users.find((user) => user.id === state.currentUserId) ?? null;
};

const registerAssetIfNeeded = (
  state: ModuleState,
  payload: { url?: string; name: string; author: string }
) => {
  if (!payload.url) return;
  const exists = state.mediaLibrary.some((asset) => asset.url === payload.url);
  if (exists) return;
  const now = new Date().toISOString();
  state.mediaLibrary.push({
    id: `asset-${state.mediaLibrary.length + 1}-${createId()}`,
    name: payload.name,
    url: payload.url,
    type: "image",
    size: 0,
    createdAt: now,
    updatedAt: now,
    createdBy: payload.author,
  });
};

const reorderByIds = <T extends { id: string }>(
  collection: T[],
  orderedIds: string[]
): T[] => {
  const seen = new Set<string>();
  const ordered: T[] = [];
  orderedIds.forEach((id) => {
    if (seen.has(id)) return;
    const item = collection.find((candidate) => candidate.id === id);
    if (item) {
      ordered.push(item);
      seen.add(id);
    }
  });
  collection.forEach((item) => {
    if (!seen.has(item.id)) {
      ordered.push(item);
    }
  });
  return ordered;
};

export interface ContentTypeBuilderModule {
  list(): ContentTypeDefinition[];
  get(uid: ContentTypeUID): ContentTypeDefinition | undefined;
  create(
    data: Omit<ContentTypeDefinition, "uid" | "kind" | "draftAndPublish" | "fields" | "configurable"> &
      Partial<Pick<ContentTypeDefinition, "draftAndPublish" | "fields">>
  ): ContentTypeDefinition;
  update(
    uid: ContentTypeUID,
    updates: Partial<Omit<ContentTypeDefinition, "uid" | "fields" | "kind">>
  ): ContentTypeDefinition;
  delete(uid: ContentTypeUID): void;
  addField(
    uid: ContentTypeUID,
    field: Omit<ContentTypeField, "id"> & { id?: string }
  ): ContentTypeField;
  updateField(
    uid: ContentTypeUID,
    fieldId: string,
    updates: Partial<Omit<ContentTypeField, "id">>
  ): ContentTypeField;
  removeField(uid: ContentTypeUID, fieldId: string): void;
}

export interface ContentManagerModule {
  listCollections(): ContentTypeDefinition[];
  listEntries(uid: ContentTypeUID): ContentEntry[];
  getEntry(uid: ContentTypeUID, id: string): ContentEntry | undefined;
  createEntry(uid: ContentTypeUID, data: Record<string, unknown>): ContentEntry;
  updateEntry(
    uid: ContentTypeUID,
    id: string,
    updates: Record<string, unknown>
  ): ContentEntry;
  deleteEntry(uid: ContentTypeUID, id: string): void;
  setStatus(uid: ContentTypeUID, id: string, status: SectionStatus): ContentEntry;
  reorderEntries(uid: ContentTypeUID, orderedIds: string[]): void;
}

export interface MediaLibraryModule {
  list(): MediaAsset[];
  upload(data: { name: string; url: string; type?: MediaType; size?: number; altText?: string }): MediaAsset;
  update(id: string, updates: Partial<Omit<MediaAsset, "id" | "createdAt" | "createdBy">>): MediaAsset;
  remove(id: string): void;
}

export interface UsersRolesPermissionsModule {
  listRoles(): Role[];
  listUsers(): User[];
  getRoleCapabilities(role: Role): (typeof ROLE_CAPABILITIES)[Role];
  currentUser(): User | null;
  createUser(data: Omit<User, "id" | "createdAt"> & { password: string }): User;
  updateUser(id: string, updates: Partial<Pick<User, "password" | "role">>): User;
  deleteUser(id: string): void;
  assignRole(id: string, role: Role): User;
  canCurrentUserManageUsers(): boolean;
}

export interface StrapiAdminStore extends AdminStore {
  modules: {
    contentTypeBuilder: ContentTypeBuilderModule;
    contentManager: ContentManagerModule;
    mediaLibrary: MediaLibraryModule;
    usersRolesPermissions: UsersRolesPermissionsModule;
  };
}

export const createStrapiAdmin = (
  storage?: StorageLike
): StrapiAdminStore => {
  const legacyStore = createAdminStore(storage);
  let moduleState = loadModuleState(storage, legacyStore.getState());

  const persist = () => persistModuleState(storage, moduleState);

  const contentTypeBuilder: ContentTypeBuilderModule = {
    list() {
      return clone(moduleState.contentTypes);
    },
    get(uid) {
      return clone(moduleState.contentTypes.find((type) => type.uid === uid));
    },
    create(data) {
      const currentUser = getCurrentUser(legacyStore);
      ensure(
        !!currentUser && ROLE_CAPABILITIES[currentUser.role].manageUsers,
        "Sin permisos para crear tipos de contenido"
      );
      const uid = (data.uid as ContentTypeUID) ?? (slugify(data.displayName) as ContentTypeUID);
      ensure(uid.length > 0, "El nombre interno del tipo no puede estar vacío");
      ensure(
        !moduleState.contentTypes.some((type) => type.uid === uid),
        "Ya existe un tipo de contenido con ese UID"
      );
      const fields = Array.isArray(data.fields) ? data.fields : [];
      const definition: ContentTypeDefinition = {
        uid,
        displayName: data.displayName,
        description: data.description,
        category: data.category ?? CUSTOM_CATEGORY,
        icon: data.icon ?? "database",
        draftAndPublish: data.draftAndPublish ?? true,
        kind: "collectionType",
        configurable: true,
        fields: fields.map((field, index) => ({
          ...field,
          id: field.id ?? `field-${index + 1}`,
        })),
      };
      moduleState.contentTypes = [...moduleState.contentTypes, definition];
      moduleState.customCollections[uid] = [];
      persist();
      return clone(definition);
    },
    update(uid, updates) {
      const currentUser = getCurrentUser(legacyStore);
      ensure(
        !!currentUser && ROLE_CAPABILITIES[currentUser.role].manageUsers,
        "Sin permisos para editar tipos de contenido"
      );
      const index = moduleState.contentTypes.findIndex((type) => type.uid === uid);
      ensure(index >= 0, "Tipo de contenido no encontrado");
      const definition = moduleState.contentTypes[index];
      ensure(definition.configurable, "El tipo de contenido no es editable");
      const updated: ContentTypeDefinition = {
        ...definition,
        ...updates,
        fields: definition.fields,
      };
      moduleState.contentTypes[index] = updated;
      persist();
      return clone(updated);
    },
    delete(uid) {
      const currentUser = getCurrentUser(legacyStore);
      ensure(
        !!currentUser && ROLE_CAPABILITIES[currentUser.role].manageUsers,
        "Sin permisos para eliminar tipos de contenido"
      );
      const type = moduleState.contentTypes.find((candidate) => candidate.uid === uid);
      ensure(!!type, "Tipo de contenido no encontrado");
      ensure(type.configurable, "No es posible eliminar un tipo del sistema");
      moduleState.contentTypes = moduleState.contentTypes.filter((item) => item.uid !== uid);
      delete moduleState.customCollections[uid];
      persist();
    },
    addField(uid, field) {
      const currentUser = getCurrentUser(legacyStore);
      ensure(
        !!currentUser && ROLE_CAPABILITIES[currentUser.role].manageUsers,
        "Sin permisos para gestionar campos"
      );
      ensure(FIELD_TYPES.has(field.type), "Tipo de campo no admitido");
      const type = moduleState.contentTypes.find((item) => item.uid === uid);
      ensure(!!type, "Tipo de contenido no encontrado");
      ensure(type.configurable, "El tipo de contenido no permite modificaciones");
      const id = field.id ?? sanitizeFieldId(field.name, type.fields);
      ensure(
        !type.fields.some((candidate) => candidate.id === id),
        "Ya existe un campo con ese identificador"
      );
      const definition: ContentTypeField = {
        id,
        name: field.name,
        type: field.type,
        required: field.required ?? false,
        configurable: field.configurable ?? true,
        defaultValue: field.defaultValue,
        options: field.options,
      };
      type.fields = [...type.fields, definition];
      persist();
      return clone(definition);
    },
    updateField(uid, fieldId, updates) {
      const currentUser = getCurrentUser(legacyStore);
      ensure(
        !!currentUser && ROLE_CAPABILITIES[currentUser.role].manageUsers,
        "Sin permisos para editar campos"
      );
      const type = moduleState.contentTypes.find((item) => item.uid === uid);
      ensure(!!type, "Tipo de contenido no encontrado");
      ensure(type.configurable, "El tipo de contenido no permite modificaciones");
      const index = type.fields.findIndex((field) => field.id === fieldId);
      ensure(index >= 0, "Campo no encontrado");
      const field = type.fields[index];
      if (updates.type) {
        ensure(FIELD_TYPES.has(updates.type), "Tipo de campo no admitido");
      }
      type.fields[index] = {
        ...field,
        ...updates,
      };
      persist();
      return clone(type.fields[index]);
    },
    removeField(uid, fieldId) {
      const currentUser = getCurrentUser(legacyStore);
      ensure(
        !!currentUser && ROLE_CAPABILITIES[currentUser.role].manageUsers,
        "Sin permisos para eliminar campos"
      );
      const type = moduleState.contentTypes.find((item) => item.uid === uid);
      ensure(!!type, "Tipo de contenido no encontrado");
      ensure(type.configurable, "El tipo de contenido no permite modificaciones");
      ensure(type.fields.some((field) => field.id === fieldId), "Campo no encontrado");
      type.fields = type.fields.filter((field) => field.id !== fieldId);
      persist();
    },
  };

  const mapCustomEntry = (entry: CustomEntry): ContentEntry => clone(entry);

  const listEntries = (uid: ContentTypeUID): ContentEntry[] => {
    if (uid === "sections") {
      return legacyStore.getState().sections.map(mapSectionToEntry);
    }
    if (uid === "team-members") {
      return legacyStore.getState().teamMembers.map(mapTeamMemberToEntry);
    }
    if (uid === "events") {
      return legacyStore.getState().events.map(mapEventToEntry);
    }
    return (moduleState.customCollections[uid] ?? []).map(mapCustomEntry);
  };

  const contentManager: ContentManagerModule = {
    listCollections() {
      return clone(moduleState.contentTypes);
    },
    listEntries(uid) {
      return listEntries(uid);
    },
    getEntry(uid, id) {
      return this.listEntries(uid).find((entry) => entry.id === id);
    },
    createEntry(uid, data) {
      if (uid === "sections") {
        const section = legacyStore.createSection({
          title: String(data.title ?? ""),
          content: String(data.content ?? ""),
          status: toSectionStatus(data.status),
        });
        persist();
        return mapSectionToEntry(section);
      }
      if (uid === "team-members") {
        const member = legacyStore.createTeamMember({
          name: String(data.name ?? ""),
          role: String(data.role ?? ""),
          image: String(data.image ?? ""),
          shortBio: String(data.shortBio ?? ""),
          bio: Array.isArray(data.bio)
            ? (data.bio as string[])
            : String(data.bio ?? "").split(/\r?\n/).filter(Boolean),
          focus: String(data.focus ?? ""),
          expertise: Array.isArray(data.expertise)
            ? (data.expertise as string[])
            : String(data.expertise ?? "").split(",").map((item) => item.trim()).filter(Boolean),
          highlights: Array.isArray(data.highlights)
            ? (data.highlights as string[])
            : String(data.highlights ?? "").split(/\r?\n/).filter(Boolean),
          socials: (Array.isArray(data.socials) ? data.socials : []) as SocialLink[],
          status: toSectionStatus(data.status),
        });
        registerAssetIfNeeded(moduleState, {
          url: member.image,
          name: member.name,
          author: getCurrentUser(legacyStore)?.username ?? "admin",
        });
        persist();
        return mapTeamMemberToEntry(member);
      }
      if (uid === "events") {
        const event = legacyStore.createEvent({
          title: String(data.title ?? ""),
          shortDescription: String(data.shortDescription ?? ""),
          description: Array.isArray(data.description)
            ? (data.description as string[])
            : String(data.description ?? "").split(/\r?\n/).filter(Boolean),
          date: String(data.date ?? new Date().toISOString()),
          image: String(data.image ?? ""),
          location: String(data.location ?? ""),
          tags: Array.isArray(data.tags)
            ? (data.tags as string[])
            : String(data.tags ?? "").split(",").map((item) => item.trim()).filter(Boolean),
          status: toSectionStatus(data.status, "draft"),
        });
        registerAssetIfNeeded(moduleState, {
          url: event.image,
          name: event.title,
          author: getCurrentUser(legacyStore)?.username ?? "admin",
        });
        persist();
        return mapEventToEntry(event);
      }
      const type = moduleState.contentTypes.find((candidate) => candidate.uid === uid);
      ensure(!!type, "Tipo de contenido no encontrado");
      const currentUser = getCurrentUser(legacyStore);
      ensure(!!currentUser, "Debes iniciar sesión para crear registros");
      const requiredFields = type.fields.filter((field) => field.required);
      requiredFields.forEach((field) => {
        ensure(data[field.id] !== undefined && data[field.id] !== null, `El campo ${field.name} es obligatorio`);
      });
      const now = new Date().toISOString();
      const status = type.draftAndPublish ? toSectionStatus(data.status) : "published";
      const entry: CustomEntry = {
        id: `entry-${createId()}`,
        contentType: uid,
        status,
        ownerId: currentUser.id,
        createdAt: now,
        updatedAt: now,
        attributes: Object.fromEntries(
          Object.entries(data).filter(([key]) => key !== "status")
        ),
      };
      if (!moduleState.customCollections[uid]) {
        moduleState.customCollections[uid] = [];
      }
      moduleState.customCollections[uid] = [entry, ...moduleState.customCollections[uid]];
      const mediaFields = type.fields.filter((field) => field.type === "media");
      mediaFields.forEach((field) => {
        const url = data[field.id];
        if (typeof url === "string") {
          registerAssetIfNeeded(moduleState, {
            url,
            name: `${type.displayName}: ${field.name}`,
            author: currentUser.username,
          });
        }
      });
      persist();
      return clone(entry);
    },
    updateEntry(uid, id, updates) {
      if (uid === "sections") {
        const section = legacyStore.updateSection(id, {
          title: updates.title as string | undefined,
          content: updates.content as string | undefined,
          status: updates.status as SectionStatus | undefined,
        });
        persist();
        return mapSectionToEntry(section);
      }
      if (uid === "team-members") {
        const member = legacyStore.updateTeamMember(id, {
          name: updates.name as string | undefined,
          role: updates.role as string | undefined,
          image: updates.image as string | undefined,
          shortBio: updates.shortBio as string | undefined,
          bio: updates.bio as string[] | undefined,
          focus: updates.focus as string | undefined,
          expertise: updates.expertise as string[] | undefined,
          highlights: updates.highlights as string[] | undefined,
          socials: updates.socials as SocialLink[] | undefined,
          status: updates.status as SectionStatus | undefined,
        });
        if (updates.image) {
          registerAssetIfNeeded(moduleState, {
            url: String(updates.image),
            name: member.name,
            author: getCurrentUser(legacyStore)?.username ?? "admin",
          });
        }
        persist();
        return mapTeamMemberToEntry(member);
      }
      if (uid === "events") {
        const event = legacyStore.updateEvent(id, {
          title: updates.title as string | undefined,
          shortDescription: updates.shortDescription as string | undefined,
          description: updates.description as string[] | undefined,
          date: updates.date as string | undefined,
          image: updates.image as string | undefined,
          location: updates.location as string | undefined,
          tags: updates.tags as string[] | undefined,
          status: updates.status as SectionStatus | undefined,
        });
        if (updates.image) {
          registerAssetIfNeeded(moduleState, {
            url: String(updates.image),
            name: event.title,
            author: getCurrentUser(legacyStore)?.username ?? "admin",
          });
        }
        persist();
        return mapEventToEntry(event);
      }
      const type = moduleState.contentTypes.find((candidate) => candidate.uid === uid);
      ensure(!!type, "Tipo de contenido no encontrado");
      const collection = moduleState.customCollections[uid] ?? [];
      const index = collection.findIndex((entry) => entry.id === id);
      ensure(index >= 0, "Entrada no encontrada");
      const entry = collection[index];
      const newStatus = updates.status
        ? toSectionStatus(updates.status as SectionStatus)
        : entry.status;
      const now = new Date().toISOString();
      const attributes = {
        ...entry.attributes,
        ...Object.fromEntries(
          Object.entries(updates).filter(([key]) => key !== "status")
        ),
      };
      const updated: CustomEntry = {
        ...entry,
        status: type.draftAndPublish ? newStatus : "published",
        updatedAt: now,
        attributes,
      };
      moduleState.customCollections[uid][index] = updated;
      persist();
      return clone(updated);
    },
    deleteEntry(uid, id) {
      if (uid === "sections") {
        legacyStore.deleteSection(id);
        persist();
        return;
      }
      if (uid === "team-members") {
        legacyStore.deleteTeamMember(id);
        persist();
        return;
      }
      if (uid === "events") {
        legacyStore.deleteEvent(id);
        persist();
        return;
      }
      const collection = moduleState.customCollections[uid];
      ensure(!!collection, "Tipo de contenido no encontrado");
      const before = collection.length;
      moduleState.customCollections[uid] = collection.filter((entry) => entry.id !== id);
      ensure(before !== moduleState.customCollections[uid].length, "Entrada no encontrada");
      persist();
    },
    setStatus(uid, id, status) {
      if (uid === "sections") {
        return this.updateEntry(uid, id, { status });
      }
      if (uid === "team-members") {
        return this.updateEntry(uid, id, { status });
      }
      if (uid === "events") {
        return this.updateEntry(uid, id, { status });
      }
      return this.updateEntry(uid, id, { status });
    },
    reorderEntries(uid, orderedIds) {
      if (uid === "sections") {
        state.sections = reorderByIds(state.sections, orderedIds);
        persist();
        return;
      }
      if (uid === "team-members") {
        state.teamMembers = reorderByIds(state.teamMembers, orderedIds);
        persist();
        return;
      }
      if (uid === "events") {
        state.events = reorderByIds(state.events, orderedIds);
        persist();
        return;
      }
      const collection = moduleState.customCollections[uid];
      ensure(!!collection, "Tipo de contenido no encontrado");
      moduleState.customCollections[uid] = reorderByIds(collection, orderedIds);
      persist();
    },
  };

  const mediaLibrary: MediaLibraryModule = {
    list() {
      return clone(moduleState.mediaLibrary);
    },
    upload(data) {
      const currentUser = getCurrentUser(legacyStore);
      ensure(!!currentUser, "Debes iniciar sesión para subir archivos");
      ensure(data.url, "La URL del archivo es obligatoria");
      const now = new Date().toISOString();
      const asset: MediaAsset = {
        id: `asset-${createId()}`,
        name: data.name || data.url.split("/").pop() || "Archivo",
        url: data.url,
        type: data.type ?? "image",
        size: data.size ?? 0,
        altText: data.altText,
        createdAt: now,
        updatedAt: now,
        createdBy: currentUser.username,
      };
      moduleState.mediaLibrary = [asset, ...moduleState.mediaLibrary.filter((item) => item.url !== asset.url)];
      persist();
      return clone(asset);
    },
    update(id, updates) {
      const index = moduleState.mediaLibrary.findIndex((asset) => asset.id === id);
      ensure(index >= 0, "Archivo multimedia no encontrado");
      const asset = moduleState.mediaLibrary[index];
      moduleState.mediaLibrary[index] = {
        ...asset,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      persist();
      return clone(moduleState.mediaLibrary[index]);
    },
    remove(id) {
      const before = moduleState.mediaLibrary.length;
      moduleState.mediaLibrary = moduleState.mediaLibrary.filter((asset) => asset.id !== id);
      ensure(before !== moduleState.mediaLibrary.length, "Archivo multimedia no encontrado");
      persist();
    },
  };

  const usersRolesPermissions: UsersRolesPermissionsModule = {
    listRoles() {
      return [...ROLES];
    },
    listUsers() {
      return clone(legacyStore.getState().users);
    },
    getRoleCapabilities(role) {
      return ROLE_CAPABILITIES[role];
    },
    currentUser() {
      return getCurrentUser(legacyStore);
    },
    createUser(data) {
      const user = legacyStore.createUser(data);
      persist();
      return user;
    },
    updateUser(id, updates) {
      const user = legacyStore.updateUser(id, updates);
      persist();
      return user;
    },
    deleteUser(id) {
      legacyStore.deleteUser(id);
      persist();
    },
    assignRole(id, role) {
      return this.updateUser(id, { role });
    },
    canCurrentUserManageUsers() {
      return legacyStore.canManageUsers();
    },
  };

  return {
    ...legacyStore,
    modules: {
      contentTypeBuilder,
      contentManager,
      mediaLibrary,
      usersRolesPermissions,
    },
  };
};

export type { ModuleState };
