import { useEffect, useState } from "react";

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
  fid: number | null;
  ttfb: number | null;
  domContentLoaded: number | null;
  loadComplete: number | null;
}

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    ttfb: null,
    domContentLoaded: null,
    loadComplete: null,
  });

  useEffect(() => {
    // Check if PerformanceObserver is supported
    if (!("PerformanceObserver" in window)) {
      console.warn("PerformanceObserver not supported");
      return;
    }

    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(
        (entry) => entry.name === "first-contentful-paint"
      );
      if (fcpEntry) {
        setMetrics((prev) => ({ ...prev, fcp: fcpEntry.startTime }));
      }
    });

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcpEntry = entries[entries.length - 1];
      if (lcpEntry) {
        setMetrics((prev) => ({ ...prev, lcp: lcpEntry.startTime }));
      }
    });

    // Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        const layoutShiftEntry = entry as any;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
        }
      }
      setMetrics((prev) => ({ ...prev, cls: clsValue }));
    });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fidEntry = entries[0] as any;
      if (fidEntry) {
        setMetrics((prev) => ({
          ...prev,
          fid: fidEntry.processingStart - fidEntry.startTime,
        }));
      }
    });

    try {
      fcpObserver.observe({ entryTypes: ["paint"] });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (error) {
      console.warn("PerformanceObserver failed:", error);
    }

    // Navigation timing metrics
    const navigationEntry = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      setMetrics((prev) => ({
        ...prev,
        ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
        domContentLoaded:
          navigationEntry.domContentLoadedEventEnd -
          navigationEntry.domContentLoadedEventStart,
        loadComplete:
          navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
      }));
    }

    // Cleanup
    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      clsObserver.disconnect();
      fidObserver.disconnect();
    };
  }, []);

  const getPerformanceScore = () => {
    let score = 100;

    // FCP scoring (0-100)
    if (metrics.fcp !== null) {
      if (metrics.fcp < 1800) score -= 0;
      else if (metrics.fcp < 3000) score -= 10;
      else score -= 25;
    }

    // LCP scoring (0-100)
    if (metrics.lcp !== null) {
      if (metrics.lcp < 2500) score -= 0;
      else if (metrics.lcp < 4000) score -= 10;
      else score -= 25;
    }

    // CLS scoring (0-100)
    if (metrics.cls !== null) {
      if (metrics.cls < 0.1) score -= 0;
      else if (metrics.cls < 0.25) score -= 10;
      else score -= 25;
    }

    // FID scoring (0-100)
    if (metrics.fid !== null) {
      if (metrics.fid < 100) score -= 0;
      else if (metrics.fid < 300) score -= 10;
      else score -= 25;
    }

    return Math.max(0, score);
  };

  const logPerformanceReport = () => {
    const score = getPerformanceScore();
    console.group("🚀 Performance Report", `Overall Score: ${score}/100`);
    console.groupEnd();
  };

  return {
    metrics,
    getPerformanceScore,
    logPerformanceReport,
  };
};
