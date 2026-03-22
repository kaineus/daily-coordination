import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  resolve: {
    dedupe: ['lit'],
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // public/manifest.json 직접 사용
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
});
