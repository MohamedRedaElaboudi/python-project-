import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------

const PORT = 3039;

export default defineConfig({
  plugins: [
    react(), // ✅ Seulement React, sans détection d'erreurs
  ],
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: {
    port: PORT,
    host: true,
    hmr: {
      overlay: false, // ✅ désactive aussi l'affichage via HMR
    },
  },
  preview: { port: PORT, host: true },
});