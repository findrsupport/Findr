// Findr™ theme-aware placeholder swap (no legacy file dependency)
// - Always uses themed variants; replaces any legacy blue placeholder on sight.
// - Handles initial DOM, late-added nodes, src changes, and load errors.
(function(){
  var DARK = "assets/placeholder-real-estate-dark.svg";
  var LIGHT = "assets/placeholder-real-estate-light.svg";

  var LEGACY_NAMES = [
    "assets/placeholder-real-estate.svg",
    "assets/placeholder.svg",
    "assets/placeholder-realestate.svg"
  ];

  function currentTheme(){
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    try {
      return (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) ? "light" : "dark";
    } catch { return "dark"; }
  }
  function themed(){ return currentTheme() === "light" ? LIGHT : DARK; }

  function isLegacy(src){
    if (!src) return false;
    try { src = new URL(src, location.href).pathname; } catch {}
    return LEGACY_NAMES.some(function(name){ return src.endsWith(name.replace(/^assets\//,'')) || src.indexOf(name) !== -1; });
  }

  function applyThemed(img){
    if (!img || img.tagName !== "IMG") return;
    var ph = themed();
    if (img.src && img.src.indexOf(ph) !== -1) return; // already themed
    img.src = ph;
    if (!img.alt) img.alt = "Listing image placeholder";
    if (!img.decoding) img.decoding = "async";
    if (!img.loading) img.loading = "lazy";
  }

  function maybeSwap(img){
    if (!img || img.tagName !== "IMG") return;
    if (!img.src || isLegacy(img.src)) {
      applyThemed(img);
      return;
    }
    // Also replace any obviously-blue placeholder by filename pattern
    if (/placeholder.*\.svg/i.test(img.src)) {
      // If it's not our themed ones, force to themed
      if (img.src.indexOf(DARK) === -1 && img.src.indexOf(LIGHT) === -1) {
        applyThemed(img);
      }
    }
  }

  function onError(e){
    var el = e.target;
    if (el && el.tagName === "IMG") applyThemed(el);
  }

  function scanAll(){
    document.querySelectorAll("img").forEach(maybeSwap);
  }

  // Observe newly added images and src changes
  var mo;
  function observe(){
    try {
      mo = new MutationObserver(function(muts){
        muts.forEach(function(m){
          if (m.type === "attributes" && m.attributeName === "src" && m.target.tagName === "IMG") {
            maybeSwap(m.target);
          } else if (m.type === "childList") {
            m.addedNodes && m.addedNodes.forEach(function(n){
              if (n.tagName === "IMG") {
                maybeSwap(n);
              } else if (n.querySelectorAll) {
                n.querySelectorAll("img").forEach(maybeSwap);
              }
            });
          } else if (m.type === "attributes" && m.attributeName === "data-theme") {
            // Theme toggled: re-theme any current placeholders
            var want = themed();
            document.querySelectorAll("img").forEach(function(img){
              if (img.src.indexOf(DARK) !== -1 || img.src.indexOf(LIGHT) !== -1) {
                if (img.src.indexOf(want) === -1) img.src = want;
              }
            });
          }
        });
      });
      mo.observe(document, { childList: true, subtree: true });
      mo.observe(document.documentElement, { attributes: true });
    } catch {}
  }

  window.addEventListener("error", onError, true);
  document.addEventListener("DOMContentLoaded", function(){
    scanAll();
    observe();
  });
})();
