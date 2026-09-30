/* =========================================================
   居家擺設頁（Figma 187:4695；售後服務彈窗 187:4465）
   ─ 商品資料：MG.getProduct('decor-013')（也接受 ?id= 的其他居家擺設商品）
   ─ 4 張縮圖 = [主圖, 細節 1, 細節 2, 細節 3]；點第 1 張主圖回到原圖，點 2–4 換成該細節照。
   ─ 「加入購物車」「售後服務」用 core.js 的 data-add-to-cart / data-after-sales。
   ========================================================= */
(function () {
  var MG = window.MG;
  var root = document.querySelector('.decor-main');
  if (!MG || !root) return;

  var DEFAULT_ID = 'decor-013';
  var product = MG.getProduct(MG.param('id'));
  if (!product || product.type !== 'decor') product = MG.getProduct(DEFAULT_ID);
  if (!product) return;

  /* 細節照（縮圖 800px、換到主圖時用 1600px），編號同 Figma 縮圖順序。
     Figma 的 4 張特寫取最不重複的 3 張：第 2 張（IMG_2759，白色永生花＋金黃花蕊）
     和第 1 張幾乎同一區塊，不再使用。 */
  var IMG = 'https://pub-6b1a46631bc645beb6f95ed1a98d6997.r2.dev/img/decor/';
  var MEDIA = {
    'decor-013': [
      { thumb: IMG + 'decor-013-thumb-1.jpg', large: IMG + 'decor-013-detail-1.jpg', alt: '細節：白色永生花與金黃花蕊' },
      { thumb: IMG + 'decor-013-thumb-3.jpg', large: IMG + 'decor-013-detail-3.jpg', alt: '細節：乾燥葉片、白色珠狀花材與扭轉枝幹' },
      // Figma 這張是從上緣開始裁切
      { thumb: IMG + 'decor-013-thumb-4.jpg', large: IMG + 'decor-013-detail-4.jpg', alt: '細節：扭轉枝幹與白色珠狀花材', position: '50% 0%' }
    ]
  };

  /* ---------- 內容 ---------- */
  var esc = MG.esc;
  var d = product.details;
  function paras(list) {
    return list.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');
  }

  document.title = product.code + '｜居家擺設｜Multiverse Garden';
  root.querySelector('.decor-head__code').textContent = product.code;
  root.querySelector('.decor-head__price').textContent = MG.price(product.price);

  root.querySelector('.decor-copy').innerHTML =
    '<div class="decor-copy__block"><h2 class="prose__title">{ 商品簡介 }</h2>' + paras(d.intro) + '</div>' +
    '<div class="decor-copy__block">' + paras(d.specs) + '</div>' +
    '<div class="decor-copy__block"><h2 class="prose__title">{ 養護方式 }</h2>' + paras(d.care) + '</div>' +
    '<div class="decor-copy__block"><h2 class="prose__title">{ 觀賞壽命 }</h2>' + paras(d.life) + '</div>';

  var addBtn = document.querySelector('.decor-actions [data-add-to-cart]');
  if (addBtn) addBtn.setAttribute('data-add-to-cart', product.id);

  var mainImg = root.querySelector('.decor-main__img');
  if (mainImg.getAttribute('src') !== product.img) mainImg.src = product.img;
  mainImg.alt = product.alt;

  // 第 1 張縮圖 = 主圖本身（與主圖同一個檔案，不另外下載）
  var items = [{ thumb: product.img, large: product.img, alt: product.alt }].concat(MEDIA[product.id] || []);

  var list = root.querySelector('.decor-thumbs');
  list.innerHTML = items.map(function (t, i) {
    return (
      '<li><button class="decor-thumb" type="button" aria-pressed="' + (i === 0) + '" data-index="' + i + '">' +
      '<img src="' + t.thumb + '" alt="' + esc(t.alt) + '" decoding="async"' +
      (t.position ? ' style="object-position:' + t.position + '"' : '') + '></button></li>'
    );
  }).join('');
  var thumbs = Array.prototype.slice.call(list.querySelectorAll('.decor-thumb'));

  /* ---------- 點縮圖換主圖 ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var active = 0;
  var swapSeq = 0;

  function preload(src) {
    var img = new Image();
    img.src = src;
    return img;
  }
  // 圖片載入（並盡量解碼）後才換上，避免換圖時閃白；解碼最多等 150ms
  function whenReady(src, cb) {
    var img = preload(src);
    var called = false;
    function go() { if (!called) { called = true; cb(); } }
    function loaded() {
      if (img.decode) img.decode().then(go, go);
      setTimeout(go, 150);
    }
    if (img.complete) loaded();
    else { img.onload = loaded; img.onerror = go; }
  }
  function showMain(src, alt, position) {
    var seq = ++swapSeq;
    whenReady(src, function () {
      if (seq !== swapSeq) return;
      mainImg.src = src;
      mainImg.alt = alt;
      mainImg.style.objectPosition = position || '';
      if (!reduceMotion && mainImg.animate) {
        mainImg.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
      }
    });
  }

  list.addEventListener('click', function (e) {
    var btn = e.target.closest('.decor-thumb');
    if (!btn) return;
    var i = Number(btn.getAttribute('data-index'));
    if (i === active) return;
    active = i;
    thumbs.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === active)); });
    showMain(items[i].large, items[i].alt, items[i].position);
  });

  // 滑到／聚焦縮圖時預先載入大圖
  function warm(e) {
    var btn = e.target.closest && e.target.closest('.decor-thumb');
    if (!btn || btn.dataset.warm) return;
    btn.dataset.warm = '1';
    preload(items[Number(btn.getAttribute('data-index'))].large);
  }
  list.addEventListener('pointerover', warm);
  list.addEventListener('focusin', warm);
  /* 空間照：觸控裝置沒有 hover，點一下切換「有／沒有作品」 */
  [].forEach.call(document.querySelectorAll('.decor-room'), function (fig) {
    fig.addEventListener('pointerup', function (e) {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') return;
      fig.classList.toggle('is-art');
    });
  });
})();
