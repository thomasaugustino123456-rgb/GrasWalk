// Fixing "Cannot redeclare block-scoped variable 'process'" by using global augmentation.
// This approach safely extends the global scope and avoids re-declaration conflicts with other type definitions.
declare global {
  var process: {
    env: {
      API_KEY: string;
      [key: string]: string | undefined;
    };
  };

  interface ImportMetaEnv {
    readonly VITE_API_KEY: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};