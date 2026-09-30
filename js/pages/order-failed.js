/* 付款失敗｜Multiverse Garden
   ─ 一般商品訂單：購物車保留不動，「返回結帳頁面」連回 checkout.html。
   ─ 花藝體驗課程（course.html 付款失敗，網址帶 ?from=course）：
     「返回結帳頁面」改回 course.html。
   「訂閱我們」沒有設計稿，href="#" 由 core.js 攔下。 */
(function () {
  var MG = window.MG || {};
  if (!MG.param || MG.param('from') !== 'course') return;
  var back = document.querySelector('[data-back-to-checkout]');
  if (back) back.setAttribute('href', 'course.html');
})();
