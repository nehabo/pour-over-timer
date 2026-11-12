/// <reference types="vitest/config" />
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the static build works on GitHub Pages under any repo name.
  base: './',
  plugins: [svelte()],
  // Vitest must resolve Svelte's client runtime, or runes in .svelte.ts aren't reactive.
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
