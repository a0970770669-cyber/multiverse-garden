/* =========================================================
   商品說明頁（Figma 157:1759「商品說明頁面」）
   ─ ?id=010…031 讀取鮮花商品（只接受 type 'fresh'），沒有或找不到就顯示 013。
   ─ 4 張縮圖 = [原本的商品圖, 細節 1, 細節 2, 細節 3]；點第 1 張主圖回到原圖，點 2–4 換成該細節。
   ─ 013：Figma 上的主圖、半圓細節圖、縮圖都是「同一張原圖（1200×1468）的不同裁切」，
     已依 Figma 的裁切框切成 https://pub-6b1a46631bc645beb6f95ed1a98d6997.r2.dev/img/product/013-*.jpg（見 GALLERY）。
   ─ 其他商品只有一張 product.img：細節與半圓圖用同一張圖裁切放大（見 FOCUS），
     在瀏覽器裡依圖片實際比例換算位置與倍率（不變形）。
   ─ 放大鏡 → 半圓圖原地放大 2 倍、跟著游標移動；再點一下（或 Esc）還原。
   ─ 「加入購物車」用 core.js 的 data-add-to-cart（側欄 = Figma 223:5693）。
   ========================================================= */
(function () {
  var MG = window.MG;
  var root = document.querySelector('.pd');
  if (!MG || !root) return;

  /* ---------- 商品 ---------- */
  var DEFAULT_ID = '013';
  var product = MG.getProduct(MG.param('id'));
  if (!product || product.type !== 'fresh') product = MG.getProduct(DEFAULT_ID);
  if (!product) return;

  // 各圖框的寬高比（Figma 尺寸）
  var BOX = { main: 604 / 800, detail: 604 / 447, thumb: 160 / 192 };

  /* 013：依 Figma 圖層 imageTransform 切好的檔案。
     半圓 = 334:11045；細節 = Figma 4 張縮圖框中彼此最不像的 3 張（334:11075／11076／11077）。
     第 4 張 334:11078（中央的菊花與綠葉）和第 1 張、半圓圖內容重疊，不再使用。 */
  var IMG = 'https://pub-6b1a46631bc645beb6f95ed1a98d6997.r2.dev/img/product/';
  var GALLERY = {
    '013': {
      main: IMG + '013-main.jpg',
      detail: { src: IMG + '013-detail.jpg', alt: '白色菊花、銀柳與綠葉交織的局部特寫' },
      details: [
        { src: IMG + '013-thumb-1.jpg', alt: '局部：銀柳枝條環繞白色菊花' },
        { src: IMG + '013-thumb-2.jpg', alt: '局部：白色海芋與綠色花莖' },
        { src: IMG + '013-thumb-3.jpg', alt: '局部：銀柳彎弧與海芋' }
      ]
    }
  };

  /* 其他商品只有一張圖：裁切 = { cx, cy：裁切中心（原圖寬／高比例）, w：可見寬度（原圖寬比例） }
     半圓沿用 Figma 334:11045 的框。3 張細節依各照片的主體位置取不同區域與倍率：
     主體上段（約 2.2 倍）、主體中心特寫（約 3.3 倍）、主體下段（約 1.8 倍）。
     FOCUS = 主體中心 cx、cy 與上下分布 sy，由每張照片的紋理（花材細節）分布離線量得；
     換了商品照或新增商品時，沒有資料就用 FOCUS_DEFAULT。 */
  var HALF = { cx: 0.4573, cy: 0.3918, w: 0.5547 };
  var FOCUS = {
    '010': [0.52, 0.54, 0.18], '011': [0.56, 0.47, 0.21], '012': [0.54, 0.56, 0.21],
    '014': [0.39, 0.61, 0.21], '015': [0.45, 0.49, 0.23], '016': [0.51, 0.60, 0.18],
    '017': [0.48, 0.55, 0.20], '018': [0.40, 0.58, 0.26], '019': [0.44, 0.62, 0.21],
    '020': [0.47, 0.58, 0.15], '021': [0.51, 0.66, 0.23], '022': [0.46, 0.67, 0.18],
    '023': [0.50, 0.67, 0.13], '024': [0.52, 0.58, 0.22], '025': [0.51, 0.64, 0.17],
    '026': [0.57, 0.70, 0.15], '027': [0.56, 0.54, 0.23], '028': [0.47, 0.58, 0.14],
    '029': [0.55, 0.57, 0.19], '030': [0.48, 0.60, 0.12], '031': [0.49, 0.75, 0.19]
  };
  var FOCUS_DEFAULT = [0.50, 0.58, 0.19];
  function detailCrops(id) {
    var f = FOCUS[id] || FOCUS_DEFAULT;
    return [
      { cx: f[0], cy: f[1] - f[2], w: 0.45 },
      { cx: f[0], cy: f[1], w: 0.30 },
      { cx: f[0], cy: f[1] + f[2], w: 0.55 }
    ];
  }

  function galleryFor(p) {
    var g = GALLERY[p.id];
    var main = { src: g ? g.main : p.img, alt: p.alt };
    if (g) return { main: main, detail: g.detail, thumbs: [main].concat(g.details) };
    return {
      main: main,
      detail: { src: p.img, alt: p.alt + '（局部特寫）', crop: HALF },
      thumbs: [main].concat(detailCrops(p.id).map(function (c, i) {
        return { src: p.img, alt: p.alt + '（局部 ' + (i + 1) + '）', crop: c };
      }))
    };
  }
  var gallery = galleryFor(product);

  /* ---------- 裁切：同一張圖放進不同比例的框 ----------
     以裁切中心與寬度為準，依圖片實際比例補足框的比例（不變形），超出圖片時往內推。 */
  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
  function pct(v) { return (v * 100).toFixed(3) + '%'; }
  function applyCrop(img, crop, boxRatio) {
    function run() {
      var ratio = img.naturalWidth / img.naturalHeight;
      if (!ratio) return;
      var w = crop.w;
      var h = (w * ratio) / boxRatio;
      if (h > 1) { w = w / h; h = 1; }
      var x = clamp(crop.cx - w / 2, 0, 1 - w);
      var y = clamp(crop.cy - h / 2, 0, 1 - h);
      img.style.width = pct(1 / w);
      img.style.height = pct(1 / h);
      img.style.left = pct(-x / w);
      img.style.top = pct(-y / h);
    }
    if (img.complete && img.naturalWidth) run();
    else img.addEventListener('load', run, { once: true });
  }
  function clearCrop(img) {
    img.classList.remove('pd-crop');
    img.style.width = img.style.height = img.style.left = img.style.top = '';
  }
  function setImage(img, item, boxRatio) {
    if (img.getAttribute('src') !== item.src) img.src = item.src;
    img.alt = item.alt || '';
    clearCrop(img);
    if (item.crop) {
      img.classList.add('pd-crop');
      applyCrop(img, item.crop, boxRatio);
    }
  }

  /* ---------- 內容 ---------- */
  var esc = MG.esc;
  var d = product.details;

  document.title = product.code + '｜商品說明｜Multiverse Garden';
  root.querySelector('.pd-head__code').textContent = product.code;
  root.querySelector('.pd-head__price').textContent = MG.price(product.price);

  root.querySelector('.pd-copy').innerHTML =
    '<div class="pd-copy__inner">' +
      '<div class="pd-copy__block"><h2 class="prose__title">{ 使用花材 }</h2><p>' + esc(d.materials) + '</p></div>' +
      '<div class="pd-copy__block"><p>' + esc(d.sizeLabel) + '</p><p>' + esc(d.size) + '</p></div>' +
      '<div class="pd-copy__block"><h2 class="prose__title">{ 養護方式 }</h2><p>' + esc(d.care) + '</p></div>' +
      '<div class="pd-copy__block"><h2 class="prose__title">{ 觀賞壽命 }</h2><p>' + esc(d.life) + '</p></div>' +
    '</div>';

  // 甜美溫柔 ↔ 優雅個性 = personality；暖色調 ↔ 冷色調 = tone（0–100）
  root.querySelector('.pd-scales').innerHTML =
    MG.scaleHTML('甜美溫柔', '優雅個性', product.personality) +
    MG.scaleHTML('暖色調', '冷色調', product.tone);

  root.querySelector('[data-add-to-cart]').setAttribute('data-add-to-cart', product.id);

  function makeImg(cls, lazy) {
    var img = document.createElement('img');
    img.className = cls;
    img.decoding = 'async';
    if (lazy) img.loading = 'lazy';
    return img;
  }
  var mainImg = makeImg('pd-main__img');
  setImage(mainImg, gallery.main, BOX.main);
  root.querySelector('.pd-main').appendChild(mainImg);

  var detailImg = makeImg('pd-detail__img', true);
  setImage(detailImg, gallery.detail, BOX.detail);
  root.querySelector('.pd-detail__zoom').appendChild(detailImg);

  var thumbList = root.querySelector('.pd-thumbs');
  thumbList.innerHTML = gallery.thumbs.map(function (t, i) {
    return (
      '<li><button class="pd-thumb" type="button" aria-pressed="' + (i === 0) + '" data-index="' + i + '">' +
      '<span class="pd-thumb__frame"><img alt="' + esc(t.alt) + '" loading="lazy" decoding="async"></span></button></li>'
    );
  }).join('');
  var thumbs = Array.prototype.slice.call(thumbList.querySelectorAll('.pd-thumb'));
  thumbs.forEach(function (btn, i) {
    setImage(btn.querySelector('img'), gallery.thumbs[i], BOX.thumb);
  });

  /* ---------- 點縮圖換主圖（第 1 張 = 原本的商品圖） ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var active = 0;
  var swapSeq = 0;

  // 圖片載入（並盡量解碼）後才換上，避免換圖時閃白；解碼最多等 150ms
  function whenReady(src, cb) {
    var img = new Image();
    img.src = src;
    var called = false;
    function go() { if (!called) { called = true; cb(); } }
    function loaded() {
      if (img.decode) img.decode().then(go, go);
      setTimeout(go, 150);
    }
    if (img.complete) loaded();
    else { img.onload = loaded; img.onerror = go; }
  }
  function showMain(item) {
    var seq = ++swapSeq;
    whenReady(item.src, function () {
      if (seq !== swapSeq) return;
      setImage(mainImg, item, BOX.main);
      if (!reduceMotion && mainImg.animate) {
        mainImg.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
      }
    });
  }

  thumbList.addEventListener('click', function (e) {
    var btn = e.target.closest('.pd-thumb');
    if (!btn) return;
    var i = Number(btn.getAttribute('data-index'));
    if (i === active) return;
    active = i;
    thumbs.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === active)); });
    showMain(gallery.thumbs[i]);
  });

  /* ---------- 放大鏡：半圓圖原地放大 ---------- */
  var detail = root.querySelector('.pd-detail');
  var zoomLayer = detail.querySelector('.pd-detail__zoom');
  var toggle = detail.querySelector('.pd-detail__toggle');
  var zoomed = false;
  var down = null;

  function setOrigin(e) {
    var r = detail.getBoundingClientRect();
    var x = clamp((e.clientX - r.left) / r.width, 0, 1);
    var y = clamp((e.clientY - r.top) / r.height, 0, 1);
    zoomLayer.style.transformOrigin = pct(x) + ' ' + pct(y);
  }
  function setZoom(on, e) {
    zoomed = on;
    if (on) {
      if (e && e.clientX != null) setOrigin(e);
      else zoomLayer.style.transformOrigin = '50% 50%';
    }
    detail.classList.toggle('is-zoomed', on); // CSS：scale(2)
    toggle.setAttribute('aria-pressed', String(on));
  }

  // 放大鏡按鈕（鍵盤可操作）：從中央放大
  toggle.addEventListener('click', function () { setZoom(!zoomed); });

  // 直接點圖：在點的位置放大；放大中再點一下還原。觸控拖曳（平移）不算點擊。
  detail.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; });
  detail.addEventListener('click', function (e) {
    if (e.target.closest('.pd-detail__toggle')) return;
    var moved = down && (Math.abs(e.clientX - down.x) > 6 || Math.abs(e.clientY - down.y) > 6);
    down = null;
    if (zoomed && moved) return;
    setZoom(!zoomed, e);
  });
  detail.addEventListener('pointermove', function (e) { if (zoomed) setOrigin(e); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && zoomed) setZoom(false);
  });
})();
