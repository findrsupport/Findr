// Findr™ image placeholder fallback + theme swap
(function(){
  var DARK = "assets/placeholder-real-estate-dark.svg";
  var LIGHT = "assets/placeholder-real-estate-light.svg";
  var BASE = "assets/placeholder-real-estate.svg";

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

  function applyPlaceholder(img){
    if (!img) return;
    if (img.dataset && img.dataset.placeholderApplied === "1") return;
    var ph = placeholderForTheme();
    // Avoid loops
    if (img.src && (img.src.indexOf(ph) !== -1)) return;
    img.dataset.placeholderApplied = "1";
    img.src = ph;
    img.alt = img.alt || "Listing image placeholder";
    img.decoding = img.decoding || "async";
    img.loading = img.loading || "lazy";
  }

  function handleError(e){
    var el = e.target;
    if (!el || el.tagName !== "IMG") return;
    applyPlaceholder(el);
  }

  function swapExistingBasePlaceholders(){
    document.querySelectorAll('img[src$="placeholder-real-estate.svg"]').forEach(function(img){
      // Force-swap base file to themed variant
      img.dataset.placeholderApplied = "0"; // allow apply
      applyPlaceholder(img);
    });
  }

  function reskinPlaceholdersForTheme(){
    // If theme changes, update any placeholder currently shown
    var phDark = DARK, phLight = LIGHT;
    var want = placeholderForTheme();
    document.querySelectorAll('img').forEach(function(img){
      if (!img.src) return;
      if (img.src.indexOf(phDark) !== -1 || img.src.indexOf(phLight) !== -1) {
        img.src = want;
      }
    });
  }

  // Listen for image load errors (broken URLs)
  window.addEventListener("error", handleError, true);

  // On DOM ready, swap any old base placeholders to themed ones
  document.addEventListener("DOMContentLoaded", function(){
    swapExistingBasePlaceholders();
  });

  // Observe theme changes via data-theme attribute (from your toggle)
  var mo;
  try {
    mo = new MutationObserver(function(muts){
      for (var i=0;i<muts.length;i++){
        if (muts[i].type === "attributes" && muts[i].attributeName === "data-theme") {
          reskinPlaceholdersForTheme();
        }
      }
    });
    mo.observe(document.documentElement, { attributes: true });
  } catch {}

})();