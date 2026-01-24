/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  // Add other VITE_ prefixed environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
