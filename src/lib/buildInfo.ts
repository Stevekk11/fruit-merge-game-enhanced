// These constants are injected at build time by vite.config.ts.
// They are replaced with literal string values during the build step.
declare const __APP_VERSION__: string;
declare const __BUILD_HASH__: string;

export const APP_VERSION: string = __APP_VERSION__;
export const BUILD_HASH: string = __BUILD_HASH__;
