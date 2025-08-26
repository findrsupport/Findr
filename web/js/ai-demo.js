// Demo stubs to simulate AI without calling a model.
// IMPORTANT: This only parses USER TEXT into a filter spec.
// It never reads listings, so it's safe in COMPLIANT mode.

(function (global) {
  async function parseUserIntentDemo(text) {
    text = String(text || '');

    // crude signal checks
    const wantCondo = /\b(condo|apartment|flat)\b/i.test(text);
    const wantHouse = /\b(house|detached|laneway)\b/i.test(text);

    // price like "under 900k" or "$1.2M"
    let maxPrice = null, minPrice = null;
    const kMatch = /(?:under|below)\s*\$?\s*([\d,]+)\s*[kK]\b/i.exec(text);
    const mMatch = /(?:under|below)\s*\$?\s*([\d.]+)\s*[mM]\b/i.exec(text);
    const between = /\bbetween\s*\$?\s*([\d,]+)\s*[kK]\s*and\s*\$?\s*([\d,]+)\s*[kK]\b/i.exec(text);
    if (between) {
      minPrice = Number(between[1].replace(/,/g,'')) * 1000;
      maxPrice = Number(between[2].replace(/,/g,'')) * 1000;
    } else if (kMatch) {
      maxPrice = Number(kMatch[1].replace(/,/g,'')) * 1000;
    } else if (mMatch) {
      maxPrice = Math.round(Number(mMatch[1]) * 1_000_000);
    }

    // beds/baths like "2 bed 1 bath"
    const beds = /(\d+)\s*(?:bed|br)\b/i.exec(text);
    const baths = /(\d+)\s*(?:bath|ba)\b/i.exec(text);

    // areas (simple list of capitalized tokens or known cities)
    const cities = ['Vancouver','Burnaby','Coquitlam','Port Coquitlam','Port Moody','Maple Ridge','Langley','Surrey','New Westminster','Richmond'];
    const areas = cities.filter(c => new RegExp(`\\b${c}\\b`, 'i').test(text));

    // sort cues
    const sort = /\bcheapest|lowest price|asc(ending)?\b/i.test(text) ? 'price-asc'
               : /\bexpensive|highest price|desc(ending)?\b/i.test(text) ? 'price-desc'
               : 'relevance';

    return {
      min_price: minPrice,
      max_price: maxPrice,
      beds_min: beds ? Number(beds[1]) : null,
      baths_min: baths ? Number(baths[1]) : null,
      property_types: wantCondo ? ['Condo'] : wantHouse ? ['House'] : null,
      areas: areas.length ? areas : null,
      nearby: null,
      must_have: null,
      polygon: null,
      sort
    };
  }

  global.AIDemo = { parseUserIntentDemo };
})(window);
