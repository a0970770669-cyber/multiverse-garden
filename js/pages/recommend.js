/* 線上花禮推薦｜Multiverse Garden
   兩條拉桿：色調（0 暖色調 – 100 冷色調）、個性（0 甜美溫柔 – 100 優雅個性）。
   依商品的 tone / personality 計算距離，顯示最接近的 4 件（卡片連到商品頁），
   推薦結果改變時淡出 → 換卡片 → 淡入。初始值取自 Figma 滑塊位置（色調 69、個性 81）。 */
(function () {
  var MG = window.MG;
  var cards = document.getElementById('rec-cards');
  var tone = document.getElementById('rec-tone');
  var personality = document.getElementById('rec-personality');
  if (!MG || !cards || !tone || !personality) return;

  var COUNT = 4;
  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function fadeMs() { return reduceMotion && reduceMotion.matches ? 0 : 200; }   // = --dur-fast

  function nearest(t, s) {
    return MG.products
      .map(function (p, i) {
        var dt = p.tone - t;
        var ds = p.personality - s;
        return { id: p.id, d: dt * dt + ds * ds, i: i };
      })
      .sort(function (a, b) { return a.d - b.d || a.i - b.i; })
      .slice(0, COUNT)
      .map(function (x) { return x.id; });
  }
  function cardsHTML(ids) {
    return ids.map(function (id) { return MG.productCardHTML(MG.getProduct(id)); }).join('');
  }
  function same(a, b) { return !!a && !!b && a.join() === b.join(); }
  function preload(ids) {
    ids.forEach(function (id) { var img = new Image(); img.src = MG.getProduct(id).img; });
  }

  var shown = null;     // 目前畫面上的 4 件
  var pending = null;   // 淡出期間收到的最新結果
  var busy = false;

  function swap() {
    if (!pending || same(pending, shown)) { pending = null; busy = false; return; }
    busy = true;
    preload(pending);
    cards.classList.add('is-fading');
    window.setTimeout(function () {
      shown = pending;
      pending = null;
      cards.innerHTML = cardsHTML(shown);
      cards.classList.remove('is-fading');
      window.setTimeout(function () {
        busy = false;
        if (pending) swap();
      }, fadeMs());
    }, fadeMs());
  }

  function describe(input) {
    var v = Number(input.value);
    input.setAttribute('aria-valuetext',
      input.getAttribute('data-left') + ' ' + (100 - v) + '，' + input.getAttribute('data-right') + ' ' + v);
  }

  function update() {
    var ids = nearest(Number(tone.value), Number(personality.value));
    if (busy) { pending = ids; return; }
    if (same(ids, shown)) return;
    pending = ids;
    swap();
  }

  [tone, personality].forEach(function (input) {
    describe(input);
    input.addEventListener('input', function () { describe(input); update(); });
  });

  // 進頁時先顯示設計稿上畫的 4 款；使用者拉動拉桿後才改成依數值計算的推薦。
  var DESIGN_INITIAL = ['026', '024', '020', '013'];
  shown = DESIGN_INITIAL.filter(function (id) { return MG.getProduct(id); });
  if (shown.length < COUNT) shown = nearest(Number(tone.value), Number(personality.value));
  cards.innerHTML = cardsHTML(shown);
})();
