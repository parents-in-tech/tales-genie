/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GOOGLE_GENERATIVE_AI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
