import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.js'],
    coverage: {
      include: ['src/**/*.js'],
      exclude: ['src/assets/**', 'src/components/**', 'src/main.js', 'src/contexts/**', 'src/styles/**', 'src/services/supabase.js'],
    },
  },
});
