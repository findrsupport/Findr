// Findr™ image placeholder fallback (append-only safe)
// - Replaces broken listing photos with a brand-aligned placeholder (dark/light)
// - No markup changes required.
(function(){
  var DARK = "assets/placeholder-real-estate-dark.svg";
  var LIGHT = "assets/placeholder-real-estate-light.svg";
  function currentTheme(){
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    try {
      return (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) ? "light" : "dark";
    } catch { return "dark"; }
  }
  function placeholderForTheme(){
    return currentTheme() === "light" ? LIGHT : DARK;
  }
  function handleError(e){
    var el = e.target;
    if (!el || el.tagName !== "IMG") return;
    if (el.dataset && el.dataset.placeholderApplied === "1") return;
    // Avoid infinite loops: if src already our placeholder, bail
    var ph = placeholderForTheme();
    if (el.src && el.src.indexOf(ph) !== -1) return;
    el.dataset.placeholderApplied = "1";
    el.src = ph;
    el.alt = el.alt || "Listing image placeholder";
    el.decoding = el.decoding || "async";
    el.loading = el.loading || "lazy";
  }
  // Capture phase so we catch errors from any <img> before they bubble away
  window.addEventListener("error", handleError, true);
  // Also patch up any <img> with empty src on DOM ready
  document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll("img").forEach(function(img){
      if (!img.getAttribute("src")) {
        handleError({target: img});
      }
    });
  });
})();