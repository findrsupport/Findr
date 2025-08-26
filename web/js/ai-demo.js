<script>
// Demo stubs to simulate AI without hitting a model.
// Never use these with DDF/IDX data.

(function (global) {
  async function summarizeListingDemo(listing) {
    const bits = [`${listing.beds} bd`, `${listing.baths} ba`, listing.city];
    return `Demo summary: ${listing.address} — ${bits.join(" · ")} — near transit.`;
  }

  async function parseUserIntentDemo(text) {
    const wantCondo = /condo|apartment/i.test(text || "");
    const m = /\$?\s*([\d,]+)\s*[kK]/.exec(text || "");
    const maxK = m ? Number(m[1].replace(/,/g, "")) : null;
    const bedm = /(\d+)\s*bed/i.exec(text || "");
    const bathm = /(\d+)\s*bath/i.exec(text || "");
    return {
      min_price: null,
      max_price: maxK ? maxK * 1000 : null,
      beds_min: bedm ? Number(bedm[1]) : null,
      baths_min: bathm ? Number(bathm[1]) : null,
      property_types: wantCondo ? ["Condo"] : null,
      areas: null,
      nearby: null,
      must_have: null,
      polygon: null,
      sort: "price-desc"
    };
  }

  global.AIDemo = { summarizeListingDemo, parseUserIntentDemo };
})(window);
</script>
