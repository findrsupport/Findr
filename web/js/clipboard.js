// Findr™ clipboard helper
window.FINDR = window.FINDR || {};
FINDR.copyCurrentUrl = function(label){
  var url = location.href;
  navigator.clipboard && navigator.clipboard.writeText(url).then(function(){
    toast(label || 'Link copied');
  }).catch(function(){
    // fallback
    var ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(label || 'Link copied'); } finally { document.body.removeChild(ta); }
  });
};
function toast(msg){
  var el = document.createElement('div');
  el.textContent = msg;
  el.setAttribute('role','status');
  el.style.position='fixed'; el.style.bottom='20px'; el.style.left='50%'; el.style.transform='translateX(-50%)';
  el.style.background='var(--card,#1a1a1a)'; el.style.color='var(--fg,#f4f4f4)';
  el.style.border='1px solid var(--stroke,#2a2a2a)'; el.style.padding='8px 12px'; el.style.borderRadius='12px';
  el.style.boxShadow='0 6px 18px rgba(0,0,0,.3)'; el.style.zIndex='9999'; el.style.opacity='0';
  document.body.appendChild(el);
  requestAnimationFrame(function(){ el.style.transition='opacity .2s'; el.style.opacity='1'; });
  setTimeout(function(){ el.style.opacity='0'; setTimeout(function(){ el.remove(); }, 200); }, 1600);
}