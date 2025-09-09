// Findr™ PWA bootstrap (append-only, safe to include on every page)
// - Ensures <link rel="manifest" href="/manifest.json"> exists
// - Registers /sw.js for app-shell caching (network-first for data)
// - No-ops if already present or unsupported

(function () {
  try {
    // Ensure manifest <link> exists
    var hasManifest = !!document.querySelector('link[rel="manifest"]');
    if (!hasManifest) {
      var link = document.createElement('link');
      link.rel = 'manifest';
      // Use relative path so it works from /web publish dir as well as root
      link.href = (location.pathname.startsWith('/web/') ? '../manifest.json' : 'manifest.json');
      document.head && document.head.appendChild(link);
    }

    // Register service worker (idempotent)
    if ('serviceWorker' in navigator) {
      var swPath = (location.pathname.startsWith('/web/') ? '../sw.js' : 'sw.js');
      navigator.serviceWorker.register(swPath).catch(function (err) {
        console.debug('[PWA] SW registration failed:', err && (err.message || err));
      });
    }
  } catch (e) {
    console.debug('[PWA] bootstrap error:', e && (e.message || e));
  }
})();
