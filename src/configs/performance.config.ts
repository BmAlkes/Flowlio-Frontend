export const PERFORMANCE_CONFIG = {
  // Image optimization settings
  images: {
    defaultQuality: 85,
    formats: ["webp", "jpeg"],
    sizes: {
      thumbnail: 150,
      small: 300,
      medium: 600,
      large: 1200,
      xlarge: 1920,
    },
    lazyLoadingOffset: 50, // pixels from viewport
  },

  // Bundle optimization
  bundle: {
    maxChunkSize: 500, // KB
    maxInitialChunkSize: 1000, // KB
    chunkLoadingTimeout: 30000, // ms
  },

  // Caching strategies
  cache: {
    staticAssets: {
      maxAge: 31536000, // 1 year
      staleWhileRevalidate: 86400, // 1 day
    },
    apiResponses: {
      maxAge: 300, // 5 minutes
      staleWhileRevalidate: 60, // 1 minute
    },
  },

  // Performance budgets
  budgets: {
    fcp: 1800, // ms
    lcp: 2500, // ms
    cls: 0.1,
    fid: 100, // ms
    ttfb: 800, // ms
  },

  // Critical resources
  criticalResources: ["/src/main.tsx", "/src/index.css", "/logo/logo.png"],

  // Preload hints
  preloadHints: [
    { resource: "/src/main.tsx", as: "script" },
    { resource: "/src/index.css", as: "style" },
    { resource: "/logo/logo.png", as: "image" },
  ],

  // DNS prefetch domains
  dnsPrefetch: ["//fonts.googleapis.com", "//fonts.gstatic.com"],

  // Font loading strategy
  fonts: {
    display: "swap",
    preload: true,
    fallback:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
};

// Performance monitoring configuration
export const PERFORMANCE_MONITORING = {
  enabled: process.env.NODE_ENV === "development",
  metrics: {
    fcp: true,
    lcp: true,
    cls: true,
    fid: true,
    ttfb: true,
    domContentLoaded: true,
    loadComplete: true,
  },
  reporting: {
    console: true,
    analytics: false, // Set to true if you want to send to analytics
    threshold: 0.8, // Report when performance drops below 80%
  },
};

// Service worker configuration
export const SERVICE_WORKER_CONFIG = {
  enabled: true,
  scope: "/",
  updateViaCache: "none",
  skipWaiting: true,
  clientsClaim: true,
};

// Lazy loading configuration
export const LAZY_LOADING_CONFIG = {
  threshold: 0.1,
  rootMargin: "50px",
  fallbackDelay: 200,
  errorBoundary: true,
};

// Bundle analysis configuration
export const BUNDLE_ANALYSIS = {
  enabled: process.env.ANALYZE === "true",
  outputDir: "dist/bundle-analysis",
  open: true,
  gzip: true,
  brotli: true,
};
