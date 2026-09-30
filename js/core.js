/* =========================================================
   core.js — 全站共用
   1. 產生 Header / 分類列 / Footer（頁面放 data-mg 佔位元素即可）
   2. 購物車（存在瀏覽器 localStorage）與「已加至購物車」側欄
   3. 彈窗（售後服務）
   4. 小工具：價格格式、網址參數、商品卡 / 拉桿 HTML
   頁面專屬程式寫在 js/pages/<page>.js，放在本檔之後載入。
   ========================================================= */
(function () {
  var MG = (window.MG = window.MG || {});

  /* ---------- helpers ---------- */
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  MG.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  };
  MG.price = function (n) { return 'NT$ ' + n; };
  MG.param = function (name) {
    try { return new URLSearchParams(window.location.search).get(name); } catch (e) { return null; }
  };

  /* ---------- 主選單與分類列（依資訊架構 flower-pro-ux-flow） ----------
     點主選單的分類 → 下方分類列換成該分類的子項目（不換頁）。
     沒有分類列的頁面（插花、結帳…）點主選單則前往 href。
     href "#" = 設計稿還沒有畫的頁面：外觀保留，點了不會跳頁。 */
  var TODO = '#';
  var NAV = [
    {
      key: 'space', label: '空間 盆花 / 佈置', href: 'products.html',
      chips: [
        { key: 'all', label: '全部商品', href: 'products.html' },
        { key: 'large', label: '大盆花', href: 'products.html?cat=large' },
        { key: 'small', label: '小盆花', href: 'products.html?cat=small' },
        { key: 'case', label: '商業空間', href: 'case.html' },
        { key: 'wedding', label: '婚禮佈置', href: 'wedding.html' },
        { key: 'party', label: '抓周派對', href: 'party.html' },
        { key: 'decor', label: '居家擺設', href: 'decor.html' }
      ]
    },
    {
      key: 'bouquet', label: '花束', href: 'bouquet.html',
      chips: [
        { key: 'date', label: '約會花束', href: 'bouquet.html?cat=date' },
        { key: 'celebrate', label: '生日 / 祝賀花束', href: 'bouquet.html?cat=celebrate' },
        { key: 'visit', label: '探望花束', href: 'bouquet.html?cat=visit' }
      ]
    },
    {
      key: 'festival', label: '節日系列', href: 'festival.html',
      chips: [
        { key: 'mother', label: '母親節花禮', href: 'festival.html?cat=mother' },
        { key: 'valentine', label: '情人節花禮', href: 'festival.html?cat=valentine' },
        { key: 'banquet', label: '婚宴 / 拍攝用花', href: 'festival.html?cat=banquet' }
      ]
    },
    {
      key: 'service', label: '探索品牌服務', href: 'index.html?nav=service',
      chips: [
        { key: 'story', label: '品牌故事與門市', href: 'index.html' },
        { key: 'arrange', label: '線上體驗插花', href: 'arrange.html' },
        { key: 'course', label: '花藝體驗課程', href: 'course.html' },
        { key: 'contact', label: '聯絡我們 / 客製化需求', href: 'contact.html' }
      ]
    }
  ];
  MG.NAV = NAV;
  function navByKey(key) {
    for (var i = 0; i < NAV.length; i++) if (NAV[i].key === key) return NAV[i];
    return null;
  }

  // 讓頁面自己切換目前的分類（例如商品列表依 ?cat= 篩選）
  MG.setActiveChip = function (key) {
    var list = document.querySelector('.chipbar__list');
    if (list && list.getAttribute('data-group') === pageGroup) pageChip = key;
    var chips = document.querySelectorAll('.chipbar .chip');
    Array.prototype.forEach.call(chips, function (el) {
      var on = el.getAttribute('data-chip') === key;
      el.classList.toggle('is-active', on);
      if (on) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
    revealActiveChip();
    updateChipEdges();
  };

  function link(cls, item, extra) {
    return '<a class="' + cls + '" href="' + item.href + '"' + (extra || '') + '>' + item.label + '</a>';
  }

  function headerHTML(variant) {
    var logo =
      '<a class="site-header__logo" href="index.html" aria-label="Multiverse Garden 首頁">' +
      '<img src="assets/logo.svg" alt="Multiverse Garden" width="230" height="28"></a>';
    var nav =
      '<nav class="site-nav" aria-label="主選單">' +
      NAV.map(function (n) { return link('site-nav__link', n, ' data-nav="' + n.key + '"'); }).join('') +
      '</nav>';
    // 搜尋：點放大鏡在左側展開膠囊輸入框（圓角 999），送出前往 products.html?q=…
    var search =
      '<form class="site-search" action="products.html" method="get" role="search">' +
      '<label class="visually-hidden" for="mg-search-input">搜尋商品</label>' +
      '<input class="site-search__input" id="mg-search-input" type="search" name="q" placeholder="搜尋商品" autocomplete="off" enterkeyhint="search" value="' + MG.esc(MG.param('q') || '') + '">' +
      '</form>';
    var icons =
      '<div class="header-icons">' +
      search +
      '<button class="icon-btn" type="button" data-search-toggle aria-label="搜尋" aria-expanded="false" aria-controls="mg-search-input">' + MG.icon('search') + '</button>' +
      '<a class="icon-btn" href="checkout.html" aria-label="購物車">' + MG.icon('cart') + '</a>' +
      '<a class="icon-btn" href="#" aria-label="會員中心">' + MG.icon('user') + '</a>' +
      '</div>';
    if (variant === 'center') {
      return '<header class="site-header site-header--center"><div class="site-header__bar">' + icons + logo + nav + '</div></header>';
    }
    return '<header class="site-header"><div class="site-header__bar">' + logo + nav + icons + '</div></header>';
  }

  function chipsHTML(group, active) {
    return group.chips.map(function (c) {
      var on = c.key === active;
      return link('chip' + (on ? ' is-active' : ''), c, ' data-chip="' + c.key + '"' + (on ? ' aria-current="page"' : ''));
    }).join('');
  }

  function chipbarHTML(group, active) {
    return (
      '<div class="chipbar">' +
      '<nav class="chipbar__list" id="mg-chips" data-group="' + group.key + '" aria-label="' + MG.esc(group.label) + '">' +
      chipsHTML(group, active) +
      '</nav>' +
      '<button class="icon-btn" type="button" data-filter-toggle aria-label="篩選商品">' + MG.icon('filter') + '</button>' +
      '</div>'
    );
  }

  /* ---------- 分類列：切換、可左右滑動 ---------- */
  var chipList = null;
  var pageGroup = 'space'; // 本頁所屬的主選單分類（data-group）
  var pageChip = null;     // 本頁在該分類裡的啟用項目（data-chip）

  function markNav(key) {
    var links = document.querySelectorAll('.site-nav__link[data-nav]');
    Array.prototype.forEach.call(links, function (a) {
      if (a.getAttribute('data-nav') === key) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  // 依捲動位置在左右邊緣加上淡出，提示還有按鈕可以滑動
  function updateChipEdges() {
    if (!chipList) return;
    var max = chipList.scrollWidth - chipList.clientWidth;
    chipList.classList.toggle('has-more-left', max > 1 && chipList.scrollLeft > 1);
    chipList.classList.toggle('has-more-right', max > 1 && chipList.scrollLeft < max - 1);
  }

  function revealActiveChip() {
    if (!chipList) return;
    var on = chipList.querySelector('.chip.is-active');
    if (!on) { chipList.scrollLeft = 0; return; }
    var left = on.offsetLeft - chipList.offsetLeft;
    var right = left + on.offsetWidth;
    if (left < chipList.scrollLeft || right > chipList.scrollLeft + chipList.clientWidth) {
      chipList.scrollLeft = Math.max(0, right - chipList.clientWidth + 24);
    }
  }

  MG.showChipGroup = function (key) {
    var group = navByKey(key);
    if (!chipList || !group) return;
    markNav(key);
    if (chipList.getAttribute('data-group') === key) return;
    var active = key === pageGroup ? pageChip : null;
    chipList.classList.add('is-switching');
    window.setTimeout(function () {
      chipList.innerHTML = chipsHTML(group, active);
      chipList.setAttribute('data-group', key);
      chipList.setAttribute('aria-label', group.label);
      revealActiveChip();
      updateChipEdges();
      chipList.classList.remove('is-switching');
    }, 150);
  };

  // 滑鼠按住拖曳也能左右滑（觸控板與觸控本來就能滑）
  function enableChipDrag(el) {
    var startX = 0, startLeft = 0, down = false, moved = false, suppress = false;
    el.addEventListener('pointerdown', function (e) {
      suppress = false;
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      if (el.scrollWidth <= el.clientWidth) return;
      down = true; moved = false;
      startX = e.clientX; startLeft = el.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) { moved = true; el.classList.add('is-dragging'); }
      if (moved) el.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      if (moved) { suppress = true; el.classList.remove('is-dragging'); }
    });
    // 拖曳結束時不要順便點到按鈕
    el.addEventListener('click', function (e) {
      if (suppress) { e.preventDefault(); e.stopPropagation(); suppress = false; }
    }, true);
    el.addEventListener('dragstart', function (e) { e.preventDefault(); });
    el.addEventListener('scroll', updateChipEdges, { passive: true });
    window.addEventListener('resize', updateChipEdges);
  }

  function footerHTML() {
    function btn(label, href) { return '<a class="btn btn--outline" href="' + (href || '#') + '">' + label + '</a>'; }
    return (
      '<footer class="site-footer"><div class="site-footer__inner">' +
      '<div class="site-footer__brand">' +
      '<img src="assets/logo.svg" alt="Multiverse Garden" width="201" height="25">' +
      '<p class="site-footer__place">' + MG.icon('location') + '<span>Taipei, Taiwan</span></p>' +
      '</div>' +
      '<dl class="site-footer__info">' +
      '<dt>ADDRESS</dt><dd>1F 132, Daan street, Daan, Taipei, Taiwan</dd>' +
      '<dt>FLOWER SHOP HOURS</dt><dd>10:00 ~ 20:00</dd>' +
      '<dt>CONTACT</dt><dd>(02) 12345667</dd>' +
      '<dt>EMAIL</dt><dd>Multiversegarden@gmail.com</dd>' +
      '</dl>' +
      '<div class="site-footer__links">' +
      '<div class="site-footer__links-row">' + btn('品牌故事', 'index.html') + btn('聯繫我們', 'contact.html') + btn('訂閱社群') + '</div>' +
      btn('門市地圖') +
      '</div>' +
      '</div></footer>'
    );
  }

  /* <div data-mg="header" data-variant="left|center" data-chip="all|large|small|case|decor"></div>
     沒有 data-chip 就不顯示分類列。Header + 分類列會包在 .site-top 裡。 */
  function mountLayout() {
    var h = document.querySelector('[data-mg="header"]');
    if (h) {
      // data-chip：有這個屬性才顯示分類列，值是本頁的啟用項目（"none" = 沒有啟用項目）
      // data-group：本頁屬於哪個主選單分類（預設「空間 盆花 / 佈置」）
      var hasChips = h.hasAttribute('data-chip');
      var chip = h.getAttribute('data-chip');
      pageGroup = navByKey(h.getAttribute('data-group')) ? h.getAttribute('data-group') : 'space';
      pageChip = chip && chip !== 'none' ? chip : null;
      // ?nav=bouquet 等：從沒有分類列的頁面點主選單過來時，直接顯示該分類
      var group = navByKey(MG.param('nav')) || navByKey(pageGroup);
      var wrap = document.createElement('div');
      wrap.className = 'site-top';
      wrap.innerHTML = headerHTML(h.getAttribute('data-variant') || 'left') +
        (hasChips ? chipbarHTML(group, group.key === pageGroup ? pageChip : null) : '');
      h.parentNode.replaceChild(wrap, h);
      chipList = wrap.querySelector('.chipbar__list');
      if (chipList) {
        markNav(group.key);
        enableChipDrag(chipList);
        revealActiveChip();
        updateChipEdges();
        // 字型載入後按鈕寬度會變，再算一次邊緣淡出
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { revealActiveChip(); updateChipEdges(); });
      }
    }
    var f = document.querySelector('[data-mg="footer"]');
    if (f) {
      var tmp = document.createElement('div');
      tmp.innerHTML = footerHTML();
      f.parentNode.replaceChild(tmp.firstChild, f);
    }
  }

  /* ---------- 商品卡 / 拉桿 HTML ---------- */
  MG.productCardHTML = function (p, opts) {
    opts = opts || {};
    var isLink = opts.link !== false;
    var tag = isLink ? 'a' : 'div';
    var cutout = opts.cutout && p.cutout
      ? '<img class="product-card__cutout" src="' + p.cutout + '" alt="" loading="lazy">'
      : '';
    return (
      '<' + tag + ' class="product-card"' + (isLink ? ' href="' + p.href + '"' : '') + ' data-id="' + MG.esc(p.id) + '">' +
      '<span class="product-card__code">' + MG.esc(p.code) + '</span>' +
      '<span class="product-card__media"><img src="' + p.img + '" alt="' + MG.esc(p.alt) + '" loading="lazy">' + cutout + '</span>' +
      '<span class="product-card__price">' + MG.price(p.price) + '</span>' +
      '</' + tag + '>'
    );
  };

  // 顯示用拉桿：value 0–100（0 = 左側文字，100 = 右側文字）
  MG.scaleHTML = function (left, right, value) {
    return (
      '<div class="mg-scale" style="--value:' + Number(value) + '" role="img" aria-label="' +
      MG.esc(left + ' ↔ ' + right + '：' + value + ' / 100') + '">' +
      '<span>' + MG.esc(left) + '</span>' +
      '<span class="mg-scale__track"><span class="mg-scale__thumb"></span></span>' +
      '<span>' + MG.esc(right) + '</span>' +
      '</div>'
    );
  };

  /* ---------- 購物車 ---------- */
  var CART_KEY = 'mg-cart';
  var memoryCart = [];
  function readCart() {
    try {
      var v = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return memoryCart.slice(); }
  }
  function writeCart(items) {
    memoryCart = items.slice();
    try { window.localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) { /* 私密瀏覽等情況 */ }
    document.dispatchEvent(new CustomEvent('mg:cart-change', { detail: { items: items } }));
  }

  MG.cart = {
    items: function () {
      return readCart().filter(function (it) { return MG.getProduct(it.id) && it.qty > 0; });
    },
    add: function (id, qty) {
      qty = qty || 1;
      var items = readCart();
      var found = null;
      items.forEach(function (it) { if (it.id === id) found = it; });
      if (found) found.qty += qty; else items.push({ id: id, qty: qty });
      writeCart(items);
    },
    setQty: function (id, qty) {
      var items = readCart()
        .map(function (it) { return it.id === id ? { id: it.id, qty: qty } : it; })
        .filter(function (it) { return it.qty > 0; });
      writeCart(items);
    },
    remove: function (id) { MG.cart.setQty(id, 0); },
    clear: function () { writeCart([]); },
    detailed: function () {
      return MG.cart.items().map(function (it) {
        var p = MG.getProduct(it.id);
        return { product: p, qty: it.qty, total: p.price * it.qty };
      });
    },
    subtotal: function () {
      return MG.cart.detailed().reduce(function (sum, it) { return sum + it.total; }, 0);
    },
    count: function () {
      return MG.cart.items().reduce(function (sum, it) { return sum + it.qty; }, 0);
    }
  };

  /* ---------- 「已加至購物車」側欄 ---------- */
  var drawer = null;
  var drawerReturnFocus = null;
  function ensureDrawer() {
    if (drawer) return drawer;
    drawer = document.createElement('aside');
    drawer.className = 'cart-drawer';
    drawer.setAttribute('aria-label', '購物車');
    drawer.tabIndex = -1;
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('[data-drawer-close]')) MG.drawer.close();
    });
    document.body.appendChild(drawer);
    return drawer;
  }
  MG.drawer = {
    open: function (product) {
      var d = ensureDrawer();
      d.innerHTML =
        '<button class="icon-btn cart-drawer__close" type="button" data-drawer-close aria-label="關閉">' + MG.icon('close') + '</button>' +
        '<div class="cart-drawer__inner">' +
        '<p class="cart-drawer__title" role="status">商品 ' + MG.esc(product.code) + ' 已加至購物車</p>' +
        MG.productCardHTML(product, { link: false }) +
        '<div class="cart-drawer__actions">' +
        '<a class="btn btn--lg btn--neutral" href="checkout.html">檢視購物車</a>' +
        '<a class="btn btn--lg btn--primary" href="checkout.html#order-form">結帳</a>' +
        '</div>' +
        '</div>';
      drawerReturnFocus = document.activeElement;
      void d.offsetWidth; // 讓滑入動畫生效
      d.classList.add('is-open');
      d.focus({ preventScroll: true });
    },
    close: function () {
      if (!drawer || !drawer.classList.contains('is-open')) return;
      drawer.classList.remove('is-open');
      if (drawerReturnFocus && drawerReturnFocus.focus) drawerReturnFocus.focus({ preventScroll: true });
    },
    isOpen: function () { return !!(drawer && drawer.classList.contains('is-open')); }
  };

  MG.addToCart = function (id, qty) {
    var p = MG.getProduct(id);
    if (!p) return;
    MG.cart.add(id, qty || 1);
    MG.drawer.open(p);
  };

  /* ---------- 彈窗 ----------
     MG.modal.open(html, { label: '售後服務', anchor: element })
     有 anchor：遮罩只蓋住該元素，卡片放在它的左上（居家擺設頁的設計）
     沒 anchor：蓋住整個畫面，卡片置中 */
  var modal = null;
  var modalAnchor = null;
  var modalReturnFocus = null;
  function placeModal() {
    if (!modal || !modalAnchor) return;
    var r = modalAnchor.getBoundingClientRect();
    modal.style.top = r.top + window.scrollY + 'px';
    modal.style.left = r.left + window.scrollX + 'px';
    modal.style.width = r.width + 'px';
    modal.style.height = r.height + 'px';
  }
  MG.modal = {
    open: function (html, opts) {
      opts = opts || {};
      if (!modal) {
        modal = document.createElement('div');
        modal.addEventListener('click', function (e) {
          if (e.target === modal || e.target.closest('[data-modal-close]')) MG.modal.close();
        });
        document.body.appendChild(modal);
      }
      modalAnchor = opts.anchor || null;
      modal.className = 'mg-modal' + (modalAnchor ? ' mg-modal--anchored' : '');
      modal.removeAttribute('style');
      modal.innerHTML =
        '<div class="mg-modal__card" role="dialog" aria-modal="true" aria-label="' + MG.esc(opts.label || '') + '" tabindex="-1">' +
        '<button class="icon-btn mg-modal__close" type="button" data-modal-close aria-label="關閉">' + MG.icon('close') + '</button>' +
        html +
        '</div>';
      placeModal();
      modalReturnFocus = document.activeElement;
      void modal.offsetWidth;
      modal.classList.add('is-open');
      if (!modalAnchor) document.documentElement.classList.add('is-scroll-locked');
      modal.querySelector('.mg-modal__card').focus({ preventScroll: true });
    },
    close: function () {
      if (!modal || !modal.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      document.documentElement.classList.remove('is-scroll-locked');
      if (modalReturnFocus && modalReturnFocus.focus) modalReturnFocus.focus({ preventScroll: true });
    }
  };

  /* ---------- 搜尋膠囊 ---------- */
  function searchParts() {
    var form = document.querySelector('.site-search');
    if (!form) return null;
    return { form: form, input: form.querySelector('input'), btn: document.querySelector('[data-search-toggle]') };
  }
  MG.search = {
    isOpen: function () { var s = searchParts(); return !!(s && s.form.classList.contains('is-open')); },
    open: function () {
      var s = searchParts();
      if (!s) return;
      s.form.classList.add('is-open');
      s.btn.setAttribute('aria-expanded', 'true');
      s.btn.setAttribute('aria-label', '送出搜尋');
      window.setTimeout(function () { s.input.focus({ preventScroll: true }); }, 60);
    },
    close: function () {
      var s = searchParts();
      if (!s || !s.form.classList.contains('is-open')) return;
      s.form.classList.remove('is-open');
      s.btn.setAttribute('aria-expanded', 'false');
      s.btn.setAttribute('aria-label', '搜尋');
      if (s.form.contains(document.activeElement)) s.btn.focus({ preventScroll: true });
    },
    submit: function () {
      var s = searchParts();
      if (!s) return;
      var q = s.input.value.trim();
      if (!q) { MG.search.close(); return; }
      window.location.href = 'products.html?q=' + encodeURIComponent(q);
    }
  };
  document.addEventListener('submit', function (e) {
    if (!e.target.classList || !e.target.classList.contains('site-search')) return;
    e.preventDefault();
    MG.search.submit();
  });

  // 售後服務：<a href="#" data-after-sales="#anchor-selector"> 或 data-after-sales（置中）
  MG.openAfterSales = function (anchor) {
    MG.modal.open(MG.AFTER_SALES_HTML, { label: '售後服務', anchor: anchor || null });
  };

  /* ---------- 全站事件 ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;

    // 搜尋：第一次點打開輸入框；已打開且有文字就送出，沒文字就收起
    var searchBtn = t.closest('[data-search-toggle]');
    if (searchBtn) {
      if (!MG.search.isOpen()) MG.search.open();
      else if (searchParts().input.value.trim()) MG.search.submit();
      else MG.search.close();
      return;
    }
    if (MG.search.isOpen() && !t.closest('.site-search') && !searchParts().input.value.trim()) MG.search.close();

    var add = t.closest('[data-add-to-cart]');
    if (add) {
      e.preventDefault();
      MG.addToCart(add.getAttribute('data-add-to-cart'));
      return;
    }

    var after = t.closest('[data-after-sales]');
    if (after) {
      e.preventDefault();
      var sel = after.getAttribute('data-after-sales');
      MG.openAfterSales(sel ? document.querySelector(sel) : null);
      return;
    }

    var filter = t.closest('[data-filter-toggle]');
    if (filter) {
      // 商品列表頁會攔截這個事件自己開篩選面板；其他頁面則前往商品列表並打開面板。
      var ev = new CustomEvent('mg:filter-toggle', { cancelable: true, detail: { trigger: filter } });
      if (document.dispatchEvent(ev)) window.location.href = 'products.html?filter=open';
      return;
    }

    // 主選單：有分類列的頁面就地切換分類，沒有的頁面照連結前往
    var navLink = t.closest('.site-nav__link[data-nav]');
    if (navLink && chipList) {
      e.preventDefault();
      MG.showChipGroup(navLink.getAttribute('data-nav'));
      return;
    }

    // 尚未設計的頁面
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();

    // 點側欄外面就收起
    if (MG.drawer.isOpen() && drawer && !drawer.contains(t)) MG.drawer.close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      MG.search.close();
      MG.drawer.close();
      MG.modal.close();
    }
  });

  window.addEventListener('resize', placeModal);

  mountLayout();
})();
