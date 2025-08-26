(function (global) {
  function normalizeParams(p) {
    return {
      q: (p?.q || "").toString().trim().toLowerCase(),
      city: (p?.city || "").toString().trim().toLowerCase(),
      beds: Number(p?.beds || 0),
      baths: Number(p?.baths || 0),
      minp: Number(p?.minp || 0),
      maxp: Number(p?.maxp || 0) || Number.MAX_SAFE_INTEGER
    };
  }

  function textMatches(it, q) {
    if (!q) return true;
    const blob = `${it.address} ${it.city} ${it.beds}bd ${it.baths}ba ${it.brokerage}`.toLowerCase();
    return blob.includes(q);
  }

  function applyFilters(listings, params) {
    const p = normalizeParams(params || {});
    return (listings || []).filter(it => {
      if (p.beds && it.beds < p.beds) return false;
      if (p.baths && it.baths < p.baths) return false;
      if (typeof it.price === "number") {
        if (it.price < p.minp) return false;
        if (it.price > p.maxp) return false;
      }
      if (p.city && String(it.city||"").toLowerCase() !== p.city) return false;
      if (!textMatches(it, p.q)) return false;
      return true;
    });
  }

  global.FILTERS = { applyFilters, normalizeParams };
})(window);
