<script>
  // Default production/compliance configuration (no AI on listings)
  window.FINDR_CONFIG = {
    MODE: "COMPLIANT",
    ALLOW_AI_ON_LISTINGS: false,              // hard-off for any listing payloads
    DATA_SOURCES_ALLOWED_FOR_AI: ["mock"],    // ignored when ALLOW_AI_ON_LISTINGS=false
    LOG_AI_IO: true                           // console.debug logs for audit trail (user-intent only)
  };
</script>
