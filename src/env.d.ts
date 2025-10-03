/// <reference types="astro/client" />

declare interface ImportMetaEnv {
  readonly PUBLIC_STRAPI_URL: string;
  readonly STRAPI_API_TOKEN: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
