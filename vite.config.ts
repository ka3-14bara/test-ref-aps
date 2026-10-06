import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  define: {
    'process.env': {}, // Эта строчка лечит любые старые библиотеки, ищущие process
  },
  server: {
    host: '0.0.0.0',
  }
})
