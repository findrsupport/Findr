// Findr™ PWA install prompt (append-only)
(function(){
  var deferred;
  function showPrompt(){
    if (document.getElementById('install-findr')) return;
    var btn = document.createElement('button');
    btn.id = 'install-findr';
    btn.textContent = 'Install Findr';
    btn.setAttribute('aria-label', 'Install Findr app');
    btn.style.position = 'fixed';
    btn.style.bottom = '16px';
    btn.style.right = '16px';
    btn.style.zIndex = 10000;
    btn.style.padding = '10px 14px';
    btn.style.borderRadius = '9999px';
    btn.style.border = '1px solid var(--stroke, #2a2a2a)';
    btn.style.background = 'var(--card, #1a1a1a)';
    btn.style.color = 'var(--fg, #f4f4f4)';
    btn.style.boxShadow = '0 4px 16px rgba(0,0,0,.25)';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', function(){
      if (!deferred) { btn.remove(); return; }
      deferred.prompt();
      deferred.userChoice.finally(function(){
        btn.remove();
        deferred = null;
      });
    });
    document.body.appendChild(btn);
  }
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    deferred = e;
    // Only show on index/listings/map
    var path = location.pathname;
    if (/\/(index\.html)?$|\/listings\.html$|\/map\.html$/.test(path)) showPrompt();
  });
})();