// Global type declarations

// Node.js globals for browser environment  
declare namespace NodeJS {
  interface Timeout {}
}

// Global variables
declare const global: typeof globalThis;

// Extend Window interface if needed
interface Window {
  // Add any window extensions here
}

// Vitest/Jest globals
declare const vi: any;
declare const expect: any;
declare const describe: any;
declare const it: any;
declare const beforeEach: any;
declare const afterEach: any;