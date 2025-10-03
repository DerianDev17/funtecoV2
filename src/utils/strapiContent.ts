import {
  fallbackEvents,
  getFallbackEventBySlug,
  type Event,
} from "../data/eventsFallback";
import {
  fallbackTeamMembers,
  getFallbackTeamMemberBySlug,
  type SocialLink,
  type TeamMember,
} from "../data/team";
import {
  resolveStrapiMediaUrl,
  strapiFetch,
  type StrapiFetchOptions,
} from "./strapiClient";

interface StrapiCollectionResponse<TAttributes> {
  data: Array<{
    id: number;
    attributes: TAttributes & {
      createdAt?: string | null;
      updatedAt?: string | null;
      publishedAt?: string | null;
    };
  }>;
}

interface StrapiMediaAttributes {
  url?: string | null;
  alternativeText?: string | null;
}

interface StrapiMediaField {
  data?: {
    id?: number;
    attributes?: StrapiMediaAttributes | null;
  } | null;
}

interface StrapiEventAttributes {
  slug?: string | null;
  title?: string | null;
  shortDescription?: string | null;
  description?: string | string[] | null;
  body?: string | null;
  content?: string | null;
  summary?: string | null;
  date?: string | null;
  eventDate?: string | null;
  location?: string | null;
  tags?: string | string[] | null;
  image?: StrapiMediaField | string | null;
  cover?: StrapiMediaField | null;
  hero?: StrapiMediaField | null;
  formattedDate?: string | null;
}

interface StrapiTeamMemberAttributes {
  slug?: string | null;
  name?: string | null;
  role?: string | null;
  shortBio?: string | null;
  focus?: string | null;
  bio?: string | string[] | null;
  expertise?: string | string[] | null;
  highlights?: string | string[] | null;
  socials?: SocialLink[] | null;
  image?: StrapiMediaField | string | null;
  portrait?: StrapiMediaField | null;
}

export interface EventsOptions extends Omit<StrapiFetchOptions, "query" | "init"> {
  locale?: string;
  fallback?: Event[];
}

export interface TeamOptions extends Omit<StrapiFetchOptions, "query" | "init"> {
  fallback?: TeamMember[];
}

const parseParagraphs = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n\r?\n|\r?\n/g)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

const normalizeTags = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(/[,;]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

const getMediaUrl = (
  field: StrapiMediaField | string | null | undefined,
  baseUrl?: string
): string | undefined => {
  if (!field) return undefined;
  if (typeof field === "string") {
    return resolveStrapiMediaUrl(field, baseUrl);
  }
  const mediaUrl = field.data?.attributes?.url ?? undefined;
  return resolveStrapiMediaUrl(mediaUrl ?? undefined, baseUrl);
};

const formatDate = (value: string, locale = "es-EC") => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch (error) {
    return value;
  }
};

const pickEventFallbackImage = (fallback?: Event[]) => {
  const source = (fallback ?? fallbackEvents)[0];
  return source?.image;
};

const mapEventAttributes = (
  attributes: StrapiEventAttributes,
  options: EventsOptions
): Event | null => {
  const slug = attributes.slug ?? undefined;
  const title = attributes.title ?? undefined;
  if (!slug || !title) {
    return null;
  }

  const date = attributes.date ?? attributes.eventDate ?? attributes.publishedAt ?? new Date().toISOString();
  const formattedDate =
    attributes.formattedDate ?? formatDate(date, options.locale ?? "es-EC");
  const description =
    parseParagraphs(attributes.description ?? attributes.body ?? attributes.content ?? attributes.summary);
  const shortDescription =
    attributes.shortDescription ?? description[0] ?? "Pronto compartiremos más detalles sobre este evento.";
  const location = attributes.location ?? "Ubicación por confirmar";
  const image =
    getMediaUrl(attributes.image, options.baseUrl) ??
    getMediaUrl(attributes.cover, options.baseUrl) ??
    getMediaUrl(attributes.hero, options.baseUrl) ??
    pickEventFallbackImage(options.fallback);

  const tags = normalizeTags(attributes.tags);

  return {
    slug,
    title,
    shortDescription,
    description: description.length > 0 ? description : [shortDescription],
    date,
    formattedDate,
    image: image ?? pickEventFallbackImage(options.fallback) ?? "",
    location,
    tags,
  };
};

export const getEvents = async (options: EventsOptions = {}): Promise<Event[]> => {
  try {
    const response = await strapiFetch<StrapiCollectionResponse<StrapiEventAttributes>>("/api/events", {
      ...options,
      query: {
        populate: "*",
        sort: "date:asc",
        "pagination[pageSize]": "100",
      },
    });

    const events = response.data
      .map((item) => mapEventAttributes(item.attributes, options))
      .filter((event): event is Event => Boolean(event));

    if (events.length === 0) {
      throw new Error("Strapi no devolvió eventos válidos");
    }

    return events;
  } catch (error) {
    console.warn("Fallo al obtener eventos desde Strapi, se usará la data local.", error);
    const fallback = options.fallback ?? fallbackEvents;
    return fallback.map((event) => ({ ...event }));
  }
};

export const getEventBySlug = async (
  slug: string,
  options: EventsOptions = {}
): Promise<Event | undefined> => {
  try {
    const response = await strapiFetch<StrapiCollectionResponse<StrapiEventAttributes>>("/api/events", {
      ...options,
      query: {
        populate: "*",
        "filters[slug][$eq]": slug,
        "pagination[pageSize]": "1",
      },
    });

    const event = response.data
      .map((item) => mapEventAttributes(item.attributes, options))
      .find((item): item is Event => Boolean(item));

    if (event) {
      return event;
    }
  } catch (error) {
    console.warn(`No se pudo obtener el evento ${slug} desde Strapi.`, error);
  }

  const fallback = options.fallback ?? fallbackEvents;
  const local = getFallbackEventBySlug(slug);
  return local ? { ...local } : fallback.find((event) => event.slug === slug);
};

const mapStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n|[,;]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

const mapTeamMemberAttributes = (
  attributes: StrapiTeamMemberAttributes,
  options: TeamOptions
): TeamMember | null => {
  const slug = attributes.slug ?? undefined;
  const name = attributes.name ?? undefined;
  const role = attributes.role ?? undefined;
  if (!slug || !name || !role) {
    return null;
  }

  const shortBio =
    attributes.shortBio ??
    "Este perfil se actualizará en cuanto el equipo cargue la información completa en Strapi.";
  const focus = attributes.focus ?? "Detalle de foco en construcción";
  const bio = mapStringArray(attributes.bio);
  const expertise = mapStringArray(attributes.expertise);
  const highlights = mapStringArray(attributes.highlights);
  const socials = Array.isArray(attributes.socials)
    ? attributes.socials.map((item) => ({ ...item }))
    : [];

  const image =
    getMediaUrl(attributes.image, options.baseUrl) ??
    getMediaUrl(attributes.portrait, options.baseUrl) ??
    fallbackTeamMembers.find((member) => member.slug === slug)?.image ??
    fallbackTeamMembers[0]?.image ??
    "";

  return {
    slug,
    name,
    role,
    image,
    shortBio,
    bio: bio.length > 0 ? bio : [shortBio],
    focus,
    expertise: expertise.length > 0 ? expertise : [focus],
    highlights: highlights.length > 0 ? highlights : [shortBio],
    socials,
  };
};

export const getTeamMembers = async (options: TeamOptions = {}): Promise<TeamMember[]> => {
  try {
    const response = await strapiFetch<StrapiCollectionResponse<StrapiTeamMemberAttributes>>(
      "/api/team-members",
      {
        ...options,
        query: {
          populate: "*",
          sort: "name:asc",
          "pagination[pageSize]": "100",
        },
      }
    );

    const members = response.data
      .map((item) => mapTeamMemberAttributes(item.attributes, options))
      .filter((member): member is TeamMember => Boolean(member));

    if (members.length === 0) {
      throw new Error("Sin integrantes válidos en Strapi");
    }

    return members;
  } catch (error) {
    console.warn("Fallo al obtener integrantes desde Strapi, se usará la data local.", error);
    const fallback = options.fallback ?? fallbackTeamMembers;
    return fallback.map((member) => ({ ...member }));
  }
};

export const getTeamMemberBySlug = async (
  slug: string,
  options: TeamOptions = {}
): Promise<TeamMember | undefined> => {
  try {
    const response = await strapiFetch<StrapiCollectionResponse<StrapiTeamMemberAttributes>>(
      "/api/team-members",
      {
        ...options,
        query: {
          populate: "*",
          "filters[slug][$eq]": slug,
          "pagination[pageSize]": "1",
        },
      }
    );

    const member = response.data
      .map((item) => mapTeamMemberAttributes(item.attributes, options))
      .find((item): item is TeamMember => Boolean(item));

    if (member) {
      return member;
    }
  } catch (error) {
    console.warn(`No se pudo obtener el perfil ${slug} desde Strapi.`, error);
  }

  const fallback = options.fallback ?? fallbackTeamMembers;
  const local = getFallbackTeamMemberBySlug(slug);
  return local ? { ...local } : fallback.find((member) => member.slug === slug);
};

export type { Event, TeamMember };
