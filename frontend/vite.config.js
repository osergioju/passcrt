import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  // Vitest ainda usa o pipeline esbuild para transformar JSX nos
  // arquivos de teste; o plugin-react (Vite 8 / rolldown) configura o
  // JSX via `oxc`, que o Vitest não lê, então sem isso os testes
  // quebram com "React is not defined" por cair no runtime clássico.
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
})
