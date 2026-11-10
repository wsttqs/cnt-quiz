/* =============================================================================
   CNT Quiz — 答题引擎（普通问答 + 动态漏斗分支题）
   参考站答题页结构：顶部工具条（重置 / 进度条 + 走动角色 / 音效）→ 大图 → 问题 →
   白色选项按钮 → 绿色/灰色作答态 + 白色反馈卡 + 红色 Next → 结果页
   ============================================================================= */
(function (global) {
  'use strict';

  var I18N = global.CNTI18n;
  var Data = global.CNTData;
  var Art = global.CNTArt;
  var CNT = global.CNT;

  var t = function (k, f) { return I18N.t(k, f); };
  var pick = function (o, f) { return I18N.pick(o, f); };
  var rich = function (s) { return CNT.rich(s); };
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /* ------------------------------------------------------------------
     运行状态
     ------------------------------------------------------------------ */
  var S = {
    quiz: null,
    funnel: false,
    qi: 0,             /* 普通题：当前题序；漏斗：全局已答数 */
    answered: 0,       /* 已作答数量 */
    picks: [],         /* 普通题：每题所选下标 */
    correct: 0,        /* 普通题：答对数 */
    layerIdx: 0,       /* 漏斗：当前层 */
    groupKey: null,    /* 漏斗：当前题组 */
    groupPos: 0,       /* 漏斗：题组内进度 */
    path: [],          /* 漏斗：已确定的路径 [{layerIdx, groupKey, size}] */
    layerScores: [],   /* 漏斗：每层的标签得分 */
    outcome: [],       /* 漏斗：每层的产出 {tag, score, bucket} */
    picked: null,      /* 本题所选下标 */
    locked: false,     /* 是否已作答（锁定） */
    done: false
  };

  /* ------------------------------------------------------------------
     环境音乐（WebAudio 轻音循环）
     ------------------------------------------------------------------ */
  var music = { on: false, timer: null, ctx: null };
  function softTone(freq, dur) {
    var c = music.ctx;
    if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.022, c.currentTime + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g); g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur + 0.05);
  }
  function setMusic(on) {
    music.on = !!on;
    if (music.on) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) { music.on = false; return; }
      if (!music.ctx) music.ctx = new AC();
      if (music.ctx.state === 'suspended' && music.ctx.resume) music.ctx.resume();
      var notes = [261.63, 329.63, 392.0, 329.63, 293.66, 349.23, 440.0, 349.23];
      var i = 0;
      clearInterval(music.timer);
      music.timer = setInterval(function () {
        if (CNT.sfx.isMuted()) return;
        softTone(notes[i % notes.length], 0.55);
        i++;
      }, 720);
    } else {
      clearInterval(music.timer);
      music.timer = null;
    }
  }

  /* ------------------------------------------------------------------
     题目读取
     ------------------------------------------------------------------ */
  function currentList() {
    if (!S.funnel) return S.quiz.questions;
    var layer = S.quiz.layers[S.layerIdx];
    var group = layer.groups[S.groupKey];
    return group ? group.questions : [];
  }
  function currentQuestion() {
    var list = currentList();
    if (S.funnel) return list[S.groupPos] || null;
    return list[S.qi] || null;
  }
  function totalQuestions() {
    if (!S.funnel) return S.quiz.questions.length;
    var total = 0, i, g;
    for (i = 0; i < S.path.length; i++) total += S.path[i].size;
    for (i = S.path.length; i < S.quiz.layers.length; i++) {
      var layer = S.quiz.layers[i];
      var max = 0;
      for (g in layer.groups) {
        if (Object.prototype.hasOwnProperty.call(layer.groups, g)) {
          max = Math.max(max, layer.groups[g].questions.length);
        }
      }
      total += max;
    }
    return Math.max(total, S.answered + 1);
  }
  function isLastQuestion() {
    if (!S.funnel) return S.qi >= S.quiz.questions.length - 1;
    var layer = S.quiz.layers[S.layerIdx];
    var group = layer.groups[S.groupKey];
    return S.groupPos >= group.questions.length - 1;
  }

  /* ------------------------------------------------------------------
     漏斗：计分 / 区间 / 路由
     ------------------------------------------------------------------ */
  function addScore(layer, weights) {
    var scores = S.layerScores[S.layerIdx];
    if (!scores) { scores = {}; S.layerScores[S.layerIdx] = scores; }
    for (var tag in weights) {
      if (!Object.prototype.hasOwnProperty.call(weights, tag)) continue;
      scores[tag] = (scores[tag] || 0) + weights[tag];
    }
  }
  function layerWinner(layer) {
    var scores = S.layerScores[S.layerIdx] || {};
    var priority = layer.tagPriority || [];
    var best = null, bestScore = 0;
    var tags = [];
    for (var tag in scores) {
      if (Object.prototype.hasOwnProperty.call(scores, tag)) tags.push(tag);
    }
    /* 先按 tagPriority 排序，再按分数取最大（同分靠前者胜出） */
    tags.sort(function (a, b) {
      var ia = priority.indexOf(a), ib = priority.indexOf(b);
      if (ia === -1) ia = priority.length;
      if (ib === -1) ib = priority.length;
      if (ia !== ib) return ia - ib;
      return a < b ? -1 : 1;
    });
    for (var i = 0; i < tags.length; i++) {
      var s = scores[tags[i]];
      if (best === null || s > bestScore) { best = tags[i]; bestScore = s; }
    }
    if (!best || bestScore <= 0) {
      best = layer.defaultTag || (tags[0] || 'visual');
      bestScore = scores[best] || 0;
    }
    return { tag: best, score: bestScore };
  }
  function bucketOf(layer, score) {
    var buckets = layer.buckets || [];
    for (var i = 0; i < buckets.length; i++) {
      var b = buckets[i];
      var min = (b.min === undefined || b.min === null) ? -Infinity : b.min;
      var max = (b.max === undefined || b.max === null) ? Infinity : b.max;
      if (score >= min && score <= max) return b.id;
    }
    return buckets.length ? buckets[buckets.length - 1].id : 'low';
  }
  function routeNext(layer, tag, bucket) {
    var routes = layer.routes || [];
    for (var i = 0; i < routes.length; i++) {
      if (routes[i].tag === tag && routes[i].bucket === bucket) return routes[i].group;
    }
    return layer.defaultGroup;
  }

  /* ------------------------------------------------------------------
     结果匹配
     ------------------------------------------------------------------ */
  function matchResult() {
    var qz = S.quiz;
    for (var i = 0; i < qz.results.length; i++) {
      var r = qz.results[i];
      var ok = true;
      for (var c = 0; c < r.when.length; c++) {
        var cond = r.when[c];
        var out = S.outcome[layerIndexOf(cond.layer)];
        if (!out) { ok = false; break; }
        var val = cond.kind === 'tag' ? out.tag : out.bucket;
        if (val !== cond.value) { ok = false; break; }
      }
      if (ok) return r;
    }
    return qz.defaultResult;
  }
  function layerIndexOf(id) {
    for (var i = 0; i < S.quiz.layers.length; i++) {
      if (S.quiz.layers[i].id === id) return i;
    }
    return 0;
  }

  /* ------------------------------------------------------------------
     HTML 片段
     ------------------------------------------------------------------ */
  function toolbarHTML() {
    var total = totalQuestions();
    var pct = total ? Math.min(100, Math.round((S.answered / total) * 100)) : 0;
    var cur = S.funnel ? (S.answered + 1) : (S.qi + 1);
    var label = t('quiz.questionOf') + ' ' + cur + ' ' + t('quiz.of') + ' ' + total;
    return '' +
      '<div class="quiz-toolbar">' +
        '<button type="button" class="quiz-restart-btn" id="btnRestart">' +
          '<span aria-hidden="true">⟲</span>' + esc(t('quiz.restart')) + '</button>' +
        '<div class="quiz-progress">' +
          '<div class="quiz-progress-fill" style="width:' + pct + '%"></div>' +
          '<span class="quiz-progress-label">' + esc(label) + '</span>' +
          '<span class="quiz-character" style="left:' + pct + '%" aria-hidden="true">' + Art.progressSprite() + '</span>' +
        '</div>' +
        '<button type="button" class="quiz-tool-btn' + (CNT.sfx.isMuted() ? '' : ' is-on') + '" id="btnSfx" ' +
          'title="' + esc(t('quiz.sound')) + '" aria-label="' + esc(t('quiz.sound')) + '">' + Art.iconSpeaker(!CNT.sfx.isMuted(), 18) + '</button>' +
        '<button type="button" class="quiz-tool-btn' + (music.on ? ' is-on' : '') + '" id="btnMusic" ' +
          'title="' + esc(t('quiz.mute')) + '" aria-label="' + esc(t('quiz.mute')) + '">' + Art.iconMusic(18) + '</button>' +
      '</div>';
  }

  function stepsHTML() {
    if (!S.funnel) return '';
    var html = S.quiz.layers.map(function (L, i) {
      var cls = i < S.layerIdx ? ' is-done' : (i === S.layerIdx ? ' is-active' : '');
      var mark = i < S.layerIdx ? '✓ ' : (i === S.layerIdx ? '▶ ' : '');
      return '<span class="funnel-step' + cls + '">' + mark + rich(pick(L.label)) + '</span>';
    }).join('');
    return '<div class="funnel-steps">' + html + '</div>';
  }

  function stageHTML(imgSrc, feedback) {
    return '' +
      '<div class="quiz-stage">' +
        '<div class="quiz-stage__img"><img src="' + imgSrc + '" alt="" width="640" height="360"></div>' +
        (feedback || '') +
      '</div>';
  }

  function feedbackHTML(cfg) {
    return '' +
      '<div class="quiz-feedback ' + cfg.cls + '" role="status">' +
        '<div class="quiz-feedback__body">' +
          '<div class="quiz-feedback__verdict"><span class="ico" aria-hidden="true">' + cfg.ico + '</span>' + esc(cfg.verdict) + '</div>' +
          '<p class="quiz-feedback__text">' + rich(cfg.text) + '</p>' +
        '</div>' +
        '<button type="button" class="quiz-feedback__next" id="btnNext">' + esc(cfg.next) +
          '<span class="arrow" aria-hidden="true">→</span></button>' +
      '</div>';
  }

  function optionsHTML(items, mode, answerIdx, pickedIdx) {
    return '<div class="quiz-options" id="quizOptions">' + items.map(function (text, i) {
      var cls = '', mark = '';
      if (mode === 'correct') {
        if (i === answerIdx) { cls = ' quiz-option--correct'; mark = '✓'; }
        else if (i === pickedIdx) { cls = ' quiz-option--wrong'; mark = '✕'; }
        else { cls = ' quiz-option--muted'; }
      } else if (mode === 'picked') {
        if (i === pickedIdx) { cls = ' quiz-option--picked'; mark = '★'; }
        else { cls = ' quiz-option--muted'; }
      }
      return '<button type="button" class="quiz-option' + cls + '" data-opt="' + i + '"' + (S.locked ? ' disabled' : '') + '>' +
        '<span>' + rich(text) + '</span>' +
        '<span class="quiz-option__mark" aria-hidden="true">' + mark + '</span>' +
      '</button>';
    }).join('') + '</div>';
  }

  function bottomBtnHTML() {
    return '<button type="button" class="quiz-bottom-btn" id="btnTop">' + esc(t('quiz.backToTop')) + '</button>';
  }

  /* ------------------------------------------------------------------
     渲染：普通题
     ------------------------------------------------------------------ */
  function renderRegular() {
    var q = currentQuestion();
    var host = document.getElementById('app');
    if (!q) return;

    var img = Art.thumb(S.quiz.theme, S.qi);
    var opts = q.o.map(function (o) { return pick(o); });
    var feedback = '';

    if (S.locked) {
      var ok = S.picks[S.qi] === q.a;
      feedback = feedbackHTML({
        cls: ok ? 'is-correct' : 'is-wrong',
        ico: ok ? '✔' : '✘',
        verdict: ok ? t('quiz.correct') : t('quiz.wrong'),
        text: pick(q.f),
        next: isLastQuestion() ? t('quiz.finish') : t('quiz.next')
      });
    }

    host.innerHTML = '' +
      '<div class="quiz-page">' +
        toolbarHTML() +
        '<h1 class="quiz-title">' + rich(pick(S.quiz.title)) + '</h1>' +
        stepsHTML() +
        stageHTML(img, feedback) +
        '<h2 class="quiz-question-title">' + rich(pick(q.q)) + '</h2>' +
        optionsHTML(opts, S.locked ? 'correct' : 'open', q.a, S.picked) +
        bottomBtnHTML() +
      '</div>';

    wireQuestion();
  }

  /* ------------------------------------------------------------------
     渲染：漏斗题
     ------------------------------------------------------------------ */
  function renderFunnel() {
    var q = currentQuestion();
    var host = document.getElementById('app');
    if (!q) return;

    var img = Art.thumb(S.quiz.theme, S.layerIdx * 4 + S.groupPos);
    var opts = q.o.map(function (o) { return pick(o); });
    var feedback = '';

    if (S.locked) {
      var fbText = (q.fb && q.fb[S.picked]) ? pick(q.fb[S.picked]) : pick(q.q);
      var nextLabel = t('quiz.next');
      if (isLastQuestion()) {
        nextLabel = (S.layerIdx < S.quiz.layers.length - 1) ? t('quiz.unlock') : t('quiz.finish');
      }
      feedback = feedbackHTML({
        cls: 'is-correct',
        ico: '★',
        verdict: t('quiz.gotIt'),
        text: fbText,
        next: nextLabel
      });
    }

    host.innerHTML = '' +
      '<div class="quiz-page">' +
        toolbarHTML() +
        '<h1 class="quiz-title">' + rich(pick(S.quiz.title)) + '</h1>' +
        stepsHTML() +
        stageHTML(img, feedback) +
        '<h2 class="quiz-question-title">' + rich(pick(q.q)) + '</h2>' +
        optionsHTML(opts, S.locked ? 'picked' : 'open', -1, S.picked) +
        bottomBtnHTML() +
      '</div>';

    wireQuestion();
  }

  function render() {
    if (S.done) return renderResult();
    if (S.funnel) renderFunnel(); else renderRegular();
  }

  /* ------------------------------------------------------------------
     交互绑定
     ------------------------------------------------------------------ */
  function wireQuestion() {
    var box = document.getElementById('quizOptions');
    if (box) {
      box.addEventListener('click', function (e) {
        var btn = e.target.closest('.quiz-option');
        if (!btn || S.locked) return;
        S.picked = parseInt(btn.getAttribute('data-opt'), 10);
        S.locked = true;
        CNT.sfx.click();
        /* 记录被点击按钮的视口坐标，作为特效原点 */
        var rect = btn.getBoundingClientRect();
        answer({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      });
    }
    var next = document.getElementById('btnNext');
    if (next) {
      next.addEventListener('click', function () {
        CNT.sfx.click();
        advance();
      });
    }
    wireCommon();
  }

  function wireCommon() {
    var restart = document.getElementById('btnRestart');
    if (restart) {
      restart.addEventListener('click', function () {
        CNT.sfx.click();
        if (global.CNTEffects) global.CNTEffects.clear();
        resetState();
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    var top = document.getElementById('btnTop');
    if (top) {
      top.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    var sfxBtn = document.getElementById('btnSfx');
    if (sfxBtn) {
      sfxBtn.addEventListener('click', function () {
        var muted = !CNT.sfx.isMuted();
        CNT.sfx.setMuted(muted);
        sfxBtn.classList.toggle('is-on', !muted);
        sfxBtn.textContent = muted ? '🔇' : '🔊';
        if (!muted) CNT.sfx.click();
      });
    }
    var musicBtn = document.getElementById('btnMusic');
    if (musicBtn) {
      musicBtn.addEventListener('click', function () {
        setMusic(!music.on);
        musicBtn.classList.toggle('is-on', music.on);
        if (music.on) softTone(392.0, 0.4);
      });
    }
  }

  /* ------------------------------------------------------------------
     作答与推进
     ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------
     答对 / 答错 互动特效（答对 = 奖杯 + 彩带，答错 = 炸弹 + 爆炸）
     ------------------------------------------------------------------ */
  function fxCorrect(origin) {
    if (global.CNTEffects) global.CNTEffects.correct(origin);
  }
  function fxWrong(origin) {
    if (global.CNTEffects) global.CNTEffects.wrong(origin);
  }
  function fxPick(origin) {
    if (global.CNTEffects) global.CNTEffects.pick(origin);
  }
  function celebrate() {
    if (!global.CNTEffects) return;
    var total = S.quiz.questions.length;
    var ratio = S.funnel ? 1 : (total ? S.correct / total : 0);
    global.CNTEffects.celebrate(ratio >= 0.6 ? 'high' : 'low');
  }

  function answer(origin) {
    var q = currentQuestion();
    if (!q) return;

    if (!S.funnel) {
      S.picks[S.qi] = S.picked;
      S.answered++;
      var ok = S.picked === q.a;
      if (ok) {
        S.correct++;
        CNT.sfx.correct();
        fxCorrect(origin);
      } else {
        CNT.sfx.wrong();
        fxWrong(origin);
      }
    } else {
      S.answered++;
      var weights = (q.t && q.t[S.picked]) || {};
      addScore(S.quiz.layers[S.layerIdx], weights);
      CNT.sfx.correct();
      fxPick(origin);
    }
    render();
    /* 滚动到反馈卡 */
    setTimeout(function () {
      var fb = document.querySelector('.quiz-feedback');
      if (fb && fb.scrollIntoView) fb.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  }

  function advance() {
    if (S.funnel) {
      var layer = S.quiz.layers[S.layerIdx];
      var group = layer.groups[S.groupKey];
      if (S.groupPos < group.questions.length - 1) {
        S.groupPos++;
        S.locked = false;
        S.picked = null;
        render();
        scrollToQuestion();
        return;
      }
      /* 本层结束：结算并路由 */
      var w = layerWinner(layer);
      var bucket = bucketOf(layer, w.score);
      S.outcome[S.layerIdx] = { tag: w.tag, score: w.score, bucket: bucket };

      if (S.layerIdx < S.quiz.layers.length - 1) {
        var nextGroup = routeNext(layer, w.tag, bucket);
        var nextLayer = S.quiz.layers[S.layerIdx + 1];
        if (!nextLayer.groups[nextGroup]) nextGroup = nextLayer.defaultGroup;
        S.layerIdx++;
        S.groupKey = nextGroup;
        S.groupPos = 0;
        S.path.push({ layerIdx: S.layerIdx, groupKey: nextGroup, size: nextLayer.groups[nextGroup].questions.length });
        S.locked = false;
        S.picked = null;
        CNT.sfx.finish();
        render();
        scrollToQuestion();
        return;
      }
      S.done = true;
      CNT.sfx.finish();
      render();
      celebrate();
      return;
    }

    /* 普通题 */
    if (S.qi < S.quiz.questions.length - 1) {
      S.qi++;
      S.locked = false;
      S.picked = null;
      render();
      scrollToQuestion();
    } else {
      S.done = true;
      CNT.sfx.finish();
      render();
      celebrate();
    }
  }

  function scrollToQuestion() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ------------------------------------------------------------------
     结果页
     ------------------------------------------------------------------ */
  function resultTraitsHTML(traits) {
    if (!traits || !traits.length) return '';
    return '<ul class="quiz-result__traits">' + traits.map(function (tr) {
      return '<li>' + rich(pick(tr)) + '</li>';
    }).join('') + '</ul>';
  }

  function renderResult() {
    var host = document.getElementById('app');
    var badge, score, label, title, desc, traits = '';

    if (S.funnel) {
      var r = matchResult();
      var out0 = S.outcome[0] || { tag: 'visual' };
      badge = '🧠 ' + esc(t('quiz.funnelResult'));
      score = esc(I18N.tagLabel(out0.tag));
      label = esc(t('quiz.funnelResult'));
      title = rich(pick(r.title));
      desc = rich(pick(r.desc));
      traits = resultTraitsHTML(r.traits);
    } else {
      var total = S.quiz.questions.length;
      var ratio = total ? S.correct / total : 0;
      badge = '🎯 ' + Math.round(ratio * 100) + '%';
      score = S.correct + '/' + total;
      label = esc(t('quiz.yourScore'));
      if (ratio === 1) { title = esc(t('quiz.perfectTitle')); desc = esc(t('quiz.perfectDesc')); }
      else if (ratio >= 0.6) { title = esc(t('quiz.greatTitle')); desc = esc(t('quiz.greatDesc')); }
      else if (ratio >= 0.4) { title = esc(t('quiz.okTitle')); desc = esc(t('quiz.okDesc')); }
      else { title = esc(t('quiz.lowTitle')); desc = esc(t('quiz.lowDesc')); }
    }

    host.innerHTML = '' +
      '<div class="quiz-page">' +
        '<div class="quiz-result' + (S.funnel ? ' quiz-result--funnel' : '') + '">' +
          '<span class="quiz-result__badge">' + badge + '</span>' +
          '<div class="quiz-result__score">' + score + '</div>' +
          '<div class="quiz-result__label">' + label + '</div>' +
          '<h2 class="quiz-result__title">' + title + '</h2>' +
          '<p class="quiz-result__desc">' + desc + '</p>' +
          traits +
          '<div class="quiz-result__actions">' +
            '<button type="button" class="btn btn--primary" id="btnAgain">↻ ' + esc(t('quiz.playAgain')) + '</button>' +
            '<a class="btn" href="index.html#all">' + esc(t('quiz.exploreMore')) + '</a>' +
            '<a class="btn" href="index.html">' + esc(t('quiz.backHome')) + '</a>' +
            '<button type="button" class="btn" id="btnCopy">⧉ ' + esc(t('quiz.share')) + '</button>' +
          '</div>' +
        '</div>' +
        bottomBtnHTML() +
      '</div>';

    var again = document.getElementById('btnAgain');
    if (again) {
      again.addEventListener('click', function () {
        CNT.sfx.click();
        if (global.CNTEffects) global.CNTEffects.clear();
        resetState();
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    var copy = document.getElementById('btnCopy');
    if (copy) {
      copy.addEventListener('click', function () {
        var text = resultText();
        copyText(text, function (ok) {
          CNT.toast(ok ? t('quiz.shareDone') : t('quiz.copyFail'));
          if (ok) CNT.sfx.correct();
        });
      });
    }
    wireCommon();
  }

  function resultText() {
    var qz = pick(S.quiz.title);
    if (S.funnel) {
      var r = matchResult();
      var out0 = S.outcome[0] || { tag: 'visual' };
      return 'CNT Quiz · ' + qz + ' → ' + pick(r.title) + ' (' + I18N.tagLabel(out0.tag) + ')';
    }
    var total = S.quiz.questions.length;
    return 'CNT Quiz · ' + qz + ' → ' + S.correct + '/' + total + ' (' + Math.round((S.correct / total) * 100) + '%)';
  }

  function copyText(text, cb) {
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        cb(ok);
      } catch (e) { cb(false); }
    }
    if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
      global.navigator.clipboard.writeText(text).then(function () { cb(true); }, fallback);
    } else {
      fallback();
    }
  }

  /* ------------------------------------------------------------------
     初始化
     ------------------------------------------------------------------ */
  function resetState() {
    S.qi = 0;
    S.answered = 0;
    S.picks = [];
    S.correct = 0;
    S.layerIdx = 0;
    S.groupKey = null;
    S.groupPos = 0;
    S.path = [];
    S.layerScores = [];
    S.outcome = [];
    S.picked = null;
    S.locked = false;
    S.done = false;
  }

  function start(quiz) {
    S.quiz = quiz;
    S.funnel = quiz.type === 'funnel';
    resetState();
    if (S.funnel) {
      var layer = quiz.layers[0];
      S.groupKey = layer.entryGroup || Object.keys(layer.groups)[0];
      S.path.push({ layerIdx: 0, groupKey: S.groupKey, size: layer.groups[S.groupKey].questions.length });
    }
  }

  function notFound() {
    var host = document.getElementById('app');
    host.innerHTML = '' +
      '<div class="error-page">' +
        '<div class="error-code-wrap"><small>' + esc(t('quiz.notFound')) + '</small></div>' +
        '<div class="error-code">404</div>' +
        '<h2>' + esc(t('quiz.notFound')) + '</h2>' +
        '<p>' + esc(t('quiz.notFoundDesc')) + '</p>' +
        '<div class="error-cta-row">' +
          '<a class="btn btn--primary" href="index.html">' + esc(t('err.cta')) + '</a>' +
          '<a class="btn" href="index.html#all">' + esc(t('err.browse')) + '</a>' +
        '</div>' +
      '</div>';
  }

  function boot() {
    var id = CNT.params().id;
    var quiz = Data.byId(id);
    if (!quiz) {
      document.title = 'CNT Quiz — 404';
      CNT.mount({ onReady: notFound });
      return;
    }
    global.__CNT_ACTIVE_CAT__ = quiz.cat;
    start(quiz);

    CNT.mount({
      activeCat: quiz.cat,
      onReady: function () { render(); }
    });

    document.addEventListener('cnt:langchange', function () { render(); });

    /* 键盘：1–4 选择，Enter 进入下一题 */
    document.addEventListener('keydown', function (e) {
      if (S.done || S.locked) return;
      var tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9) {
        var btns = document.querySelectorAll('#quizOptions .quiz-option');
        if (btns[n - 1]) { e.preventDefault(); btns[n - 1].click(); }
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && S.locked && !S.done) {
        var next = document.getElementById('btnNext');
        if (next) { e.preventDefault(); next.click(); }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);