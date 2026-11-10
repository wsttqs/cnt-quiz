/* =============================================================================
   CNT Quiz — 首页渲染（Hero + 分类板块 + 卡片网格）
   ============================================================================= */
(function (global) {
  'use strict';

  var I18N = global.CNTI18n;
  var Data = global.CNTData;
  var Art = global.CNTArt;
  var CNT = global.CNT;

  var t = function (k) { return I18N.t(k); };
  var pick = function (o) { return I18N.pick(o); };
  var rich = function (s) { return CNT.rich(s); };
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /* ------------------------------------------------------------------
     今日 Quiz：按日期取模，保证一天一个主题
     ------------------------------------------------------------------ */
  function dailyQuiz() {
    var now = new Date();
    var seed = now.getFullYear() * 372 + now.getMonth() * 31 + now.getDate();
    var pool = Data.quizzes.filter(function (q) { return q.type !== 'funnel'; });
    return pool[seed % pool.length];
  }

  /* ------------------------------------------------------------------
     Hero
     ------------------------------------------------------------------ */
  function heroHTML() {
    var q = dailyQuiz();
    var cat = Data.catById(q.cat);
    var question = q.questions[0];
    var opts = question.o.map(function (o, i) {
      return '<button type="button" class="hero-option" data-opt="' + i + '">' +
        '<span class="dot" aria-hidden="true"></span><span>' + rich(pick(o)) + '</span></button>';
    }).join('');

    return '' +
      '<section class="home-hero" aria-label="' + esc(t('hero.daily')) + '">' +
        '<div class="hero-quiz-card">' +
          '<div class="hero-quiz-card__ribbon">' +
            '<span class="hero-quiz-card__ribbon-text"><span aria-hidden="true">★</span>' + esc(t('hero.todayQuiz')) + '</span>' +
          '</div>' +
          '<div class="hero-quiz-card__body">' +
            '<h2 class="hero-quiz-card__question">' + rich(pick(question.q)) + '</h2>' +
            '<div class="hero-quiz-card__options" id="heroOptions">' + opts + '</div>' +
            '<a class="hero-quiz-card__play" id="heroPlay" href="quiz.html?id=' + esc(q.id) + '" role="button">' + esc(t('hero.play')) + '</a>' +
          '</div>' +
        '</div>' +
        '<div class="hero-mascot" aria-hidden="true">' + Art.heroMascot() + '</div>' +
      '</section>';
  }

  /* ------------------------------------------------------------------
     卡片
     ------------------------------------------------------------------ */
  function cardHTML(q) {
    var cat = Data.catById(q.cat);
    var isFunnel = q.type === 'funnel';
    var n = isFunnel
      ? q.layers.reduce(function (s, L) {
          return s + Object.keys(L.groups).reduce(function (s2, g) { return s2 + L.groups[g].questions.length; }, 0);
        }, 0)
      : q.questions.length;

    return '' +
      '<a class="home-grid-card" href="quiz.html?id=' + esc(q.id) + '">' +
        '<span class="home-grid-card__img">' +
          '<img src="' + Art.thumb(q.theme, q.id.length) + '" alt="" loading="lazy" width="640" height="360">' +
          '<span class="home-grid-card__tag">' + esc(pick(cat ? cat.name : '')) + '</span>' +
        '</span>' +
        '<span class="home-grid-card__body">' +
          '<span class="home-grid-card__title">' + rich(pick(q.title)) + '</span>' +
          '<span class="home-grid-card__meta">' + rich(pick(q.desc)) + '</span>' +
          '<span class="home-grid-card__foot">' +
            '<span>' + n + ' ' + esc(t('home.qCount')) + ' · ' + q.minutes + ' ' + esc(t('home.minutes')) + '</span>' +
            '<span class="arrow" aria-hidden="true">→</span>' +
          '</span>' +
        '</span>' +
      '</a>';
  }

  /* ------------------------------------------------------------------
     分类板块
     ------------------------------------------------------------------ */
  function sectionHTML(cat) {
    var list = Data.byCategory(cat.id);
    return '' +
      '<section class="cat-section" id="cat-' + esc(cat.id) + '">' +
        '<div class="cat-section__head">' +
          '<h2 class="cat-badge"><span class="star" aria-hidden="true">★</span>' + esc(pick(cat.name)) + '</h2>' +
          '<span class="cat-section__count">' + esc(pick(cat.blurb)) + ' · ' + list.length + ' ' + esc(t('home.quizCount')) + '</span>' +
        '</div>' +
        '<div class="home-grid">' + list.map(cardHTML).join('') + '</div>' +
      '</section>';
  }

  /* ------------------------------------------------------------------
     渲染
     ------------------------------------------------------------------ */
  function render() {
    var host = document.getElementById('app');
    if (!host) return;
    host.innerHTML = heroHTML() + Data.categories.map(sectionHTML).join('');
    wireHero();
    markActive();
  }

  function markActive() {
    var hash = (location.hash || '').replace('#cat-', '');
    var active = Data.catById(hash) ? hash : (global.__CNT_ACTIVE_CAT__ || '');
    global.__CNT_ACTIVE_CAT__ = active;
    var tabs = document.querySelectorAll('.navbar-genres__tab[data-cat]');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('is-active', tabs[i].getAttribute('data-cat') === active);
    }
    if (active) {
      var el = document.getElementById('cat-' + active);
      if (el && location.hash.indexOf('#cat-') === 0) {
        setTimeout(function () {
          var y = el.getBoundingClientRect().top + window.pageYOffset - 70;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }, 60);
      }
    }
  }

  /* ------------------------------------------------------------------
     Hero 交互：选中一个选项，再点 PLAY
     ------------------------------------------------------------------ */
  function wireHero() {
    var box = document.getElementById('heroOptions');
    var play = document.getElementById('heroPlay');
    if (!box) return;

    box.addEventListener('click', function (e) {
      var btn = e.target.closest('.hero-option');
      if (!btn) return;
      var all = box.querySelectorAll('.hero-option');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('is-selected');
      btn.classList.add('is-selected');
      CNT.sfx.click();
      if (play) {
        play.setAttribute('aria-pressed', 'true');
        play.focus({ preventScroll: true });
      }
    });

    if (play) {
      play.addEventListener('click', function () { CNT.sfx.click(); });
    }
  }

  /* ------------------------------------------------------------------
     启动
     ------------------------------------------------------------------ */
  function boot() {
    CNT.mount({
      activeCat: global.__CNT_ACTIVE_CAT__ || '',
      onReady: function () { render(); }
    });

    /* 语言切换 → 重绘主体 */
    document.addEventListener('cnt:langchange', function () { render(); });

    /* 分类导航条点击 */
    document.addEventListener('click', function (e) {
      var tab = e.target.closest('.navbar-genres__tab[data-cat]');
      if (!tab) return;
      var cat = tab.getAttribute('data-cat');
      global.__CNT_ACTIVE_CAT__ = cat;
      markActive();
    });

    window.addEventListener('hashchange', markActive);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);