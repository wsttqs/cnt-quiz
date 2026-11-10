/* =============================================================================
   CNT Quiz — 答对 / 答错 互动特效
   答对  → 金色奖杯弹出 + 彩带雨 + 星星迸射 + 红色绶带横幅
   答错  → 炸弹从顶部坠落 → 引线火花 → 爆炸（冲击波 + 碎片 + 闪光）+ 页面震屏
   漏斗题 → 中性星选反馈（星爆 + 飘字），不判对错
   全部特效均为 DOM + Canvas 叠加层，pointer-events:none，不影响答题操作。
   ============================================================================= */
(function (global) {
  'use strict';

  var I18N = global.CNTI18n;
  var t = function (k, f) { return I18N.t(k, f); };
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  var reduced = false;
  try {
    reduced = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) { reduced = false; }

  var CONF_COLORS = ['#ef3b33', '#f6c453', '#1ad697', '#4aa8ff', '#f79aa4', '#ffffff', '#ff9f1c', '#ffd93d'];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function rint(a, b) { return Math.floor(rand(a, b + 1)); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function vw() { return global.innerWidth || document.documentElement.clientWidth || 0; }
  function vh() { return global.innerHeight || document.documentElement.clientHeight || 0; }
  function now() {
    return (global.performance && global.performance.now) ? global.performance.now() : Date.now();
  }

  /* ==================================================================
     1. Canvas 粒子层
     ================================================================== */
  var cv = null, ctx = null, parts = [], rafId = 0, dpr = 1;

  function ensureCanvas() {
    if (cv && cv.parentNode) return cv;
    cv = document.createElement('canvas');
    cv.className = 'fx-canvas';
    cv.setAttribute('aria-hidden', 'true');
    hostRoot().appendChild(cv);
    ctx = cv.getContext ? cv.getContext('2d') : null;
    sizeCanvas();
    global.addEventListener('resize', sizeCanvas);
    return cv;
  }
  function sizeCanvas() {
    if (!cv) return;
    dpr = Math.min(global.devicePixelRatio || 1, 2);
    cv.width = Math.floor(vw() * dpr);
    cv.height = Math.floor(vh() * dpr);
    cv.style.width = vw() + 'px';
    cv.style.height = vh() + 'px';
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burstConfetti(x, y, n, opt) {
    opt = opt || {};
    var cols = opt.colors || CONF_COLORS;
    var spread = (opt.spread == null) ? Math.PI * 2 : opt.spread;
    var dir = (opt.dir == null) ? -Math.PI / 2 : opt.dir;
    var spd = opt.speed || 13;
    for (var i = 0; i < n; i++) {
      var a = dir + (Math.random() - .5) * spread;
      var v = spd * rand(.5, 1.4);
      parts.push({
        k: 'c', x: x, y: y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        w: rand(6, 12), h: rand(8, 15),
        rot: rand(0, 6.28), vr: rand(.1, .36) * (Math.random() < .5 ? -1 : 1),
        col: pick(cols),
        life: rint(72, 138), g: rand(.16, .32), drag: .99, sway: rand(0, 6.28)
      });
    }
    play();
  }

  function burstSpark(x, y, n, col, spd) {
    for (var i = 0; i < n; i++) {
      var a = rand(0, 6.28);
      var v = (spd || 7) * rand(.3, 1.25);
      parts.push({
        k: 's', x: x, y: y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v - rand(0, 2),
        r: rand(1.3, 3.4),
        col: col || '#ffd93d',
        life: rint(18, 44), g: rand(.02, .12), drag: .93
      });
    }
    play();
  }

  function burstDebris(x, y, n) {
    var cols = ['#2b2b31', '#3b3b44', '#141419', '#ef3b33', '#f6c453', '#ff7a18', '#8a6a3a'];
    for (var i = 0; i < n; i++) {
      var a = rand(0, 6.28);
      var v = rand(4, 16);
      parts.push({
        k: 'd', x: x, y: y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v - rand(2, 8),
        s: rand(4, 11),
        rot: rand(0, 6.28), vr: rand(-.35, .35),
        col: pick(cols),
        life: rint(46, 96), g: rand(.22, .4), drag: .985
      });
    }
    play();
  }

  function confettiRain(n) {
    for (var i = 0; i < n; i++) {
      parts.push({
        k: 'c', x: rand(-40, vw() + 40), y: rand(-vh() * .8, -20),
        vx: rand(-1.6, 1.6), vy: rand(2, 6),
        w: rand(6, 12), h: rand(8, 15),
        rot: rand(0, 6.28), vr: rand(.08, .3) * (Math.random() < .5 ? -1 : 1),
        col: pick(CONF_COLORS),
        life: rint(130, 230), g: rand(.14, .26), drag: 1, sway: rand(0, 6.28)
      });
    }
    play();
  }

  function frame() {
    rafId = 0;
    if (!ctx) return;
    var W = vw(), H = vh();
    ctx.clearRect(0, 0, W, H);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.vy += p.g;
      p.vx *= p.drag; p.vy *= p.drag;
      p.x += p.vx; p.y += p.vy;
      if (p.k === 'c') {
        p.sway += .12;
        p.x += Math.sin(p.sway) * .6;
        p.rot += p.vr;
      } else if (p.k === 'd') { p.rot += p.vr; }
      p.life--;
      if (p.life <= 0 || p.y > H + 140 || p.x < -200 || p.x > W + 200) { parts.splice(i, 1); continue; }
      var al = p.life > 26 ? 1 : p.life / 26;
      ctx.save();
      ctx.globalAlpha = al;
      ctx.fillStyle = p.col;
      if (p.k === 'c') {
        ctx.translate(p.x, p.y);
        var sx = Math.abs(Math.cos(p.rot));
        ctx.scale(Math.max(.08, sx), 1);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else if (p.k === 's') {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      } else {
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.moveTo(-p.s * .5, -p.s * .38);
        ctx.lineTo(p.s * .55, -p.s * .2);
        ctx.lineTo(p.s * .28, p.s * .5);
        ctx.lineTo(-p.s * .45, p.s * .3);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    if (parts.length) rafId = global.requestAnimationFrame(frame);
  }
  function play() { if (!rafId) rafId = global.requestAnimationFrame(frame); }
  /* ==================================================================
     2. DOM 叠加层
     ================================================================== */
  /* 特效层的挂载点：<html>（body 震屏 transform 不影响它） */
  function hostRoot() {
    return document.documentElement || document.body;
  }

  function layer() {
    var el = document.getElementById('fxLayer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'fxLayer';
      el.className = 'fx-layer';
      el.setAttribute('aria-hidden', 'true');
      hostRoot().appendChild(el);
    }
    return el;
  }
  function drop(el, ms) {
    global.setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, ms);
  }

  /* ---------------- 奖杯 SVG ---------------- */
  function trophySVG() {
    var u = 'tx' + Math.random().toString(36).slice(2, 7);
    return '' +
    '<svg viewBox="0 0 240 250" width="200" height="208" xmlns="http://www.w3.org/2000/svg" class="fx-trophy__svg" aria-hidden="true" focusable="false">' +
      '<defs>' +
        '<linearGradient id="g' + u + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#fff3bd"/><stop offset=".42" stop-color="#f6c453"/><stop offset="1" stop-color="#d99a12"/>' +
        '</linearGradient>' +
        '<linearGradient id="h' + u + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#ffeaa3"/><stop offset="1" stop-color="#dfa51a"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect x="104" y="138" width="32" height="60" rx="6" fill="url(#h' + u + ')" stroke="#8a5c06" stroke-width="4"/>' +
      '<rect x="84" y="192" width="72" height="22" rx="8" fill="url(#g' + u + ')" stroke="#8a5c06" stroke-width="4"/>' +
      '<rect x="62" y="208" width="116" height="28" rx="10" fill="url(#g' + u + ')" stroke="#8a5c06" stroke-width="4"/>' +
      '<path d="M56 26h128v50c0 42-30 72-64 72S56 118 56 76V26z" fill="url(#g' + u + ')" stroke="#8a5c06" stroke-width="4"/>' +
      '<path d="M56 44H38a26 26 0 0 0 26 30" fill="none" stroke="url(#h' + u + ')" stroke-width="13" stroke-linecap="round"/>' +
      '<path d="M184 44h18a26 26 0 0 1-26 30" fill="none" stroke="url(#h' + u + ')" stroke-width="13" stroke-linecap="round"/>' +
      '<rect x="42" y="14" width="156" height="24" rx="12" fill="url(#h' + u + ')" stroke="#8a5c06" stroke-width="4"/>' +
      '<path d="M78 42c-5 24-4 46 4 62" fill="none" stroke="#fff8d6" stroke-width="9" stroke-linecap="round" opacity=".5"/>' +
      '<path d="M120 58l9.5 19.5 21.5 3-15.5 15 3.7 21.4-19.2-10.2-19.2 10.2 3.7-21.4L89 80.5l21.5-3L120 58z" ' +
        'fill="#fff6d0" stroke="#a8720a" stroke-width="3.5" stroke-linejoin="round"/>' +
    '</svg>';
  }

  /* ---------------- 炸弹 SVG ---------------- */
  function bombSVG() {
    return '' +
    '<svg viewBox="0 0 160 190" width="150" height="180" xmlns="http://www.w3.org/2000/svg" class="fx-bomb__svg" aria-hidden="true" focusable="false">' +
      '<defs><radialGradient id="bmbg" cx=".36" cy=".3" r=".85">' +
        '<stop offset="0" stop-color="#7d7d8a"/><stop offset=".5" stop-color="#2f2f38"/><stop offset="1" stop-color="#101015"/>' +
      '</radialGradient></defs>' +
      '<path d="M74 66Q84 26 106 12" fill="none" stroke="#8a6a3a" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M74 66Q84 26 106 12" fill="none" stroke="#c9a06a" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="60" y="54" width="30" height="18" rx="6" fill="#5b5b66" stroke="#0a0a0e" stroke-width="4"/>' +
      '<circle cx="74" cy="120" r="54" fill="url(#bmbg)" stroke="#08080c" stroke-width="4"/>' +
      '<ellipse cx="54" cy="92" rx="18" ry="11" fill="#fff" opacity=".22" transform="rotate(-30 54 92)"/>' +
      '<circle cx="106" cy="10" r="9" fill="#ffb347" class="fx-bomb__fuse"/>' +
      '<circle cx="106" cy="10" r="4" fill="#fff8dc" class="fx-bomb__fuse"/>' +
    '</svg>';
  }

  /* ---------------- 绶带横幅 ---------------- */
  function banner(kind) {
    var host = layer();
    var ok = kind !== 'bad';
    var el = document.createElement('div');
    el.className = 'fx-banner ' + (ok ? 'fx-banner--ok' : 'fx-banner--bad');
    el.innerHTML =
      '<span class="fx-banner__main">' + esc(ok ? t('fx.correct') : t('fx.wrong')) + '</span>' +
      '<span class="fx-banner__sub">' + esc(ok ? t('fx.correctSub') : t('fx.wrongSub')) + '</span>';
    host.appendChild(el);
    global.setTimeout(function () { el.classList.add('is-out'); }, 1750);
    drop(el, 2400);
  }

  /* ---------------- 冲击波 / 闪光 / 烟雾 / 震屏 ---------------- */
  function wave(x, y, color, delay) {
    var host = layer();
    var el = document.createElement('div');
    el.className = 'fx-wave';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.borderColor = color;
    if (delay) el.style.animationDelay = delay + 'ms';
    host.appendChild(el);
    drop(el, 900);
  }

  function flash(inner, outer) {
    var host = layer();
    var el = document.createElement('div');
    el.className = 'fx-flash';
    el.style.background = 'radial-gradient(circle at 50% 50%, ' + inner + ' 0%, ' + outer + ' 45%, rgba(0,0,0,0) 78%)';
    host.appendChild(el);
    drop(el, 700);
  }

  function smoke(x, y) {
    var host = layer();
    for (var i = 0; i < 8; i++) {
      var el = document.createElement('div');
      var a = (i / 8) * Math.PI * 2 + rand(-.3, .3);
      var d = rand(28, 74);
      el.className = 'fx-smoke';
      el.style.left = (x + Math.cos(a) * d) + 'px';
      el.style.top = (y + Math.sin(a) * d * .55) + 'px';
      el.style.setProperty('--sd', rand(-46, 46) + 'px');
      el.style.setProperty('--st', rand(-46, 46) + 'px');
      el.style.animationDelay = (i * 26) + 'ms';
      host.appendChild(el);
      drop(el, 1500);
    }
  }

  function shake() {
    var b = document.body;
    if (!b) return;
    b.classList.remove('fx-shake');
    /* 强制重排以重启动画 */
    void b.offsetWidth;
    b.classList.add('fx-shake');
    global.setTimeout(function () { b.classList.remove('fx-shake'); }, 700);
  }
  /* ==================================================================
     3. 答对：金色奖杯弹出
     ================================================================== */
  function showTrophy(x, y) {
    var host = layer();
    var px = clamp(x, 130, vw() - 130);
    var py = clamp(y, 150, vh() - 170);

    var wrap = document.createElement('div');
    wrap.className = 'fx-pop fx-pop--trophy';
    wrap.style.left = px + 'px';
    wrap.style.top = py + 'px';
    wrap.innerHTML =
      '<div class="fx-rays" aria-hidden="true"></div>' +
      '<div class="fx-trophy">' + trophySVG() + '</div>' +
      '<div class="fx-trophy__caption">' + esc(t('fx.perfect')) + '</div>';
    host.appendChild(wrap);

    /* 强制重排后加 is-in，保证入场动画播放 */
    void wrap.offsetWidth;
    wrap.classList.add('is-in');

    global.setTimeout(function () { wrap.classList.add('is-out'); }, 1600);
    drop(wrap, 2250);
    return { x: px, y: py };
  }

  /* ==================================================================
     4. 答错：炸弹坠落 → 爆炸
     ================================================================== */
  function explode(x, y, bombEl) {
    if (bombEl) bombEl.classList.add('is-boom');
    flash('rgba(255,255,255,.92)', 'rgba(255,138,61,.75)');
    wave(x, y, '#ff7a18');
    wave(x, y, '#ffd93d', 90);
    wave(x, y, '#ef3b33', 180);
    burstDebris(x, y, 34);
    burstSpark(x, y, 30, '#ffb347', 13);
    burstSpark(x, y, 20, '#fff3b0', 8);
    smoke(x, y);
    shake();
    drop(bombEl, 500);
  }

  function showBomb(x, y) {
    var host = layer();
    var px = clamp(x, 90, vw() - 90);
    var py = clamp(y, 170, vh() - 230);
    var startY = -190;
    var dur = reduced ? 240 : 760;

    var wrap = document.createElement('div');
    wrap.className = 'fx-pop fx-pop--bomb';
    wrap.innerHTML = '<div class="fx-bomb">' + bombSVG() + '</div>';
    host.appendChild(wrap);

    var t0 = now();
    function step(ts) {
      var k = Math.min(1, (ts - t0) / dur);
      var e = k * k;                         /* ease-in：越掉越快 */
      var cur = startY + (py - startY) * e;
      var wob = Math.sin(k * Math.PI * 7) * (1 - k) * 16;
      wrap.style.transform = 'translate3d(' + (px - 75 + wob) + 'px,' + cur + 'px,0)';
      if (!reduced && Math.random() < .55) {
        burstSpark(px + wob + 106, cur + 12, 2, '#ffd93d', 4);
      }
      if (k < 1) {
        global.requestAnimationFrame(step);
      } else {
        explode(px + wob, cur + 108, wrap);
      }
    }
    global.requestAnimationFrame(step);
  }

  /* ==================================================================
     5. 漏斗题：中性星选反馈
     ================================================================== */
  function showPick(x, y) {
    var host = layer();
    var px = clamp(x, 110, vw() - 110);
    var py = clamp(y, 120, vh() - 140);
    var el = document.createElement('div');
    el.className = 'fx-float';
    el.style.left = px + 'px';
    el.style.top = py + 'px';
    el.innerHTML =
      '<span class="fx-float__star" aria-hidden="true">★</span>' +
      '<span class="fx-float__txt">' + esc(t('fx.pick')) + '</span>';
    host.appendChild(el);
    drop(el, 1500);

    if (!reduced) {
      burstSpark(px, py, 18, '#ffd93d', 8);
      burstConfetti(px, py, 16, { spread: Math.PI * 1.7, speed: 8 });
    }
  }

  /* ==================================================================
     6. 结果页庆祝
     ================================================================== */
  function celebrate(level) {
    ensureCanvas();
    var strong = level !== 'low';
    if (reduced) return;
    confettiRain(strong ? 120 : 60);
    var pts = [[vw() * .18, vh() * .3], [vw() * .5, vh() * .18], [vw() * .82, vh() * .3]];
    for (var i = 0; i < pts.length; i++) {
      (function (p, idx) {
        global.setTimeout(function () {
          burstConfetti(p[0], p[1], strong ? 34 : 18, { speed: 14 });
          burstSpark(p[0], p[1], 14, '#ffd93d', 8);
        }, idx * 140);
      })(pts[i], i);
    }
  }

  /* ==================================================================
     7. 对外接口
     ================================================================== */
  function originOf(opt) {
    opt = opt || {};
    return {
      x: (opt.x == null) ? vw() / 2 : opt.x,
      y: (opt.y == null) ? vh() / 2 : opt.y
    };
  }

  global.CNTEffects = {
    /* 答对：奖杯 + 彩带 */
    correct: function (opt) {
      var o = originOf(opt);
      ensureCanvas();
      var pos = showTrophy(o.x, o.y);
      banner('ok');
      if (!reduced) {
        burstConfetti(pos.x, pos.y - 40, 48, { speed: 15 });
        confettiRain(70);
        global.setTimeout(function () {
          burstSpark(pos.x, pos.y - 60, 24, '#ffd93d', 10);
          burstSpark(pos.x - 60, pos.y - 20, 12, '#fff6d0', 7);
          burstSpark(pos.x + 60, pos.y - 20, 12, '#fff6d0', 7);
        }, 230);
      }
    },
    /* 答错：炸弹 + 爆炸 */
    wrong: function (opt) {
      var o = originOf(opt);
      ensureCanvas();
      showBomb(o.x, o.y);
      banner('bad');
    },
    /* 漏斗题：中性反馈 */
    pick: function (opt) {
      var o = originOf(opt);
      ensureCanvas();
      showPick(o.x, o.y);
    },
    /* 结果页庆祝 */
    celebrate: celebrate,
    /* 供外部手动清场（重开 Quiz 时调用） */
    clear: function () {
      parts.length = 0;
      if (ctx) ctx.clearRect(0, 0, vw(), vh());
      var l = document.getElementById('fxLayer');
      if (l) l.innerHTML = '';
      var b = document.body;
      if (b) b.classList.remove('fx-shake');
    }
  };
})(window);