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
                      "name": "NewsFlash Quiz",
                      "short_name": "NewsFlash",
                      "description": "Transforms current news headlines into an engaging quiz experience.",
                      "theme_color": "#1d4ed8",
                      "background_color": "#0d1117",
                      "display": "standalone",
                      "start_url": "/",
                      "scope": "/",
                      "id": "/",
                      "lang": "en",
                      "orientation": "portrait",
                      "categories": ["education", "entertainment", "news", "trivia"],
                      "prefer_related_applications": false,
                      "icons": [
                        {
                          "src": "/web-app-manifest-192x192.png",
                          "sizes": "192x192",
                          "type": "image/png",
                          "purpose": "any"
                        },
                        {
                          "src": "/web-app-manifest-512x512.png",
                          "sizes": "512x512",
                          "type": "image/png",
                          "purpose": "any"
                        },
                      ],
                      "screenshots": [
                        {
                          "src": "/Screenshot_1.png",
                          "sizes": "1080x2400",
                          "type": "image/png",
                          "label": "Review answers",
                          "form_factor": "narrow"
                        },
                        {
                          "src": "/Screenshot_2.png",
                          "sizes": "1080x2400",
                          "type": "image/png",
                          "label": "Results view",
                          "form_factor": "narrow"
                        },
                        {
                          "src": "/Screenshot_3.png",
                          "sizes": "1080x2400",
                          "type": "image/png",
                          "label": "Home screen",
                          "form_factor": "narrow"
                        },
                        {
                          "src": "/Screenshot_4.png",
                          "sizes": "1080x2400",
                          "type": "image/png",
                          "label": "Question view",
                          "form_factor": "narrow"
                        }
                      ]
                    },
          })],
  base: '/', //'/QuizApp-frontend/',
})


