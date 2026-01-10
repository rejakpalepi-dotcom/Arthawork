import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-512.png", "favicon.ico", "og-preview.jpg"],
      manifest: {
        name: "Artha - Professional Proposal & Invoice Builder",
        short_name: "Artha",
        description: "Streamline your freelance business with Artha. Create stunning proposals, automate invoices, and manage clients with ease.",
        id: "com.arthawork.app",
        theme_color: "#1a1a1a",
        background_color: "#0f0f0f",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        categories: ["business", "productivity", "finance"],
        prefer_related_applications: false,
        icons: [
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icon-maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        shortcuts: [
          {
            name: "New Invoice",
            short_name: "Invoice",
            description: "Create a new invoice quickly",
            url: "/invoices/new",
            icons: [{ src: "/icon-512.png", sizes: "192x192" }]
          },
          {
            name: "Active Proposals",
            short_name: "Proposals",
            description: "View all active proposals",
            url: "/proposals",
            icons: [{ src: "/icon-512.png", sizes: "192x192" }]
          },
          {
            name: "Dashboard",
            short_name: "Home",
            description: "Go to dashboard",
            url: "/dashboard",
            icons: [{ src: "/icon-512.png", sizes: "192x192" }]
          }
        ],
        screenshots: [
          {
            src: "/og-preview.jpg",
            sizes: "1200x630",
            type: "image/jpeg",
            form_factor: "wide",
            label: "Artha Dashboard"
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MiB to handle large logo
        globPatterns: ["**/*.{js,css,html,ico,svg,woff2}"], // Exclude png from precache
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  build: {
    chunkSizeWarningLimit: 1000, // 1MB warning limit
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-popover"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
}));
