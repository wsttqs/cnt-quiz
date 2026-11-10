/* =============================================================================
   CNT Quiz — 原创 SVG 素材（吉祥物 Cortex / Logo / Hero 插画 / 扁平图标 / 缩略图）
   全部为手写矢量图形，不引用任何第三方站点的图片资源。
   ============================================================================= */
(function (global) {
  'use strict';

  var FONT = "'Baloo 2','Nunito','Segoe UI',system-ui,sans-serif";
  var FONT_HEAVY = "'Baloo 2','Arial Black',Impact,'Segoe UI',sans-serif";

  /* ------------------------------------------------------------------
     通用图形：放射爆炸轮廓 / 四角星
     ------------------------------------------------------------------ */
  function burstPath(cx, cy, rOut, rIn, points, seed, sx, sy) {
    var d = '', i, a, r, x, y;
    for (i = 0; i < points * 2; i++) {
      a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      r = (i % 2 === 0 ? rOut : rIn) * (0.84 + 0.30 * ((Math.sin(seed + i * 2.71) + 1) / 2));
      x = cx + Math.cos(a) * r * (sx || 1);
      y = cy + Math.sin(a) * r * (sy || 1);
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d + 'Z';
  }

  function sparkle(cx, cy, r, color, opacity) {
    var d = 'M' + cx + ' ' + (cy - r) + 'Q' + cx + ' ' + cy + ' ' + (cx + r) + ' ' + cy +
            'Q' + cx + ' ' + cy + ' ' + cx + ' ' + (cy + r) +
            'Q' + cx + ' ' + cy + ' ' + (cx - r) + ' ' + cy +
            'Q' + cx + ' ' + cy + ' ' + cx + ' ' + (cy - r) + 'Z';
    return '<path d="' + d + '" fill="' + color + '" opacity="' + (opacity == null ? 1 : opacity) + '"/>';
  }

  /* ------------------------------------------------------------------
     脑体：底椭圆 + 一圈凸起，模拟脑回沟的圆润轮廓
     ------------------------------------------------------------------ */
  function brainLobes() {
    var out = [], i, n = 18, a, x, y;
    for (i = 0; i < n; i++) {
      a = (i / n) * Math.PI * 2;
      x = Math.cos(a) * 47;
      y = Math.sin(a) * 40;
      out.push('<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="18"/>');
    }
    out.push('<ellipse cx="0" cy="0" rx="55" ry="48"/>');
    return out.join('');
  }

  /* 头部（在原点 0,0 居中绘制，方便各处复用） */
  function headArt(uid) {
    return '<defs>' +
        '<linearGradient id="bgg' + uid + '" gradientUnits="userSpaceOnUse" x1="-58" y1="-58" x2="30" y2="58">' +
          '<stop offset="0" stop-color="#f79aa4"/><stop offset="1" stop-color="#dc5f72"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<g fill="url(#bgg' + uid + ')">' + brainLobes() + '</g>' +
      /* 脑沟 */
      '<g stroke="#c14d61" stroke-width="5" fill="none" stroke-linecap="round" opacity=".62">' +
        '<path d="M0 -46q-7 22 0 42 7 20 0 40"/>' +
        '<path d="M-25 -44q-14 18-7 36-13 16-4 32"/>' +
        '<path d="M25 -44q14 18 7 36 13 16 4 32"/>' +
        '<path d="M-46 -14q-13 16-5 32"/>' +
        '<path d="M46 -14q13 16 5 32"/>' +
        '<path d="M-22 40q12 10 22 10"/>' +
        '<path d="M22 40q-12 10-22 10"/>' +
      '</g>' +
      /* 眉毛 */
      '<g stroke="#2b2b33" stroke-width="6" fill="none" stroke-linecap="round">' +
        '<path d="M-44 -24q15-9 28-3"/>' +
        '<path d="M44 -24q-15-9-28-3"/>' +
      '</g>' +
      /* 黑框眼镜 */
      '<g stroke="#16181d" stroke-width="6.5" fill="#ffffff" fill-opacity=".96">' +
        '<rect x="-46" y="-13" width="44" height="42" rx="15"/>' +
        '<rect x="2" y="-13" width="44" height="42" rx="15"/>' +
        '<path d="M-2 4h4" stroke="#16181d" stroke-linecap="round"/>' +
        '<path d="M-46 -6l-15-4M46 -6l15-4" stroke="#16181d" stroke-linecap="round"/>' +
      '</g>' +
      /* 眼睛 */
      '<circle cx="-24" cy="9" r="10.5" fill="#16181d"/>' +
      '<circle cx="24" cy="9" r="10.5" fill="#16181d"/>' +
      '<circle cx="-27.5" cy="5" r="3.8" fill="#fff"/>' +
      '<circle cx="20.5" cy="5" r="3.8" fill="#fff"/>' +
      /* 腮红 */
      '<ellipse cx="-47" cy="32" rx="11" ry="6.5" fill="#cf4c68" opacity=".3"/>' +
      '<ellipse cx="47" cy="32" rx="11" ry="6.5" fill="#cf4c68" opacity=".3"/>' +
      /* 笑嘴 */
      '<path d="M-21 33q21 9 42 0 3 26-21 26T-24 33z" fill="#8d2434"/>' +
      '<path d="M-19 34q19 8 38 0l-2 8q-17 6-34 0z" fill="#fff"/>' +
      '<path d="M-8 50q8 8 16 0 0 8-8 8t-8-8z" fill="#e05a6d"/>';
  }

  /* 头部片段：viewBox 0 0 140 130 下的独立 SVG 片段 */
  function brainHeadMarkup(uid) {
    return '<g transform="translate(70,62)">' + headArt(uid) + '</g>';
  }

  function brainHead(opts) {
    opts = opts || {};
    var uid = opts.uid || 'bh' + Math.random().toString(36).slice(2, 6);
    return '<svg viewBox="0 0 140 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cortex">' +
      brainHeadMarkup(uid) + '</svg>';
  }
  /* ------------------------------------------------------------------
     全身吉祥物：脑头 + 蓝衬衫 + 红领结 + 牛仔裤 + 红球鞋 + 白手套
     viewBox 0 0 260 340
     ------------------------------------------------------------------ */
  function brainCharacterMarkup(uid) {
    return '<g>' +
      /* 举起的手臂（画面左，白手套竖起食指） */
      '<path d="M86 140q-26-4-34-26" stroke="#2f4f8f" stroke-width="20" fill="none" stroke-linecap="round"/>' +
      '<path d="M54 116q-6-22 6-34" stroke="#e0707f" stroke-width="14" fill="none" stroke-linecap="round"/>' +
      /* 垂下的手臂（画面右） */
      '<path d="M170 142q24 6 30 30" stroke="#2f4f8f" stroke-width="20" fill="none" stroke-linecap="round"/>' +
      '<path d="M200 172q9 20 5 38" stroke="#e0707f" stroke-width="14" fill="none" stroke-linecap="round"/>' +
      /* 牛仔裤 */
      '<path d="M86 222h88l5 56a10 10 0 0 1-10 11h-16a12 12 0 0 1-12-10l-3-27h-16l-3 27a12 12 0 0 1-12 10h-16a10 10 0 0 1-10-11z" fill="#3a6fb5"/>' +
      /* 红球鞋 + 白鞋头 + 白鞋底 */
      '<path d="M84 282h34a16 16 0 0 1 16 16v10H68v-10a16 16 0 0 1 16-16z" fill="#d63031"/>' +
      '<path d="M68 294h20a6 6 0 0 1 6 6v8H68z" fill="#fff"/>' +
      '<rect x="64" y="306" width="72" height="12" rx="6" fill="#fff"/>' +
      '<path d="M142 282h34a16 16 0 0 1 16 16v10h-66v-10a16 16 0 0 1 16-16z" fill="#d63031"/>' +
      '<path d="M166 294h20a6 6 0 0 1 6 6v8h-26z" fill="#fff"/>' +
      '<rect x="124" y="306" width="72" height="12" rx="6" fill="#fff"/>' +
      /* 蓝衬衫 */
      '<path d="M130 116c-26 0-44 12-48 34l-8 50c-2 12 7 22 20 22h72c13 0 22-10 20-22l-8-50c-4-22-22-34-48-34z" fill="#2f4f8f"/>' +
      /* 脑袋 */
      '<g transform="translate(130,80) scale(0.98)">' + headArt(uid) + '</g>' +
      /* 衣领 */
      '<path d="M100 118q30 26 60 0l-3 14q-27 18-54 0z" fill="#f6faff" stroke="#d3e0f0" stroke-width="2"/>' +
      /* 红领结 */
      '<g stroke="#a81f20" stroke-width="3" stroke-linejoin="round">' +
        '<path d="M130 146l-24-12v27l24-9z" fill="#d63031"/>' +
        '<path d="M130 146l24-12v27l-24-9z" fill="#d63031"/>' +
        '<circle cx="130" cy="149" r="6.5" fill="#c1292a"/>' +
      '</g>' +
      /* 白手套（最后绘制，压在身前） */
      '<g fill="#fff" stroke="#e2e9f2" stroke-width="2.5" stroke-linejoin="round">' +
        '<rect x="45" y="26" width="15" height="46" rx="7.5"/>' +
        '<path d="M38 62a17 17 0 0 1 34 0v14a17 17 0 0 1-34 0z"/>' +
        '<path d="M194 210a14 14 0 0 1 28 0v12a14 14 0 0 1-28 0z"/>' +
      '</g>' +
      '</g>';
  }

  function brainCharacter(opts) {
    opts = opts || {};
    var uid = opts.uid || 'bc' + Math.random().toString(36).slice(2, 6);
    return '<svg viewBox="0 0 260 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cortex the brain mascot">' +
      brainCharacterMarkup(uid) + '</svg>';
  }

  /* 进度条上的小吉祥物 */
  function progressSprite() {
    return '<svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<g transform="translate(60,50) scale(0.78)">' + headArt('ps' + Math.random().toString(36).slice(2, 6)) + '</g>' +
      '<rect x="42" y="96" width="11" height="17" rx="5.5" fill="#e0707f"/>' +
      '<rect x="67" y="96" width="11" height="17" rx="5.5" fill="#e0707f"/>' +
      '<rect x="34" y="108" width="27" height="10" rx="5" fill="#d63031"/>' +
      '<rect x="59" y="108" width="27" height="10" rx="5" fill="#d63031"/>' +
      '</svg>';
  }
  /* ------------------------------------------------------------------
     Logo：吉祥物 + 堆叠字标（深蓝描边 + 白描边 + 红填充）
     ------------------------------------------------------------------ */
  function wordText(x, y, size, str) {
    var a = ' x="' + x + '" y="' + y + '" font-size="' + size + '" text-anchor="middle" letter-spacing="-1"';
    return '<text' + a + ' stroke="#0b1d2e" stroke-width="15" stroke-linejoin="round" paint-order="stroke" fill="#d63031">' + str + '</text>' +
           '<text' + a + ' stroke="#ffffff" stroke-width="8" stroke-linejoin="round" paint-order="stroke" fill="#d63031">' + str + '</text>';
  }

  function logoMark(opts) {
    opts = opts || {};
    var uid = opts.uid || 'lg' + Math.random().toString(36).slice(2, 6);
    var text = opts.text || 'CNT';
    var text2 = opts.text2 || 'Quiz';
    return '<svg viewBox="0 0 300 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CNT Quiz">' +
      '<g transform="translate(2,0) scale(0.38)">' + brainCharacterMarkup(uid) + '</g>' +
      '<g transform="rotate(-3 200 66)" font-family="' + FONT_HEAVY + '" font-weight="900">' +
        wordText(196, 58, 54, text) +
        wordText(202, 112, 58, text2) +
      '</g>' +
      '</svg>';
  }
  /* ------------------------------------------------------------------
     Hero 大插画：吉祥物 + 对话气泡 + PROVE IT 爆炸标 + 装饰元素
     ------------------------------------------------------------------ */
  function heroMascot() {
    return '<svg viewBox="0 0 480 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cortex mascot with speech bubble">' +
      /* 漂浮的问号与星星 */
      '<g>' +
        '<text x="252" y="78" font-family="' + FONT_HEAVY + '" font-size="42" font-weight="900" fill="#f0a500" transform="rotate(-12 252 78)">?</text>' +
        '<text x="246" y="212" font-family="' + FONT_HEAVY + '" font-size="32" font-weight="900" fill="#e4342c" transform="rotate(14 246 212)">?</text>' +
        '<text x="18" y="300" font-family="' + FONT_HEAVY + '" font-size="34" font-weight="900" fill="#f0a500" transform="rotate(10 18 300)">?</text>' +
        sparkle(96, 16, 9, '#f0a500', .9) +
        sparkle(248, 118, 7, '#ffd83d', .95) +
        sparkle(16, 244, 8, '#f0a500', .85) +
        sparkle(276, 392, 8, '#ffd83d', .9) +
        sparkle(120, 402, 6, '#f0a500', .8) +
      '</g>' +
      /* 小灯泡 */
      '<g transform="translate(26,2) rotate(-14)">' +
        '<path d="M18 0a18 18 0 0 0-10 33v6h20v-6A18 18 0 0 0 18 0z" fill="#ffd83d" stroke="#b58b00" stroke-width="3" stroke-linejoin="round"/>' +
        '<rect x="9" y="40" width="18" height="6" rx="3" fill="#9aa4ad"/>' +
        '<rect x="11" y="48" width="14" height="6" rx="3" fill="#9aa4ad"/>' +
      '</g>' +
      /* 角色 */
      '<g transform="translate(4,34) scale(1.05)">' + brainCharacterMarkup('hm' + Math.random().toString(36).slice(2, 6)) + '</g>' +
      /* 对话气泡 */
      '<g transform="translate(286,30)">' +
        '<path d="M26 0h124a26 26 0 0 1 26 26v104a26 26 0 0 1-26 26H74l-6 30-30-30H26a26 26 0 0 1-26-26V26A26 26 0 0 1 26 0z" fill="#ffffff" stroke="#16212e" stroke-width="6" stroke-linejoin="round"/>' +
        '<g font-family="' + FONT_HEAVY + '" font-weight="900" fill="#16212e" text-anchor="middle" font-size="29">' +
          '<text x="88" y="40">THINK</text>' +
          '<text x="88" y="70">YOU GOT</text>' +
          '<text x="88" y="100">WHAT IT</text>' +
          '<text x="88" y="130">TAKES?</text>' +
        '</g>' +
      '</g>' +
      /* PROVE IT 爆炸标 */
      '<g transform="translate(300,250)">' +
        '<path d="' + burstPath(85, 45, 74, 52, 13, 1.7, 1.12, 0.72) + '" fill="#121a24"/>' +
        '<text x="85" y="57" font-family="' + FONT_HEAVY + '" font-size="31" font-weight="900" font-style="italic" fill="#ffd83d" text-anchor="middle" transform="rotate(-5 85 57)">PROVE IT!</text>' +
      '</g>' +
      '</svg>';
  }
  /* ------------------------------------------------------------------
     扁平 UI 图标（24×24，跟随 currentColor）
     ------------------------------------------------------------------ */
  function flatIcon(inner, size) {
    var s = size || 18;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }

  function iconSearch(size) {
    return flatIcon(
      '<circle cx="10.5" cy="10.5" r="6.6" fill="none" stroke="currentColor" stroke-width="2.4"/>' +
      '<path d="M15.4 15.4L21 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>', size);
  }

  function iconSun(size) {
    return flatIcon(
      '<circle cx="12" cy="12" r="5" fill="currentColor"/>' +
      '<g stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
      '<path d="M12 1.8v2.8M12 19.4v2.8M1.8 12h2.8M19.4 12h2.8M4.8 4.8l2 2M17.2 17.2l2 2M19.2 4.8l-2 2M6.8 17.2l-2 2"/>' +
      '</g>', size);
  }

  function iconMoon(size) {
    return flatIcon(
      '<path d="M20.5 14.6A8.9 8.9 0 0 1 9.4 3.5a9 9 0 1 0 11.1 11.1z" fill="currentColor"/>', size);
  }

  function iconGlobe(size) {
    return flatIcon(
      '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.2"/>' +
      '<path d="M3 12h18" stroke="currentColor" stroke-width="1.8"/>' +
      '<path d="M12 3c2.7 2.7 4 5.7 4 9s-1.3 6.3-4 9c-2.7-2.7-4-5.7-4-9s1.3-6.3 4-9z" fill="none" stroke="currentColor" stroke-width="1.8"/>', size);
  }

  function iconSpeaker(on, size) {
    var body = '<path d="M4 9.3h3.4L12 5.2v13.6L7.4 14.7H4z" fill="currentColor"/>';
    var waves = on
      ? '<path d="M15.2 9.2a4 4 0 0 1 0 5.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
        '<path d="M18 6.4a8 8 0 0 1 0 11.2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
      : '<path d="M15.6 9.6l5 4.8M20.6 9.6l-5 4.8" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>';
    return flatIcon(body + waves, size);
  }

  function iconMusic(size) {
    return flatIcon(
      '<path d="M9.4 18.2V6.6l9-1.9v11.6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="6.9" cy="18.2" r="2.7" fill="currentColor"/>' +
      '<circle cx="15.9" cy="16.3" r="2.7" fill="currentColor"/>', size);
  }
  var ICONS = {
    columns: '<path d="M12 30h76l-38-22z" fill="currentColor"/><rect x="22" y="34" width="10" height="42" rx="2" fill="currentColor"/><rect x="45" y="34" width="10" height="42" rx="2" fill="currentColor"/><rect x="68" y="34" width="10" height="42" rx="2" fill="currentColor"/><rect x="14" y="80" width="72" height="9" rx="3" fill="currentColor"/>',
    mic: '<path d="M50 10a16 16 0 0 1 16 16v22a16 16 0 0 1-32 0V26a16 16 0 0 1 16-16z" fill="currentColor"/><path d="M26 46a24 24 0 0 0 48 0" stroke="currentColor" stroke-width="8" fill="none" stroke-linecap="round"/><rect x="44" y="68" width="12" height="16" rx="4" fill="currentColor"/><rect x="30" y="84" width="40" height="9" rx="4" fill="currentColor"/>',
    clapper: '<rect x="10" y="34" width="80" height="46" rx="6" fill="currentColor"/><path d="M8 20l80-12 4 15-80 12z" fill="currentColor" opacity=".72"/><rect x="22" y="46" width="24" height="7" rx="3" fill="#0b1d2e" opacity=".35"/><rect x="22" y="60" width="40" height="7" rx="3" fill="#0b1d2e" opacity=".35"/>',
    trophy: '<path d="M30 16h40v22a20 20 0 0 1-40 0z" fill="currentColor"/><path d="M30 22H16v8a14 14 0 0 0 14 14M70 22h14v8a14 14 0 0 1-14 14" stroke="currentColor" stroke-width="7" fill="none"/><rect x="44" y="58" width="12" height="16" fill="currentColor"/><rect x="30" y="74" width="40" height="11" rx="4" fill="currentColor"/>',
    ball: '<circle cx="50" cy="52" r="32" fill="currentColor"/><path d="M50 34l12 9-4.5 14H42.5L38 43z" fill="#0b1d2e" opacity=".38"/><path d="M50 20v14M24 44l14-1M76 44l-14-1M31 74l11-11M69 74L58 63" stroke="#0b1d2e" stroke-width="4" opacity=".38" stroke-linecap="round"/>',
    globe: '<circle cx="50" cy="50" r="34" fill="currentColor"/><path d="M50 16c12 12 12 56 0 68M50 16c-12 12-12 56 0 68M16 50h68" stroke="#0b1d2e" stroke-width="4" opacity=".4" fill="none"/><circle cx="72" cy="28" r="9" fill="#f6c453"/><rect x="69" y="35" width="6" height="12" rx="3" fill="#f6c453"/>',
    flask: '<path d="M40 14h20v6h-4v22l20 34a6 6 0 0 1-5 9H29a6 6 0 0 1-5-9l20-34V20h-4z" fill="currentColor"/><path d="M34 62h32l10 17a4 4 0 0 1-3 6H27a4 4 0 0 1-3-6z" fill="#0b1d2e" opacity=".35"/>',
    mask: '<path d="M50 12c22 0 38 12 38 28 0 22-16 48-38 48S12 62 12 40C12 24 28 12 50 12z" fill="currentColor"/><path d="M30 40c4-6 12-6 16 0M54 40c4-6 12-6 16 0" stroke="#0b1d2e" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M36 62c8 8 20 8 28 0" stroke="#0b1d2e" stroke-width="5" fill="none" stroke-linecap="round"/>',
    controller: '<path d="M26 32h48c14 0 22 12 18 26l-4 14c-3 10-16 10-21 2l-7-11H40l-7 11c-5 8-18 8-21-2l-4-14c-4-14 4-26 18-26z" fill="currentColor"/><rect x="34" y="46" width="9" height="9" rx="3" fill="#0b1d2e" opacity=".45"/><rect x="47" y="46" width="9" height="9" rx="3" fill="#0b1d2e" opacity=".45"/><circle cx="70" cy="48" r="6" fill="#0b1d2e" opacity=".45"/><circle cx="80" cy="58" r="6" fill="#0b1d2e" opacity=".45"/>',
    bubble: '<path d="M14 22h72a8 8 0 0 1 8 8v34a8 8 0 0 1-8 8H48l-18 16 4-16H14a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8z" fill="currentColor"/><text x="50" y="58" font-family="\'Baloo 2\',\'Arial Black\',sans-serif" font-weight="900" font-size="40" fill="#0b1d2e" text-anchor="middle" opacity=".5">?</text>',
    plane: '<path d="M50 8l9 26 33 20v10L58 56v20l14 8v6L50 84 28 90v-6l14-8V56L10 64V54l33-20z" fill="currentColor"/>',
    scroll: '<path d="M22 14h56a8 8 0 0 1 8 8v56a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8V22a8 8 0 0 1 8-8z" fill="currentColor"/><rect x="6" y="14" width="16" height="72" rx="8" fill="currentColor" opacity=".6"/><g stroke="#0b1d2e" stroke-width="5" opacity=".35" stroke-linecap="round"><path d="M32 32h40M32 48h40M32 64h26"/></g>',
    bulb: '<path d="M50 10a26 26 0 0 1 16 46v10H34V56A26 26 0 0 1 50 10z" fill="currentColor"/><rect x="34" y="70" width="32" height="8" rx="4" fill="currentColor"/><rect x="38" y="82" width="24" height="8" rx="4" fill="currentColor" opacity=".7"/>',
    plate: '<circle cx="50" cy="50" r="34" fill="currentColor"/><circle cx="50" cy="50" r="22" fill="#0b1d2e" opacity=".3"/><path d="M14 22v22c0 8 6 12 12 12M86 22v22c0 8-6 12-12 12" stroke="currentColor" stroke-width="7" fill="none" stroke-linecap="round"/>',
    headphone: '<path d="M18 58V48a32 32 0 0 1 64 0v10" stroke="currentColor" stroke-width="11" fill="none" stroke-linecap="round"/><rect x="8" y="54" width="22" height="30" rx="10" fill="currentColor"/><rect x="70" y="54" width="22" height="30" rx="10" fill="currentColor"/>',
    disc: '<circle cx="50" cy="50" r="34" fill="currentColor"/><circle cx="50" cy="50" r="10" fill="#0b1d2e" opacity=".45"/><circle cx="50" cy="50" r="3" fill="#f6c453"/><path d="M50 16a34 34 0 0 1 30 18" stroke="#0b1d2e" stroke-width="4" opacity=".3" fill="none"/>',
    clock: '<circle cx="50" cy="50" r="32" fill="currentColor"/><circle cx="50" cy="50" r="24" fill="#0b1d2e" opacity=".25"/><path d="M50 32v20l14 9" stroke="#f6c453" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    star: '<path d="M50 10l12 25 27 4-20 19 5 27-24-13-24 13 5-27-20-19 27-4z" fill="currentColor"/>',
    starburst: '<path d="M50 6l8 22 20-10-4 23 24 4-18 16 18 16-24 4 4 23-20-10-8 22-8-22-20 10 4-23-24-4 18-16-18-16 24-4-4-23 20 10z" fill="currentColor"/>'
  };


  var THEMES = {
    wonders:  { from: '#1b3a63', to: '#3a1d4d', ink: '#f6c453', icon: 'columns' },
    trivia:   { from: '#0f4c5c', to: '#12304f', ink: '#ffd166', icon: 'bubble' },
    history:  { from: '#4a2c14', to: '#2a1a10', ink: '#f0b357', icon: 'scroll' },
    movie:    { from: '#4a1533', to: '#1d1230', ink: '#ff7a9c', icon: 'clapper' },
    music:    { from: '#3a1250', to: '#16103a', ink: '#c9a7ff', icon: 'disc' },
    sports:   { from: '#0d3b2e', to: '#0a2436', ink: '#6ee7a8', icon: 'trophy' },
    travel:   { from: '#0f3f5e', to: '#0a2030', ink: '#7dd3fc', icon: 'plane' },
    geography:{ from: '#154b2e', to: '#0d2a3d', ink: '#a3e635', icon: 'globe' },
    science:  { from: '#2a2258', to: '#0e1636', ink: '#a5b4fc', icon: 'flask' },
    game:     { from: '#3b1740', to: '#17103a', ink: '#f472b6', icon: 'controller' },
    food:     { from: '#5a2a12', to: '#2a1408', ink: '#fbbf24', icon: 'plate' },
    celebrity:{ from: '#4b1d2e', to: '#1f0f22', ink: '#fda4af', icon: 'star' },
    retro:    { from: '#5c3a10', to: '#2b1a08', ink: '#fde047', icon: 'clock' },
    pop:      { from: '#123a52', to: '#101a30', ink: '#67e8f9', icon: 'headphone' },
    personality:{ from: '#3d1030', to: '#180d24', ink: '#f9a8d4', icon: 'mask' },
    brain:    { from: '#5c1f35', to: '#24101f', ink: '#fda4af', icon: 'starburst' }
  };


  function artDataUri(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* 生成一张 16:9 缩略图 */
  function thumb(theme, variant) {
    var t = THEMES[theme] || THEMES.trivia;
    var id = 't' + Math.random().toString(36).slice(2, 8);
    var icon = ICONS[t.icon] || ICONS.bubble;
    var v = variant || 0;

    var deco = '';
    /* 放射射线 */
    for (var i = 0; i < 14; i++) {
      var a = i * 25.7 + v * 11;
      deco += '<rect x="318" y="-120" width="46" height="640" fill="#ffffff" opacity="' + (i % 2 ? 0.03 : 0.05) + '" transform="rotate(' + a + ' 320 180)"/>';
    }
    /* 圆点 */
    var dots = [[70, 58, 13], [142, 40, 8], [560, 62, 11], [520, 320, 8], [46, 292, 10], [588, 190, 6], [214, 316, 7]];
    for (var d = 0; d < dots.length; d++) {
      deco += '<circle cx="' + (dots[d][0] + (v * 17) % 40) + '" cy="' + dots[d][1] + '" r="' + dots[d][2] + '" fill="#ffffff" opacity=".10"/>';
    }
    /* 底部弧线 */
    deco += '<path d="M-40 330c120-40 220 30 340-6s180-40 380 4v90H-40z" fill="#000000" opacity=".14"/>';

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">' +
      '<defs>' +
        '<linearGradient id="g' + id + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="' + t.from + '"/><stop offset="1" stop-color="' + t.to + '"/>' +
        '</linearGradient>' +
        '<linearGradient id="s' + id + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="' + t.ink + '" stop-opacity=".28"/>' +
          '<stop offset="1" stop-color="' + t.ink + '" stop-opacity=".05"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect width="640" height="360" fill="url(#g' + id + ')"/>' +
      deco +
      '<circle cx="320" cy="168" r="120" fill="#ffffff" opacity=".07"/>' +
      '<g transform="translate(320,168) scale(1.45) translate(-50,-50)" style="color:' + t.ink + '">' +
        '<g opacity=".92">' + icon + '</g>' +
      '</g>' +
      '<rect x="0" y="0" width="640" height="360" fill="url(#s' + id + ')"/>' +
      '</svg>';
    return artDataUri(svg);
  }

  global.CNTArt = {
    brainHead: brainHead,
    brainHeadMarkup: brainHeadMarkup,
    brainCharacter: brainCharacter,
    brainCharacterMarkup: brainCharacterMarkup,
    progressSprite: progressSprite,
    logoMark: logoMark,
    heroMascot: heroMascot,
    thumb: thumb,
    themes: THEMES,
    iconSearch: iconSearch,
    iconSun: iconSun,
    iconMoon: iconMoon,
    iconGlobe: iconGlobe,
    iconSpeaker: iconSpeaker,
    iconMusic: iconMusic
  };
})(window);