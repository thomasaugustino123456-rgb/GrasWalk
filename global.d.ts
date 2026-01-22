// This file augments the global NodeJS namespace to provide type definitions for environment variables.
// Using namespace augmentation instead of a direct 'process' variable declaration prevents
// "Cannot redeclare block-scoped variable 'process'" errors when Node.js types are already present.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY?: string;
    [key: string]: string | undefined;
  }
}
