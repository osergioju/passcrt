import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Caminhos dos assets no HTML gerado (script/link src) são
  // relativos a este `base`. Padrão "/" funciona quando o app é
  // servido na raiz do domínio; num deploy atrás de um subpath (ex:
  // crtpublicidade.com.br/passcrt/), defina VITE_BASE_PATH=/passcrt/
  // antes do build — senão os assets tentam carregar da raiz do
  // domínio e dão 404 (tela em branco).
  base: process.env.VITE_BASE_PATH || '/',
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
