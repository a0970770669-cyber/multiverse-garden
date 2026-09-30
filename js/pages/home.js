/* =========================================================
   首頁｜Multiverse Garden
   1. 主視覺：一段 5 秒的影片（牆上的花長出來），平常停在第一格＝設計稿的那張照片。
      滑鼠進到主視覺就往前播、離開就倒帶回原狀；播到滿開會停住，不循環。
   2. PRODUCTS：由右往左的無限循環跑馬燈（約 35px/秒）。滑鼠移上或鍵盤聚焦時暫停；
      可用滑鼠拖曳、觸控滑動或觸控板左右捲動，拖曳時不會觸發連結，放開後繼續移動。
   prefers-reduced-motion: reduce → 主視覺維持靜態、跑馬燈不自動移動（仍可手動左右滑）。
   ========================================================= */
(function () {
  'use strict';

  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reducedMotion() { return !!(motionQuery && motionQuery.matches); }
  function onMotionChange(fn) {
    if (!motionQuery) return;
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', fn);
    else if (motionQuery.addListener) motionQuery.addListener(fn);
  }

  /* ---------- 1. 主視覺：滑鼠靠近，花從牆面長出來 ---------- */
  /* 主視覺是一段 5 秒的影片（牆上的花慢慢長出來），平常停在第一格＝設計稿的那張照片。
     滑鼠進到主視覺就往前播（花長出來），離開就往回倒帶（花縮回牆面），所以它同時是
     「靜態的照片」也是「會回應滑鼠的動態」。播到滿開就停住，不會一直循環。
     觸控裝置沒有滑鼠：點一下播、再點一下倒回。開啟「減少動態效果」時完全不播。 */
  function initHeroBloom() {
    // 觸發範圍就是照片本身（滑鼠碰到牆面才開花），不含左邊的文字欄
    var area = document.querySelector('.home-hero__visual');
    var video = area && area.querySelector('.home-hero__video');
    if (!video) return;

    var REWIND = 1.8;     // 倒帶速度（正常播放的倍率）
    var open = false;     // 目前是「要開花」還是「要收回」
    var raf = 0;
    var last = 0;
    var seeking = false;  // 上一個 seek 還沒完成就不要再送下一個（Safari 才不會卡）

    function duration() {
      var d = video.duration;
      return d && isFinite(d) ? d : 0;
    }
    function stopRewind() {
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
      last = 0;
    }
    // 倒帶：影片沒辦法反著播，所以一格一格把時間往回推。
    // 等上一格 seek 完成才送下一格，瀏覽器跟得上多少就跑多少，不會塞車。
    video.addEventListener('seeking', function () { seeking = true; });
    video.addEventListener('seeked', function () { seeking = false; });
    function rewind(now) {
      raf = 0;
      if (open) return;
      if (seeking) { raf = window.requestAnimationFrame(rewind); return; }
      var dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      var t = video.currentTime - dt * REWIND;
      if (t <= 0) {
        video.currentTime = 0;
        last = 0;
        area.classList.remove('is-blooming');   // 回到清晰的照片
        return;
      }
      video.currentTime = t;
      raf = window.requestAnimationFrame(rewind);
    }

    function bloom() {
      if (reducedMotion()) return;
      open = true;
      area.classList.add('is-blooming');   // 換成影片（會動）
      stopRewind();
      if (duration() && video.currentTime >= duration() - 0.05) return;   // 已經滿開
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* 不能自動播就維持靜態 */ });
    }
    function close() {
      open = false;
      video.pause();
      if (video.currentTime > 0) {
        if (!raf) raf = window.requestAnimationFrame(rewind);
      } else {
        area.classList.remove('is-blooming');
      }
    }

    area.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') bloom();
    });
    area.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') close();
    });
    // 觸控：點一下開、再點一下收
    area.addEventListener('pointerup', function (e) {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') return;
      if (open) close(); else bloom();
    });
    // 播到最後就停在滿開的那一格
    video.addEventListener('ended', function () { video.pause(); });
    onMotionChange(function () { if (reducedMotion()) close(); });
  }

  /* ---------- 2. PRODUCTS 跑馬燈 ---------- */
  function initMarquee() {
    var section = document.querySelector('.home-products');
    var viewport = section && section.querySelector('.home-products__viewport');
    var track = viewport && viewport.querySelector('.home-products__list');
    if (!track || !track.children.length) return;

    var SPEED = 35;           // 自動移動速度（px/秒，內容由右往左）
    var DRAG_THRESHOLD = 6;   // 移動超過 6px 才算拖曳，否則當作點擊
    var originals = [].slice.call(track.children);

    // 複製兩組（共三組）：一組寬 4 × (320 + 24) = 1376，比 1440 的畫面窄，三組才能無縫循環。
    // 複製的項目不給輔助科技讀取、也不能用 Tab 聚焦。
    for (var n = 0; n < 2; n++) {
      originals.forEach(function (li) {
        var copy = li.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        [].forEach.call(copy.querySelectorAll('a, button, [tabindex]'), function (el) {
          el.setAttribute('tabindex', '-1');
        });
        track.appendChild(copy);
      });
    }
    section.classList.add('is-marquee');

    var setWidth = 0;
    var offset = 0;                               // 0 ≤ offset < setWidth
    var velocity = reducedMotion() ? 0 : SPEED;   // 目前速度（px/秒）
    var hovering = false;
    var focused = false;
    var inView = true;
    var drag = null;
    var pressing = false;   // 滑鼠／手指按下中（這時的聚焦是點擊造成的，不當作鍵盤聚焦）
    var releasedAt = -1e9;  // 觸控點擊的聚焦會在放開後才發生，所以放開後 400ms 內也算
    var suppressClick = false;
    var raf = 0;
    var lastTime = 0;

    function wrap(x) { return setWidth > 0 ? ((x % setWidth) + setWidth) % setWidth : 0; }
    function render() { track.style.transform = 'translate3d(' + (-offset).toFixed(2) + 'px, 0, 0)'; }
    function measure() {
      setWidth = track.children[originals.length].offsetLeft - track.children[0].offsetLeft;
      offset = wrap(offset);
      render();
    }
    function targetVelocity() {
      return hovering || focused || drag || reducedMotion() ? 0 : SPEED;
    }

    function tick(now) {
      raf = 0;
      var dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0;
      lastTime = now;
      if (!drag) {
        // 暫停／恢復與放開後的慣性：速度平滑地靠近目標值，不會突然停住或暴衝
        var target = targetVelocity();
        velocity += (target - velocity) * (1 - Math.pow(0.03, dt));
        if (Math.abs(velocity - target) < 0.5) velocity = target;
        if (velocity) {
          offset = wrap(offset + velocity * dt);
          render();
        }
      }
      if (inView && (velocity || targetVelocity())) raf = window.requestAnimationFrame(tick);
      else lastTime = 0;
    }
    function run() {
      if (raf || !inView) return;
      lastTime = 0;
      raf = window.requestAnimationFrame(tick);
    }

    /* 拖曳（滑鼠）／滑動（觸控） */
    viewport.addEventListener('pointerdown', function (e) {
      pressing = true;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      suppressClick = false;
      velocity = 0;
      drag = { id: e.pointerId, startX: e.clientX, startOffset: offset, moved: false, lastX: e.clientX, lastT: e.timeStamp, v: 0 };
    });
    viewport.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.startX;
      if (!drag.moved) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        drag.moved = true;
        viewport.classList.add('is-dragging');
        try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* 不支援時照常拖曳 */ }
      }
      offset = wrap(drag.startOffset - dx);
      render();
      var dtMs = e.timeStamp - drag.lastT;
      if (dtMs > 0) drag.v = drag.v * 0.7 + ((drag.lastX - e.clientX) / dtMs * 1000) * 0.3;
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
    });
    function endDrag(e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.moved) {
        viewport.classList.remove('is-dragging');
        if (e.type === 'pointerup') {
          suppressClick = true;
          window.setTimeout(function () { suppressClick = false; }, 0);
        }
        var held = e.timeStamp - drag.lastT > 120;   // 停住一下才放開 → 不給慣性
        velocity = reducedMotion() || held ? 0 : Math.max(-3000, Math.min(3000, drag.v));
      }
      drag = null;
      run();
    }
    // 在 window 上監聽：就算在 viewport 外放開也會結束拖曳
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    function released() {
      if (!pressing) return;
      pressing = false;
      releasedAt = window.performance.now();
    }
    window.addEventListener('pointerup', released);
    window.addEventListener('pointercancel', released);
    // 拖曳後放開時不要觸發連結
    viewport.addEventListener('click', function (e) {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    }, true);
    viewport.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* 觸控板／Shift + 滾輪 左右捲動；一般直向滾動照常捲頁面 */
    viewport.addEventListener('wheel', function (e) {
      var dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
      if (!dx) return;
      e.preventDefault();
      if (e.deltaMode === 1) dx *= 16;
      else if (e.deltaMode === 2) dx *= viewport.clientWidth;
      velocity = 0;
      offset = wrap(offset + dx);
      render();
      run();
    }, { passive: false });

    /* 滑鼠移上暫停 */
    viewport.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') hovering = true;
    });
    viewport.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      hovering = false;
      run();
    });

    /* 鍵盤（或輔助科技）聚焦：暫停，並把聚焦的項目完整移進畫面。
       按下滑鼠／手指時造成的聚焦不算，否則拖曳放開後會一直停住。 */
    viewport.addEventListener('focusin', function (e) {
      if (pressing || window.performance.now() - releasedAt < 400) return;
      focused = true;
      var li = e.target.closest ? e.target.closest('li') : null;
      if (!li || originals.indexOf(li) === -1) return;
      var x = li.offsetLeft - track.children[0].offsetLeft;
      var w = li.offsetWidth;
      var vw = viewport.clientWidth;
      if (x < offset || x + w > offset + vw) {
        velocity = 0;
        offset = Math.max(0, x - (vw - w) / 2);
        render();
      }
    });
    viewport.addEventListener('focusout', function (e) {
      if (e.relatedTarget && viewport.contains(e.relatedTarget)) return;
      focused = false;
      run();
    });
    // 位置由 transform 控制；瀏覽器若為了顯示聚焦元素而捲動 viewport，就歸零
    viewport.addEventListener('scroll', function () {
      if (viewport.scrollLeft) viewport.scrollLeft = 0;
    });

    /* 不在畫面上時停止計算 */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[entries.length - 1].isIntersecting;
        if (inView) run();
      }).observe(viewport);
    }
    window.addEventListener('resize', measure);
    onMotionChange(function () {
      if (reducedMotion()) velocity = 0;
      run();
    });

    measure();
    run();
  }

  initHeroBloom();
  initMarquee();
})();
