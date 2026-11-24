import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Frontend (Vite) skickar vidare alla anrop till /api till backend
    proxy: { '/api': 'http://localhost:3000' }
  },
  test: {
    include: ['tests/**/*.test.js']
  }
});
