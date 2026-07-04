import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/festival-webhook": {
        target: "https://api.agents.snsihub.ai",
        changeOrigin: true,
        timeout: 600000,
        rewrite: () => "/webhook-test/forecast/festival-intelligence",
      },
      "/ai-festival-filters": {
        target: "https://api.agents.snsihub.ai",
        changeOrigin: true,
        timeout: 30000,
        rewrite: () => "/webhook/9a0b471a-a890-481e-b519-4b0bf5b8b923",
      },
      "/ai-festival-forecast": {
        target: "https://api.agents.snsihub.ai",
        changeOrigin: true,
        timeout: 600000,
        rewrite: () => "/webhook/ai-festival-forecasting",
      },
      "/demand-intel-filters": {
        target: "https://api.agents.snsihub.ai",
        changeOrigin: true,
        timeout: 30000,
        rewrite: () => "/webhook/9a0b471a-a890-481e-b519-4b0bf5b8b923",
      },
      "/demand-intelligence": {
        target: "https://api.agents.snsihub.ai",
        changeOrigin: true,
        timeout: 600000,
        rewrite: () => "/webhook/ai-demand-forecasting",
      },
    },
  },
})
