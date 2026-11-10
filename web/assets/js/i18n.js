/* =============================================================================
   CNT Quiz — 界面文案字典（中文 / English）
   参考站的标志性细节：右上角语言下拉 + 深浅主题切换
   ============================================================================= */
(function (global) {
  'use strict';

  var LANGS = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'zh', label: '中文', flag: '中文' }
  ];

  var DICT = {
    en: {
      /* 顶部导航 */
      'nav.home': 'Home',
      'nav.search': 'Search',
      'nav.subscribe': 'Subscribe',
      'nav.emailPlaceholder': 'Enter your email',
      'nav.lang': 'Language',
      'nav.themeLight': 'Switch to light mode',
      'nav.themeDark': 'Switch to dark mode',
      'nav.menu': 'Menu',
      'nav.more': 'More',
      'nav.skip': 'Skip to content',

      /* Hero */
      'hero.todayQuiz': "TODAY'S QUIZ",
      'hero.play': 'PLAY',
      'hero.think': 'THINK YOU GOT WHAT IT TAKES?',
      'hero.prove': 'PROVE IT!',
      'hero.pick': 'Pick an answer, then hit PLAY',
      'hero.daily': 'Question of the day',

      /* 首页 */
      'home.quizCount': 'quizzes',
      'home.qCount': 'questions',
      'home.minutes': 'min',
      'home.start': 'START QUIZ',
      'home.all': 'ALL CATEGORIES',
      'home.featured': 'Featured',
      'home.funnelBadge': 'Dynamic',
      'home.funnelHint': 'A branching quiz — every answer changes the next round.',

      /* 页脚 */
      'footer.heading': 'Take Quizzes. Have Fun. Learn Something New!',
      'footer.text': 'Hand-made quizzes on history, science, movies, sports and more. New challenges every week, zero sign-up required.',
      'footer.about': 'About',
      'footer.contact': 'Contact',
      'footer.privacy': 'Privacy',
      'footer.terms': 'Terms',
      'footer.faq': 'FAQ',
      'footer.copyright': '© 2026 CNT Quiz. All rights reserved.',
      'footer.madeWith': 'Made with brains & caffeine',

      /* 答题页 */
      'quiz.restart': 'RESTART',
      'quiz.questionOf': 'Question',
      'quiz.of': 'of',
      'quiz.next': 'Next',
      'quiz.finish': 'Finish',
      'quiz.correct': 'CORRECT!',
      'quiz.wrong': 'NOT QUITE',
      'quiz.gotIt': 'GOT IT',
      'quiz.traits': 'Your traits',
      'quiz.step': 'Step',
      'quiz.qOf': 'Q',
      'quiz.unlock': 'Next layer unlocked',
      'quiz.notFound': 'Quiz not found',
      'quiz.notFoundDesc': 'This quiz id does not exist in the CNT Quiz library. It may have been retired.',
      'quiz.copyFail': 'Could not copy to clipboard',
      'quiz.scoreOf': 'Score',
      'quiz.answered': 'answered',
      'quiz.band': 'band',
      'quiz.tagged': 'Tag',
      'quiz.backToTop': 'Back to Top',
      'quiz.mute': 'Mute',
      'quiz.sound': 'Sound',
      'fx.correct': 'CORRECT!',
      'fx.perfect': 'PERFECT!',
      'fx.correctSub': 'You nailed it!',
      'fx.wrong': 'BOOM!',
      'fx.wrongSub': 'Wrong this time',
      'fx.pick': 'NOTED',
      'quiz.yourScore': 'YOUR SCORE',
      'quiz.outOf': 'out of',
      'quiz.playAgain': 'Play Again',
      'quiz.exploreMore': 'Explore More Quizzes',
      'quiz.backHome': 'Back to Home',
      'quiz.share': 'Copy Result',
      'quiz.shareDone': 'Result copied to clipboard',
      'quiz.perfectTitle': 'Flawless!',
      'quiz.perfectDesc': 'Perfect score. Your brain is doing laps around the block.',
      'quiz.greatTitle': 'Excellent!',
      'quiz.greatDesc': 'Strong knowledge — only a couple of wobbles left.',
      'quiz.okTitle': 'Not Bad',
      'quiz.okDesc': 'You know more than you think. One more round to polish it off.',
      'quiz.lowTitle': 'Worth Another Try',
      'quiz.lowDesc': 'The quiz does not forgive — but neither do we. Restart and beat it.',
      'quiz.startTitle': 'Ready?',
      'quiz.startDesc': 'Five questions, one score. Pick an option and go!',
      'quiz.startBtn': 'Start the Quiz',
      'quiz.layer': 'Layer',
      'quiz.funnelResult': 'Your result profile',

      /* 搜索 */
      'search.placeholder': 'Search quizzes, categories, topics…',
      'search.results': 'results',
      'search.noResults': 'No quizzes found',
      'search.noResultsHint': 'Try a different keyword — “space”, “movie”, “brain”…',
      'search.close': 'Close',
      'search.inCategory': 'in',

      /* 404 */
      'err.code': '404',
      'err.title': 'This question went missing',
      'err.desc': 'The page you were looking for is not here. Maybe it dropped out of the pool during the swim.',
      'err.cta': 'Back to Home',
      'err.browse': 'Browse categories'
    },

    zh: {
      /* 顶部导航 */
      'nav.home': '首页',
      'nav.search': '搜索',
      'nav.subscribe': '订阅',
      'nav.emailPlaceholder': '输入你的邮箱',
      'nav.lang': '语言',
      'nav.themeLight': '切换到浅色模式',
      'nav.themeDark': '切换到深色模式',
      'nav.menu': '菜单',
      'nav.more': '更多',
      'nav.skip': '跳到主要内容',

      /* Hero */
      'hero.todayQuiz': '今日测验',
      'hero.play': '开始测验',
      'hero.think': '你以为你过关了吗？',
      'hero.prove': '来证明！',
      'hero.pick': '先选一个答案，再点击开始',
      'hero.daily': '每日一题',

      /* 首页 */
      'home.quizCount': '个测验',
      'home.qCount': '道题目',
      'home.minutes': '分钟',
      'home.start': '开始测验',
      'home.all': '全部分类',
      'home.featured': '精选',
      'home.funnelBadge': '动态分支',
      'home.funnelHint': '分支式测验 —— 每一道回答都会改变下一轮的题目。',

      /* 页脚 */
      'footer.heading': '做测验，有趣，还能学到新东西！',
      'footer.text': '历史、科学、影视、体育等主题的原创小测验。每周更新新挑战，无需注册即可开玩。',
      'footer.about': '关于我们',
      'footer.contact': '联系我们',
      'footer.privacy': '隐私政策',
      'footer.terms': '服务条款',
      'footer.faq': '常见问题',
      'footer.copyright': '© 2026 CNT Quiz 版权所有',
      'footer.madeWith': '用大脑与咖啡因制作',

      /* 答题页 */
      'quiz.restart': '重新开始',
      'quiz.questionOf': '第',
      'quiz.of': '题 / 共',
      'quiz.next': '下一题',
      'quiz.finish': '完成',
      'quiz.correct': '回答正确！',
      'quiz.wrong': '不太对哦',
      'quiz.gotIt': '记下了',
      'quiz.traits': '你的特征',
      'quiz.step': '第',
      'quiz.qOf': '题',
      'quiz.unlock': '进入下一层',
      'quiz.notFound': '没有找到这个测验',
      'quiz.notFoundDesc': 'CNT Quiz 题目库里没有这个 id，它可能已经下架了。',
      'quiz.copyFail': '复制到剪贴板失败',
      'quiz.scoreOf': '得分',
      'quiz.answered': '已作答',
      'quiz.band': '区间',
      'quiz.tagged': '标签',
      'quiz.backToTop': '回到顶部',
      'quiz.mute': '静音',
      'quiz.sound': '音效',
      'fx.correct': '答对啦！',
      'fx.perfect': '太棒了！',
      'fx.correctSub': '就是这个！',
      'fx.wrong': '轰！',
      'fx.wrongSub': '不是这个哦',
      'fx.pick': '记下了',
      'quiz.yourScore': '你的得分',
      'quiz.outOf': '总分',
      'quiz.playAgain': '再玩一次',
      'quiz.exploreMore': '逛逛更多测验',
      'quiz.backHome': '返回首页',
      'quiz.share': '复制成绩',
      'quiz.shareDone': '成绩已复制到剪贴板',
      'quiz.perfectTitle': '满分通关！',
      'quiz.perfectDesc': '一题不差，你的大脑刚刚绕着街区跑了两圈。',
      'quiz.greatTitle': '非常棒！',
      'quiz.greatDesc': '知识相当扎实，只剩个别小摇摆。',
      'quiz.okTitle': '还不错',
      'quiz.okDesc': '你知道的比自己以为的更多，再来一轮就能打磨到位。',
      'quiz.lowTitle': '值得再试一次',
      'quiz.lowDesc': '这套题不宽容 —— 但我们也不。重新开始，把它拿下。',
      'quiz.startTitle': '准备好了吗？',
      'quiz.startDesc': '五道题，一个分数。选个答案就开始！',
      'quiz.startBtn': '开始答题',
      'quiz.layer': '第',
      'quiz.funnelResult': '你的结果画像',

      /* 搜索 */
      'search.placeholder': '搜索测验、分类、主题…',
      'search.results': '条结果',
      'search.noResults': '没有找到相关测验',
      'search.noResultsHint': '换个关键词试试 —— “太空”“电影”“脑筋急转弯”…',
      'search.close': '关闭',
      'search.inCategory': '来自',

      /* 404 */
      'err.code': '404',
      'err.title': '这道题不见了',
      'err.desc': '你访问的页面不在这里。也许它游泳的时候掉出了池子。',
      'err.cta': '回到首页',
      'err.browse': '浏览全部分类'
    }
  };


  /* 漏斗标签与分值区间（显示用） */
  var TAGS = {
    visual:     { en: 'Visual',     zh: '视觉型' },
    auditory:   { en: 'Auditory',   zh: '听觉型' },
    kinesthetic:{ en: 'Hands-on',   zh: '动手型' },
    reading:    { en: 'Reading',    zh: '阅读型' },
    focus:      { en: 'Deep focus', zh: '深度聚焦' },
    practice:   { en: 'Practice',   zh: '反复练习' },
    review:     { en: 'Review',     zh: '计划回顾' },
    pace:       { en: 'Rhythm',     zh: '节奏型' },
    tools:      { en: 'Toolkit',    zh: '工具型' },
    structure:  { en: 'Structure',  zh: '结构沉淀' }
  };
  var BANDS = {
    low:  { en: 'Low band',  zh: '低分区间' },
    mid:  { en: 'Mid band',  zh: '中分区间' },
    high: { en: 'High band', zh: '高分区间' }
  };
  var current = 'en';

  function detect() {
    try {
      var saved = localStorage.getItem('cnt_lang');
      if (saved && DICT[saved]) return saved;
    } catch (e) { /* localStorage 不可用时忽略 */ }
    var nav = (navigator.language || 'en').toLowerCase();
    if (nav.indexOf('zh') === 0) return 'zh';
    return 'en';
  }

  current = detect();

  function t(key, fallback) {
    var pack = DICT[current] || DICT.en;
    if (pack[key] !== undefined) return pack[key];
    if (DICT.en[key] !== undefined) return DICT.en[key];
    return fallback !== undefined ? fallback : key;
  }

  /* 取双语对象（{en,zh}）在当前语言下的文本 */
  function pick(obj, fallback) {
    if (obj === null || obj === undefined) return fallback || '';
    if (typeof obj === 'string') return obj;
    if (obj[current] !== undefined) return obj[current];
    if (obj.en !== undefined) return obj.en;
    if (obj.zh !== undefined) return obj.zh;
    return fallback || '';
  }

  function setLang(code) {
    if (!DICT[code]) return;
    current = code;
    try { localStorage.setItem('cnt_lang', code); } catch (e) {}
    document.documentElement.setAttribute('lang', code === 'zh' ? 'zh-CN' : 'en');
    document.dispatchEvent(new CustomEvent('cnt:langchange', { detail: { lang: code } }));
  }

  function getLang() { return current; }

  global.CNTI18n = {
    langs: LANGS,
    t: t,
    pick: pick,
    setLang: setLang,
    getLang: getLang,
    tagLabel: function (tag) { return pick(TAGS[tag] || { en: tag, zh: tag }); },
    bandLabel: function (band) { return pick(BANDS[band] || { en: band, zh: band }); }
  };
})(window);
