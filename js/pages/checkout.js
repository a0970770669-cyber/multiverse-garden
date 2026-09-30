/* =========================================================
   購物車與結帳｜Multiverse Garden
   1. 購物車：列出 MG.cart.detailed()；數量用 MG.cart.setQty 即時更新金額
      （最小 1，設計稿沒有刪除按鈕）。合計 = 小計 + MG.SHIPPING_FEE。
   2. 確認付款：先跑原生 HTML 表單驗證，通過後用 Luhn 檢查卡號
      → 通過：清空購物車、前往 order-success.html
      → 不通過：保留購物車、前往 order-failed.html
   ※ 展示用網站：表單資料一律不儲存（不寫 localStorage / sessionStorage、
     不放進網址、不送到任何地方）。欄位刻意不設 name，就算 JS 失效、
     表單被原生送出，網址也不會帶任何欄位值。
   ========================================================= */
(function () {
  var MG = window.MG;
  var cartRoot = document.querySelector('[data-cart]');
  var form = document.getElementById('checkout-form');
  if (!MG || !cartRoot || !form) return;

  var submitBtn = form.querySelector('button[type="submit"]');
  var cardInput = document.getElementById('co-card-number');
  var MAX_QTY = 99;
  var leaving = false;     // 已決定跳頁：不再重畫購物車（避免清空時閃一下空狀態）
  var renderedKey = null;  // 目前畫面上的商品組合（id 串），組合不變就只更新數字

  // Figma codicon:chrome-minimize / akar-icons:plus（顏色跟著 currentColor）
  var ICON_MINUS =
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">' +
    '<path d="M4.375 9.375H15.625" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>';
  var ICON_PLUS =
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">' +
    '<path d="M10 16.6667V10M10 10V3.33333M10 10H16.6667M10 10H3.33333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

  var EMPTY_HTML =
    '<p class="co-cart__empty"><span>購物車目前沒有商品</span>' +
    '<a class="text-link" href="products.html">繼續購物</a></p>';

  /* ---------- 購物車 ---------- */
  function itemHTML(it, i) {
    var p = it.product;
    var n = 'co-item-' + i;
    return (
      '<li class="co-item" data-id="' + MG.esc(p.id) + '">' +
        '<div class="co-item__media">' +
          '<span class="co-item__code" id="' + n + '-code">' + MG.esc(p.code) + '</span>' +
          '<img class="co-item__img" src="' + MG.esc(p.img) + '" alt="' + MG.esc(p.alt) + '" width="165" height="202" decoding="async">' +
        '</div>' +
        '<div class="co-item__buy">' +
          '<span class="co-item__qty-label" id="' + n + '-qty">數量</span>' +
          '<div class="co-qty" role="group" aria-labelledby="' + n + '-qty ' + n + '-code">' +
            '<button class="co-qty__btn" type="button" data-step="-1" aria-label="減少數量">' + ICON_MINUS + '</button>' +
            '<output class="co-qty__value" data-qty>' + it.qty + '</output>' +
            '<button class="co-qty__btn" type="button" data-step="1" aria-label="增加數量">' + ICON_PLUS + '</button>' +
          '</div>' +
          '<span class="co-item__price" data-line-total>' + MG.price(it.total) + '</span>' +
        '</div>' +
      '</li>'
    );
  }

  function totalsHTML() {
    return (
      '<dl class="co-totals">' +
        '<div class="co-totals__row"><dt>運費</dt><dd>' + MG.price(MG.SHIPPING_FEE) + '</dd></div>' +
        '<div class="co-totals__row co-totals__row--sum"><dt>合計</dt><dd data-grand-total></dd></div>' +
      '</dl>'
    );
  }

  // 只更新數字（保留鍵盤焦點）
  function update(items) {
    var rows = cartRoot.querySelectorAll('.co-item');
    items.forEach(function (it, i) {
      var row = rows[i];
      if (!row) return;
      row.querySelector('[data-qty]').textContent = it.qty;
      row.querySelector('[data-line-total]').textContent = MG.price(it.total);
      row.querySelector('[data-step="-1"]').setAttribute('aria-disabled', String(it.qty <= 1));
      row.querySelector('[data-step="1"]').setAttribute('aria-disabled', String(it.qty >= MAX_QTY));
    });
    var grand = cartRoot.querySelector('[data-grand-total]');
    if (grand) grand.textContent = MG.price(MG.cart.subtotal() + MG.SHIPPING_FEE);
  }

  function render() {
    if (leaving) return;
    var items = MG.cart.detailed();
    var key = items.map(function (it) { return it.product.id; }).join('|');
    submitBtn.disabled = !items.length;

    if (!items.length) {
      renderedKey = key;
      cartRoot.innerHTML = EMPTY_HTML;
      return;
    }
    if (key !== renderedKey) {
      renderedKey = key;
      cartRoot.innerHTML = '<ul class="co-cart__list">' + items.map(itemHTML).join('') + '</ul>' + totalsHTML();
    }
    update(items);
  }

  function qtyOf(id) {
    var found = MG.cart.items().filter(function (it) { return it.id === id; })[0];
    return found ? found.qty : 0;
  }

  cartRoot.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-step]');
    if (!btn || btn.getAttribute('aria-disabled') === 'true') return;
    var id = btn.closest('.co-item').getAttribute('data-id');
    var cur = qtyOf(id);
    if (!cur) return;
    var next = Math.min(MAX_QTY, Math.max(1, cur + Number(btn.getAttribute('data-step'))));
    if (next !== cur) MG.cart.setQty(id, next); // 觸發 mg:cart-change → render()
  });

  document.addEventListener('mg:cart-change', render);
  window.addEventListener('storage', render); // 其他分頁改了購物車
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;               // 從上一頁快取回來：重新對齊購物車與表單
    leaving = false;
    form.reset();
    render();
  });

  /* ---------- 表單驗證 ---------- */
  // 格式不符時顯示比「請符合要求的格式」更具體的提示（只出現在瀏覽器原生的驗證泡泡）
  form.addEventListener('invalid', function (e) {
    var el = e.target;
    var hint = el.getAttribute && el.getAttribute('data-hint');
    if (hint && el.validity.patternMismatch) el.setCustomValidity(hint);
  }, true);
  form.addEventListener('input', function (e) {
    if (e.target.setCustomValidity) e.target.setCustomValidity('');
  });
  // 單行欄位去掉前後空白，只輸入空白會被 required 擋下
  form.addEventListener('change', function (e) {
    var el = e.target;
    if (el.tagName === 'INPUT' && el.value !== el.value.trim()) el.value = el.value.trim();
  });

  function hasBlankRequired() {
    var blank = false;
    Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (el) {
      if (!el.value.trim()) { el.value = ''; blank = true; }
    });
    return blank;
  }

  // Luhn（模 10）檢查：13–19 位數字
  function luhn(digits) {
    if (!/^[0-9]{13,19}$/.test(digits)) return false;
    var sum = 0;
    var dbl = false;
    for (var i = digits.length - 1; i >= 0; i--) {
      var d = digits.charCodeAt(i) - 48;
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  }

  // 只有原生驗證通過才會觸發 submit
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // 不送出、不改網址
    if (!MG.cart.count()) { render(); return; }
    if (hasBlankRequired()) { form.reportValidity(); return; }

    var ok = luhn(cardInput.value.replace(/[^0-9]/g, ''));
    leaving = true;
    if (ok) MG.cart.clear();
    form.reset(); // 離開前清空欄位，返回上一頁時不會留著卡號
    window.location.href = ok ? 'order-success.html' : 'order-failed.html';
  });

  render();
})();
