// Findr™ Map Sidebar Filters (append-only)
// Integrates with existing FILTERS from web/js/filters.js and Leaflet map.
// - Renders a left sidebar with filter controls
// - Applies filters, updates URL params, updates map markers
// - Shows a "Most Relevant" listing card in the sidebar
(function(){
  var DATA_URLS = ["/data/listings.json", "/listings.json"]; // support both
  var dataCache = null;
  var mapRef = null;
  var markersLayer = null;
  var applyBtn, formEl, topCardEl;

  function qs(sel, root){ return (root||document).querySelector(sel); }
  function ce(tag, attrs){ var el=document.createElement(tag); if(attrs){Object.assign(el, attrs);} return el; }
  function setParams(params){
    var u = new URL(location.href);
    Object.keys(params).forEach(function(k){
      if (params[k] == null || params[k] === "" ) u.searchParams.delete(k);
      else u.searchParams.set(k, params[k]);
    });
    history.replaceState(null, "", u.toString());
  }
  function getParams(){
    var u = new URL(location.href);
    var p = u.searchParams;
    return {
      q: p.get('q')||'',
      city: p.get('city')||'',
      beds: p.get('beds')||'',
      baths: p.get('baths')||'',
      minp: p.get('minp')||'',
      maxp: p.get('maxp')||'',
      sort: p.get('sort')||'relevance',
      type: p.get('type')||''
    };
  }
  function fmtMoney(n){
    try{
      var v = Number(n);
      if (!isFinite(v) || v<=0) return '';
      return '$' + v.toLocaleString();
    } catch { return ''; }
  }
  function buildSidebar(){
    if (qs('#findr-sidebar')) return; // already
    var sidebar = ce('aside');
    sidebar.id = 'findr-sidebar';
    sidebar.setAttribute('aria-label','Filters panel');
    sidebar.innerHTML = [
      '<div class="sidebar-header">',
      '  <h2 class="sidebar-title">Filters</h2>',
      '  <button id="findr-sidebar-close" aria-label="Close filters" class="sidebar-close" title="Close">×</button>',
      '</div>',
      '<form id="findr-filter-form" class="sidebar-form" aria-describedby="findr-filter-help">',
      '  <div class="field"><label for="city">City</label><select id="city" name="city" aria-label="City">',
      '    <option value="">Any</option>',
      '    <option>Burnaby</option>',
      '    <option>Coquitlam</option>',
      '    <option>Port Coquitlam</option>',
      '    <option>Port Moody</option>',
      '    <option>Maple Ridge</option>',
      '    <option>Pitt Meadows</option>',
      '    <option>Langley</option>',
      '    <option>Surrey</option>',
      '    <option>Vancouver</option>',
      '  </select></div>',
      '  <div class="row">',
      '    <div class="field"><label for="beds">Beds (min)</label><select id="beds" name="beds" aria-label="Beds minimum">',
      '      <option value="">Any</option>',
      '      <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>',
      '    </select></div>',
      '    <div class="field"><label for="baths">Baths (min)</label><select id="baths" name="baths" aria-label="Baths minimum">',
      '      <option value="">Any</option>',
      '      <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>',
      '    </select></div>',
      '  </div>',
      '  <div class="row">',
      '    <div class="field"><label for="minp">Min Price</label><input id="minp" name="minp" type="number" inputmode="numeric" placeholder="300000" /></div>',
      '    <div class="field"><label for="maxp">Max Price</label><input id="maxp" name="maxp" type="number" inputmode="numeric" placeholder="2500000" /></div>',
      '  </div>',
      '  <div class="row">',
      '    <div class="field"><label for="type">Type</label><select id="type" name="type">',
      '      <option value="">Any</option>',
      '      <option>Condo</option><option>Townhouse</option><option>House</option>',
      '    </select></div>',
      '    <div class="field"><label for="sort">Sort</label><select id="sort" name="sort">',
      '      <option value="relevance">Relevance</option>',
      '      <option value="price-asc">Price ↑</option>',
      '      <option value="price-desc">Price ↓</option>',
      '      <option value="beds-desc">Beds ↓</option>',
      '      <option value="baths-desc">Baths ↓</option>',
      '    </select></div>',
      '  </div>',
      '  <div class="actions">',
      '    <button type="button" id="findr-apply" class="btn-primary">Apply</button>',
      '    <button type="button" id="findr-clear" class="btn-secondary">Clear</button>',
      '  </div>',
      '  <p id="findr-filter-help" class="help">Filters update the map without reloading the page.</p>',
      '</form>',
      '<div class="top-card" aria-live="polite" aria-label="Most relevant listing">',
      '  <h3>Most Relevant</h3>',
      '  <div id="findr-top-card"></div>',
      '</div>'
    ].join("\n");
    document.body.appendChild(sidebar);

    // Toggle button
    if (!qs('#findr-open-filters')) {
      var openBtn = ce('button');
      openBtn.id = 'findr-open-filters';
      openBtn.textContent = 'Filters';
      openBtn.setAttribute('aria-controls','findr-sidebar');
      openBtn.className = 'sidebar-open';
      document.body.appendChild(openBtn);
      openBtn.addEventListener('click', function(){ document.documentElement.classList.add('sidebar-open'); });
    }
    qs('#findr-sidebar-close').addEventListener('click', function(){
      document.documentElement.classList.remove('sidebar-open');
    });

    // Bind form
    formEl = qs('#findr-filter-form');
    applyBtn = qs('#findr-apply');
    topCardEl = qs('#findr-top-card');
    applyBtn.addEventListener('click', onApply);
    qs('#findr-clear').addEventListener('click', function(){
      ['city','beds','baths','minp','maxp','type','sort'].forEach(function(id){ var el=qs('#'+id); if (el) el.value=''; });
      onApply();
    });

    // Prefill from URL
    var p = getParams();
    Object.keys(p).forEach(function(k){ var el=qs('#'+k); if(el && p[k]) el.value = p[k]; });
  }

  function ensureStyles(){
    if (qs('#findr-sidebar-styles')) return;
    var css = document.createElement('style');
    css.id = 'findr-sidebar-styles';
    css.textContent = [
      '#findr-open-filters{display:none;position:fixed;top:78px;left:16px;z-index:9500;padding:8px 12px;border-radius:9999px;border:1px solid var(--stroke,#2a2a2a);background:var(--card,#1a1a1a);color:var(--fg,#f4f4f4)}',
      '#findr-sidebar{position:fixed;top:60px;left:0;bottom:0;width:360px;max-width:92vw;z-index:9400;background:var(--surface,#0f0f0f);color:var(--fg,#f4f4f4);border-right:1px solid var(--stroke,#2a2a2a);box-shadow:0 8px 24px rgba(0,0,0,.35);transform:translateX(-100%);transition:transform .25s ease}',
      'html.sidebar-open #findr-sidebar{transform:none}
#findr-sidebar{transform:none}',
      'html.sidebar-open #map{margin-left:360px;transition:margin-left .25s ease}',
      '@media (max-width: 900px){ #map{margin-left:0} }',
      '.sidebar-header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--stroke,#2a2a2a)}',
      '.sidebar-title{font-size:16px;margin:0}',
      '.sidebar-close{font-size:20px;line-height:20px;padding:6px 10px;border-radius:8px;border:1px solid var(--stroke,#2a2a2a);background:var(--card,#1a1a1a);color:var(--fg,#f4f4f4)}',
      '.sidebar-form{padding:12px 14px}',
      '.row{display:flex;gap:10px}',
      '.field{display:flex;flex-direction:column;gap:4px;margin:8px 0;flex:1}',
      '.field input,.field select{padding:8px 10px;border-radius:10px;border:1px solid var(--stroke,#2a2a2a);background:var(--card,#1a1a1a);color:var(--fg,#f4f4f4)}',
      '.actions{display:flex;gap:8px;margin-top:10px}',
      '.btn-primary{padding:8px 12px;border-radius:10px;background:var(--brand,#ffbc00);border:1px solid var(--stroke,#2a2a2a);color:#111;font-weight:700;cursor:pointer}',
      '.btn-secondary{padding:8px 12px;border-radius:10px;background:var(--card,#1a1a1a);border:1px solid var(--stroke,#2a2a2a);color:var(--fg,#f4f4f4);cursor:pointer}',
      '.help{color:var(--muted,#a0a0a0);font-size:12px;margin:8px 0 12px}',
      '.top-card{border-top:1px solid var(--stroke,#2a2a2a);padding:12px 14px}',
      '.listing-card{display:grid;grid-template-columns:96px 1fr;gap:10px;align-items:center;border:1px solid var(--stroke,#2a2a2a);border-radius:12px;padding:10px;background:var(--card,#1a1a1a)}',
      '.listing-card img{width:96px;height:72px;object-fit:cover;border-radius:10px}',
      '.listing-card .meta{display:flex;flex-direction:column;gap:2px}'
    ].join('');
    document.head.appendChild(css);
  }

  function loadData(){
    if (dataCache) return Promise.resolve(dataCache);
    return new Promise(function(resolve){
      (function tryNext(i){
        if (i>=DATA_URLS.length) { resolve([]); return; }
        fetch(DATA_URLS[i]).then(function(r){ return r.json(); }).then(function(j){ dataCache=j; resolve(j); }).catch(function(){ tryNext(i+1); });
      })(0);
    });
  }

  function currentFilterSpec(){
    var p = getParams();
    return {
      q: p.q,
      city: p.city,
      beds: p.beds ? Number(p.beds) : "",
      baths: p.baths ? Number(p.baths) : "",
      minp: p.minp ? Number(p.minp) : "",
      maxp: p.maxp ? Number(p.maxp) : ""
    };
  }

  function applyFiltersAndRender(){
    loadData().then(function(rows){
      var spec = currentFilterSpec();
      // Use FILTERS.applyFilters if available
      var filtered = rows;
      try {
        if (window.FILTERS && typeof FILTERS.applyFilters === 'function') {
          filtered = FILTERS.applyFilters(rows, spec);
        } else {
          // fallback minimal filter
          filtered = rows.filter(function(x){
            var ok = true;
            if (spec.city && x.city !== spec.city) ok=false;
            if (spec.beds && Number(x.beds) < spec.beds) ok=false;
            if (spec.baths && Number(x.baths) < spec.baths) ok=false;
            if (spec.minp && Number(x.price) < spec.minp) ok=false;
            if (spec.maxp && Number(x.price) > spec.maxp) ok=false;
            return ok;
          });
        }
      } catch(e){ console.debug('[sidebar] filter error', e); }

      // Optional type filter
      var type = getParams().type;
      if (type) filtered = filtered.filter(function(x){ return (x.type||'').toLowerCase() === type.toLowerCase(); });

      // Sort
      var sort = getParams().sort || 'relevance';
      filtered = (window.FILTERS && FILTERS.sortRows) ? FILTERS.sortRows(filtered, sort) : filtered;

      updateTopCard(filtered[0] || null);
      updateLegendText(spec, sort);
      updateMapMarkers(filtered);
    });
  }

  function updateLegendText(spec, sort){
    var el = document.getElementById('map-legend');
    if (!el) return;
    function part(){ var arr=[];
      if (spec.city) arr.push(spec.city);
      if (spec.beds) arr.push(spec.beds + '+ beds');
      if (spec.baths) arr.push(spec.baths + '+ baths');
      if (spec.minp || spec.maxp) arr.push((fmtMoney(spec.minp)||'Any') + '–' + (fmtMoney(spec.maxp)||'Any'));
      return arr.join(' • ');
    }
    el.textContent = 'Filters: ' + (part() || 'All results') + (sort && sort!=='relevance' ? (' • Sort: ' + sort) : '');
  }

  function cardHTML(row){
    if (!row) return '<p class="help">No results match the current filters.</p>';
    var img = row.photo || 'assets/placeholder-real-estate-dark.svg';
    var price = fmtMoney(row.price) || '$—';
    var meta = [row.beds + ' bd', row.baths + ' ba', (row.type || '').toString()].filter(Boolean).join(' • ');
    var brokerage = row.brokerage || '—';
    var badge = '<a href="' + (row.realtorca_url || '#') + '" target="_blank" rel="noopener" aria-label="View on REALTOR.ca"><img src="assets/realtorca-badge.svg" alt="Powered by REALTOR.ca" style="height:18px"></a>';
    return [
      '<div class="listing-card">',
      '  <img src="' + img + '" alt="Listing photo for ' + (row.address||'') + '">',
      '  <div class="meta">',
      '    <strong>' + price + '</strong>',
      '    <span>' + (row.address || '') + '</span>',
      '    <span>' + meta + '</span>',
      '    <span style="font-size:12px;color:var(--muted,#a0a0a0)">' + brokerage + ' • ' + badge + '</span>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function updateTopCard(row){
    if (!topCardEl) return;
    topCardEl.innerHTML = cardHTML(row);
  }

  function updateMapMarkers(rows){
    try {
      if (!mapRef && window.FINDR_MAP && FINDR_MAP.map) mapRef = FINDR_MAP.map;
      if (!mapRef && window.map) mapRef = window.map; // fallback to global
      if (!mapRef) return;
      if (!markersLayer && window.L && mapRef.addLayer){
        markersLayer = L.layerGroup().addTo(mapRef);
      }
      if (!markersLayer) return;
      markersLayer.clearLayers();
      (rows || []).forEach(function(r){
        if (!window.L) return;
        var m = L.marker([Number(r.lat), Number(r.lng)]);
        m.bindPopup('<strong>' + (r.address||'') + '</strong><br>' + (fmtMoney(r.price)||'$—') + ' • ' + (r.beds||'?') + ' bd • ' + (r.baths||'?') + ' ba');
        markersLayer.addLayer(m);
      });
    } catch(e){ console.debug('[sidebar] marker update error', e); }
  }

  function onApply(){
    var payload = {};
    ['city','beds','baths','minp','maxp','type','sort'].forEach(function(id){
      var el=qs('#'+id);
      if (!el) return;
      var v = (el.value||'').trim();
      payload[id] = v;
    });
    setParams(payload);
    applyFiltersAndRender();
  }

  // Init when DOM and map scripts are ready
  document.addEventListener('DOMContentLoaded', function(){ document.documentElement.classList.add('sidebar-open');
    ensureStyles();
    buildSidebar();
    applyFiltersAndRender();
  });

})();