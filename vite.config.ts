import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import path from "path";
import { copyFileSync, readFileSync, writeFileSync } from "fs";

// Cloudflare Pages serves unknown paths from 404.html with a 404 status. Public pages that
// crawlers check (Meta, search engines) get their own copy so they answer 200, with their
// own canonical and og:url: crawlers otherwise treat them as the home page.
const PUBLIC_PAGES = { "privacy-policy": "Privacy Policy", "terms-of-service": "Terms of Service" };
const copyIndexTo404: import("vite").Plugin = {
  name: "copy-index-to-404",
  closeBundle() {
    copyFileSync("dist/index.html", "dist/404.html");
    const shell = readFileSync("dist/index.html", "utf8");
    for (const [page, title] of Object.entries(PUBLIC_PAGES)) {
      const url = `https://flowlioapp.com/${page}`;
      writeFileSync(`dist/${page}.html`, shell
        .replace('<link rel="canonical" href="https://flowlioapp.com/" />', `<link rel="canonical" href="${url}" />`)
        .replace('<meta property="og:url" content="https://flowlioapp.com/" />', `<meta property="og:url" content="${url}" />`)
        .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="Flowlio — ${title}" />`)
        .replace("<title>Flowlio</title>", `<title>Flowlio — ${title}</title>`));
    }
  },
};

export default defineConfig({
  define: { "import.meta.env.VITE_APP_VERSION": JSON.stringify(process.env.CF_PAGES_COMMIT_SHA || process.env.APP_VERSION || "development") },
  plugins: [react(), tailwindcss(), copyIndexTo404],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 4000,
    open: "/",
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-aspect-ratio', '@radix-ui/react-avatar', '@radix-ui/react-checkbox', '@radix-ui/react-collapsible', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label', '@radix-ui/react-menubar', '@radix-ui/react-popover', '@radix-ui/react-progress', '@radix-ui/react-scroll-area', '@radix-ui/react-select', '@radix-ui/react-separator', '@radix-ui/react-slot', '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
          charts: ['recharts', 'react-calendar-timeline', '@rsagiev/gantt-task-react-19'],
          forms: ['@hookform/resolvers', 'react-hook-form', 'zod'],
          utils: ['clsx', 'class-variance-authority', 'tailwind-merge', 'date-fns', 'dayjs'],
          animations: ['framer-motion', 'gsap'],
          query: ['@tanstack/react-query', '@tanstack/react-query-devtools'],
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
