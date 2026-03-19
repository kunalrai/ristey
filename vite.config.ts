import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png", "favicon.png", "offline.html"],
      manifest: {
        name: "The Heritage Curator",
        short_name: "Heritage",
        description: "Curated matchmaking rooted in cultural heritage and family values.",
        start_url: "/",
        display: "standalone",
        background_color: "#500010",
        theme_color: "#800020",
        orientation: "portrait-primary",
        icons: [
          { src: "/icons/icon-192.png",          sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png",          sizes: "512x512", type: "image/png" },
          { src: "/icons/apple-touch-icon.png",  sizes: "180x180", type: "image/png" },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.convex\.cloud\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
