/* 花束｜Multiverse Garden
   版型同商品列表（主視覺影片＋商品區），目前沒有商品。
   ?cat=date|celebrate|visit → 分類列啟用對應項目；沒有 ?cat 就沒有啟用項目。
   主視覺影片：prefers-reduced-motion 時暫停，只顯示封面。 */
(function () {
  var MG = window.MG;
  if (!MG) return;

  var CATS = ['date', 'celebrate', 'visit'];
  var cat = MG.param('cat');
  if (CATS.indexOf(cat) !== -1) MG.setActiveChip(cat);

  var video = document.querySelector('#main .products-hero__video');
  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function syncVideo() {
    if (!video) return;
    if (reduceMotion && reduceMotion.matches) {
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
  if (reduceMotion && reduceMotion.matches) syncVideo();
  if (reduceMotion) {
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', syncVideo);
    else if (reduceMotion.addListener) reduceMotion.addListener(syncVideo);
  }
})();
