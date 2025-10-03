const DEFAULT_STRAPI_URL = "http://localhost:1337";

const readImportMetaEnv = (key: string): string | undefined => {
  try {
    return (import.meta as unknown as { env?: Record<string, string> }).env?.[key];
  } catch (error) {
    return undefined;
  }
};

const readProcessEnv = (key: string): string | undefined => {
  if (typeof process !== "undefined" && process.env && key in process.env) {
    return process.env[key];
  }
  return undefined;
};

export interface StrapiFetchOptions {
  baseUrl?: string;
  token?: string;
  fetcher?: typeof fetch;
  query?: Record<string, string | number | boolean | string[]>;
  init?: RequestInit;
}

export const getStrapiBaseUrl = (explicit?: string) =>
  explicit ??
  readImportMetaEnv("PUBLIC_STRAPI_URL") ??
  readProcessEnv("PUBLIC_STRAPI_URL") ??
  DEFAULT_STRAPI_URL;

export const getStrapiToken = (explicit?: string) =>
  explicit ?? readProcessEnv("STRAPI_API_TOKEN") ?? readImportMetaEnv("STRAPI_API_TOKEN");

const ensureFetcher = (custom?: typeof fetch) => {
  if (custom) return custom;
  if (typeof fetch === "function") {
    return fetch.bind(globalThis);
  }
  throw new Error("Fetch API no disponible en este entorno");
};

const appendQueryParams = (url: URL, query?: Record<string, string | number | boolean | string[]>) => {
  if (!query) return;
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, String(item)));
      return;
    }
    url.searchParams.set(key, String(value));
  });
};

export async function strapiFetch<TResponse = unknown>(
  path: string,
  options: StrapiFetchOptions = {}
): Promise<TResponse> {
  const baseUrl = getStrapiBaseUrl(options.baseUrl);
  const fetcher = ensureFetcher(options.fetcher);
  const url = new URL(path, baseUrl);
  appendQueryParams(url, options.query);

  const headers = new Headers(options.init?.headers ?? {});
  const token = getStrapiToken(options.token);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetcher(url.toString(), {
    method: "GET",
    ...options.init,
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `Solicitud a Strapi fallida (${response.status} ${response.statusText}) en ${url.toString()}`
    );
  }

  return (await response.json()) as TResponse;
}

export const resolveStrapiMediaUrl = (url?: string | null, baseUrl?: string) => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const origin = getStrapiBaseUrl(baseUrl);
  return new URL(url, origin).toString();
};
