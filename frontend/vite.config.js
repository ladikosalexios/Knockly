/* eslint-env node */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'process';

const apiTarget = process.env.VITE_API_URL || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});