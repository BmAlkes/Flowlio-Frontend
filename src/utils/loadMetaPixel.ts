const META_PIXEL_ID = "3113496175518093";

let loaded = false;

/** Injects and initializes the Meta Pixel — only call this after marketing
 * consent has been granted. Safe to call more than once (no-ops after the
 * first successful load). */
export function loadMetaPixel() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;

  const w = window as any;
  if (w.fbq) {
    w.fbq("init", META_PIXEL_ID);
    w.fbq("track", "PageView");
    return;
  }

  /* eslint-disable */
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  w.fbq("init", META_PIXEL_ID);
  w.fbq("track", "PageView");
}

export function isMetaPixelLoaded() {
  return loaded;
}
