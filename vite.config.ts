// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      // Force the subpath to the ESM you have on disk
      '@angular/animations/browser': '@angular/animations/fesm2022/browser.mjs',
    },
  },
});