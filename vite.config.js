import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png", "favicon.ico"],
      manifest: {
        name: "減脂紀錄",
        short_name: "減脂紀錄",
        description: "個人用減脂、體重、飲食、喝水、睡眠與重訓紀錄工具",
        theme_color: "#0f766e",
        background_color: "#f7fbfa",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "zh-Hant-TW",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
});
