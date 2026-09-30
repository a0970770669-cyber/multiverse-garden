/* =========================================================
   訂單成立｜Multiverse Garden
   ─ 一般商品訂單：不需要程式（購物車已在結帳頁清空；
     「訂閱我們／加入行事曆／查詢訂單」沒有設計稿，href="#" 由 core.js 攔下）。
   ─ 花藝體驗課程（course.html 付款成功，網址帶 ?from=course）：
     讀 sessionStorage 的課程日期／時段／人數，
     「加入行事曆」改成下載該課程的 .ics（標題、日期時段、門市地址）。
   ========================================================= */
(function () {
  var MG = window.MG || {};
  if (!MG.param || MG.param('from') !== 'course') return;

  var BOOKING_KEY = 'mg-course-booking';
  var SLOTS = ['10:00–12:00', '13:00–15:00', '15:00–17:00', '17:00–19:00'];
  var STORE_ADDRESS = '1F 132, Daan street, Daan, Taipei, Taiwan';

  var booking = null;
  try { booking = JSON.parse(window.sessionStorage.getItem(BOOKING_KEY) || 'null'); } catch (e) { booking = null; }
  if (!booking ||
      !/^\d{4}-\d{2}-\d{2}$/.test(booking.date) ||
      SLOTS.indexOf(booking.slot) === -1 ||
      !(booking.qty >= 1 && booking.qty <= 6)) return;

  var link = document.querySelector('[data-calendar]');
  if (!link) return;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
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

  var t = /^(\d{2}):(\d{2})\s*[–-]\s*(\d{2}):(\d{2})$/.exec(booking.slot);
  var day = booking.date.replace(/-/g, '');
  var ics = [
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
    'SUMMARY:' + icsText('Multiverse Garden 花藝體驗課程'),
    'LOCATION:' + icsText(STORE_ADDRESS),
    'DESCRIPTION:' + icsText('人數：' + booking.qty + ' 人'),
    'END:VEVENT',
    'END:VCALENDAR'
  ].map(fold).join('\r\n') + '\r\n';

  link.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  link.setAttribute('download', 'multiverse-garden-course-' + day + '.ics');
})();
