import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/serwis/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'TerminyBHP',
        short_name: 'TerminyBHP',
        description: 'Terminy BHP dla specjalistów',
        theme_color: '#1B4F72',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/serwis/',
        scope: '/serwis/',
        icons: [
          { src: '/serwis/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/serwis/icon-512.png', sizes: '512x512', type: 'image/png' }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
});
