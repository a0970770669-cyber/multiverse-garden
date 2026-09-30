/* 商品列表｜Multiverse Garden
   1. 商品格線（MG.products；?cat=large|small 只顯示該分類；?q= 搜尋鮮花商品＋居家擺設）
   2. 卡片 hover：原圖淡出、去背圖淡入並放大（Figma「商品頁面（卡片放大版）」）
   3. 往下捲動：Header＋分類列收起 → 頂部細條；往上捲或點「查看全部品項」再展開
   4. 篩選面板：預算單選、色系複選；「確認」套用並關閉、「重置」清除；?filter=open 進頁直接打開
   5. 主視覺影片：prefers-reduced-motion 時暫停，只顯示封面 */
(function () {
  var MG = window.MG;
  var main = document.getElementById('main');
  if (!MG || !main) return;

  var grid = document.getElementById('product-grid');
  var empty = document.getElementById('product-empty');
  var panel = document.getElementById('filter-panel');
  var form = document.getElementById('filter-form');
  var bar = main.querySelector('[data-collapse-bar]');
  var showTopBtn = main.querySelector('[data-show-top]');
  var siteTop = document.querySelector('.site-top');
  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function prefersReduced() { return !!(reduceMotion && reduceMotion.matches); }
  function onMediaChange(mq, fn) {
    if (!mq) return;
    if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn);
  }

  each(main.querySelectorAll('[data-icon]'), function (el) {
    el.innerHTML = MG.icon(el.getAttribute('data-icon'));
  });

  /* ---------- 1. 主視覺影片 ---------- */
  var video = main.querySelector('.products-hero__video');
  function syncVideo() {
    if (!video) return;
    if (prefersReduced()) {
      video.autoplay = false;
      video.pause();
      video.preload = 'none';
      video.load();               // 回到封面（poster）
    } else {
      video.preload = 'auto';
      video.autoplay = true;
      var playing = video.play();
      if (playing && playing.catch) playing.catch(function () { /* 瀏覽器擋自動播放時就停在封面 */ });
    }
  }
  if (prefersReduced()) syncVideo();
  onMediaChange(reduceMotion, syncVideo);

  /* ---------- 2. 商品格線 ----------
     ?q=關鍵字：在鮮花商品＋居家擺設裡搜尋（以空白分成多個關鍵字，每個都要出現在
     編號、圖片描述、分類名稱或色系其中之一，不分大小寫）；搜尋時不套用 ?cat、分類列沒有啟用項目。 */
  var searchTitle = document.getElementById('product-search-title');
  var QUERY = (MG.param('q') || '').trim();
  var TERMS = normalize(QUERY).split(/\s+/).filter(Boolean);
  var SEARCHING = TERMS.length > 0;
  var CAT_NAMES = { large: '大盆花', small: '小盆花', decor: '居家擺設' };

  var CAT = SEARCHING ? null : MG.param('cat');
  if (CAT !== 'large' && CAT !== 'small') CAT = null;
  if (SEARCHING) MG.setActiveChip(null);
  else if (CAT) MG.setActiveChip(CAT);
  var POOL = SEARCHING ? MG.products.concat(MG.decorProducts || []) : MG.products;
  if (SEARCHING && searchTitle) searchTitle.textContent = '「' + QUERY + '」的搜尋結果';

  function normalize(s) {
    s = String(s == null ? '' : s);
    try { s = s.normalize('NFKC'); } catch (e) { /* 舊瀏覽器沒有 normalize */ }  // 全形英數 → 半形
    return s.toLowerCase();
  }
  function matchesQuery(p) {
    if (!SEARCHING) return true;
    var fields = [p.code, p.alt, CAT_NAMES[p.category] || ''].concat(p.colors || []).map(normalize);
    return TERMS.every(function (term) {
      return fields.some(function (f) { return f.indexOf(term) !== -1; });
    });
  }

  // 去背圖只給能 hover 的裝置（手機看不到 hover，不必多載 22 張 PNG）
  var CAN_HOVER = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  var TONES = ['暖色調', '冷色調'];
  var applied = { budget: '', colors: [] };

  // 預算值 "2000-2999"；"5000-" = 5000 以上
  function inBudget(price, budget) {
    if (!budget) return true;
    var r = budget.split('-');
    var min = Number(r[0]);
    var max = r[1] ? Number(r[1]) : Infinity;
    return price >= min && price <= max;
  }
  function hasAny(values, wanted) {
    if (!wanted.length) return true;
    for (var i = 0; i < wanted.length; i++) if (values.indexOf(wanted[i]) !== -1) return true;
    return false;
  }
  // 色系複選：色調（暖／冷）與顏色各自「任一符合」，兩者同時勾選時要都符合
  function matches(p) {
    if (CAT && p.category !== CAT) return false;
    if (!matchesQuery(p)) return false;
    if (!inBudget(p.price, applied.budget)) return false;
    var colors = p.colors || [];
    var tones = applied.colors.filter(function (c) { return TONES.indexOf(c) !== -1; });
    var hues = applied.colors.filter(function (c) { return TONES.indexOf(c) === -1; });
    return hasAny(colors, tones) && hasAny(colors, hues);
  }
  function render() {
    var list = POOL.filter(matches);
    grid.innerHTML = list.map(function (p) { return MG.productCardHTML(p, { cutout: CAN_HOVER }); }).join('');
    // 有去背圖的卡片才做 hover 換圖（居家擺設沒有去背圖，維持一般卡片）
    each(grid.querySelectorAll('.product-card__cutout'), function (img) {
      img.closest('.product-card').classList.add('product-card--cutout');
    });
    grid.hidden = !list.length;
    empty.hidden = !!list.length;
    if (searchTitle) searchTitle.hidden = !(SEARCHING && list.length);
  }
  render();

  /* ---------- 3. Header＋分類列收起 / 展開 ----------
     top：頁面最上方（完整 Header 在原位）
     collapsed：往下捲 → Header 收起，顯示細條
     expanded：往上捲或點「查看全部品項」→ 完整 Header 貼在頂部 */
  var state = 'top';
  var lastY = window.pageYOffset;
  if (siteTop && !siteTop.id) siteTop.id = 'site-top';
  if (siteTop) showTopBtn.setAttribute('aria-controls', siteTop.id);

  function topHeight() { return siteTop ? siteTop.offsetHeight : 136; }
  function setState(next) {
    if (next === state) return;
    state = next;
    var collapsed = next === 'collapsed';
    if (siteTop) siteTop.classList.toggle('is-collapsed', collapsed);
    bar.classList.toggle('is-visible', collapsed);
    showTopBtn.setAttribute('aria-expanded', String(!collapsed));
  }
  function onScroll() {
    var y = window.pageYOffset;
    if (y <= topHeight()) { setState('top'); lastY = y; return; }
    var dy = y - lastY;
    if (dy > 6) { setState('collapsed'); lastY = y; }
    else if (dy < -6) { setState('expanded'); lastY = y; }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });
  if (lastY > topHeight()) setState('collapsed');   // 重新整理時停在頁面中段

  showTopBtn.addEventListener('click', function (e) {
    setState('expanded');
    lastY = window.pageYOffset;
    // 只有鍵盤觸發（Enter / 空白鍵，e.detail === 0）才把焦點帶到分類列；滑鼠點擊不移動焦點，避免出現焦點框
    if (e.detail !== 0) return;
    var target = siteTop && (siteTop.querySelector('.chip.is-active') || siteTop.querySelector('.chip') || siteTop.querySelector('a[href], button'));
    if (target) target.focus({ preventScroll: true });
  });
  // 用 Tab 走進收起的 Header 時自動展開
  if (siteTop) siteTop.addEventListener('focusin', function () {
    if (state === 'collapsed') setState('expanded');
  });

  /* ---------- 4. 篩選面板 ---------- */
  var returnFocus = null;
  function isOpen() { return panel.classList.contains('is-open'); }
  function setTriggers(open) {
    each(document.querySelectorAll('[data-filter-toggle]'), function (t) {
      t.setAttribute('aria-controls', 'filter-panel');
      t.setAttribute('aria-expanded', String(open));
    });
  }
  function syncForm() {        // 面板內容 = 目前套用中的條件（沒按確認就關掉的變更不保留）
    each(form.querySelectorAll('input'), function (el) {
      el.checked = el.name === 'budget' ? el.value === applied.budget : applied.colors.indexOf(el.value) !== -1;
    });
  }
  function readForm() {
    var budget = form.querySelector('input[name="budget"]:checked');
    var colors = [];
    each(form.querySelectorAll('input[name="color"]:checked'), function (el) { colors.push(el.value); });
    return { budget: budget ? budget.value : '', colors: colors };
  }
  function openPanel(trigger) {
    if (isOpen()) return;
    syncForm();
    returnFocus = trigger || null;
    panel.classList.add('is-open');
    setTriggers(true);
    panel.focus({ preventScroll: true });
  }
  function visibleTrigger() {  // 目前畫面上看得到的篩選 icon（細條或分類列）
    return state === 'collapsed' ? bar.querySelector('[data-filter-toggle]') : document.querySelector('.chipbar [data-filter-toggle]');
  }
  function closePanel(restoreFocus) {
    if (!isOpen()) return;
    var focusWasInside = panel.contains(document.activeElement);
    panel.classList.remove('is-open');
    setTriggers(false);
    var target = returnFocus && document.contains(returnFocus) ? returnFocus : visibleTrigger();
    if (restoreFocus && focusWasInside && target) target.focus({ preventScroll: true });
    returnFocus = null;
  }
  // 套用後若格線頂端已捲出畫面，回到格線開頭（避免結果變少時停在頁尾）
  function revealGrid() {
    var top = grid.parentNode.getBoundingClientRect().top;
    if (top >= 0) return;
    window.scrollTo({
      top: Math.max(0, window.pageYOffset + top - topHeight()),
      behavior: prefersReduced() ? 'auto' : 'smooth'
    });
  }

  setTriggers(false);
  document.addEventListener('mg:filter-toggle', function (e) {
    e.preventDefault();       // 本頁自己開面板，不跳轉
    if (isOpen()) closePanel(true);
    else openPanel(e.detail && e.detail.trigger);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) closePanel(true);
  });
  document.addEventListener('click', function (e) {
    if (!isOpen()) return;
    var t = e.target;
    if (panel.contains(t) || (t.closest && t.closest('[data-filter-toggle]'))) return;
    closePanel(false);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    applied = readForm();
    render();
    closePanel(true);
    revealGrid();
  });
  form.addEventListener('reset', function () {   // 表單本身會被瀏覽器清空，這裡同步清掉已套用的條件
    applied = { budget: '', colors: [] };
    render();
  });

  if (MG.param('filter') === 'open') openPanel(null);
})();
