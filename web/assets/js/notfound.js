/* =============================================================================
   CNT Quiz — 404 页面
   ============================================================================= */
(function (global) {
  'use strict';

  var I18N = global.CNTI18n;
  var Data = global.CNTData;
  var CNT = global.CNT;

  var t = function (k) { return I18N.t(k); };
  var pick = function (o) { return I18N.pick(o); };
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  function render() {
    var host = document.getElementById('app');
    if (!host) return;
    var genres = Data.categories.map(function (c) {
      return '<a href="index.html#cat-' + esc(c.id) + '">' + esc(pick(c.name)) + '</a>';
    }).join('');

    host.innerHTML = '' +
      '<div class="error-page">' +
        '<div class="error-code-wrap"><small>' + esc(t('err.code')) + '</small></div>' +
        '<div class="error-code">' + esc(t('err.code')) + '</div>' +
        '<h2>' + esc(t('err.title')) + '</h2>' +
        '<p>' + esc(t('err.desc')) + '</p>' +
        '<div class="error-cta-row">' +
          '<a class="btn btn--primary" href="index.html">' + esc(t('err.cta')) + '</a>' +
          '<a class="btn" href="index.html#all">' + esc(t('err.browse')) + '</a>' +
        '</div>' +
        '<div class="error-genres-label">' + esc(t('err.browse').toUpperCase()) + '</div>' +
        '<div class="error-genres-row">' + genres + '</div>' +
      '</div>';
  }

  function boot() {
    CNT.mount({ onReady: render });
    document.addEventListener('cnt:langchange', render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);