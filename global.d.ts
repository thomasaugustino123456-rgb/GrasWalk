// Augment the NodeJS namespace to include API_KEY in ProcessEnv.
// This avoids redeclaring the 'process' variable which may conflict with existing global declarations (e.g. from @types/node).
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
