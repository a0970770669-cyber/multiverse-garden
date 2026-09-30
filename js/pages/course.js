/* =========================================================
   花藝體驗課程｜Multiverse Garden
   課程資訊 → 預約（參加者資訊、日期時段、人數）→ 付款
   1. 人數用結帳頁的 −/+ 數量控制（1–6），合計 = 人數 × NT$ 1800
   2. 課程日期只能選明天以後
   3. 確認付款：原生 HTML 驗證 → Luhn 檢查卡號
      → 通過：sessionStorage 只存「課程日期／時段／人數」，前往 order-success.html?from=course
      → 不通過：前往 order-failed.html?from=course（「返回結帳頁面」會回到本頁）
   ※ 展示用：姓名、電話、Email、卡號、安全碼一律不儲存、不放進網址、不送出
     （欄位刻意不設 name）。課程付款不會清空商品購物車。
   ========================================================= */
(function () {
  var MG = window.MG;
  var form = document.getElementById('course-form');
  if (!MG || !form) return;

  var PRICE = 1800;
  var MIN_QTY = 1;
  var MAX_QTY = 6;
  var BOOKING_KEY = 'mg-course-booking';

  var qty = MIN_QTY;
  var qtyGroup = form.querySelector('.cs-qty');
  var qtyOut = qtyGroup.querySelector('[data-qty]');
  var dec = qtyGroup.querySelector('[data-step="-1"]');
  var inc = qtyGroup.querySelector('[data-step="1"]');
  var qtyText = form.querySelector('[data-qty-text]');
  var unitPrice = form.querySelector('[data-unit-price]');
  var grandTotal = form.querySelector('[data-grand-total]');
  var cardInput = document.getElementById('cs-card-number');
  var dateInput = document.getElementById('cs-date');
  var slotSelect = document.getElementById('cs-slot');

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- 人數與金額 ---------- */
  function renderQty() {
    qtyOut.textContent = qty;
    qtyText.textContent = qty;
    unitPrice.textContent = MG.price(PRICE);
    grandTotal.textContent = MG.price(qty * PRICE);
    dec.setAttribute('aria-disabled', String(qty <= MIN_QTY));
    inc.setAttribute('aria-disabled', String(qty >= MAX_QTY));
  }
  qtyGroup.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-step]');
    if (!btn || btn.getAttribute('aria-disabled') === 'true') return;
    qty = Math.min(MAX_QTY, Math.max(MIN_QTY, qty + Number(btn.getAttribute('data-step'))));
    renderQty();
  });

  /* ---------- 課程日期：今天之後（本地時間） ---------- */
  (function () {
    var d = new Date();
    d.setDate(d.getDate() + Number(dateInput.getAttribute('data-min-days') || 1));
    dateInput.min = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  })();

  /* ---------- 驗證（同結帳頁） ---------- */
  form.addEventListener('invalid', function (e) {
    var el = e.target;
    var hint = el.getAttribute && el.getAttribute('data-hint');
    if (hint && el.validity.patternMismatch) el.setCustomValidity(hint);
  }, true);
  form.addEventListener('input', function (e) {
    if (e.target.setCustomValidity) e.target.setCustomValidity('');
  });
  form.addEventListener('change', function (e) {
    var el = e.target;
    if (el.tagName === 'INPUT' && el.type !== 'date' && el.value !== el.value.trim()) el.value = el.value.trim();
  });
  function hasBlankRequired() {
    var blank = false;
    Array.prototype.forEach.call(form.querySelectorAll('input[required], textarea[required]'), function (el) {
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

  function resetAll() {
    form.reset();
    qty = MIN_QTY;
    renderQty();
  }

  // 只有原生驗證通過才會觸發 submit
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // 不送出、不改網址
    if (hasBlankRequired()) { form.reportValidity(); return; }

    var ok = luhn(cardInput.value.replace(/[^0-9]/g, ''));
    if (ok) {
      // 只存課程日期／時段／人數（不含姓名、電話、Email、卡號）
      try {
        window.sessionStorage.setItem(BOOKING_KEY, JSON.stringify({ date: dateInput.value, slot: slotSelect.value, qty: qty }));
      } catch (err) { /* 私密瀏覽等情況：成功頁的「加入行事曆」維持原狀 */ }
    }
    resetAll(); // 離開前清空欄位，返回上一頁時不會留著卡號
    window.location.href = ok ? 'order-success.html?from=course' : 'order-failed.html?from=course';
  });

  // 從上一頁快取回來：欄位與人數回到初始
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) resetAll();
  });

  renderQty();
})();
