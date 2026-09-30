/* =========================================================
   聯絡我們 / 客製化需求｜Multiverse Garden
   顧客需求單 → 預約討論時間（門市預約諮詢／與花藝師線上討論）
   1. ?type=case|wedding|party|decor 預先選好需求類型
   2. 預約日期只能選明天以後
   3. 送出：原生 HTML 驗證通過後，本頁換成「需求單已送出」面板，
      「加入行事曆」下載這次預約的 .ics（標題、日期時段、地點）
   ※ 展示用：表單內容不儲存、不放進網址、不送到任何地方（欄位刻意不設 name）；
     .ics 只有標題、時間與地點，不含姓名、電話、Email。
   ========================================================= */
(function () {
  var MG = window.MG || {};
  var form = document.getElementById('contact-form');
  var result = document.querySelector('[data-contact-result]');
  if (!form || !result) return;

  var STORE_ADDRESS = '1F 132, Daan street, Daan, Taipei, Taiwan';
  var PRESET_TYPES = ['case', 'wedding', 'party', 'decor'];

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- 預約日期：今天之後（本地時間） ---------- */
  Array.prototype.forEach.call(form.querySelectorAll('input[type="date"][data-min-days]'), function (el) {
    var d = new Date();
    d.setDate(d.getDate() + Number(el.getAttribute('data-min-days')));
    el.min = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  });

  /* ---------- ?type= 預選需求類型 ---------- */
  var type = MG.param ? MG.param('type') : null;
  if (type && PRESET_TYPES.indexOf(type) !== -1) document.getElementById('ct-type').value = type;

  /* ---------- 驗證（同結帳頁） ---------- */
  // 格式不符時，瀏覽器原生驗證泡泡顯示較具體的提示
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
    if (el.tagName === 'INPUT' && el.type !== 'date' && el.value !== el.value.trim()) el.value = el.value.trim();
  });
  function hasBlankRequired() {
    var blank = false;
    Array.prototype.forEach.call(form.querySelectorAll('input[required], textarea[required]'), function (el) {
      if (!el.value.trim()) { el.value = ''; blank = true; }
    });
    return blank;
  }

  /* ---------- 行事曆 .ics（RFC 5545，台北時間） ---------- */
  function icsText(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }
  // 每行最多 75 bytes（UTF-8），超過就折行，續行以一個空白開頭
  function fold(line) {
    var out = '';
    var bytes = 0;
    Array.from(line).forEach(function (ch) {
      var cp = ch.codePointAt(0);
      var b = cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
      if (bytes + b > 75) { out += '\r\n '; bytes = 1; }
      out += ch;
      bytes += b;
    });
    return out;
  }
  function utcStamp(d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }
  // ev = { summary, date: 'YYYY-MM-DD', slot: 'HH:MM–HH:MM', location }
  function buildICS(ev) {
    var t = /^(\d{2}):(\d{2})\s*[–-]\s*(\d{2}):(\d{2})$/.exec(ev.slot);
    var day = ev.date.replace(/-/g, '');
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Multiverse Garden//Booking//ZH-TW',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE',
      'TZID:Asia/Taipei',
      'BEGIN:STANDARD',
      'DTSTART:19700101T000000',
      'TZOFFSETFROM:+0800',
      'TZOFFSETTO:+0800',
      'TZNAME:CST',
      'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      'UID:' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10) + '@multiverse-garden',
      'DTSTAMP:' + utcStamp(new Date()),
      'DTSTART;TZID=Asia/Taipei:' + day + 'T' + t[1] + t[2] + '00',
      'DTEND;TZID=Asia/Taipei:' + day + 'T' + t[3] + t[4] + '00',
      'SUMMARY:' + icsText(ev.summary),
      'LOCATION:' + icsText(ev.location),
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    return lines.map(fold).join('\r\n') + '\r\n';
  }

  /* ---------- 送出 ---------- */
  // 只有原生驗證通過才會觸發 submit
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // 不送出、不改網址
    if (hasBlankRequired()) { form.reportValidity(); return; }

    var date = document.getElementById('ct-date').value;
    var slot = document.getElementById('ct-slot').value;
    var online = document.getElementById('ct-method').value === 'online';
    var ics = buildICS({
      summary: 'Multiverse Garden 需求討論',
      date: date,
      slot: slot,
      location: online ? '線上討論' : STORE_ADDRESS
    });

    var cal = result.querySelector('[data-calendar]');
    cal.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    cal.setAttribute('download', 'multiverse-garden-consultation-' + date.replace(/-/g, '') + '.ics');

    form.reset(); // 個資不留在頁面上
    form.hidden = true;
    result.hidden = false;
    document.title = '需求單已送出｜Multiverse Garden';
    window.scrollTo(0, 0);
    document.getElementById('ct-result-title').focus({ preventScroll: true });
  });
})();
