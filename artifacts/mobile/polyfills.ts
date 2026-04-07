// Polyfills that must run before @elevenlabs/react / @elevenlabs/client are loaded.
// @elevenlabs/client accesses DOMException at module initialisation time.
// Hermes (React Native's JS engine) does not define DOMException globally.

/* eslint-disable @typescript-eslint/no-explicit-any */
if (typeof (global as any).DOMException === 'undefined') {
  (global as any).DOMException = class DOMException extends Error {
    readonly code: number = 0;
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name ?? 'Error';
    }
  };
}
