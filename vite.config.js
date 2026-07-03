import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Reemplazá 'mundial-bracket' por el nombre EXACTO de tu repositorio en GitHub
// (si el repo se llama distinto, esta ruta debe coincidir o la página cargará en blanco).
export default defineConfig({
  plugins: [react()],
  base: '/mundial-bracket/',
})
