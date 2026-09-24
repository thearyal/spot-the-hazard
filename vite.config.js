import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 8080,
    open: '/index.html'
  },
  build: {
    rollupOptions: {
      input: {
        start: resolve(__dirname, 'index.html'),
        game: resolve(__dirname, 'game.html'),
        end: resolve(__dirname, 'end.html'),
        quiz: resolve(__dirname, 'quiz.html')
      }
    }
  }
});
