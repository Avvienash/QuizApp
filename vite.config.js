import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), 
            tailwindcss(),
            VitePWA({
            registerType: "autoUpdate",   
            manifest: {
              name: "NewsFlash Quiz",
              short_name: "NQ",
              description: "newsflash quiz app",
              theme_color: "#0d1117",
              background_color: "#ffffff",
              display: "standalone",
              start_url: "/",
              icons: [
                {
                  src: "/web-app-manifest-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
                {
                  src: "/web-app-manifest-512x512.png",
                  sizes: "512x512",
                  type: "image/png",
                },
              ],
            },
          })],
  base: '/', //'/QuizApp-frontend/',
})


