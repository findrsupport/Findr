<script>
  // DEMO ONLY: enable AI on *mock* data. Never deploy with DDF/IDX.
  window.FINDR_CONFIG = {
    MODE: "DEMO_FULL_AI",
    ALLOW_AI_ON_LISTINGS: true,               // demo summaries/reranking allowed ONLY for mock
    DATA_SOURCES_ALLOWED_FOR_AI: ["mock"],    // absolutely no "ddf"/"idx"
    LOG_AI_IO: true
  };
</script>
