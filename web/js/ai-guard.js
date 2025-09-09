(function (global) {
  const cfg = global.FINDR_CONFIG || {};
  const ALLOW = !!cfg.ALLOW_AI_ON_LISTINGS;
  const ALLOWED_SOURCES = new Set(cfg.DATA_SOURCES_ALLOWED_FOR_AI || []);
  const LOG = !!cfg.LOG_AI_IO;

  function safePreview(v, n = 160) {
    try { return ("" + v).slice(0, n); } catch { return ""; }
  }
  function log(kind, payload) { if (LOG) console.debug(`[AI-LOG] ${kind}:`, payload); }

  function guardListingPayload(listing) {
    // Require explicit provenance when evaluating listing content with AI
    const src = listing && listing.source;
    if (!src) throw new Error("AI blocked: missing listing.source");
    if (!ALLOW) throw new Error("AI blocked: ALLOW_AI_ON_LISTINGS=false (compliance)");
    if (!ALLOWED_SOURCES.has(src)) throw new Error(`AI blocked: source "${src}" not allowed`);
  }

  async function withListingAIGuard(listing, aiFn) {
    guardListingPayload(listing);
    log("AI-IN", { mode: cfg.MODE, source: listing.source, id: listing.id ?? listing.address });
    const out = await aiFn(listing);
    log("AI-OUT", { id: listing.id ?? listing.address, preview: safePreview(out) });
    return out;
  }

  // Always allowed: user text → filter JSON (no listing payload involved)
  async function withUserIntentGuard(userText, aiFn) {
    log("AI-IN-INTENT", { textPreview: safePreview(userText) });
    const spec = await aiFn(userText);
    log("AI-OUT-INTENT", spec);
    return spec;
  }

  global.FindrAI = { withListingAIGuard, withUserIntentGuard };
})(window);
