/* =============================================================================
   CNT Quiz — 公共外壳（Header / 分类导航条 / Footer / 搜索浮层 / 主题 / 语言 / 音效）
   ============================================================================= */
(function (global) {
  'use strict';

  var I18N = global.CNTI18n;
  var Data = global.CNTData;
  var t = function (k, f) { return I18N.t(k, f); };
  var pick = function (o, f) { return I18N.pick(o, f); };

  /* ------------------------------------------------------------------
     主题
     ------------------------------------------------------------------ */
  function getTheme() {
    try {
      var saved = localStorage.getItem('cnt_theme');
      if (saved) return saved;
    } catch (e) {}
    return 'dark';
  }
  function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    try { localStorage.setItem('cnt_theme', mode); } catch (e) {}
    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.innerHTML = mode === 'light' ? global.CNTArt.iconSun(19) : global.CNTArt.iconMoon(19);
      btn.setAttribute('aria-label', mode === 'light' ? t('nav.themeDark') : t('nav.themeLight'));
      btn.setAttribute('title', mode === 'light' ? t('nav.themeDark') : t('nav.themeLight'));
    }
  }

  /* ------------------------------------------------------------------
     音效（WebAudio 合成，无需外部素材）
     ------------------------------------------------------------------ */
  var SFX = (function () {
    var ctx = null;
    var muted = false;
    function ac() {
      if (!ctx) {
        var AC = global.AudioContext || global.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
      return ctx;
    }
    function tone(freq, dur, type, gain, delay) {
      var c = ac();
      if (!c || muted) return;
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, c.currentTime + (delay || 0));
      g.gain.exponentialRampToValueAtTime(gain || 0.08, c.currentTime + (delay || 0) + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (delay || 0) + dur);
      o.connect(g); g.connect(c.destination);
      o.start(c.currentTime + (delay || 0));
      o.stop(c.currentTime + (delay || 0) + dur + 0.05);
    }
    return {
      setMuted: function (m) { muted = !!m; },
      isMuted: function () { return muted; },
      click: function () { tone(520, 0.06, 'triangle', 0.05); },
      correct: function () { tone(660, 0.12, 'sine', 0.07); tone(990, 0.18, 'sine', 0.06, 0.09); },
      wrong: function () { tone(200, 0.16, 'sawtooth', 0.05); },
      finish: function () { tone(523, 0.14, 'sine', 0.07); tone(659, 0.14, 'sine', 0.07, 0.11); tone(784, 0.26, 'sine', 0.07, 0.22); }
    };
  })();

  /* ------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------ */
  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-show'); }, 2600);
  }

  /* ------------------------------------------------------------------
     Header
     ------------------------------------------------------------------ */
  function headerHTML() {
    var lang = I18N.getLang();
    var cur = null;
    for (var i = 0; i < I18N.langs.length; i++) {
      if (I18N.langs[i].code === lang) cur = I18N.langs[i];
    }
    var langBtns = I18N.langs.map(function (l) {
      return '<button type="button" data-lang="' + l.code + '"' + (l.code === lang ? ' class="is-current"' : '') + '>' +
        '<span>' + l.label + '</span><span style="opacity:.55;font-size:12px">' + l.flag + '</span></button>';
    }).join('');

    return '' +
      '<header class="navbar-root">' +
        '<div class="container navbar-inner">' +
          '<a class="navbar-logo-link" href="index.html" aria-label="CNT Quiz home">' +
            global.CNTArt.logoMark({ uid: 'hdr' + Math.random().toString(36).slice(2, 6) }) +
          '</a>' +
          '<div class="nav-cluster">' +
            '<div class="nav-cluster__top">' +
              '<div style="position:relative">' +
                '<button type="button" class="lang-trigger" id="langTrigger" aria-haspopup="true" aria-expanded="false">' +
                  global.CNTArt.iconGlobe(16) + '<span>' + (cur ? cur.label : 'English') + '</span><span class="caret">▾</span>' +
                '</button>' +
                '<div class="lang-menu" id="langMenu" hidden>' + langBtns + '</div>' +
              '</div>' +
              '<button type="button" class="icon-btn" id="themeToggle" aria-label="' + t('nav.themeLight') + '" title="' + t('nav.themeLight') + '">' + global.CNTArt.iconMoon(19) + '</button>' +
              '<button type="button" class="icon-btn" id="searchOpen" aria-label="' + t('nav.search') + '" title="' + t('nav.search') + '">' + global.CNTArt.iconSearch(19) + '</button>' +
            '</div>' +
            '<form class="subscribe-row" id="subscribeForm" novalidate>' +
              '<input class="email-input" type="email" id="emailInput" placeholder="' + t('nav.emailPlaceholder') + '" aria-label="' + t('nav.emailPlaceholder') + '">' +
              '<button class="btn-subscribe" type="submit">' + t('nav.subscribe') + '</button>' +
            '</form>' +
          '</div>' +
        '</div>' +
      '</header>';
  }

  /* ------------------------------------------------------------------
     分类导航条
     ------------------------------------------------------------------ */
  function genreBarHTML(activeCat) {
    var tabs = Data.categories.map(function (c) {
      var isActive = c.id === activeCat ? ' is-active' : '';
      return '<a class="navbar-genres__tab' + isActive + '" href="index.html#cat-' + c.id + '" data-cat="' + c.id + '">' +
        pick(c.name) + '</a>';
    }).join('');
    var more = '<a class="navbar-genres__tab" href="index.html#all"><span data-i18n="nav.more">More</span> <span class="caret">▾</span></a>';
    return '<nav class="navbar-genres" aria-label="Quiz categories"><div class="container navbar-genres__inner">' + tabs + more + '</div></nav>';
  }

  /* ------------------------------------------------------------------
     Footer
     ------------------------------------------------------------------ */
  function footerBandHTML() {
    return '' +
      '<section class="footer-band">' +
        '<div class="container footer-band__inner">' +
          '<div class="footer-band__logo">' + global.CNTArt.logoMark({ uid: 'ftr', text: 'CNT', text2: 'Quiz' }) + '</div>' +
          '<h2 class="footer-band__heading">' + t('footer.heading') + '</h2>' +
          '<p class="footer-band__text">' + t('footer.text') + '</p>' +
          '<div class="footer-band__links">' +
            '<a href="#about">' + t('footer.about') + '</a><span class="sep">•</span>' +
            '<a href="#contact">' + t('footer.contact') + '</a><span class="sep">•</span>' +
            '<a href="#privacy">' + t('footer.privacy') + '</a><span class="sep">•</span>' +
            '<a href="#terms">' + t('footer.terms') + '</a><span class="sep">•</span>' +
            '<a href="#faq">' + t('footer.faq') + '</a>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<footer class="site-footer"><div class="container">' +
        '<div class="legal">' +
          '<span>' + t('footer.copyright') + '</span><span class="sep">•</span>' +
          '<span>' + t('footer.madeWith') + '</span>' +
        '</div>' +
      '</div></footer>';
  }

  /* ------------------------------------------------------------------
     搜索浮层
     ------------------------------------------------------------------ */
  function searchOverlayHTML() {
    return '' +
      '<div class="search-overlay" id="searchOverlay" role="dialog" aria-modal="true" aria-label="' + t('nav.search') + '">' +
        '<div class="search-panel">' +
          '<div class="search-panel__top">' +
            global.CNTArt.iconSearch(18) +
            '<input class="search-panel__input" id="searchInput" type="search" placeholder="' + t('search.placeholder') + '" autocomplete="off">' +
            '<button class="icon-btn" id="searchClose" aria-label="' + t('search.close') + '">✕</button>' +
          '</div>' +
          '<div class="search-results" id="searchResults"></div>' +
        '</div>' +
      '</div>';
  }

  /* ------------------------------------------------------------------
     渲染整站外壳
     ------------------------------------------------------------------ */
  function mount(opts) {
    opts = opts || {};
    var head = document.getElementById('siteHeader');
    if (head) head.innerHTML = headerHTML();
    var bar = document.getElementById('genreBar');
    if (bar) bar.outerHTML = genreBarHTML(opts.activeCat);
    var foot = document.getElementById('siteFooter');
    if (foot) foot.innerHTML = footerBandHTML();
    var so = document.getElementById('searchHost');
    if (so) so.innerHTML = searchOverlayHTML();

    setTheme(getTheme());
    wire();
    if (opts.onReady) opts.onReady();
  }

  /* ------------------------------------------------------------------
     事件绑定
     ------------------------------------------------------------------ */
  function wire() {
    /* 语言下拉 */
    var trigger = document.getElementById('langTrigger');
    var menu = document.getElementById('langMenu');
    if (trigger && menu) {
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menu.hasAttribute('hidden');
        if (open) { menu.removeAttribute('hidden'); trigger.setAttribute('aria-expanded', 'true'); }
        else { menu.setAttribute('hidden', ''); trigger.setAttribute('aria-expanded', 'false'); }
      });
      menu.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-lang]');
        if (!btn) return;
        e.stopPropagation();
        menu.setAttribute('hidden', '');
        trigger.setAttribute('aria-expanded', 'false');
        I18N.setLang(btn.getAttribute('data-lang'));
      });
      document.addEventListener('click', function (e) {
        if (!menu.hasAttribute('hidden') && !menu.contains(e.target)) {
          menu.setAttribute('hidden', '');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    /* 主题切换 */
    var themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        setTheme(next);
        SFX.click();
      });
    }

    /* 订阅 */
    var form = document.getElementById('subscribeForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = document.getElementById('emailInput');
        var val = (input && input.value || '').trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) {
          toast(I18N.getLang() === 'zh' ? '请输入有效的邮箱地址' : 'Please enter a valid email address');
          if (input) input.focus();
          return;
        }
        toast(I18N.getLang() === 'zh' ? '订阅成功！每周一封新测验。' : 'Subscribed! One new quiz every Monday.');
        input.value = '';
        SFX.correct();
      });
    }

    /* 搜索浮层 */
    var openBtn = document.getElementById('searchOpen');
    var overlay = document.getElementById('searchOverlay');
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var closeBtn = document.getElementById('searchClose');

    function renderResults(term) {
      if (!results) return;
      var list = Data.search(term);
      if (!term) {
        results.innerHTML = '<div class="search-empty">' + t('search.placeholder') + '</div>';
        return;
      }
      if (!list.length) {
        results.innerHTML = '<div class="search-empty"><strong>' + t('search.noResults') + '</strong><br>' + t('search.noResultsHint') + '</div>';
        return;
      }
      results.innerHTML = list.map(function (q) {
        var c = Data.catById(q.cat);
        return '<a class="search-result" href="quiz.html?id=' + q.id + '">' +
          '<img src="' + global.CNTArt.thumb(q.theme, 0) + '" alt="">' +
          '<span><span class="search-result__t">' + pick(q.title) + '</span><br>' +
          '<span class="search-result__g">' + pick(c ? c.name : '') + '</span></span></a>';
      }).join('');
    }
    if (openBtn && overlay) {
      openBtn.addEventListener('click', function () {
        overlay.classList.add('is-open');
        if (input) { input.value = ''; renderResults(''); setTimeout(function () { input.focus(); }, 60); }
        SFX.click();
      });
    }
    if (closeBtn && overlay) {
      closeBtn.addEventListener('click', function () { overlay.classList.remove('is-open'); });
    }
    if (overlay) {
      overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('is-open'); });
    }
    if (input) {
      input.addEventListener('input', function () { renderResults(input.value); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { overlay.classList.remove('is-open'); }
        if (e.key === 'Enter') {
          var first = results && results.querySelector('.search-result');
          if (first) location.href = first.getAttribute('href');
        }
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) overlay.classList.remove('is-open');
      if ((e.key === '/' || (e.key === 'k' && (e.ctrlKey || e.metaKey))) && overlay) {
        e.preventDefault();
        overlay.classList.add('is-open');
        if (input) { input.value = ''; renderResults(''); setTimeout(function () { input.focus(); }, 60); }
      }
    });

    /* 语言变化：重绘外壳 */
    document.addEventListener('cnt:langchange', function () {
      var head = document.getElementById('siteHeader');
      if (head) head.innerHTML = headerHTML();
      var bar = document.getElementById('genreBar');
      if (bar) bar.outerHTML = genreBarHTML(global.__CNT_ACTIVE_CAT__);
      var foot = document.getElementById('siteFooter');
      if (foot) foot.innerHTML = footerBandHTML();
      setTheme(getTheme());
      wire();
    });
  }

  /* ------------------------------------------------------------------
     工具
     ------------------------------------------------------------------ */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  /* 富文本：*斜体* -> <em>斜体</em> */
  function rich(s) {
    return esc(s).replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  }
  function params() {
    var out = {};
    (location.search.replace(/^\?/, '').split('&') || []).forEach(function (kv) {
      if (!kv) return;
      var p = kv.split('=');
      out[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || '').replace(/\+/g, ' '));
    });
    return out;
  }

  global.CNT = {
    t: t,
    pick: pick,
    esc: esc,
    rich: rich,
    params: params,
    toast: toast,
    sfx: SFX,
    mount: mount,
    headerHTML: headerHTML,
    genreBarHTML: genreBarHTML,
    footerBandHTML: footerBandHTML,
    searchOverlayHTML: searchOverlayHTML,
    setTheme: setTheme,
    getTheme: getTheme
  };
})(window);