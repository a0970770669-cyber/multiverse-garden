/* 線上插花體驗｜Multiverse Garden
   步驟切換（網址 hash）：#choose 選擇盆花 → #make 插花畫布 → #done 完成
   畫布：從左側拖曳花材新增；拖曳移動；按住 SHIFT 拖曳 = 以花朵中心調整大小與轉向；
         觸控雙指縮放／旋轉；拖出畫布即移除；選取中的花按 Delete / Backspace 移除。
   畫布使用固定的邏輯座標 664×828（Figma 畫布區），依可用空間等比縮放。 */
(function () {
  'use strict';

  var MG = window.MG || {};
  var page = document.querySelector('.page-arrange');
  if (!page) return;

  function q(sel) { return page.querySelector(sel); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function normDeg(d) { d = d % 360; if (d > 180) d -= 360; if (d <= -180) d += 360; return d; }

  var IMG = 'assets/img/arrange/';
  var STAGE_W = 664;
  var STAGE_H = 828;
  var GROW = 1.1;                 // 放到畫布上的大小 = 花材格子中的大小 × 1.1（Figma：繡球 173 → 190）
  var MIN_SCALE = 0.3;
  var MAX_SCALE = 3;
  var VASE_MOUTH = { x: 331, y: 412 }; // 花器瓶口（畫布座標）
  var HIT_TOLERANCE = 6;          // 螢幕 px：細莖也容易抓到
  var STORE_KEY = 'mg-arrange';

  // 花材：disp = 在 150×150 格子中的位置與尺寸（由 Figma 圖層與去背範圍換算）
  var FLOWERS = [
    { key: 'hydrangea',      name: '白色繡球花', disp: [11.64, 20.09, 125.36, 110.49] },
    { key: 'slipper',        name: '拖鞋蘭',     disp: [30.31, 1.30, 90.58, 160.70] },
    { key: 'amaranth-white', name: '白色尾穗莧', disp: [42.07, 22.68, 67.07, 127.32] },
    { key: 'dendrobium',     name: '藍色石斛蘭', disp: [26.42, -4.88, 99.57, 154.88] },
    { key: 'phalaenopsis',   name: '白色蝴蝶蘭', disp: [6.67, 37.60, 133.86, 69.51] },
    { key: 'amaranth-green', name: '綠色尾穗莧', disp: [26.30, 15.50, 67.37, 135.50] },
    { key: 'tulip',          name: '粉白鬱金香', disp: [43.96, 19.59, 52.15, 178.41] },
    { key: 'anthurium',      name: '白色火鶴花', disp: [32.81, 22.73, 84.59, 119.93] },
    { key: 'carnation',      name: '橘紅康乃馨', disp: [25.72, 20.61, 112.36, 129.39] },
    { key: 'sweetpea',       name: '淡紫香豌豆', disp: [32.67, 0.00, 93.77, 150.00] }
  ];
  var BY_KEY = {};
  FLOWERS.forEach(function (f) {
    f.src = IMG + 'flower-' + f.key + '.png';
    f.w = f.disp[2] * GROW;
    f.h = f.disp[3] * GROW;
    BY_KEY[f.key] = f;
  });

  var steps = { choose: q('#arr-choose'), make: q('#arr-make'), done: q('#arr-done') };
  var palette = q('[data-arr-palette]');
  var canvas = q('[data-arr-canvas]');
  var stage = q('[data-arr-stage]');
  var layer = q('[data-arr-flowers]');
  var statusEl = q('[data-arr-status]');
  var doneStage = q('[data-arr-done-stage]');
  var scene = q('[data-arr-scene]');
  var work = q('[data-arr-work]');

  var flowers = [];   // 由下到上：{ id, key, x, y, rot, scale, el }（x, y = 花朵中心，畫布座標）
  var uid = 0;
  var stageScale = 1;
  var current = null;

  /* ---------- 花材格子 ---------- */
  function pct(v) { return (v / 150 * 100).toFixed(3) + '%'; }
  palette.innerHTML = FLOWERS.map(function (f) {
    var d = f.disp;
    return '<li><button class="arr-material" type="button" data-flower="' + f.key + '" aria-label="' + f.name +
      '" aria-describedby="arr-kbd-help"><img src="' + f.src + '" alt="" draggable="false" style="left:' + pct(d[0]) +
      ';top:' + pct(d[1]) + ';width:' + pct(d[2]) + ';height:' + pct(d[3]) + '"></button></li>';
  }).join('');

  /* ---------- 透明度圖：點到透明處時穿透到下面那朵 ---------- */
  var alphaMaps = {};
  FLOWERS.forEach(function (f) {
    var img = new Image();
    img.onload = function () {
      try {
        var k = 128 / Math.max(img.naturalWidth, img.naturalHeight);
        var w = Math.max(1, Math.round(img.naturalWidth * k));
        var h = Math.max(1, Math.round(img.naturalHeight * k));
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var px = ctx.getImageData(0, 0, w, h).data;
        var a = new Uint8Array(w * h);
        for (var i = 0; i < a.length; i++) a[i] = px[i * 4 + 3];
        alphaMaps[f.key] = { w: w, h: h, a: a };
      } catch (e) { /* 無法讀取像素（例如 file://）：改用外框判斷 */ }
    };
    img.src = f.src;
  });

  function hitsFlower(f, sx, sy, tol) {
    var d = BY_KEY[f.key];
    var r = f.rot * Math.PI / 180;
    var c = Math.cos(r), s = Math.sin(r);
    var dx = sx - f.x, dy = sy - f.y;
    var lx = (dx * c + dy * s) / f.scale + d.w / 2;
    var ly = (-dx * s + dy * c) / f.scale + d.h / 2;
    var t = tol / f.scale;
    if (lx < -t || ly < -t || lx > d.w + t || ly > d.h + t) return false;
    var m = alphaMaps[f.key];
    if (!m) return lx >= 0 && ly >= 0 && lx <= d.w && ly <= d.h;
    var o = t * 0.7;
    var probes = [0, 0, t, 0, -t, 0, 0, t, 0, -t, o, o, -o, o, o, -o, -o, -o];
    for (var i = 0; i < probes.length; i += 2) {
      var px = lx + probes[i], py = ly + probes[i + 1];
      if (px < 0 || py < 0 || px >= d.w || py >= d.h) continue;
      if (m.a[Math.floor(py / d.h * m.h) * m.w + Math.floor(px / d.w * m.w)] > 48) return true;
    }
    return false;
  }
  function hitTest(sx, sy) {
    for (var i = flowers.length - 1; i >= 0; i--) {
      if (hitsFlower(flowers[i], sx, sy, HIT_TOLERANCE / stageScale)) return flowers[i];
    }
    return null;
  }

  /* ---------- 花朵元素 ---------- */
  function flowerEl(key, interactive) {
    var d = BY_KEY[key];
    var el = document.createElement('div');
    el.className = 'arr-flower';
    el.style.width = d.w + 'px';
    el.style.height = d.h + 'px';
    if (interactive) {
      el.tabIndex = 0;
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', d.name);
      el.setAttribute('aria-describedby', 'arr-kbd-help');
    }
    var img = document.createElement('img');
    img.src = d.src;
    img.alt = '';
    img.draggable = false;
    el.appendChild(img);
    return el;
  }
  function placeEl(el, f) {
    var d = BY_KEY[f.key];
    el.style.transform = 'translate(' + (f.x - d.w / 2).toFixed(2) + 'px,' + (f.y - d.h / 2).toFixed(2) + 'px) rotate(' +
      f.rot.toFixed(2) + 'deg) scale(' + f.scale.toFixed(4) + ')';
  }
  function findFlower(el) {
    for (var i = 0; i < flowers.length; i++) if (flowers[i].el === el) return flowers[i];
    return null;
  }

  function addFlower(key, x, y, rot, scale) {
    var f = { id: ++uid, key: key, x: x, y: y, rot: rot || 0, scale: scale || 1 };
    f.el = flowerEl(key, true);
    layer.appendChild(f.el);
    flowers.push(f);
    placeEl(f.el, f);
    return f;
  }
  function removeFlower(f, fromKeyboard) {
    var i = flowers.indexOf(f);
    if (i < 0) return;
    flowers.splice(i, 1);
    var next = fromKeyboard ? (flowers[i - 1] || flowers[i] || null) : null;
    f.el.remove();
    announce('已移除' + BY_KEY[f.key].name);
    save();
    if (fromKeyboard) {
      if (next) next.el.focus({ preventScroll: true });
      else { var first = palette.querySelector('.arr-material'); if (first) first.focus({ preventScroll: true }); }
    }
  }
  // 拖曳中的花移到最上層（後放 / 最後操作的在上層）
  function bringToTop(f) {
    var i = flowers.indexOf(f);
    if (i < 0 || i === flowers.length - 1) return;
    flowers.splice(i, 1);
    flowers.push(f);
    layer.appendChild(f.el);
  }

  /* ---------- 畫布縮放與座標 ---------- */
  function fitStage() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    stageScale = Math.min(1, w / STAGE_W, h / STAGE_H);
    var tx = (w - STAGE_W * stageScale) / 2;
    var ty = (h - STAGE_H * stageScale) / 2;
    stage.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) scale(' + stageScale.toFixed(4) + ')';
  }
  function toStage(clientX, clientY) {
    var r = stage.getBoundingClientRect();
    return {
      x: (clientX - r.left) / stageScale,
      y: (clientY - r.top) / stageScale,
      inside: clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom
    };
  }

  /* ---------- 畫布上的拖曳 / SHIFT 縮放旋轉 / 雙指 ---------- */
  var gesture = null;

  function capture(el, id) { try { el.setPointerCapture(id); } catch (e) { /* 已結束的指標 */ } }
  function pointsOf(g) { var pts = []; g.pointers.forEach(function (p) { pts.push(p); }); return pts; }

  function rebase(g) {
    var f = g.f;
    var pts = pointsOf(g);
    g.base = { x: f.x, y: f.y, rot: f.rot, scale: f.scale };
    if (pts.length >= 2) {
      var a = toStage(pts[0].x, pts[0].y), b = toStage(pts[1].x, pts[1].y);
      g.mode = 'pinch';
      g.ref = { mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, len: Math.max(Math.hypot(b.x - a.x, b.y - a.y), 1), ang: Math.atan2(b.y - a.y, b.x - a.x) };
      return;
    }
    var p = toStage(pts[0].x, pts[0].y);
    g.mode = g.shift ? 'transform' : 'move';
    var vx = p.x - f.x, vy = p.y - f.y;
    g.ref = { x: p.x, y: p.y, len: Math.hypot(vx, vy), ang: Math.atan2(vy, vx) };
  }

  function applyGesture(g) {
    var f = g.f, b = g.base, ref = g.ref;
    var pts = pointsOf(g);
    if (g.mode === 'pinch' && pts.length >= 2) {
      var a = toStage(pts[0].x, pts[0].y), c = toStage(pts[1].x, pts[1].y);
      var len = Math.max(Math.hypot(c.x - a.x, c.y - a.y), 1);
      f.scale = clamp(b.scale * len / ref.len, MIN_SCALE, MAX_SCALE);
      f.rot = normDeg(b.rot + (Math.atan2(c.y - a.y, c.x - a.x) - ref.ang) * 180 / Math.PI);
      f.x = b.x + ((a.x + c.x) / 2 - ref.mx);
      f.y = b.y + ((a.y + c.y) / 2 - ref.my);
    } else {
      var p = toStage(pts[0].x, pts[0].y);
      if (g.mode === 'transform') {
        // 以花朵中心為軸：與中心的距離 → 大小，角度 → 轉向
        var vx = p.x - f.x, vy = p.y - f.y;
        var dist = Math.hypot(vx, vy);
        if (ref.len < 12) {           // 從太靠近中心的位置開始：等拉開一點再開始計算
          if (dist >= 12) { g.base = { x: f.x, y: f.y, rot: f.rot, scale: f.scale }; ref.len = dist; ref.ang = Math.atan2(vy, vx); }
          return;
        }
        f.scale = clamp(b.scale * Math.max(dist, 1) / ref.len, MIN_SCALE, MAX_SCALE);
        f.rot = normDeg(b.rot + (Math.atan2(vy, vx) - ref.ang) * 180 / Math.PI);
      } else {
        f.x = b.x + (p.x - ref.x);
        f.y = b.y + (p.y - ref.y);
      }
      f.el.classList.toggle('is-leaving', !p.inside);
    }
    placeEl(f.el, f);
  }

  function endGesture() {
    var g = gesture;
    if (!g) return;
    gesture = null;
    g.pointers.forEach(function (p, id) { try { stage.releasePointerCapture(id); } catch (e) { /* noop */ } });
    g.f.el.classList.remove('is-dragging', 'is-leaving');
    return g;
  }

  stage.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (gesture) {
      // 第二根手指加入：雙指縮放 / 旋轉同一朵花
      if (e.pointerType === 'touch' && gesture.pointerType === 'touch' && gesture.pointers.size === 1) {
        e.preventDefault();
        gesture.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        capture(stage, e.pointerId);
        rebase(gesture);
      }
      return;
    }
    var p = toStage(e.clientX, e.clientY);
    var f = hitTest(p.x, p.y);
    if (!f) {
      var active = document.activeElement;
      if (active && active.classList && active.classList.contains('arr-flower')) active.blur();
      return;
    }
    e.preventDefault();
    bringToTop(f);
    f.el.focus({ preventScroll: true });
    gesture = { f: f, pointers: new Map(), pointerType: e.pointerType, shift: e.shiftKey };
    gesture.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    capture(stage, e.pointerId);
    rebase(gesture);
    f.el.classList.add('is-dragging');
  });

  stage.addEventListener('pointermove', function (e) {
    var g = gesture;
    if (!g || !g.pointers.has(e.pointerId)) return;
    if (g.pointers.size === 1 && e.shiftKey !== g.shift) {   // 拖曳途中按下 / 放開 SHIFT
      g.shift = e.shiftKey;
      rebase(g);
    }
    g.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    applyGesture(g);
  });

  function onStageUp(e) {
    var g = gesture;
    if (!g || !g.pointers.has(e.pointerId)) return;
    if (g.pointers.size > 1) {        // 放開其中一指：剩下的那指繼續拖曳
      g.pointers.delete(e.pointerId);
      try { stage.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
      rebase(g);
      return;
    }
    endGesture();
    var f = g.f;
    if (e.type === 'pointerup') {
      var p = toStage(e.clientX, e.clientY);
      var out = !p.inside || f.x < 0 || f.y < 0 || f.x > STAGE_W || f.y > STAGE_H;
      if (out) { removeFlower(f); return; }
    }
    save();
  }
  stage.addEventListener('pointerup', onStageUp);
  stage.addEventListener('pointercancel', onStageUp);
  stage.addEventListener('lostpointercapture', function (e) {
    if (gesture && gesture.pointers.has(e.pointerId) && gesture.pointers.size === 1) { endGesture(); save(); }
  });

  /* ---------- 鍵盤：方向鍵移動、Shift+方向鍵 大小 / 轉向、Delete 移除 ---------- */
  layer.addEventListener('keydown', function (e) {
    var el = e.target.closest ? e.target.closest('.arr-flower') : null;
    var f = el && findFlower(el);
    if (!f) return;
    var k = e.key;
    if (k === 'Delete' || k === 'Backspace') {
      e.preventDefault();
      removeFlower(f, true);
      return;
    }
    var dx = k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : 0;
    var dy = k === 'ArrowUp' ? -1 : k === 'ArrowDown' ? 1 : 0;
    if (!dx && !dy) return;
    e.preventDefault();
    if (e.shiftKey) {
      if (dx) f.rot = normDeg(f.rot + dx * 5);
      if (dy) f.scale = clamp(f.scale * (dy < 0 ? 1.05 : 1 / 1.05), MIN_SCALE, MAX_SCALE);
    } else {
      f.x = clamp(f.x + dx * 8, 0, STAGE_W);
      f.y = clamp(f.y + dy * 8, 0, STAGE_H);
    }
    placeEl(f.el, f);
    save();
  });

  /* ---------- 從花材拖到畫布（點一下或 Enter 也可加入） ---------- */
  var drag = null;
  var suppressClickUntil = 0;

  palette.addEventListener('pointerdown', function (e) {
    var btn = e.target.closest('.arr-material');
    if (!btn || drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { key: btn.getAttribute('data-flower'), btn: btn, id: e.pointerId, x0: e.clientX, y0: e.clientY, ghost: null };
    capture(btn, e.pointerId);
  });

  palette.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.ghost) {
      if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 6) return;
      var d = BY_KEY[drag.key];
      var ghost = document.createElement('div');
      ghost.className = 'arr-ghost';
      ghost.style.width = d.w * stageScale + 'px';
      ghost.style.height = d.h * stageScale + 'px';
      ghost.innerHTML = '<img src="' + d.src + '" alt="">';
      document.body.appendChild(ghost);
      drag.ghost = ghost;
      drag.gw = d.w * stageScale;
      drag.gh = d.h * stageScale;
      document.documentElement.classList.add('arr-is-dragging');
    }
    drag.ghost.style.transform = 'translate(' + (e.clientX - drag.gw / 2).toFixed(1) + 'px,' + (e.clientY - drag.gh / 2).toFixed(1) + 'px)';
    drag.ghost.classList.toggle('is-outside', !toStage(e.clientX, e.clientY).inside);   // 放開不會加入
  });

  function endPaletteDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dd = drag;
    drag = null;
    try { dd.btn.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
    if (!dd.ghost) return;                 // 沒有拖動：交給 click
    dd.ghost.remove();
    document.documentElement.classList.remove('arr-is-dragging');
    suppressClickUntil = Date.now() + 400;
    if (e.type !== 'pointerup') return;
    var p = toStage(e.clientX, e.clientY);
    if (!p.inside) return;
    var f = addFlower(dd.key, p.x, p.y);
    f.el.focus({ preventScroll: true });
    announce('已加入' + BY_KEY[dd.key].name);
    save();
  }
  palette.addEventListener('pointerup', endPaletteDrag);
  palette.addEventListener('pointercancel', endPaletteDrag);

  palette.addEventListener('click', function (e) {
    var btn = e.target.closest('.arr-material');
    if (!btn || Date.now() < suppressClickUntil) return;
    var d = BY_KEY[btn.getAttribute('data-flower')];
    var n = flowers.length;
    var x = VASE_MOUTH.x + [0, -28, 28, -14, 14][n % 5];
    var y = VASE_MOUTH.y - d.h * 0.25 - (n % 3) * 10;
    addFlower(d.key, x, y);
    announce('已將' + d.name + '加到花器上');
    save();
  });

  palette.addEventListener('dragstart', function (e) { e.preventDefault(); });
  stage.addEventListener('dragstart', function (e) { e.preventDefault(); });

  /* ---------- 暫存（重新整理或返回上一頁時保留作品） ---------- */
  function r2(v) { return Math.round(v * 100) / 100; }
  function save() {
    try {
      window.sessionStorage.setItem(STORE_KEY, JSON.stringify(flowers.map(function (f) {
        return [f.key, r2(f.x), r2(f.y), r2(f.rot), Math.round(f.scale * 10000) / 10000];
      })));
    } catch (e) { /* 私密瀏覽等情況 */ }
  }
  function restore() {
    var list;
    try { list = JSON.parse(window.sessionStorage.getItem(STORE_KEY) || '[]'); } catch (e) { return; }
    if (!Array.isArray(list)) return;
    list.forEach(function (it) {
      if (!Array.isArray(it) || !BY_KEY[it[0]]) return;
      var n = it.slice(1, 5).map(Number);
      if (n.length < 4 || n.some(function (v) { return !isFinite(v); })) return;
      addFlower(it[0], clamp(n[0], 0, STAGE_W), clamp(n[1], 0, STAGE_H), normDeg(n[2]), clamp(n[3], MIN_SCALE, MAX_SCALE));
    });
  }

  function announce(msg) {
    if (!statusEl) return;
    statusEl.textContent = '';
    window.setTimeout(function () { statusEl.textContent = msg; }, 30);
  }

  /* ---------- 完成畫面：作品等比例放到背景照片上（花器對齊 Figma 完成畫面） ---------- */
  function fitScene() {
    var w = doneStage.clientWidth, h = doneStage.clientHeight;
    if (!w || !h) return;
    var s = Math.max(w / 1376, h / 768);   // 等同 object-fit: cover，置中
    scene.style.transform = 'translate(' + ((w - 1376 * s) / 2).toFixed(2) + 'px,' + ((h - 768 * s) / 2).toFixed(2) + 'px) scale(' + s.toFixed(4) + ')';
  }
  function renderDone() {
    work.innerHTML = '';
    var vase = document.createElement('img');
    vase.className = 'arr-vase';
    vase.src = IMG + 'vase-shell.png';
    vase.alt = '';
    work.appendChild(vase);
    flowers.forEach(function (f) {
      var el = flowerEl(f.key, false);
      work.appendChild(el);
      placeEl(el, f);
    });
    work.setAttribute('aria-label', flowers.length
      ? '您完成的盆花作品：米色貝殼陶瓶中插了 ' + flowers.length + ' 枝花材'
      : '您完成的盆花作品：米色貝殼陶瓶');
    fitScene();
  }

  /* ---------- 分享彈窗 ---------- */
  function openShare() {
    var url = window.location.href.split('#')[0];
    var text = '我在 Multiverse Garden 完成了一盆線上插花作品';
    var links = [
      { label: '開啟 Instagram（另開新分頁）', icon: 'share-instagram.svg', href: 'https://www.instagram.com/' },
      { label: '分享到 Facebook（另開新分頁）', icon: 'share-facebook.svg', href: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) },
      { label: '分享到 Threads（另開新分頁）', icon: 'share-threads.svg', href: 'https://www.threads.net/intent/post?text=' + encodeURIComponent(text + ' ' + url) }
    ];
    var html = '<p class="share-card__title">點選分享社群</p><ul class="share-card__list">' + links.map(function (l) {
      return '<li><a class="share-card__link" href="' + MG.esc(l.href) + '" target="_blank" rel="noopener" aria-label="' + l.label +
        '"><img src="' + IMG + l.icon + '" width="60" height="60" alt=""></a></li>';
    }).join('') + '</ul>';
    // 桌機依 Figma：遮罩只蓋作品區（Header 不變暗）；手機改為全畫面置中
    var wide = window.matchMedia('(min-width: 769px)').matches;
    MG.modal.open(html, { label: '分享至社群', anchor: wide ? steps.done : null });
    var card = document.querySelector('.mg-modal .mg-modal__card');
    if (card) card.classList.add('share-card');
  }

  /* ---------- 步驟切換（hash） ---------- */
  function stepFromHash() {
    var h = window.location.hash.replace('#', '');
    return steps[h] ? h : 'choose';
  }
  function showStep(name, initial) {
    if (!steps[name]) name = 'choose';
    if (name === current) return;
    if (gesture) endGesture();
    if (MG.modal && MG.modal.close) MG.modal.close();
    Object.keys(steps).forEach(function (k) { steps[k].hidden = k !== name; });
    current = name;
    if (name === 'make') fitStage();
    if (name === 'done') renderDone();
    if (!initial) window.scrollTo(0, 0);
  }

  q('[data-arr-finish]').addEventListener('click', function () { window.location.hash = 'done'; });
  q('[data-arr-share]').addEventListener('click', openShare);
  window.addEventListener('hashchange', function () { showStep(stepFromHash()); });

  if ('ResizeObserver' in window) {
    new ResizeObserver(fitStage).observe(canvas);
    new ResizeObserver(fitScene).observe(doneStage);
  } else {
    window.addEventListener('resize', function () { fitStage(); fitScene(); });
  }

  restore();
  showStep(stepFromHash(), true);

  // 驗證與除錯用
  MG.arrange = {
    flowers: function () { return flowers.map(function (f) { return { key: f.key, x: f.x, y: f.y, rot: f.rot, scale: f.scale }; }); },
    add: function (key, x, y, rot, scale) { var f = addFlower(key, x, y, rot, scale); save(); return f.id; },
    clear: function () { flowers.slice().forEach(function (f) { f.el.remove(); }); flowers.length = 0; save(); },
    stageScale: function () { return stageScale; }
  };
})();
