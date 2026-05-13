import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /** Expose `API_URL` from `.env` (see https://vite.dev/config/shared-options.html#envprefix) */
  envPrefix: ['VITE_', 'API_'],
})
