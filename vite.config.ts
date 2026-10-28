import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Daybook',
        short_name: 'Daybook',
        description: 'A private sticker journal.',
        // The installed app opens straight to quick capture.
        start_url: '/catch',
        scope: '/',
        display: 'standalone',
        background_color: '#EEE8FB',
        theme_color: '#EEE8FB',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // The whole app shell, so it opens with no signal. Fonts as woff2 only.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        // Firebase's auth helper paths must never be answered by the app shell.
        navigateFallbackDenylist: [/^\/__\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
