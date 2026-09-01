import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` matches the repository name so asset URLs resolve when the site is
// served from GitHub Pages at https://<user>.github.io/chai-ai-intake-platform/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/chai-ai-intake-platform/',
})
