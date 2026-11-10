/* =============================================================================
   CNT Quiz — 题库数据
   文案格式：[英文, 中文] 二元组，载入时统一转成 {en, zh}
   题目格式：{ q:[en,zh], o:[[en,zh]×4], a:正确项下标, f:[en,zh] 解析 }
   动态漏斗题：type:'funnel'，含 layers(漏斗层) / routes(层间路由) / results(结果页匹配)
   ============================================================================= */
(function (global) {
  'use strict';

  /* ---------- 双语文本归一化 ---------- */
  function L(x) {
    if (x === null || x === undefined) return '';
    if (Array.isArray(x)) return { en: x[0], zh: x[1] === undefined ? x[0] : x[1] };
    return x;
  }

  var CATEGORIES = [
    { id: 'trivia', theme: 'trivia', icon: 'bubble',
      name: ['Trivia', '趣味常识'],
      blurb: ['Everyday brain-ticklers for everyone', '人人都会的生活冷知识'] },
    { id: 'history', theme: 'history', icon: 'scroll',
      name: ['History', '历史长河'],
      blurb: ['From pyramids to moon landings', '从金字塔到登月'] },
    { id: 'science', theme: 'science', icon: 'flask',
      name: ['Science', '科学探索'],
      blurb: ['Lab coats, deep oceans, far-off stars', '实验室、深海与遥远星辰'] },
    { id: 'geography', theme: 'geography', icon: 'globe',
      name: ['Geography', '地理世界'],
      blurb: ['Capitals, deserts, flags and far horizons', '首都、沙漠、国旗与远方'] },
    { id: 'sports', theme: 'sports', icon: 'trophy',
      name: ['Sports', '体育竞技'],
      blurb: ['The roar of the crowd, on and off the pitch', '赛场内外的欢呼时刻'] },
    { id: 'movies', theme: 'movie', icon: 'clapper',
      name: ['Movies', '影视巨幕'],
      blurb: ['Blockbusters, bangers and behind the scenes', '大片、佳作与幕后故事'] },
    { id: 'music', theme: 'music', icon: 'disc',
      name: ['Music', '音乐现场'],
      blurb: ['Composers, chart-toppers and instruments', '作曲家、榜单与乐器'] },
    { id: 'brain', theme: 'brain', icon: 'starburst',
      name: ['Brain Teasers', '脑筋急转弯'],
      blurb: ['Riddles, wordplay and quick-fire puzzles', '谜语、文字游戏与烧脑快问快答'] },
    { id: 'lab', theme: 'personality', icon: 'mask',
      name: ['CNT Lab', '智能实验室'],
      blurb: ['Self-discovery quizzes that adapt to you', '会随你回答变化的自我探索测验'] }
  ];

  var QUIZZES = [];

  function add(q) {
    q.title = L(q.title);
    q.desc = L(q.desc);
    q.level = L(q.level);
    (q.questions || []).forEach(function (it) {
      it.q = L(it.q);
      it.f = L(it.f);
      it.o = (it.o || []).map(L);
    });
    QUIZZES.push(q);
    return q;
  }

  /* =====================================================================
     1. TRIVIA — 趣味常识
     ===================================================================== */
  add({
    id: 'ultimate-general-knowledge', cat: 'trivia', theme: 'trivia',
    title: ['Ultimate General Knowledge', '终极常识大挑战'],
    desc: ['Ten things you think you know — until you do not.', '十道自以为知道、其实未必答对的题目。'],
    level: ['Easy', '入门'], minutes: 3,
    questions: [
      { q: ['Which planet is known as the Red Planet?', '哪颗行星被称为「红色星球」？'],
        o: [['Mars', '火星'], ['Venus', '金星'], ['Jupiter', '木星'], ['Mercury', '水星']], a: 0,
        f: ['Iron oxide (rust) on the surface gives Mars its reddish colour.', '火星表面的氧化铁（铁锈）让它呈现红色。'] },
      { q: ['How many continents are there on Earth?', '地球上共有几块大陆？'],
        o: [['5', '5 块'], ['6', '6 块'], ['7', '7 块'], ['8', '8 块']], a: 2,
        f: ['Africa, Antarctica, Asia, Europe, North America, Oceania and South America.', '非洲、南极洲、亚洲、欧洲、北美洲、大洋洲和南美洲。'] },
      { q: ['What is the only even prime number?', '唯一的偶质数是几？'],
        o: [['0', '0'], ['2', '2'], ['4', '4'], ['6', '6']], a: 1,
        f: ['2 divides evenly by 1 and by itself, and no other even number does.', '2 只能被 1 和它本身整除，其他偶数都做不到。'] },
      { q: ['Which gas do plants absorb for photosynthesis?', '植物进行光合作用时吸收哪种气体？'],
        o: [['Oxygen', '氧气'], ['Carbon dioxide', '二氧化碳'], ['Nitrogen', '氮气'], ['Hydrogen', '氢气']], a: 1,
        f: ['Plants take in CO₂ and give back oxygen as a by-product.', '植物吸入二氧化碳，并把氧气作为副产物排出。'] },
      { q: ['How many bones are there in an adult human body?', '成年人体内有多少块骨头？'],
        o: [['186', '186 块'], ['206', '206 块'], ['226', '226 块'], ['246', '246 块']], a: 1,
        f: ['Newborns start with around 300 bones; many fuse as they grow.', '新生儿约有 300 块骨头，长大过程中许多会融合。'] }
    ]
  });

  add({
    id: 'around-the-world', cat: 'trivia', theme: 'travel',
    title: ['Around the World in Eight Questions', '环游世界八问'],
    desc: ['A quick flight around the planet — no passport needed.', '不需要护照，一次环游地球。'],
    level: ['Easy', '入门'], minutes: 3,
    questions: [
      { q: ['Which country covers the most time zones?', '哪个国家跨越的时区最多？'],
        o: [['Russia', '俄罗斯'], ['United States', '美国'], ['France', '法国'], ['China', '中国']], a: 2,
        f: ['France spans 12 time zones thanks to its overseas territories.', '凭借海外属地，法国横跨 12 个时区。'] },
      { q: ['What is the smallest country in the world by area?', '世界上面积最小的国家是？'],
        o: [['Monaco', '摩纳哥'], ['Nauru', '瑙鲁'], ['Vatican City', '梵蒂冈'], ['Liechtenstein', '列支敦士登']], a: 2,
        f: ['Vatican City covers roughly 0.49 km² — about the size of a football pitch.', '梵蒂冈面积约 0.49 平方公里，差不多一个足球场大小。'] },
      { q: ['Which river flows through London?', '哪条河流经伦敦？'],
        o: [['Severn', '塞文河'], ['Thames', '泰晤士河'], ['Mersey', '默西河'], ['Trent', '特伦特河']], a: 1,
        f: ['The Thames has shaped London for two thousand years.', '泰晤士河已经塑造了伦敦两千年。'] },
      { q: ['What is the largest desert on Earth?', '地球上最大的沙漠是？'],
        o: [['Sahara', '撒哈拉沙漠'], ['Gobi', '戈壁沙漠'], ['Antarctica', '南极沙漠'], ['Arabian', '阿拉伯沙漠']], a: 2,
        f: ['Antarctica is a polar desert — it gets less precipitation than the Sahara.', '南极洲是极地沙漠，降水量比撒哈拉还少。'] },
      { q: ['Which country is the natural home of the kangaroo?', '袋鼠的故乡是哪个国家？'],
        o: [['Australia', '澳大利亚'], ['Brazil', '巴西'], ['South Africa', '南非'], ['New Zealand', '新西兰']], a: 0,
        f: ['Kangaroos are marsupials found only in Australia and New Zealand.', '袋鼠是有袋类动物，仅见于澳大利亚与新西兰。'] }
    ]
  });

  add({
    id: 'numbers-and-records', cat: 'trivia', theme: 'retro',
    title: ['Numbers & Records', '数字与纪录'],
    desc: ['Prime numbers, bones, birds and boards — the numeric oddities.', '质数、骨头、鸟与棋盘 —— 数字里的冷知识。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['What is the largest prime number below 20?', '小于 20 的最大质数是？'],
        o: [['17', '17'], ['18', '18'], ['19', '19'], ['20', '20']], a: 2,
        f: ['19 is prime; 20 is divisible by 2 and 5.', '19 是质数；20 能被 2 和 5 整除。'] },
      { q: ['How many degrees are in a right angle?', '一个直角是多少度？'],
        o: [['45°', '45°'], ['90°', '90°'], ['180°', '180°'], ['360°', '360°']], a: 1,
        f: ['A straight angle is 180° — two right angles.', '平角是 180°，正好是两个直角。'] },
      { q: ['What is the longest bone in the human body?', '人体最长的骨头是？'],
        o: [['Tibia', '胫骨'], ['Fibula', '腓骨'], ['Femur', '股骨'], ['Humerus', '肱骨']], a: 2,
        f: ['The femur runs from hip to knee and is the longest and strongest bone.', '股骨从髋部延伸到膝盖，是最长也最结实的骨头。'] },
      { q: ['Which mammal is the only one that can truly fly?', '唯一能够真正飞行的哺乳动物是？'],
        o: [['Flying squirrel', '飞鼠'], ['Bat', '蝙蝠'], ['Sugar glider', '蜜袋鼯'], ['Colugo', '鼯猴']], a: 1,
        f: ['Bats are the only mammals whose wings are powered by true flight muscles.', '蝙蝠是唯一用真正的飞行肌肉驱动翅膀的哺乳动物。'] },
      { q: ['How many squares are there on a standard chess board?', '标准国际象棋棋盘上有多少个格子？'],
        o: [['32', '32 个'], ['48', '48 个'], ['64', '64 个'], ['81', '81 个']], a: 2,
        f: ['8 × 8 = 64 squares, alternating light and dark.', '8 × 8 = 64 个格子，深浅相间。'] }
    ]
  });

  add({
    id: 'food-and-drink', cat: 'trivia', theme: 'food',
    title: ['Food & Drink', '美食与饮品'],
    desc: ['Spice, fruit, coffee and the perfect mash.', '香料、水果、咖啡，还有最完美的 mashed potato。'],
    level: ['Easy', '入门'], minutes: 3,
    questions: [
      { q: ['Which spice is the most expensive by weight?', '按重量计算，哪种香料最昂贵？'],
        o: [['Vanilla', '香草'], ['Cinnamon', '肉桂'], ['Saffron', '藏红花'], ['Cardamom', '小豆蔻']], a: 2,
        f: ['Saffron threads can cost thousands of dollars per kilogram.', '藏红花每公斤可达数千美元。'] },
      { q: ['Which is the only fruit with its seeds on the outside?', '唯一把种子长在外面的水果是？'],
        o: [['Raspberry', '树莓'], ['Strawberry', '草莓'], ['Fig', '无花果'], ['Kiwi', '猕猴桃']], a: 1,
        f: ['Those little "seeds" on a strawberry are actually individual fruits.', '草莓表面的小「籽」其实每一颗都是独立的小果实。'] },
      { q: ['How many espresso shots make a doppio?', '一杯 doppio 包含几份浓缩咖啡？'],
        o: [['1', '1 份'], ['2', '2 份'], ['3', '3 份'], ['4', '4 份']], a: 1,
        f: ['Doppio means "double" in Italian — two ristretto shots.', 'Doppio 在意大利语中意为「双份」—— 两份浓缩。'] },
      { q: ['Which country grows most of the world\'s coffee?', '世界上哪个国家产出的咖啡最多？'],
        o: [['Colombia', '哥伦比亚'], ['Ethiopia', '埃塞俄比亚'], ['Brazil', '巴西'], ['Vietnam', '越南']], a: 2,
        f: ['Brazil has produced the largest coffee harvest for more than 150 years.', '巴西已经连续 150 多年蝉联咖啡产量第一。'] },
      { q: ['What is the main ingredient in traditional guacamole?', '传统牛油果酱的主要原料是什么？'],
        o: [['Avocado', '牛油果'], ['Cucumber', '黄瓜'], ['Pea', '豌豆'], ['Courgette', '西葫芦']], a: 0,
        f: ['Avocado is the base — with lime, onion and a little chilli.', '牛油果是基底，再配上青柠、洋葱和一点辣椒。'] }
    ]
  });
  /* =====================================================================
     2. HISTORY — 历史长河
     ===================================================================== */
  add({
    id: 'ancient-worlds', cat: 'history', theme: 'history',
    title: ['Ancient Worlds', '古代世界'],
    desc: ['Pyramids, emperors and a very famous stone.', '金字塔、皇帝，以及一块著名的石头。'],
    level: ['Easy', '入门'], minutes: 4,
    questions: [
      { q: ['Which ancient wonder stood in the Egyptian desert?', '哪座古代奇迹矗立在埃及沙漠中？'],
        o: [['The Hanging Gardens', '空中花园'], ['The Great Pyramid of Giza', '吉萨大金字塔'], ['The Colosseum', '罗马斗兽场'], ['The Parthenon', '帕特农神庙']], a: 1,
        f: ['The Great Pyramid was built around 2560 BC and was the tallest human structure for 3,800 years.', '吉萨大金字塔约建于公元前 2560 年，在 3800 年里一直是人造最高建筑。'] },
      { q: ['Which empire was ruled by Julius Caesar?', '尤利乌斯·凯撒统治的是哪个帝国？'],
        o: [['Greek Empire', '希腊帝国'], ['Roman Empire', '罗马帝国'], ['Persian Empire', '波斯帝国'], ['Ottoman Empire', '奥斯曼帝国']], a: 1,
        f: ['Caesar was dictator of the Roman Republic — and the first of the "Five Good Emperors".', '凯撒是罗马共和国的独裁者，也是「五贤帝」的先驱。'] },
      { q: ['What did the Rosetta Stone help scholars decode?', '罗塞塔石碑帮助学者破译了什么？'],
        o: [['Cuneiform', '楔形文字'], ['Egyptian hieroglyphs', '古埃及象形文字'], ['Linear B', '线性文字 B'], ['Mayan glyphs', '玛雅文字']], a: 1,
        f: ['Its three scripts — Greek, Demotic and hieroglyphic — became the key to reading hieroglyphs.', '石碑上的希腊文、世俗体与象形文字，成为解读象形文字的钥匙。'] },
      { q: ['In which year did the Berlin Wall fall?', '柏林墙是在哪一年倒塌的？'],
        o: [['1987', '1987 年'], ['1989', '1989 年'], ['1991', '1991 年'], ['1993', '1993 年']], a: 1,
        f: ['The wall opened on 9 November 1989, and Germany was reunified the next year.', '1989 年 11 月 9 日柏林墙开放，次年德国重新统一。'] },
      { q: ['Which civilisation built Machu Picchu?', '马丘比丘是哪个文明建造的？'],
        o: [['Aztec', '阿兹特克'], ['Maya', '玛雅'], ['Inca', '印加'], ['Olmec', '奥尔梅克']], a: 2,
        f: ['The Inca built it in the 15th century, high in the Peruvian Andes.', '印加人在 15 世纪于秘鲁安第斯山脉高处建造了它。'] }
    ]
  });

  add({
    id: 'medieval-europe', cat: 'history', theme: 'history',
    title: ['Medieval Europe', '中世纪欧洲'],
    desc: ['Castles, charters, trials and very long winters.', '城堡、宪章、审判与漫长的寒冬。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['Which document limited the English king\'s power in 1215?', '哪份文件在 1215 年限制了英格兰国王的权力？'],
        o: [['The Domesday Book', '末日审判书'], ['The Magna Carta', '大宪章'], ['The King\'s Bible', '詹姆士王圣经'], ['The Treaty of Troyes', '特鲁瓦条约']], a: 1,
        f: ['The Magna Carta set limits on royal power and is often seen as a root of modern democracy.', '大宪章限制了王权，常被视为现代民主的源头之一。'] },
      { q: ['In a medieval trial by combat, who fought?', '在中世纪的「神明裁判」中，谁要上战场搏斗？'],
        o: [['A hired champion', '雇佣斗士'], ['The accused', '被告'], ['A bishop', '主教'], ['The village elder', '村长']], a: 1,
        f: ['The accused fought the accuser — victory was seen as God\'s judgement.', '被告与指控者决斗，胜负被视为上帝的裁决。'] },
      { q: ['What was a castle\'s "portcullis" for?', '城堡的「吊闸」是用来做什么的？'],
        o: [['To let in guests', '迎宾'], ['To drop and block the gate', '落下封死大门'], ['To drain the moat', '排干护城河'], ['To store weapons', '存放武器']], a: 1,
        f: ['A heavy iron grid that could be dropped instantly to seal the entrance.', '一道沉重铁闸，可以瞬间落下封锁入口。'] },
      { q: ['Which disease swept across Europe in the 1300s?', '哪一种疾病在 14 世纪席卷欧洲？'],
        o: [['The Black Death', '黑死病'], ['The Spanish Flu', '西班牙流感'], ['Cholera', '霍乱'], ['Smallpox', '天花']], a: 0,
        f: ['The Black Death killed roughly a third of Europe\'s population in a few years.', '黑死病在短短几年内夺去欧洲约三分之一的人口。'] },
      { q: ['Which empire\'s rulers were called sultans and built great domed mosques?', '哪个帝国的统治者被称为「苏丹」，并建造了大量穹顶清真寺？'],
        o: [['Mongol Empire', '蒙古帝国'], ['Ottoman Empire', '奥斯曼帝国'], ['Safavid Empire', '萨法维帝国'], ['Ayyubid Empire', '阿尤布帝国']], a: 1,
        f: ['The Ottomans ruled three continents from Istanbul.', '奥斯曼帝国以伊斯坦布尔为都，统治三大洲。'] }
    ]
  });

  add({
    id: 'revolutions-and-wars', cat: 'history', theme: 'history',
    title: ['Revolutions & Wars', '革命与战争'],
    desc: ['Battles, uprisings and the leaders who started them.', '战役、起义，以及点燃导火索的人们。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['In which year did the Second World War end?', '第二次世界大战在哪一年结束？'],
        o: [['1943', '1943 年'], ['1944', '1944 年'], ['1945', '1945 年'], ['1946', '1946 年']], a: 2,
        f: ['Germany surrendered in May 1945; Japan followed in September.', '德国于 1945 年 5 月投降，日本在 9 月跟进。'] },
      { q: ['Who was the first President of the United States?', '美国第一任总统是谁？'],
        o: [['Thomas Jefferson', '托马斯·杰斐逊'], ['John Adams', '约翰·亚当斯'], ['George Washington', '乔治·华盛顿'], ['Benjamin Franklin', '本杰明·富兰克林']], a: 2,
        f: ['George Washington served two terms and set the precedent of peaceful transfer of power.', '乔治·华盛顿连任两届，并开创了和平权力交接的先例。'] },
      { q: ['Which 1815 battle ended Napoleon\'s rule?', '哪场 1815 年的战役终结了拿破仑的统治？'],
        o: [['Austerlitz', '奥斯特里茨'], ['Leipzig', '莱比锡'], ['Waterloo', '滑铁卢'], ['Borodino', '博罗季诺']], a: 2,
        f: ['Napoleon\'s last campaign ended at Waterloo, and he was exiled to St Helena.', '拿破仑最后一次战役止步滑铁卢，随后被流放至圣赫勒拿岛。'] },
      { q: ['Which Pacific naval base was attacked in 1941?', '1941 年遭袭的是哪个太平洋海军基地？'],
        o: [['Guam', '关岛'], ['Midway', '中途岛'], ['Pearl Harbor', '珍珠港'], ['Corregidor', '科雷希多']], a: 2,
        f: ['The attack on Pearl Harbor brought the United States into World War II.', '珍珠港事件使美国正式加入第二次世界大战。'] },
      { q: ['Which revolution began in 1789?', '哪场革命始于 1789 年？'],
        o: [['American Revolution', '美国独立战争'], ['French Revolution', '法国大革命'], ['Industrial Revolution', '工业革命'], ['Russian Revolution', '俄国革命']], a: 1,
        f: ['The storming of the Bastille on 14 July 1789 marked its opening.', '1789 年 7 月 14 日攻占巴士底狱标志着它的开始。'] }
    ]
  });

  add({
    id: 'exploration-and-discovery', cat: 'history', theme: 'wonders',
    title: ['Exploration & Discovery', '探索与发现'],
    desc: ['Ships, poles and the people who kept going further.', '船只、极地，以及那个不断走得更远的人。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['Who was the first person to reach the South Pole?', '第一位抵达南极点的人是谁？'],
        o: [['Roald Amundsen', '罗阿尔·阿蒙森'], ['Robert Falcon Scott', '罗伯特·斯科特'], ['Ernest Shackleton', '欧内斯特·沙克尔顿'], ['Fridtjof Nansen', '弗里乔夫·南森']], a: 0,
        f: ['Amundsen arrived in December 1911, weeks before Scott\'s ill-fated expedition.', '阿蒙森于 1911 年 12 月抵达，比斯科特那支不幸的队伍早了数周。'] },
      { q: ['Which ship was the flagship of Columbus\'s 1492 voyage?', '哪艘船是哥伦布 1492 年航行的旗舰？'],
        o: [['La Niña', '尼尼亚号'], ['La Pinta', '平塔号'], ['Santa María', '圣玛利亚号'], ['Santa Clara', '圣克拉拉号']], a: 2,
        f: ['The Santa María ran aground and was dismantled; its crew sailed home in the Niña.', '圣玛利亚号触礁后被拆解，船员改乘尼尼亚号返乡。'] },
      { q: ['Captain James Cook is best known for which voyage?', '詹姆斯·库克船长最著名的航行是哪一次？'],
        o: [['Around Cape Horn', '绕过合恩角'], ['First voyage to Australia', '首次抵达澳大利亚'], ['Search for the Northwest Passage', '寻找西北航道'], ['Voyage to the Mariana Trench', '探访马里亚纳海沟']], a: 1,
        f: ['His 1768–1771 voyage charted New Zealand and Australia\'s east coast.', '1768 至 1771 年的航程测绘了新西兰与澳大利亚东岸。'] },
      { q: ['Which continent was the last to be discovered by Europeans?', '欧洲人最后发现的洲是？'],
        o: [['Australia', '澳大利亚'], ['Antarctica', '南极洲'], ['South America', '南美洲'], ['Africa', '非洲']], a: 1,
        f: ['Antarctica was only confirmed in 1820 after several competing expeditions.', '在数支探险队竞逐之后，南极洲直到 1820 年才被确认。'] },
      { q: ['Which country first circumnavigated the globe by ship?', '哪个国家最先以船只完成环球航行？'],
        o: [['Portugal', '葡萄牙'], ['Spain', '西班牙'], ['England', '英格兰'], ['France', '法国']], a: 1,
        f: ['The Magellan–Elcano expedition set out from Spain in 1519.', '麦哲伦—埃尔卡诺船队于 1519 年从西班牙出发。'] }
    ]
  });

  /* =====================================================================
     3. SCIENCE — 科学探索
     ===================================================================== */
  add({
    id: 'the-human-body', cat: 'science', theme: 'science',
    title: ['The Human Body', '人体奥秘'],
    desc: ['Bones, blood and the organ that never stops.', '骨骼、血液，和那颗永不停歇的器官。'],
    level: ['Easy', '入门'], minutes: 3,
    questions: [
      { q: ['How many chambers does the human heart have?', '人的心脏有几个腔室？'],
        o: [['2', '2 个'], ['3', '3 个'], ['4', '4 个'], ['6', '6 个']], a: 2,
        f: ['Two atria on top, two ventricles below.', '上面两个心房，下面两个心室。'] },
      { q: ['What is the largest organ of the human body?', '人体最大的器官是？'],
        o: [['Liver', '肝脏'], ['Brain', '大脑'], ['Skin', '皮肤'], ['Lungs', '肺']], a: 2,
        f: ['Skin accounts for roughly 15% of your body weight.', '皮肤约占体重的 15%。'] },
      { q: ['Which blood type is the universal donor?', '哪一种血型是万能供血者？'],
        o: [['AB positive', 'AB 阳性'], ['A positive', 'A 阳性'], ['O negative', 'O 阴性'], ['B negative', 'B 阴性']], a: 2,
        f: ['O negative red cells carry no A, B or Rh antigens.', 'O 阴性红细胞不携带 A、B 或 Rh 抗原。'] },
      { q: ['How many pairs of ribs does an adult have?', '成年人有几对肋骨？'],
        o: [['10', '10 对'], ['11', '11 对'], ['12', '12 对'], ['13', '13 对']], a: 2,
        f: ['Twelve pairs — though many people have a 13th, "cervical" rib.', '共有 12 对，不过不少人还有第 13 对「颈肋」。'] },
      { q: ['Which organ produces insulin?', '哪个器官分泌胰岛素？'],
        o: [['Liver', '肝脏'], ['Kidney', '肾脏'], ['Pancreas', '胰腺'], ['Spleen', '脾脏']], a: 2,
        f: ['Beta cells in the pancreas make insulin, which regulates blood sugar.', '胰腺中的 β 细胞制造胰岛素，调控血糖。'] }
    ]
  });

  add({
    id: 'space-and-astronomy', cat: 'science', theme: 'science',
    title: ['Space & Astronomy', '宇宙与天文'],
    desc: ['Planets, light-years and the first little satellite.', '行星、光年，以及第一颗人造卫星。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['Which planet has the most moons?', '哪颗行星的卫星最多？'],
        o: [['Saturn', '土星'], ['Jupiter', '木星'], ['Neptune', '海王星'], ['Uranus', '天王星']], a: 1,
        f: ['Jupiter currently holds the record with well over 90 confirmed moons.', '木星目前拥有 90 多颗已确认卫星，稳居榜首。'] },
      { q: ['What is the closest star to Earth?', '离地球最近的恒星是？'],
        o: [['The Sun', '太阳'], ['Alpha Centauri', '比邻星'], ['Sirius', '天狼星'], ['Betelgeuse', '参宿四']], a: 0,
        f: ['The Sun is our own star — light from it reaches us in about 8 minutes 20 seconds.', '太阳就是我们的恒星，它的光约 8 分 20 秒到达地球。'] },
      { q: ['What does a light-year measure?', '「光年」衡量的是什么？'],
        o: [['Time', '时间'], ['Distance', '距离'], ['Brightness', '亮度'], ['Mass', '质量']], a: 1,
        f: ['It is the distance light travels in one year — about 9.46 trillion kilometres.', '光年是光走一年的距离 —— 约 9.46 万亿公里。'] },
      { q: ['Which planet is the hottest in our solar system?', '太阳系中最热的行星是？'],
        o: [['Mercury', '水星'], ['Venus', '金星'], ['Mars', '火星'], ['Jupiter', '木星']], a: 1,
        f: ['Venus is hotter than Mercury because of its thick greenhouse atmosphere.', '金星因厚重大气层的温室效应，比水星还热。'] },
      { q: ['What was the first artificial satellite?', '第一颗人造卫星叫什么？'],
        o: [['Explorer 1', '探索者 1 号'], ['Vostok 1', '东方 1 号'], ['Sputnik 1', '斯普特尼克 1 号'], ['Telstar', '通信卫星']], a: 2,
        f: ['Sputnik 1 was launched by the Soviet Union in October 1957.', '1957 年 10 月，苏联发射了斯普特尼克 1 号。'] }
    ]
  });

  add({
    id: 'elements-and-chemistry', cat: 'science', theme: 'science',
    title: ['Elements & Chemistry', '元素与化学'],
    desc: ['Symbols, gases and the periodic table.', '符号、气体与元素周期表。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['What is the chemical symbol for gold?', '黄金的化学符号是？'],
        o: [['Ag', 'Ag'], ['Au', 'Au'], ['Go', 'Go'], ['Gd', 'Gd']], a: 1,
        f: ['From the Latin *aurum*. Silver\'s symbol Ag comes from *argentum*.', '源自拉丁语 *aurum*；银的符号 Ag 则来自 *argentum*。'] },
      { q: ['Which element has the atomic number 1?', '原子序数为 1 的元素是？'],
        o: [['Helium', '氦'], ['Hydrogen', '氢'], ['Lithium', '锂'], ['Carbon', '碳']], a: 1,
        f: ['Hydrogen is the lightest and most abundant element in the universe.', '氢是宇宙中最轻、最丰富的元素。'] },
      { q: ['Which gas makes up most of Earth\'s atmosphere?', '地球大气中占比最高的气体是？'],
        o: [['Oxygen', '氧气'], ['Carbon dioxide', '二氧化碳'], ['Nitrogen', '氮气'], ['Argon', '氩气']], a: 2,
        f: ['Nitrogen makes up about 78% of the air; oxygen about 21%.', '氮气约占 78%，氧气约占 21%。'] },
      { q: ['What is table salt chemically made of?', '食盐在化学上由什么组成？'],
        o: [['Sodium bicarbonate', '碳酸氢钠'], ['Sodium chloride', '氯化钠'], ['Potassium chloride', '氯化钾'], ['Calcium carbonate', '碳酸钙']], a: 1,
        f: ['Sodium chloride — one sodium atom for every chlorine atom.', '氯化钠 —— 每个氯原子配一个钠原子。'] },
      { q: ['Which gas glows orange in advertising signs?', '哪种气体在广告灯牌中发出橙光？'],
        o: [['Argon', '氩'], ['Neon', '氖'], ['Krypton', '氪'], ['Xenon', '氙']], a: 1,
        f: ['Neon signs are the classic glowing orange storefront.', '霓虹灯招牌就是经典的橙黄色店招。'] }
    ]
  });

  add({
    id: 'everyday-physics', cat: 'science', theme: 'science',
    title: ['Everyday Physics', '日常物理'],
    desc: ['Forces, light and the shape of the things around you.', '力、光，以及身边万物的形状。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['What is the SI unit of force?', '力的国际单位制单位是？'],
        o: [['Joule', '焦耳'], ['Newton', '牛顿'], ['Watt', '瓦特'], ['Pascal', '帕斯卡']], a: 1,
        f: ['One newton is the force needed to accelerate one kilogram by one m/s².', '1 牛顿是把 1 千克物体加速 1 m/s² 所需的力。'] },
      { q: ['Roughly how fast does light travel in a vacuum?', '光在真空中的速度大约是多少？'],
        o: [['300 km/s', '300 千米/秒'], ['3,000 km/s', '3,000 千米/秒'], ['300,000 km/s', '30 万千米/秒'], ['3,000,000 km/s', '300 万千米/秒']], a: 2,
        f: ['Exactly 299,792,458 metres per second — the speed limit of the universe.', '确切数值是每秒 299,792,458 米 —— 宇宙的极速。'] },
      { q: ['Which state of matter has a fixed volume but no fixed shape?', '哪种物态有固定体积但没有固定形状？'],
        o: [['Solid', '固体'], ['Liquid', '液体'], ['Gas', '气体'], ['Plasma', '等离子体']], a: 1,
        f: ['Liquids keep their volume but flow to fit their container.', '液体体积固定，却会流动以适应容器。'] },
      { q: ['A compass needle points towards which direction?', '指南针的针指向哪个方向？'],
        o: [['Geographic north', '地理北'], ['Magnetic north', '磁北'], ['True north', '真北'], ['South', '南']], a: 1,
        f: ['A compass needle aligns with Earth\'s magnetic field, not the geographic pole.', '指南针指向地磁场方向，而不是地理极点。'] },
      { q: ['Which equation describes the equivalence of mass and energy?', '描述质量与能量等价关系的公式是？'],
        o: [['E = mc²', 'E = mc²'], ['F = ma', 'F = ma'], ['E = hν', 'E = hν'], ['PV = nRT', 'PV = nRT']], a: 0,
        f: ['Einstein\'s equation shows that mass is a form of frozen energy.', '爱因斯坦公式说明质量其实是凝固的能量。'] }
    ]
  });
  /* =====================================================================
     4. GEOGRAPHY — 地理世界
     ===================================================================== */
  add({
    id: 'world-capitals', cat: 'geography', theme: 'geography',
    title: ['World Capitals', '世界首都'],
    desc: ['Seat of government, wrong end of the map included.', '各国政府所在地，含一张「意外地图」。'],
    level: ['Easy', '入门'], minutes: 3,
    questions: [
      { q: ['What is the capital of Australia?', '澳大利亚的首都是？'],
        o: [['Sydney', '悉尼'], ['Melbourne', '墨尔本'], ['Canberra', '堪培拉'], ['Perth', '珀斯']], a: 2,
        f: ['Canberra was purpose-built as a compromise between Sydney and Melbourne.', '堪培拉是悉尼与墨尔本折中选址后专门建造的。'] },
      { q: ['What is the capital of Canada?', '加拿大的首都是？'],
        o: [['Toronto', '多伦多'], ['Vancouver', '温哥华'], ['Ottawa', '渥太华'], ['Montreal', '蒙特利尔']], a: 2,
        f: ['Queen Victoria selected Ottawa in 1857 for its location on the border.', '维多利亚女王于 1857 年因渥太华的边境位置而选定此城。'] },
      { q: ['What is the capital of Turkey?', '土耳其的首都是？'],
        o: [['Istanbul', '伊斯坦布尔'], ['Ankara', '安卡拉'], ['Izmir', '伊兹密尔'], ['Bursa', '布尔萨']], a: 1,
        f: ['Ankara became the capital in 1923, before Istanbul had been fully rebuilt.', '安卡拉于 1923 年成为首都，当时伊斯坦布尔尚未完全重建。'] },
      { q: ['Which European capital sits on the River Vltava?', '哪座欧洲首都坐落在伏尔塔瓦河畔？'],
        o: [['Budapest', '布达佩斯'], ['Prague', '布拉格'], ['Vienna', '维也纳'], ['Warsaw', '华沙']], a: 1,
        f: ['Prague is often called the "City of a Hundred Spires".', '布拉格常被称为「百塔之城」。'] },
      { q: ['Which is the most populous capital city in Africa?', '非洲人口最多的首都是？'],
        o: [['Nairobi', '内罗毕'], ['Cairo', '开罗'], ['Johannesburg', '约翰内斯堡'], ['Lagos', '拉各斯']], a: 1,
        f: ['Cairo is the capital of Egypt — Lagos is larger but is not Nigeria\'s capital.', '开罗是埃及首都；拉各斯更大，但不是尼日利亚首都。'] }
    ]
  });

  add({
    id: 'landmarks-and-wonders', cat: 'geography', theme: 'wonders',
    title: ['Landmarks & Wonders', '地标与奇迹'],
    desc: ['Seven wonders, one lost, and some very recognisable roofs.', '七大奇迹，一个已失落，还有几座辨识度极高的屋顶。'],
    level: ['Easy', '入门'], minutes: 4,
    questions: [
      { q: ['Which city is home to the Colosseum?', '罗马斗兽场位于哪座城市？'],
        o: [['Athens', '雅典'], ['Rome', '罗马'], ['Naples', '那不勒斯'], ['Milan', '米兰']], a: 1,
        f: ['The Colosseum could hold around 50,000 spectators.', '罗马斗兽场可容纳约 5 万名观众。'] },
      { q: ['Which ancient wonder stood at the harbour of Alexandria?', '哪座古代奇迹曾矗立在亚历山大港？'],
        o: [['Colossus of Rhodes', '罗得岛太阳神巨像'], ['Lighthouse of Alexandria', '亚历山大灯塔'], ['Temple of Artemis', '阿耳忒弥斯神庙'], ['Hanging Gardens', '空中花园']], a: 1,
        f: ['The lighthouse was built under the Ptolemies and stood about 100 metres tall.', '亚历山大灯塔建于托勒密王朝时期，高约 100 米。'] },
      { q: ['Which US national monument is a giant desert arch?', '美国哪座国家纪念地是巨大的沙漠拱门？'],
        o: [['Devils Tower', '魔鬼塔'], ['Monument Valley', '纪念碑谷'], ['Bryce Canyon', '布莱斯峡谷'], ['Arches', '拱门']], a: 1,
        f: ['Monument Valley became instantly famous from the 1939 film *Stagecoach*.', '纪念碑谷因 1939 年电影《Stagecoach》而声名大噪。'] },
      { q: ['Angkor Wat is located near which city?', '吴哥窟位于哪座城市附近？'],
        o: [['Bangkok', '曼谷'], ['Siem Reap', '暹粒'], ['Hanoi', '河内'], ['Phnom Penh', '金边']], a: 1,
        f: ['Siem Reap in Cambodia is the gateway to the largest religious monument in the world.', '柬埔寨暹粒是通往世界最大宗教遗迹的门户。'] },
      { q: ['Which city is home to the Sydney Opera House?', '悉尼歌剧院位于哪座城市？'],
        o: [['Melbourne', '墨尔本'], ['Sydney', '悉尼'], ['Brisbane', '布里斯班'], ['Perth', '珀斯']], a: 1,
        f: ['Its shell-like roof was designed by Danish architect Jørn Utzon.', '其贝壳状屋顶由丹麦建筑师约恩·伍重设计。'] }
    ]
  });

  add({
    id: 'nature-and-landforms', cat: 'geography', theme: 'geography',
    title: ['Nature & Landforms', '自然与地貌'],
    desc: ['Mountains, oceans and the biggest everything.', '山脉、海洋，以及各种「最大」。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['What is the longest mountain range on land?', '陆地上最长的山脉是？'],
        o: [['Himalayas', '喜马拉雅山脉'], ['Rockies', '落基山脉'], ['Andes', '安第斯山脉'], ['Ural Mountains', '乌拉尔山脉']], a: 2,
        f: ['The Andes run about 7,000 km along the western edge of South America.', '安第斯山脉沿南美洲西缘绵延约 7000 公里。'] },
      { q: ['Which ocean is the deepest?', '最深的海洋是？'],
        o: [['Atlantic', '大西洋'], ['Indian', '印度洋'], ['Pacific', '太平洋'], ['Arctic', '北冰洋']], a: 2,
        f: ['The Mariana Trench in the Pacific reaches nearly 11 km below sea level.', '太平洋的马里亚纳海沟深近 11 公里。'] },
      { q: ['What is the largest island in the world?', '世界上最大的岛屿是？'],
        o: [['New Guinea', '新几内亚'], ['Borneo', '加里曼丹'], ['Greenland', '格陵兰'], ['Madagascar', '马达加斯加']], a: 2,
        f: ['Greenland is geographically an island — Australia is classed as a continent.', '格陵兰在地理上是岛屿，澳大利亚则被视为大陆。'] },
      { q: ['Which is the highest mountain above sea level?', '海拔最高的山峰是？'],
        o: [['K2', '乔戈里峰'], ['Mount Everest', '珠穆朗玛峰'], ['Denali', '麦金利山'], ['Mount Kilimanjaro', '乞力马扎罗山']], a: 1,
        f: ['Everest reaches 8,849 m. K2 is slightly higher base-to-peak but further from sea level.', '珠穆朗玛峰海拔 8849 米；乔戈里峰从山脚到山顶略高，但海拔基准不同。'] },
      { q: ['What is the largest hot desert in the world?', '世界上最大的热带沙漠是？'],
        o: [['Sahara', '撒哈拉沙漠'], ['Gobi', '戈壁沙漠'], ['Arabian', '阿拉伯沙漠'], ['Kalahari', '卡拉哈里沙漠']], a: 0,
        f: ['The Sahara covers about 9.2 million square kilometres.', '撒哈拉沙漠面积约 920 万平方公里。'] }
    ]
  });

  add({
    id: 'flags-and-symbols', cat: 'geography', theme: 'geography',
    title: ['Flags & Symbols', '国旗与符号'],
    desc: ['Leaves, stars and the oldest flag in the world.', '枫叶、五角星，和世界上最古老的国旗。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['Which country\'s flag features a maple leaf?', '哪个国家的国旗上有枫叶？'],
        o: [['USA', '美国'], ['Canada', '加拿大'], ['Switzerland', '瑞士'], ['Denmark', '丹麦']], a: 1,
        f: ['The maple leaf became an official Canadian emblem in 1965.', '枫叶在 1965 年成为加拿大的官方象征。'] },
      { q: ['How many stars are on the flag of China?', '中国国旗上有几颗星？'],
        o: [['4', '4 颗'], ['5', '5 颗'], ['6', '6 颗'], ['1', '1 颗']], a: 1,
        f: ['One large star plus four smaller ones, representing the four social classes.', '一颗大星加四颗小星，代表四个社会阶级。'] },
      { q: ['Which country has a white flag with a red circle?', '哪个国家的国旗是白底红圆？'],
        o: [['Bangladesh', '孟加拉国'], ['Japan', '日本'], ['South Korea', '韩国'], ['Tonga', '汤加']], a: 1,
        f: ['The circle represents the sun — the disc is called the *hinomaru*.', '红日称「日之丸」，象征太阳。'] },
      { q: ['Which country has the world\'s oldest national flag still in use?', '哪个国家的国旗是世界上仍在使用的最古老国旗？'],
        o: [['Denmark', '丹麦'], ['Sweden', '瑞典'], ['Norway', '挪威'], ['Finland', '芬兰']], a: 0,
        f: ['The Danish Dannebrug dates back to 1219 and is called the world\'s oldest national flag.', '丹麦的 Dannebrug 源自 1219 年，被称为世界上最古老的国旗。'] },
      { q: ['What do the five Olympic rings represent?', '奥运五环代表什么？'],
        o: [['Five sports', '五个项目'], ['Five continents', '五大洲'], ['Five continents united', '五大洲的团结'], ['Five Olympic values', '五种奥运理念']], a: 1,
        f: ['The rings symbolise the inhabited continents gathering together in friendship.', '五环象征五大洲相聚于友谊之中。'] }
    ]
  });

  /* =====================================================================
     5. SPORTS — 体育竞技
     ===================================================================== */
  add({
    id: 'football-101', cat: 'sports', theme: 'sports',
    title: ['Football 101', '足球入门'],
    desc: ['The beautiful game: rules, records and famous grounds.', '美丽足球：规则、纪录与著名球场。'],
    level: ['Easy', '入门'], minutes: 3,
    questions: [
      { q: ['How many players from one team are on the pitch in a football match?', '一场足球比赛中，每队有多少名球员在场？'],
        o: [['9', '9 人'], ['10', '10 人'], ['11', '11 人'], ['12', '12 人']], a: 2,
        f: ['Eleven players, including the goalkeeper.', '共 11 人，包括守门员。'] },
      { q: ['How long is each half of a standard football match?', '标准足球比赛每半场多长时间？'],
        o: [['30 minutes', '30 分钟'], ['45 minutes', '45 分钟'], ['60 minutes', '60 分钟'], ['90 minutes', '90 分钟']], a: 1,
        f: ['45 minutes of play, plus added time and a 15-minute break.', '45 分钟比赛时间，加补时与 15 分钟中场休息。'] },
      { q: ['Which country has won the most FIFA World Cups?', '哪支球队赢得过最多届世界杯？'],
        o: [['Germany', '德国'], ['Italy', '意大利'], ['Brazil', '巴西'], ['Argentina', '阿根廷']], a: 2,
        f: ['Brazil have won it five times — 1958, 1962, 1970, 1994 and 2002.', '巴西共五次夺冠：1958、1962、1970、1994、2002。'] },
      { q: ['What is it called when a player scores twice in one match?', '一名球员在单场比赛进两个球叫什么？'],
        o: [['A hat-trick', '帽子戏法'], ['A brace', '梅开二度'], ['A double', '双响'], ['A clean sheet', '零封']], a: 1,
        f: ['A brace is two goals; a hat-trick is three.', '两个球叫梅开二度，三个球才是帽子戏法。'] },
      { q: ['Which stadium is the home of Liverpool FC?', '利物浦足球俱乐部的主场是？'],
        o: [['Old Trafford', '老特拉福德'], ['Anfield', '安菲尔德'], ['Camp Nou', '诺坎普'], ['Stamford Bridge', '斯坦福桥']], a: 1,
        f: ['Anfield has been Liverpool\'s home since 1884.', '自 1884 年起，安菲尔德就是利物浦的主场。'] }
    ]
  });

  add({
    id: 'olympic-games', cat: 'sports', theme: 'sports',
    title: ['Olympic Games', '奥运会'],
    desc: ['Rings, records and the four-year rhythm.', '五环、纪录，以及四年一次的节奏。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['Where were the first modern Olympic Games held?', '第一届现代奥运会在哪里举办？'],
        o: [['Paris', '巴黎'], ['Athens', '雅典'], ['London', '伦敦'], ['Rome', '罗马']], a: 1,
        f: ['Athens hosted the 1896 Games, the first modern Olympiad.', '1896 年雅典举办了第一届现代奥林匹克运动会。'] },
      { q: ['How often are the Summer Olympic Games held?', '夏季奥运会多久举办一次？'],
        o: [['Every 2 years', '每两年'], ['Every 3 years', '每三年'], ['Every 4 years', '每四年'], ['Every 5 years', '每五年']], a: 2,
        f: ['The Winter Olympics also run on a four-year cycle.', '冬奥会同样遵循四年周期。'] },
      { q: ['Which country has won the most Olympic gold medals of all time?', '历史上获得奥运金牌最多的国家是？'],
        o: [['China', '中国'], ['Great Britain', '英国'], ['Russia', '俄罗斯'], ['United States', '美国']], a: 3,
        f: ['The United States leads the all-time gold medal table comfortably.', '美国在金牌榜上长期遥遥领先。'] },
      { q: ['In which sport would you compete in the "hammer throw"?', '「掷链球」属于哪个运动项目？'],
        o: [['Swimming', '游泳'], ['Athletics', '田径'], ['Cycling', '自行车'], ['Rowing', '赛艇']], a: 1,
        f: ['The hammer throw is one of the field events in athletics.', '掷链球是田径项目中的投掷类比赛。'] },
      { q: ['How many medals does the winner of an individual Olympic event receive?', '个人奥运项目的冠军能获得几枚奖牌？'],
        o: [['1', '1 枚'], ['2', '2 枚'], ['3', '3 枚'], ['4', '4 枚']], a: 0,
        f: ['One gold medal — one athlete, one medal.', '一枚金牌 —— 一位运动员，一枚奖牌。'] }
    ]
  });

  add({
    id: 'basketball-and-court', cat: 'sports', theme: 'sports',
    title: ['Basketball & Court Sports', '篮球与球场运动'],
    desc: ['Rims, rules and the birth of the hoop.', '篮筐、规则，以及篮球的诞生。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['How many players from one team are on the court in a basketball game?', '一场篮球比赛中每队有几名球员在场？'],
        o: [['4', '4 人'], ['5', '5 人'], ['6', '6 人'], ['7', '7 人']], a: 1,
        f: ['Five on the floor, plus substitutes on the bench.', '场上 5 人，替补席上另有轮换球员。'] },
      { q: ['How high is a standard basketball rim?', '标准篮球架篮筐离地多高？'],
        o: [['2.75 m', '2.75 米'], ['3.05 m', '3.05 米'], ['3.40 m', '3.40 米'], ['4.00 m', '4 米']], a: 1,
        f: ['Exactly 10 feet, or 3.05 metres.', '正好 10 英尺，即 3.05 米。'] },
      { q: ['How many points is a free throw worth?', '罚球得几分？'],
        o: [['1', '1 分'], ['2', '2 分'], ['3', '3 分'], ['0', '0 分']], a: 0,
        f: ['A free throw is worth one point; a field goal inside the arc is two.', '罚球 1 分，弧线内投篮 2 分。'] },
      { q: ['In which country was basketball invented?', '篮球起源于哪个国家？'],
        o: [['USA', '美国'], ['Canada', '加拿大'], ['Germany', '德国'], ['Brazil', '巴西']], a: 1,
        f: ['James Naismith invented it in Springfield, Massachusetts, in 1891.', '1891 年詹姆斯·奈史密斯在马萨诸塞州斯普林菲尔德发明了篮球。'] },
      { q: ['How many players per side are on court in volleyball?', '排球比赛中每方场上有几人？'],
        o: [['5', '5 人'], ['6', '6 人'], ['7', '7 人'], ['8', '8 人']], a: 1,
        f: ['Six a side, with substitutes from a bench of five.', '每方 6 人，替补席另有 5 名替补。'] }
    ]
  });

  add({
    id: 'legends-of-sport', cat: 'sports', theme: 'sports',
    title: ['Legends of Sport', '体育传奇'],
    desc: ['The names behind the highlights reel.', '集锦背后那些名字。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['How many Olympic gold medals did Michael Phelps win in total?', '迈克尔·菲尔普斯共获得多少枚奥运金牌？'],
        o: [['13', '13 枚'], ['18', '18 枚'], ['23', '23 枚'], ['25', '25 枚']], a: 2,
        f: ['23 golds across four Games — the most by any athlete.', '四届奥运会共 23 金，是运动员个人金牌数纪录。'] },
      { q: ['Which Brazilian striker scored twice in the 2002 World Cup final?', '2002 年世界杯决赛中梅开二度的巴西前锋是谁？'],
        o: [['Rivaldo', '里瓦尔多'], ['Ronaldo', '罗纳尔多'], ['Ronaldinho', '罗纳尔迪尼奥'], ['Kaka', '卡卡']], a: 1,
        f: ['Ronaldo\'s two goals gave Brazil the title in Yokohama.', '罗纳尔多在横滨梅开二度，为巴西捧杯。'] },
      { q: ['How many World Cups did Pelé win with Brazil?', '贝利随巴西赢得过几届世界杯？'],
        o: [['1', '1 届'], ['2', '2 届'], ['3', '3 届'], ['4', '4 届']], a: 2,
        f: ['1958, 1962 and 1970 — he also won in 1958 as a 17-year-old.', '1958、1962、1970；17 岁时便随队夺冠。'] },
      { q: ['Which Australian player, nicknamed "Lady Australia", won a record 24 Grand Slam singles titles?', '绰号「澳大利亚女皇」的澳洲选手，以 24 个大满贯单打冠军创下纪录，她是谁？'],
        o: [['Margaret Court', '玛格丽特·考特'], ['Evonne Goolagong', '伊冯妮·古拉贡'], ['Chris Evert', '克里斯·埃弗特'], ['Hana Mandlikova', '哈娜·曼德利科娃']], a: 0,
        f: ['Court won 24 singles majors between 1960 and 1973, plus 30 majors in total.', '考特在 1960 至 1973 年间拿下 24 个单打大满贯冠军，含团体共 30 个。'] },
      { q: ['In which sport did the term "birdie" originate?', '「小鸟」（birdie）一词源自哪个运动？'],
        o: [['Tennis', '网球'], ['Golf', '高尔夫'], ['Cricket', '板球'], ['Badminton', '羽毛球']], a: 1,
        f: ['A score one under par on a hole is called a birdie in golf.', '高尔夫中，比标准杆少一杆叫小鸟球。'] }
    ]
  });
  /* =====================================================================
     6. MOVIES — 影视巨幕
     ===================================================================== */
  add({
    id: 'blockbusters', cat: 'movies', theme: 'movie',
    title: ['Blockbusters', '电影大片'],
    desc: ['The lines we all know by heart.', '那些我们都耳熟能详的台词。'],
    level: ['Easy', '入门'], minutes: 3,
    questions: [
      { q: ['Which film won the first Academy Award for Best Picture?', '哪部电影获得了第一部奥斯卡最佳影片奖？'],
        o: [['Wings', '《翼》'], ['The Jazz Singer', '《爵士歌王》'], ['Metropolis', '《大都会》'], ['Sunrise', '《日出》']], a: 0,
        f: ['Wings (1927) — a silent World War I aviation film — took the first Best Picture Oscar.', '《翼》（1927），一部默片战争片，拿下了首个最佳影片奖。'] },
      { q: ['Which film contains the line "Here\'s looking at you, kid"?', '「Here\'s looking at you, kid」出自哪部电影？'],
        o: [['Gone with the Wind', '《乱世佳人》'], ['Casablanca', '《卡萨布兰卡》'], ['Citizen Kane', '《公民凯恩》'], ['The Maltese Falcon', '《马耳他之鹰》']], a: 1,
        f: ['Humphrey Bogart and Ingrid Bergman share the line in *Casablanca*.', '这句台词出自《卡萨布兰卡》中亨弗莱·鲍嘉与英格丽·褒曼之口。'] },
      { q: ['In *The Godfather*, what is the Corleone family\'s real business?', '在《教父》中，科里昂家族真正经营的是什么生意？'],
        o: [['Casinos', '赌场'], ['Olive oil importing', '橄榄油贸易'], ['Shipping', '航运'], ['Real estate', '房地产']], a: 1,
        f: ['The family business is olive oil importing — and it is the metaphor for everything.', '橄榄油贸易是家族生意，也是贯穿全片的隐喻。'] },
      { q: ['Which film has been the highest-grossing of all time for over a decade?', '连续十多年票房最高的电影是？'],
        o: [['Titanic', '《泰坦尼克号》'], ['Avengers: Endgame', '《复仇者联盟4》'], ['Avatar', '《阿凡达》'], ['Star Wars: The Force Awakens', '《星球大战7》']], a: 2,
        f: ['*Avatar* took more than $2.9 billion at the global box office.', '《阿凡达》全球票房超过 29 亿美元。'] },
      { q: ['In *Jurassic Park*, which dinosaur famously escapes in the kitchen?', '在《侏罗纪公园》中，哪种恐龙在厨房里惊险逃脱？'],
        o: [['T-Rex', '霸王龙'], ['Velociraptor', '迅猛龙'], ['Dilophosaurus', '双脊龙'], ['Triceratops', '三角龙']], a: 1,
        f: ['The \"raptor\" scene in the kitchen is the movie\'s most quoted moment.', '厨房里的迅猛龙镜头是全片最被引用的名场面。'] }
    ]
  });

  add({
    id: 'animated-classics', cat: 'movies', theme: 'movie',
    title: ['Animated Classics', '动画经典'],
    desc: ['Hand-drawn favourites and family favourites.', '手绘经典与合家欢之作。'],
    level: ['Easy', '入门'], minutes: 3,
    questions: [
      { q: ['Which studio created *Toy Story*?', '*玩具总动员*由哪家工作室制作？'],
        o: [['DreamWorks', '梦工厂'], ['Pixar', '皮克斯'], ['Studio Ghibli', '吉卜力工作室'], ['Illumination', '照明娱乐']], a: 1,
        f: ['Pixar released *Toy Story* in 1995 — the first fully computer-animated feature film.', '皮克斯于 1995 年推出《玩具总动员》，是首部全电脑动画长片。'] },
      { q: ['In *The Lion King*, what is the name of Simba\'s father?', '在《狮子王》中，辛巴的父亲叫什么？'],
        o: [['Scar', '刀疤'], ['Mufasa', '木法沙'], ['Timon', '丁满'], ['Raja', '拉贾']], a: 1,
        f: ['Mufasa, the king of Pride Rock, is one of Disney\'s most memorable characters.', '荣耀石之王木法沙是迪士尼最令人难忘的角色之一。'] },
      { q: ['What is the name of Bambi\'s mother in the 1942 film?', '在 1942 年动画《小鹿斑比》中，斑比的母亲叫什么？'],
        o: [['Faline', '法琳'], ['Thumper', '跳跳'], ['Flower', '小花花'], ['Winter', '冬冬']], a: 0,
        f: ['Faline is Bambi\'s mother; Thumper is his best friend.', '法琳是斑比的母亲，跳跳是他最好的朋友。'] },
      { q: ['What kind of fish is Nemo in *Finding Nemo*?', '《海底总动员》中的尼莫是什么鱼？'],
        o: [['Goldfish', '金鱼'], ['Clownfish', '小丑鱼'], ['Angelfish', '神仙鱼'], ['Betta fish', '斗鱼']], a: 1,
        f: ['Clownfish live in anemones — and Marlin\'s overprotective journey starts there.', '小丑鱼生活在海葵中，马林的护子之旅由此开启。'] },
      { q: ['Which Pixar film features the race car Lightning McQueen?', '哪部皮克斯电影里有赛车「闪电麦昆」？'],
        o: [['Turbo', '《极速蜗牛》'], ['Cars', '《汽车总动员》'], ['Planes', '《 Planes 大闹天宫》'], ['Ratatouille', '《料理鼠王》']], a: 1,
        f: ['*Cars* was released in 2006 and became a merchandising giant.', '《汽车总动员》于 2006 年上映，并成为现象级周边IP。'] }
    ]
  });

  add({
    id: 'award-season', cat: 'movies', theme: 'movie',
    title: ['Award Season', '奥斯卡之夜'],
    desc: ['Statuettes, speeches and a few records.', '小金人、获奖感言，以及几个纪录。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['Which film has won the most Academy Awards, with eleven?', '哪部电影以 11 座小金人创下奥斯卡获奖纪录？'],
        o: [['The Lord of the Rings: The Return of the King', '《指环王3》'], ['Ben-Hur', '《宾虚》'], ['Titanic', '《泰坦尼克号》'], ['West Side Story', '《西区故事》']], a: 1,
        f: ['*Ben-Hur* (1959) won 11 Oscars and swept every category it was nominated in.', '《宾虚》（1959）拿下 11 座小金门，几乎包揽所有提名奖项。'] },
      { q: ['Which director made *Titanic*, *Avatar* and *Aliens*?', '哪位导演执导了《泰坦尼克号》《阿凡达》和《异形》？'],
        o: [['Steven Spielberg', '史蒂文·斯皮尔伯格'], ['James Cameron', '詹姆斯·卡梅隆'], ['Ridley Scott', '雷德利·斯科特'], ['Christopher Nolan', '克里斯托弗·诺兰']], a: 1,
        f: ['James Cameron has been called the king of the blockbuster — and of the deep-sea dive.', '詹姆斯·卡梅隆被称为大片之王，也是深海 dives 的执牛耳者。'] },
      { q: ['Which film was the first non-English language movie to win Best Picture?', '哪部电影是首部获得最佳影片的外语片？'],
        o: [['Roma', '《罗马》'], ['Parasite', '《寄生虫》'], ['Crouching Tiger, Hidden Dragon', '《卧虎藏龙》'], ['Life Is Beautiful', '《美丽人生》']], a: 1,
        f: ['Bong Joon-ho\'s *Parasite* won in 2020 — and the award speech went viral.', '奉俊昊的《寄生虫》于 2020 年获奖，颁奖词刷屏网络。'] },
      { q: ['In which year were the Oscars first broadcast on television?', '奥斯卡颁奖典礼在哪一年首次电视直播？'],
        o: [['1949', '1949 年'], ['1953', '1953 年'], ['1960', '1960 年'], ['1975', '1975 年']], a: 1,
        f: ['The 25th Academy Awards were the first televised, in 1953.', '第 25 届奥斯卡于 1953 年首次电视直播。'] },
      { q: ['Which studio released *Jurassic Park* in 1993?', '1993 年的《侏罗纪公园》由哪家制片厂推出？'],
        o: [['Warner Bros.', '华纳兄弟'], ['Universal Pictures', '环球影业'], ['Paramount', '派拉蒙'], ['20th Century Fox', '二十世纪福克斯']], a: 1,
        f: ['Universal took the risk and made it one of the highest-grossing films ever.', '环球影业押下重注，将其打造成影史最卖座影片之一。'] }
    ]
  });

  add({
    id: 'behind-the-screen', cat: 'movies', theme: 'movie',
    title: ['Behind the Screen', '银幕背后'],
    desc: ['The language filmmakers use when nobody is watching.', '没有观众时，电影人讲的那套语言。'],
    level: ['Hard', '挑战'], minutes: 5,
    questions: [
      { q: ['In film language, what is a "close-up"?', '电影语言中的「特写」是指什么？'],
        o: [['A shot of the sky', '拍天空的镜头'], ['A very tight shot of the subject', '主体占满画面的近景'], ['A shot from far away', '远景镜头'], ['A camera move', '摄影机运动']], a: 1,
        f: ['Close-ups show detail and emotion — from a nerve to a reaction shot.', '特写呈现细节与情绪，从神经特写到反应镜头。'] },
      { q: ['Who is credited with popularising the close-up?', '谁被认为推广了特写镜头？'],
        o: [['Charlie Chaplin', '查理·卓别林'], ['D. W. Griffith', 'D. W. 格里菲斯'], ['Louis Lumière', '路易·卢米埃尔'], ['Andrei Tarkovsky', '安德烈·塔可夫斯基']], a: 1,
        f: ['D. W. Griffith used close-ups and parallel editing to create emotional intensity.', 'D. W. 格里菲斯用特写与平行剪辑制造情绪张力。'] },
      { q: ['What is a shot filmed without cutting called?', '不剪辑、一镜到底完成的拍摄叫什么？'],
        o: [['A one-take', '长镜头'], ['A jump cut', '跳切'], ['A montage', '蒙太奇'], ['A time-lapse', '延时摄影']], a: 0,
        f: ['One-take films such as *Birdman* build tension because you cannot escape the shot.', '《鸟人》这类一镜到底电影，因无法切出画面而格外紧张。'] },
      { q: ['Who directed the 1902 film *A Trip to the Moon*?', '1902 年电影《月球旅行记》的导演是谁？'],
        o: [['Méliès', '梅里爱'], ['Lumière', '卢米埃尔'], ['Porter', '波特'], ['Fassbinder', '法斯宾德']], a: 0,
        f: ['Georges Méliès was a magician-turned-filmmaker and the father of special effects.', '乔治·梅里爱原是魔术师，后成为电影人，是特效之父。'] },
      { q: ['What does "diegetic" sound mean?', '电影术语中的「叙事内声音」指什么？'],
        o: [['Sound that exists inside the story world', '故事世界内部真实存在的声音'], ['The soundtrack music', '配乐'], ['The narration', '旁白'], ['A sound effect added later', '后期添加的音效']], a: 0,
        f: ['Diegetic sound comes from the world of the film; non-diegetic sound (like scores) comes from outside it.', '叙事内声音来自故事世界；非叙事声音（如配乐）则来自故事之外。'] }
    ]
  });

  /* =====================================================================
     7. MUSIC — 音乐现场
     ===================================================================== */
  add({
    id: 'bands-and-icons', cat: 'music', theme: 'music',
    title: ['Bands & Icons', '乐队与偶像'],
    desc: ['Albums, line-ups and the odd robot duo.', '专辑、阵容，还有那对机器人双人组。'],
    level: ['Easy', '入门'], minutes: 3,
    questions: [
      { q: ['Which band released the album *Abbey Road*?', '哪支乐队发行了专辑《艾比路》？'],
        o: [['The Rolling Stones', '滚石乐队'], ['The Beatles', '披头士'], ['Pink Floyd', '平克·弗洛伊德'], ['The Beach Boys', '海滩男孩']], a: 1,
        f: ['*Abbey Road* (1969) was the Beatles\' final recorded album.', '《艾比路》（1969）是披头士最后一张录音室专辑。'] },
      { q: ['Which band released "Bohemian Rhapsody"?', '《波西米亚狂想曲》由哪支乐队演唱？'],
        o: [['Led Zeppelin', '齐柏林飞艇'], ['Queen', '皇后乐队'], ['Deep Purple', '深紫'], ['The Who', '谁乐队']], a: 1,
        f: ['Freddie Mercury\'s vocal range made the 1975 track a global anthem.', '弗雷迪·墨丘瑞的主音让这首 1975 年作品成为全球圣歌。'] },
      { q: ['Which album did Daft Punk release in 2013?', '达夫特蓬克在 2013 年发行了哪张专辑？'],
        o: [['Discovery', '《发现》'], ['Homework', '《 Homework》'], ['Random Access Memories', '《随机存取记忆》'], ['Human After All', '《人类之后》']], a: 2,
        f: ['*Random Access Memories* swept the Grammys and featured the hit "Get Lucky".', '《随机存取记忆》横扫格莱美，并收录神曲《Get Lucky》。'] },
      { q: ['Which Irish rock band formed in Dublin in 1976?', '哪支爱尔兰摇滚乐队于 1976 年在都柏林成立？'],
        o: [['U2', 'U2'], ['The Cranberries', 'cranberries'], ['Thin Lizzy', '瘦 Lizzy'], ['Riverdance', '大河之舞']], a: 0,
        f: ['U2 formed in 1976 and became one of the best-selling bands in history.', 'U2 成立于 1976 年，成为史上销量最高的乐队之一。'] },
      { q: ['Which Queen member was the band\'s drummer?', '皇后乐队中担任鼓手的是谁？'],
        o: [['Brian May', '布莱恩·梅'], ['Freddie Mercury', '弗雷迪·墨丘瑞'], ['Roger Taylor', '罗杰·泰勒'], ['John Deacon', '约翰·迪肯']], a: 2,
        f: ['Roger Taylor was the drummer; Brian May the guitarist; Mercury the singer.', '罗杰·泰勒是鼓手，布莱恩·梅是吉他手，墨丘瑞主唱。'] }
    ]
  });

  add({
    id: 'classical-and-composers', cat: 'music', theme: 'music',
    title: ['Classical & Composers', '古典与作曲家'],
    desc: ['Orchestras, opera houses and 88 keys.', '乐团、歌剧院与 88 个琴键。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['Who composed the Ninth Symphony that includes "Ode to Joy"?', '包含《欢乐颂》的《第九交响曲》出自谁之手？'],
        o: [['Mozart', '莫扎特'], ['Beethoven', '贝多芬'], ['Bach', '巴赫'], ['Brahms', '勃拉姆斯']], a: 1,
        f: ['Beethoven completed it in 1824, two years before his death.', '贝多芬于 1824 年完成此作，距其去世还有两年。'] },
      { q: ['Who composed the violin concertos *The Four Seasons*?', '小提琴协奏曲《四季》由谁创作？'],
        o: [['Bach', '巴赫'], ['Handel', '亨德尔'], ['Vivaldi', '维瓦尔第'], ['Corelli', '科雷利']], a: 2,
        f: ['Vivaldi published them in 1725 — each pairs with a sonnet.', '维瓦尔第于 1725 年出版，每一季都配一首十四行诗。'] },
      { q: ['How many strings does a standard violin have?', '标准小提琴有几根弦？'],
        o: [['3', '3 根'], ['4', '4 根'], ['5', '5 根'], ['6', '6 根']], a: 1,
        f: ['G, D, A and E — tuned in perfect fifths.', 'G、D、A、E 四根弦，以纯五度调音。'] },
      { q: ['Who composed the opera *The Magic Flute*?', '歌剧《魔笛》由谁创作？'],
        o: [['Mozart', '莫扎特'], ['Rossini', '罗西尼'], ['Verdi', '威尔第'], ['Wagner', '瓦格纳']], a: 0,
        f: ['Mozart wrote it in his final year, 1791.', '莫扎特在生命最后一年（1791）完成了它。'] },
      { q: ['How many keys does a standard full-size piano have?', '标准立式钢琴有多少个琴键？'],
        o: [['76', '76 键'], ['85', '85 键'], ['88', '88 键'], ['97', '97 键']], a: 2,
        f: ['52 white and 36 black keys — from A0 to C8.', '52 个白键、36 个黑键，音域从 A0 到 C8。'] }
    ]
  });

  add({
    id: 'songs-and-hits', cat: 'music', theme: 'pop',
    title: ['Songs & Hits', '热门单曲'],
    desc: ['Chart records and the first ever music video.', '榜单纪录与第一支 MV。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['Which artist holds the record for most Billboard Hot 100 number-one singles?', '谁保持着 Billboard Hot 100 单曲冠军数量最多的纪录？'],
        o: [['Taylor Swift', '泰勒·斯威夫特'], ['Elvis Presley', '猫王'], ['The Beatles', '披头士'], ['Michael Jackson', '迈克尔·杰克逊']], a: 0,
        f: ['Swift has taken 19 Hot 100 number ones — more than any other artist.', '泰勒·斯威夫特共拿下 19 首冠军单曲，冠绝群芳。'] },
      { q: ['What was the first song to reach number one on the Billboard Hot 100?', 'Billboard Hot 100 榜单上第一首冠军单曲是什么？'],
        o: [['"Rocket 88"', '《Rocket 88》'], ['"Poor Little Fool"', '《Poor Little Fool》'], ['"Blue Suede Shoes"', '《Blue Suede Shoes》'], ['"That\'s All Right"', '《That\'s All Right》']], a: 1,
        f: ['Ricky Nelson\'s "Poor Little Fool" topped the first Hot 100 chart in 1958.', '1958 年，Ricky Nelson 的《Poor Little Fool》登上 Hot 100 榜首。'] },
      { q: ['Which band released "Hey Jude"?', '《Hey Jude》由哪支乐队演唱？'],
        o: [['The Rolling Stones', '滚石乐队'], ['The Beatles', '披头士'], ['The Beach Boys', '海滩男孩'], ['The Doors', '大门乐队']], a: 1,
        f: ['The Beatles released it in 1968 as a single from the *White Album* era.', '披头士于 1968 年发行该曲，收录于《白色专辑》时期。'] },
      { q: ['Which video was the first one played on MTV?', 'MTV 开台播放的第一支视频是什么？'],
        o: [['"Video Killed the Radio Star"', '《Video Killed the Radio Star》'], ['"Thriller"', '《Thriller》'], ['"Careless Whisper"', '《Careless Whisper》'], ['"Money for Nothing"', '《Money for Nothing》']], a: 0,
        f: ['The Buggles\' 1981 clip kicked off MTV on 1 August 1981.', '1981 年 8 月 1 日，Buggles 的 MV 拉开 MTV 大幕。'] },
      { q: ['Who released the album *Thriller*?', '专辑《Thriller》由谁发行？'],
        o: [['Prince', '王子'], ['Michael Jackson', '迈克尔·杰克逊'], ['Stevie Wonder', ' Stevie Wonder'], ['Donna Summer', 'Donna Summer']], a: 1,
        f: ['*Thriller* became the best-selling album of all time.', '《Thriller》成为史上销量最高的专辑。'] }
    ]
  });

  add({
    id: 'music-theory', cat: 'music', theme: 'music',
    title: ['Music Theory & Instruments', '乐理与乐器'],
    desc: ['Staffs, scales and how many players make a quartet.', '五线谱、音阶，以及一个四重奏有几个人。'],
    level: ['Hard', '挑战'], minutes: 4,
    questions: [
      { q: ['How many lines does a standard musical staff have?', '标准五线谱有几条线？'],
        o: [['4', '4 条'], ['5', '5 条'], ['6', '6 条'], ['7', '7 条']], a: 1,
        f: ['Five lines and four spaces — the staff that carries all Western notation.', '五条线四个间，承载了全部西方记谱体系。'] },
      { q: ['How many notes are in a major scale?', '一个大调音阶包含几个音？'],
        o: [['5', '5 个'], ['6', '6 个'], ['7', '7 个'], ['8', '8 个']], a: 2,
        f: ['Seven degrees — do, re, mi, fa, sol, la, ti.', '七个音级：do、re、mi、fa、sol、la、si。'] },
      { q: ['What is the highest female singing voice called?', '女声最高的音域叫什么？'],
        o: [['Alto', '女低音'], ['Tenor', '男高音'], ['Soprano', '女高音'], ['Baritone', '男中音']], a: 2,
        f: ['Soprano sits above mezzo-soprano and alto.', '女高音位于女中音与女低音之上。'] },
      { q: ['How many strings does a standard electric bass guitar have?', '标准电贝斯有几根弦？'],
        o: [['3', '3 根'], ['4', '4 根'], ['5', '5 根'], ['6', '6 根']], a: 1,
        f: ['Usually tuned E-A-D-G, the same four strings as the lower half of a guitar.', '通常按 E-A-D-G 调弦，与吉他的低四弦相同。'] },
      { q: ['How many players are in a standard string quartet?', '标准弦乐四重奏由几位演奏者组成？'],
        o: [['2', '2 位'], ['3', '3 位'], ['4', '4 位'], ['6', '6 位']], a: 2,
        f: ['Two violins, a viola and a cello.', '两把小提琴、一把中提琴和一把大提琴。'] }
    ]
  });

  /* =====================================================================
     8. BRAIN TEASERS — 脑筋急转弯
     ===================================================================== */
  add({
    id: 'riddle-me-this', cat: 'brain', theme: 'brain',
    title: ['Riddle Me This!', '看图猜谜！'],
    desc: ['Classic riddles that hide in plain sight.', '藏在眼前的经典谜语。'],
    level: ['Easy', '入门'], minutes: 3,
    questions: [
      { q: ['What has keys but opens no locks?', '什么东西有钥匙，却打不开任何锁？'],
        o: [['A typewriter', '打字机'], ['A piano', '钢琴'], ['A keyboard', '键盘'], ['A piano key', '琴键']], a: 1,
        f: ['A piano has keys — and the only thing it opens is a room full of music.', '钢琴有琴键，而它打开的只有一整个音乐厅。'] },
      { q: ['I have cities but no houses, forests but no trees, and water but no fish. What am I?', '我有城市没有房屋，有森林却没有树木，有水却没有鱼。我是什么？'],
        o: [['A globe', '地球仪'], ['A map', '地图'], ['A novel', '小说'], ['A dream', '一场梦']], a: 1,
        f: ['A map shows cities, forests and water — but none of them in real life.', '地图上有城市、森林与水，却没有一个是真的。'] },
      { q: ['The more you take, the more you leave behind. What are they?', '你拿走的越多，留下的就越多。那是什么？'],
        o: [['Footsteps', '脚印'], ['Photographs', '照片'], ['Memories', '记忆'], ['Words', '话语']], a: 0,
        f: ['Every step takes you forward but leaves a footprint behind.', '每走一步都向前移动，却留下一个脚印。'] },
      { q: ['What can travel around the world while staying in one corner?', '什么东西能环游世界，却始终待在一个角落？'],
        o: [['A spider', '蜘蛛'], ['A postage stamp', '邮票'], ['A letter', '信件'], ['A mouse', '老鼠']], a: 1,
        f: ['A stamp lives in the corner of an envelope and can travel to anywhere.', '邮票待在信封的一角，却能前往任何地方。'] },
      { q: ['What has a head and a tail but no body?', '什么东西有头有尾，却没有身体？'],
        o: [['A snake', '蛇'], ['A coin', '硬币'], ['A pencil', '铅笔'], ['A shrimp', '虾']], a: 1,
        f: ['Coins have heads and tails, but no middle at all.', '硬币有正面（头）和反面（尾），唯独没有「身体」。'] }
    ]
  });

  add({
    id: 'word-games', cat: 'brain', theme: 'brain',
    title: ['Word Games', '文字游戏'],
    desc: ['Where the English language bends and folds.', '英语被折叠变形的地方。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['What word becomes shorter when you add two letters to it?', '哪个单词加上两个字母后会变短？'],
        o: [['Short', 'Short'], ['Small', 'Small'], ['Tiny', 'Tiny'], ['Little', 'Little']], a: 0,
        f: ['Add "er" to "short" and it becomes "shorter".', '给 short 加上 er，就变成了 shorter。'] },
      { q: ['What begins with an "e" but only contains one letter?', '什么东西以字母 e 开头，却只有一个字母？'],
        o: [['Envelope', '信封'], ['Elephant', '大象'], ['Eagle', '鹰'], ['Echo', '回声']], a: 0,
        f: ['An envelope begins with E and contains one letter inside.', '信封以 E 开头，里面装着一个字母。'] },
      { q: ['What kind of ship has no captain?', '哪种「船」没有船长？'],
        o: [['A pirate ship', '海盗船'], ['A tanker', '油轮'], ['A tsunami', '海啸'], ['A tugboat', '拖船']], a: 2,
        f: ['A tsunami is a giant wave — and a "ship" with nobody on board.', '海啸是巨浪 —— 一艘没有人驾驶的「船」。'] },
      { q: ['What has many teeth but cannot bite?', '什么东西有很多牙齿，却咬不了人？'],
        o: [['A shark', '鲨鱼'], ['A comb', '梳子'], ['A crocodile', '鳄鱼'], ['A saw', '锯子']], a: 1,
        f: ['A comb has teeth, but it only touches hair.', '梳子有牙齿，但只碰头发。'] },
      { q: ['What has one eye but cannot see?', '什么东西只有一只眼睛，却看不见？'],
        o: [['A needle', '针'], ['A storm', '风暴'], ['A potato', '土豆'], ['A hurricane', '飓风']], a: 0,
        f: ['A needle has an eye for the thread — and no way to use it.', '针有穿线用的「眼」，却根本看不见。'] }
    ]
  });

  add({
    id: 'quick-maths', cat: 'brain', theme: 'brain',
    title: ['Quick Maths', '快速算术'],
    desc: ['Sums, sequences and one very precise clock.', '数列、求和，以及一只非常精确的钟。'],
    level: ['Medium', '进阶'], minutes: 4,
    questions: [
      { q: ['What comes next: 2, 6, 12, 20, 30, …?', '数列 2、6、12、20、30、…… 的下一项是？'],
        o: [['36', '36'], ['40', '40'], ['42', '42'], ['44', '44']], a: 2,
        f: ['Each term is n × (n + 1), so the sixth term is 6 × 7 = 42.', '第 n 项为 n × (n + 1)，所以第 6 项是 6 × 7 = 42。'] },
      { q: ['What is the sum of all integers from 1 to 50?', '1 到 50 的所有整数之和是多少？'],
        o: [['1225', '1225'], ['1250', '1250'], ['1275', '1275'], ['2550', '2550']], a: 2,
        f: ['50 × 51 ÷ 2 = 1275.', '50 × 51 ÷ 2 = 1275。'] },
      { q: ['On a clock showing 3:15, what is the angle between the hands?', '时钟指向 3:15 时，时针与分针夹角是多少度？'],
        o: [['0°', '0°'], ['7.5°', '7.5°'], ['15°', '15°'], ['90°', '90°']], a: 1,
        f: ['The minute hand is on 3 (90°); the hour hand has moved a quarter degree past it — 7.5° apart.', '分针指向 3（90°），时针刚好越过它 7.5°，所以夹角为 7.5°。'] },
      { q: ['How many days are in a leap year?', '闰年有多少天？'],
        o: [['365', '365 天'], ['366', '366 天'], ['367', '367 天'], ['355', '355 天']], a: 1,
        f: ['February gains a 29th day — 29 + 335 = 366.', '二月多出 29 日 —— 29 + 335 = 366。'] },
      { q: ['What is the Roman numeral for 50?', '罗马数字 50 是怎么写的？'],
        o: [['L', 'L'], ['V', 'V'], ['X', 'X'], ['C', 'C']], a: 0,
        f: ['L = 50, C = 100, X = 10 and V = 5.', 'L = 50，C = 100，X = 10，V = 5。'] }
    ]
  });

  add({
    id: 'brain-boosters', cat: 'brain', theme: 'brain',
    title: ['Brain Boosters', '思维加速'],
    desc: ['Letters, promises, cards and towels.', '字母、承诺、扑克牌与毛巾。'],
    level: ['Easy', '入门'], minutes: 3,
    questions: [
      { q: ['What comes once in a minute, twice in a moment, but never in a thousand years?', '什么东西一分钟出现一次，一刻出现两次，却一千年都不出现？'],
        o: [['The letter M', '字母 M'], ['The letter S', '字母 S'], ['A heartbeat', '心跳'], ['A clock tick', '钟摆声']], a: 0,
        f: ['"Minute" and "moment" each contain one M; "a thousand years" contains none.', 'minute 和 moment 各有一个 M，而 thousand years 里一个也没有。'] },
      { q: ['What can be broken but never held?', '什么东西可以被打破，却无法被握住？'],
        o: [['A glass', '玻璃杯'], ['A promise', '承诺'], ['A bone', '骨头'], ['An egg', '鸡蛋']], a: 1,
        f: ['You can break a promise — but you never hold one.', '承诺可以被打破，却永远无法握在手里。'] },
      { q: ['What has thirteen hearts but no other organs?', '什么东西有十三颗心，却没有其他器官？'],
        o: [['A deck of cards', '一副扑克牌'], ['A human body', '人体'], ['A chess set', '一套国际象棋'], ['A bouquet', '一束花']], a: 0,
        f: ['Each of the four suits has a heart suit — 13 ranks in total.', '四种花色中都有红桃，红桃共 13 个点数。'] },
      { q: ['What gets wetter the more it dries?', '什么东西越擦越湿？'],
        o: [['A towel', '毛巾'], ['A sponge', '海绵'], ['A cloth', '抹布'], ['A mop', '拖把']], a: 0,
        f: ['A towel absorbs water — so the more it dries you, the wetter it gets.', '毛巾吸水，所以擦得越干，它本身越湿。'] },
      { q: ['What has hands but cannot clap?', '什么东西有手却拍不了巴掌？'],
        o: [['A robot', '机器人'], ['A clock', '时钟'], ['A glove', '手套'], ['A crab', '螃蟹']], a: 1,
        f: ['A clock has hour and minute hands — and no applause at all.', '时钟有时针和分针，却从不鼓掌。'] }
    ]
  });
  /* =====================================================================
     9. CNT LAB — 智能实验室
        LAB1 是「动态漏斗 Quiz」：层 1 → 层 2 → 层 3 逐层路由，
        每层独立计算标签得分，胜出标签 + 分值区间决定下一层题目组，
        最终按 (层标签组合 + 分值区间) 匹配结果页。
        与 docs/requirements/quiz-dynamic-requirements.md 的模型一致。
     ===================================================================== */
  add({
    id: 'learning-style-funnel', cat: 'lab', theme: 'personality', type: 'funnel',
    title: ["What's Your Ideal Learning Style?", '你的学习风格是？'],
    desc: ['A branching quiz — every answer changes the next round. Three layers, one profile.',
           '分支式测验 —— 每一道回答都会改变下一轮。三层漏斗，最终生成你的专属画像。'],
    level: ['Dynamic', '动态分支'], minutes: 4,
    layers: [
      /* ---------------------------------------------------------------
         层 1：固定入口题组 —— 决定「你如何吸收信息」
         --------------------------------------------------------------- */
      {
        id: 'L1',
        label: ['Step 1 · How you absorb information', '第 1 步 · 你如何吸收信息'],
        buckets: [{ id: 'low', max: 2 }, { id: 'mid', min: 3, max: 5 }, { id: 'high', min: 6 }],
        defaultTag: 'visual',
        defaultGroup: 'G2C',
        entryGroup: 'G1',
        tagPriority: ['visual', 'auditory', 'kinesthetic', 'reading'],
        groups: {
          G1: {
            label: ['Entry set', '入口题组'],
            questions: [
              { q: ['A brand-new topic lands in front of you. What do you do first?', '一个全新的主题摆在你面前，你第一步会做什么？'],
                o: [['Sketch how the ideas connect together', '先画出这些概念是怎么串起来的'],
                    ['Read a summary and underline the key lines', '先读一份摘要，把重点划出来'],
                    ['Find somebody to explain it out loud', '找个人把它讲出来听'],
                    ['Try it yourself and see what happens', '先自己动手试，看会发生什么']],
                t: [{ visual: 2 }, { reading: 2 }, { auditory: 2 }, { kinesthetic: 2 }],
                fb: [['You build a mental picture first — visual thinkers lead with structure.', '你习惯先建立整体画面 —— 视觉型思维靠结构切入。'],
                     ['You want the words on the page — reading types like a clean runway.', '你想先拿到文字本身 —— 阅读型选手需要一条干净的跑道。'],
                     ['Hearing it — or saying it — is when it locks in for you.', '靠「听」或「说」来确认，你才算真正掌握。'],
                     ['You learn by doing — the screen is only the coach.', '你是「做中学」派，屏幕只是教练。']] },
              { q: ['Which desk setup suits you best?', '什么样的书桌最适合你？'],
                o: [['A big screen with diagrams and colour-coded notes', '大屏幕，上面是图表和彩色笔记'],
                    ['A quiet corner with a notebook and no noise', '安静的角落，摊开笔记本，没有杂音'],
                    ['Headphones on, talking it through out loud', '戴上耳机，一边听一边小声复述'],
                    ['A workbench where I can build and test things', '一张可以动手搭建、测试的工作台']],
                t: [{ visual: 2 }, { reading: 2 }, { auditory: 2 }, { kinesthetic: 2 }],
                fb: [['Diagrams and colour on a big screen — that is your kind of desk.', '大屏 + 图表 + 彩色 —— 这就是你的桌子。'],
                     ['Quiet, linear and note-first — reading types like a clean runway.', '安静、线性、以笔记为先 —— 阅读型选手需要一条干净的跑道。'],
                     ['You think out loud, with the narration running in the background.', '你边想边说，背景里还放着旁白。'],
                     ['You want your hands on it from the very first minute.', '你想从第一分钟就动手碰它。']] },
              { q: ['When you finally "get it", what happens next?', '当你终于「搞懂了」，接下来会做什么？'],
                o: [['I draw a diagram so it clicks into place', '我会画一张图，让它在脑子里落位'],
                    ['I write my own summary in my own words', '我会用自己的话写一份总结'],
                    ['I explain it to somebody else', '我会讲给别人听'],
                    ['I immediately try to apply it to a real task', '我会立刻把它用在一个真实任务上']],
                t: [{ visual: 2 }, { reading: 2 }, { auditory: 2 }, { kinesthetic: 2 }],
                fb: [['You draw it so it lands — structure first, detail second.', '你靠画图让它落位 —— 先结构，后细节。'],
                     ['You write it down in your own words — reading seals the deal.', '你用自己的话写下来 —— 阅读型选手靠文字封存理解。'],
                     ['Hearing it — or saying it — is when it locks in for you.', '靠「听」或「说」来确认，你才算真正掌握。'],
                     ['You go and use it right away — theory without practice stays theory.', '你立刻上手用起来 —— 实践过一遍的理论才吃得进。']] },
              { q: ['A video tutorial is playing. You are most likely to…', '一段视频教程正在播放，你最可能…'],
                o: [['Pause it to redraw the diagram on paper', '暂停，把图在纸上重画一遍'],
                    ['Pause it to write down the steps', '暂停，把步骤一条条记下来'],
                    ['Keep the narration loud and just listen', '把旁白开着，只管听'],
                    ['Copy the action and try it alongside', '跟着做，边看边练']],
                t: [{ visual: 2 }, { reading: 2 }, { auditory: 2 }, { kinesthetic: 2 }],
                fb: [['You pause to rebuild the picture — visual learners re-draw to remember.', '你暂停是为了重建画面 —— 视觉型学习者靠重画来记忆。'],
                     ['You pause to capture the steps — note-taking is your way in.', '你暂停是为了记下步骤 —— 笔记是你的入口。'],
                     ['You let the narration carry you — sound is your fastest route.', '你让旁白带着走 —— 声音是你最快的路线。'],
                     ['You learn by doing — the screen is only the coach.', '你是「做中学」派，屏幕只是教练。']] }
            ]
          }
        },
        routes: [
          ['visual', 'high', 'G2A'], ['auditory', 'high', 'G2A'],
          ['kinesthetic', 'high', 'G2B'], ['reading', 'high', 'G2B'],
          ['visual', 'mid', 'G2A'], ['auditory', 'mid', 'G2A'],
          ['kinesthetic', 'mid', 'G2B'], ['reading', 'mid', 'G2B'],
          ['visual', 'low', 'G2C'], ['auditory', 'low', 'G2C'],
          ['kinesthetic', 'low', 'G2C'], ['reading', 'low', 'G2C']
        ]
      },
      /* ---------------------------------------------------------------
         层 2：由层 1 的（胜出标签, 分值区间）路由进入 —— 决定「你如何记住它」
         --------------------------------------------------------------- */
      {
        id: 'L2',
        label: ['Step 2 · How you make it stick', '第 2 步 · 你如何真正记住它'],
        buckets: [{ id: 'low', max: 2 }, { id: 'high', min: 3 }],
        defaultTag: 'focus',
        defaultGroup: 'G3A',
        tagPriority: ['focus', 'practice', 'review', 'pace', 'tools'],
        groups: {
          G2A: {
            label: ['Deep-dive set', '深度吸收题组'],
            questions: [
              { q: ['A topic opens up in front of you. What do you zoom into first?', '一个主题铺开在你面前，你最先放大哪一部分？'],
                o: [['The overall picture and how it all connects', '整体图景，以及各部分如何相连'],
                    ['The exact step I keep getting stuck on', '我老是卡住的那一步'],
                    ['The tool that would make this easier', '能让这件事变容易的工具'],
                    ['The people I could learn it from', '我可以向谁学']],
                t: [{ focus: 2 }, { practice: 2 }, { tools: 2 }, { focus: 2 }],
                fb: [['You go for the big picture — the why before the how.', '你直奔全局 —— 先搞懂「为什么」，再谈「怎么做」。'],
                     ['You go straight at the blocker — fixing the stuck bit is satisfying.', '你直扑卡点 —— 把卡住的地方修好最让人上瘾。'],
                     ['You look for leverage first: the tool that does the heavy lifting.', '你优先找杠杆：能让它变轻松的那个工具。'],
                     ['You learn from people — the explanation matters more than the text.', '你从人身上学 —— 讲法比文本更重要。']] },
              { q: ['How do you stop a new idea from slipping away?', '你怎样让一个刚冒出来的念头不溜走？'],
                o: [['Revisiting the same diagram until it feels obvious', '反复看同一张图，直到它变得显而易见'],
                    ['Breaking the next step into smaller pieces', '把下一步拆成更小的碎片'],
                    ['Building a small project around it', '围着它做一个小项目'],
                    ['Talking it through until it sticks', '反复讲出来，直到它留下']],
                t: [{ review: 2 }, { pace: 2 }, { practice: 2 }, { focus: 2 }],
                fb: [['Repetition and looking again — you lock ideas in by revisiting them.', '靠重复和重看 —— 你用「再看一遍」把想法锁住。'],
                     ['You need rhythm: small, steady steps beat one heroic leap.', '你需要节奏：小而稳的步子胜过一次英雄式跳跃。'],
                     ['You make it real — a tiny project forces the idea to behave.', '你把它变真实 —— 一个小项目会逼这个想法现形。'],
                     ['You say it until it sticks — words are your anchor.', '你讲到它留下为止 —— 语言是你的锚。']] },
              { q: ['Your notes look like…', '你的笔记长这样…'],
                o: [['Mind maps and sketches', '思维导图和随手涂鸦'],
                    ['A numbered checklist of next steps', '一份编号的下一步清单'],
                    ['Screenshots, snippets and templates', '截图、代码片段和模板'],
                    ['Quotations from things people said', '别人说过的原话摘录']],
                t: [{ tools: 2 }, { tools: 2 }, { tools: 2 }, { focus: 2 }],
                fb: [['Your notes are a landscape — you think in shapes.', '你的笔记是一片地形图 —— 你用形状思考。'],
                     ['Your notes are a runway — ordered, unambiguous, next-step ready.', '你的笔记是一条跑道 —— 有序、明确，随时可以起飞。'],
                     ['You collect reusable tools — your notes are a toolkit.', '你收集可复用的工具 —— 你的笔记就是一套工具箱。'],
                     ['You keep other people\'s words — your notes are a conversation.', '你留着别人的话 —— 你的笔记是一场对话。']] }
            ]
          },
          G2B: {
            label: ['Hands-on set', '动手实操题组'],
            questions: [
              { q: ['You want to learn a new skill. Where do you start?', '想学一项新技能，你从哪儿开始？'],
                o: [['With a book, in order, cover to cover', '从一本书开始，按顺序从封面读到尾'],
                    ['By setting a schedule and sticking to it', '先定好日程，然后坚持执行'],
                    ['By finding the tools and setting them up', '先找到工具并把它们装好'],
                    ['By trying it straight away, mistakes included', '直接上手试，连错误一起试']],
                t: [{ focus: 2 }, { pace: 2 }, { tools: 2 }, { practice: 2 }],
                fb: [['You want the whole theory in order — it builds the foundation.', '你希望理论从头到尾完整铺开 —— 那是你的地基。'],
                     ['You are a creature of routine — the calendar does the work.', '你是节奏的生物 —— 日历替你干活。'],
                     ['You set up before you start — gear first, then go.', '你先搭好工具再出发 —— 装备先行。'],
                     ['You learn by doing it badly first — that is the fastest way in.', '你先做烂 —— 那是最快的入门方式。']] },
              { q: ['What tells you a topic is done?', '什么会让你觉得一个主题已经学会了？'],
                o: [['I can explain it clearly on paper', '我能在纸上把它讲清楚'],
                    ['I have practised it enough times to be quick', '我练得足够多，做起来又快又顺'],
                    ['I have built something real with it', '我用它做出了真实的东西'],
                    ['I can teach it to someone else', '我可以把它教给别人']],
                t: [{ focus: 2 }, { practice: 2 }, { practice: 2 }, { review: 2 }],
                fb: [['Understanding on paper is your finish line.', '在纸面上讲得清楚，就是你的终点线。'],
                     ['For you, done means fast — the practice is the proof.', '对你来说「学会」就是「够快」—— 练习就是证据。'],
                     ['You need an artefact — something real that exists because of it.', '你需要一件成品 —— 因为它而真实存在的东西。'],
                     ['Teaching is your test — if you can pass it on, it is yours.', '教出去就是你的检验 —— 能讲给别人，就真的属于你了。']] },
              { q: ['Your revision plan looks like…', '你的复习计划长这样…'],
                o: [['A neat set of notes with the key points highlighted', '一份整齐的笔记，重点高亮'],
                    ['A weekly schedule with real deadlines', '一份带真实截止日期的周计划'],
                    ['A checklist of exercises to run through', '一张要逐项完成的练习清单'],
                    ['A short list of the bits I still get wrong', '一份「我仍然搞错的地方」短清单']],
                t: [{ tools: 2 }, { pace: 2 }, { practice: 2 }, { review: 2 }],
                fb: [['Your revision kit is a highlight — clean, reusable, fast to re-read.', '你的复习包是荧光笔 —— 干净、可复用、重读很快。'],
                     ['Deadlines do the pushing — your plan is a contract with yourself.', '截止日期替你推一把 —— 计划是你和自己的合同。'],
                     ['You revise by doing — the checklist is a treadmill.', '你靠做题复习 —— 清单是一台跑步机。'],
                     ['You revise what hurts — the error list is your personal syllabus.', '你复习让你疼的地方 —— 错题清单就是你的私人 syllabus。']] }
            ]
          },
          G2C: {
            label: ['Balanced set', '均衡探索题组'],
            questions: [
              { q: ['What is your ideal study session?', '理想的复习时段是什么样？'],
                o: [['Seeing the big picture AND grinding the details', '既看到全局，又磨完细节'],
                    ['Reading, listening and doing — whatever it needs', '读、听、做 —— 需要什么就用什么'],
                    ['Theory and practice, side by side', '理论与实操并排放在一起'],
                    ['Whatever keeps me curious the longest', '任何能让我好奇最久的方式']],
                t: [{ focus: 2 }, { practice: 2 }, { practice: 2 }, { focus: 2 }],
                fb: [['You want the map and the compass — and you take them in turns.', '你既要地图也要罗盘 —— 而且轮流来。'],
                     ['You mix the media — read a bit, hear a bit, try a bit.', '你混合媒介 —— 读一点、听一点、做一点。'],
                     ['You want theory and practice next to each other, not in sequence.', '你想理论和实操并排，而不是前后排。'],
                     ['Curiosity is your engine — you follow whatever still feels alive.', '好奇心是你的引擎 —— 你追着还有生命力的东西跑。']] },
              { q: ['A topic refuses to click. What now?', '一个主题死活讲不通，怎么办？'],
                o: [['Step back and look at the bigger picture', '退一步，看看更大的图景'],
                    ['Change the plan and come back at a better time', '改个计划换个时间再来'],
                    ['Find a different tool and try again', '换一个工具再试一次'],
                    ['Ask somebody to talk it through with me', '找个人跟我一起把它讲透']],
                t: [{ focus: 2 }, { pace: 2 }, { tools: 2 }, { review: 2 }],
                fb: [['You zoom out when you are stuck — the wider view unblocks you.', '卡住时你后退一步 —— 拉远焦距反而通开了。'],
                     ['You reschedule instead of forcing — timing is part of learning.', '你改期而不是硬上 —— 时机也是学习的一部分。'],
                     ['You swap the tool — the same effort, different handle.', '你换工具 —— 同样的力气，换个抓手。'],
                     ['You bring in a person — a voice can unlock what text cannot.', '你请一个人来 —— 声音能撬开文字撬不开的东西。']] }
            ]
          }
        },
        routes: [
          ['focus', 'high', 'G3A'], ['tools', 'high', 'G3A'],
          ['practice', 'high', 'G3B'], ['pace', 'high', 'G3B'],
          ['review', 'high', 'G3C'],
          ['focus', 'low', 'G3A'], ['tools', 'low', 'G3A'],
          ['practice', 'low', 'G3B'], ['pace', 'low', 'G3B'],
          ['review', 'low', 'G3C']
        ]
      },
      /* ---------------------------------------------------------------
         层 3：由层 2 路由进入 —— 决定「你最终留下什么」（终点层）
         --------------------------------------------------------------- */
      {
        id: 'L3',
        label: ['Step 3 · What you keep', '第 3 步 · 你最终留下什么'],
        buckets: [{ id: 'low', max: 2 }, { id: 'high', min: 3 }],
        defaultTag: 'structure',
        defaultGroup: 'G3A',
        tagPriority: ['structure', 'practice', 'review'],
        groups: {
          G3A: {
            label: ['Structure set', '结构沉淀题组'],
            questions: [
              { q: ['Six months from now, what would make you proudest?', '半年之后，哪件事最让你骄傲？'],
                o: [['A clear mental map of the whole field', '对这个领域有一张清晰的心智地图'],
                    ['Real skills I can perform without thinking', '有真正能上手、不假思索的技能'],
                    ['A habit that keeps my knowledge fresh', '有一个让知识常新的习惯'],
                    ['Honestly, all three', '说实话，三样都想要']],
                t: [{ structure: 2 }, { practice: 2 }, { review: 2 }, { structure: 1, practice: 1, review: 1 }],
                fb: [['You want the map — structure is what makes knowledge reusable.', '你想要那张地图 —— 结构让知识变得可复用。'],
                     ['You want the skill — the ability to do it without thinking.', '你想要那项技能 —— 不假思索就能做到。'],
                     ['You want the habit — knowledge that stays alive on its own.', '你想要那个习惯 —— 知识能靠自己活着。'],
                     ['You want the whole package — map, skill and habit.', '你三样都要 —— 地图、技能和习惯。']] },
              { q: ['How do you keep what you learned?', '你怎样保住学到的东西？'],
                o: [['I build systems: notes, maps, folders', '我搭系统：笔记、地图、文件夹'],
                    ['I keep using it, so it stays sharp', '我持续使用，让它保持锋利'],
                    ['I revisit it on a schedule', '我按日程定期回看'],
                    ['I teach it to someone', '我把它教给别人']],
                t: [{ structure: 2 }, { practice: 2 }, { review: 2 }, { practice: 2 }],
                fb: [['You build containers — the system is what keeps the knowledge.', '你搭容器 —— 留住知识的是系统本身。'],
                     ['You keep it alive by using it — idleness is the only real loss.', '你靠用起来保持热度 —— 唯一的损失是闲置。'],
                     ['You schedule your way back in — spacing beats cramming.', '你靠排期回头复习 —— 间隔胜过硬啃。'],
                     ['You teach it to someone — teaching is the proof of ownership.', '你把它教给别人 —— 教会别人才是真正拥有的证明。']] }
            ]
          },
          G3B: {
            label: ['Practice set', '动手输出题组'],
            questions: [
              { q: ['The weekend arrives. What do you do with the two free days?', '周末到了，这两天你打算怎么用？'],
                o: [['Build the thing I have been putting off', '把拖了很久的那件事做出来'],
                    ['Get the theory properly straight in my head', '把理论在脑子里彻底捋顺'],
                    ['Work through my list of weak spots', '把我薄弱的地方逐个过一遍'],
                    ['Rest — a tired brain keeps nothing', '休息 —— 累坏的大脑留不住东西']],
                t: [{ practice: 2 }, { structure: 2 }, { review: 2 }, {}],
                fb: [['You make, you break, you finish — output is how you learn.', '你动手、弄坏、再做成 —— 输出才是你的学习方式。'],
                     ['You clear the decks — understanding first, output second.', '你先把桌面理清 —— 先理解，再输出。'],
                     ['You target the gaps — the error list is the fastest route back.', '你专攻漏洞 —— 错题清单是回头最快的路。'],
                     ['Rest is part of the method — burnout remembers nothing.', '休息也是方法的一部分 —— 透支的大脑什么都留不下。']] },
              { q: ['Where do you want to be in a year?', '一年之后，你希望自己在哪里？'],
                o: [['Confidently doing it without instructions', '不用说明书也能自信完成'],
                    ['Holding a complete set of my own notes', '拥有一套完整的自有笔记'],
                    ['Re-reading and refreshing what I already know', '重读并刷新我已经懂的东西'],
                    ['Teaching it to a team', '把它教给一个团队']],
                t: [{ practice: 2 }, { structure: 2 }, { review: 2 }, { practice: 2 }],
                fb: [['You want the reflex — smooth, automatic, no notes needed.', '你想要的是条件反射 —— 顺滑、自动、不用看笔记。'],
                     ['You want the archive — everything written down in your own hand.', '你想要的是档案 —— 一切都用自己的手写下来。'],
                     ['You want the refresh — knowledge kept warm, never cold.', '你想要的是保温 —— 知识一直是热的，从不冷掉。'],
                     ['You want the multiplier — what you know, passed on and amplified.', '你想要的是放大器 —— 你懂的被传出去、被放大。']] }
            ]
          },
          G3C: {
            label: ['Review set', '回顾保温题组'],
            questions: [
              { q: ['How do you keep a skill alive long after the class?', '课程结束后，你怎样让一项技能保持鲜活？'],
                o: [['I schedule short refreshers', '我安排短周期复习'],
                    ['I still use it in real work', '我还在真实工作里用它'],
                    ['I re-read my notes from the start', '我从头重读自己的笔记'],
                    ['I talk about it with other people', '我和别人聊起它']],
                t: [{ review: 2 }, { practice: 2 }, { structure: 2 }, { review: 2 }],
                fb: [['Your calendar is the engine — spaced repeats beat one big effort.', '你的日历就是引擎 —— 间隔复习胜过一次猛冲。'],
                     ['Real usage is the best teacher — work keeps it honest.', '真实使用是最好的老师 —— 工作让它保持诚实。'],
                     ['You go back to the source — your notes never go stale.', '你回到源头 —— 你的笔记永不过期。'],
                     ['Conversation is your maintenance — talking keeps it honest.', '聊天就是你的保养 —— 说着说着它就真了。']] },
              { q: ['What would make you feel like a topic is yours?', '什么会让你觉得一个主题真的属于你？'],
                o: [['I can find any detail again quickly', '我能很快找回任何一个细节'],
                    ['I keep working with it regularly', '我持续拿它做事'],
                    ['I revisit it on a fixed schedule', '我按固定日程回看'],
                    ['I bring it up in conversation naturally', '我能在聊天里自然地聊起它']],
                t: [{ structure: 2 }, { practice: 2 }, { review: 2 }, { review: 2 }],
                fb: [['Retrieval is the test — if you can find it, it is yours.', '能随时取用就是标准 —— 找得到，它才属于你。'],
                     ['You earn ownership by using it — knowledge you never apply stays borrowed.', '你靠使用赢得所有权 —— 从不落地的知识始终只是借来的。'],
                     ['Discipline keeps it yours — the schedule does the remembering for you.', '纪律让它属于你 —— 日历替你记着。'],
                     ['It feels native — you bring it up without being asked.', '它已经像母语 —— 不用人问你就聊起它。']] }
            ]
          }
        },
        routes: []
      }
    ],
    results: [
      { id: 'R1', when: [['L1', 'tag:visual'], ['L2', 'bucket:high']],
        title: ['The Visual Architect', '视觉建筑师'],
        desc: ['You build understanding by seeing it. Diagrams, sketches and big-picture maps are your fastest route in — so start there, and the rest of the detail will hang off it.',
              '你靠「看见」来建立理解。图示、草图和全局地图是你最快的入口 —— 从这里开始，细节会自然挂靠上来。'],
        traits: [['Builds mental maps first', '先搭建心智地图'], ['Needs the big picture early', '需要尽早看到全局'], ['Explains best with diagrams', '用图示解释最拿手']] },
      { id: 'R2', when: [['L1', 'tag:auditory'], ['L2', 'bucket:high']],
        title: ['The Storyteller', '讲述者'],
        desc: ['You understand by talking. A conversation, a podcast or a good explanation does more for you than a page of notes — teach someone else this week and watch it click.',
              '你靠「讲出来」来理解。一次对话、一段播客或一个好解释，胜过一页笔记 —— 这周试着教给别人，看它立刻接通。'],
        traits: [['Learns out loud', '出声学习'], ['Turns topics into stories', '把主题讲成故事'], ['Great in a study group', '在小组里如鱼得水']] },
      { id: 'R3', when: [['L1', 'tag:kinesthetic'], ['L2', 'bucket:high']],
        title: ['The Maker', '实干家'],
        desc: ['You learn by doing it badly first. Get a small real project running, break it, fix it — the theory sticks far better once your hands have been there.',
              '你靠「先做烂」来学习。先让一个小项目跑起来，弄坏它，修好它 —— 手上真的干过一遍，理论才真正吃得进。'],
        traits: [['Hands-on from minute one', '第一分钟就上手'], ['Theory after practice', '实践之后再谈理论'], ['Motivated by real output', '被真实产出激励']] },
      { id: 'R4', when: [['L1', 'tag:reading'], ['L2', 'bucket:high']],
        title: ['The Analyst', '分析师'],
        desc: ['You want it written down and in order. Text gives you the control you need — take notes properly and you will still be using them next month.',
              '你想要它被写下来、并且有秩序。文字给了你需要的掌控感 —— 好好记笔记，下个月你还会用得上。'],
        traits: [['Wants the full text', '要完整文本'], ['Systematic and ordered', '系统而有条理'], ['Notes worth keeping', '笔记值得留存']] },
      { id: 'R5', when: [['L1', 'tag:visual'], ['L2', 'bucket:low']],
        title: ['The Illustrator', '绘图者'],
        desc: ['You are visual, but you are still deciding how you like to learn. Try two styles this week and keep whichever one you actually look forward to.',
              '你有视觉天赋，但还没定下最适合自己的学习方式。这周试两种风格，留下你真正期待的那一个。'],
        traits: [['Visual instincts, undecided method', '有视觉直觉，方法待定'], ['Experiment beats theory', '实验胜过理论'], ['Try a mixed routine', '试试混合路线']] },
      { id: 'R6', when: [['L1', 'tag:auditory'], ['L2', 'bucket:low']],
        title: ['The Listener', '倾听者'],
        desc: ['You are wired for sound, but your routine is not settled yet. Pair one good explainer with one hands-on task and you will find your rhythm quickly.',
              '你天生对声音敏感，只是节奏还没定型。把一段好讲解和一次动手练习配起来，很快就能找到感觉。'],
        traits: [['Hears the signal', '对声音敏感'], ['Method still forming', '方法尚在成形'], ['Try pairing sound with doing', '试试把「听」和「做」配对']] },
      { id: 'R7', when: [['L1', 'tag:kinesthetic'], ['L2', 'bucket:low']],
        title: ['The Doer', '行动者'],
        desc: ['You learn by activity, but your follow-through is still the weak spot. Add a small ritual — five minutes at the same time each day — and it will carry you.',
              '你在行动中学，只是坚持还欠火候。加一个小仪式 —— 每天固定五分钟 —— 就能带得动你。'],
        traits: [['Prefers action', '偏好行动'], ['Consistency is the goal', '目标是保持连续'], ['Anchor it to a time', '把它锚定在固定时间']] },
      { id: 'R8', when: [['L1', 'tag:reading'], ['L2', 'bucket:low']],
        title: ['The Reader', '读者'],
        desc: ['You are a natural reader and you know it. The next step is turning reading into output — one short written summary per chapter is all it takes.',
              '你天生爱读，也清楚这一点。下一步是把「读」变成「输出」 —— 每章写一段简短总结就够了。'],
        traits: [['Reads for a living, literally', '真的靠阅读吃饭'], ['Needs an output channel', '需要输出通道'], ['Summarise to seal it', '写总结来封存知识']] }
    ],
    defaultResult: {
      id: 'R0',
      title: ['The Explorer', '探索者'],
      desc: ['You did not fit one neat box — and that is genuinely fine. Rotating between a diagram, a conversation and a hands-on task will keep you sharp. We built this quiz to branch, so your profile came out mixed on purpose.',
            '你没有落进任何一个固定的框里 —— 这其实挺好的。在图示、对话与动手之间轮换，会让你保持敏锐。这个测验本来就是分支的，所以你的画像是刻意混搭的。'],
      traits: [['Mixes several styles', '混合多种风格'], ['Curiosity over routine', '好奇心胜于固定套路'], ['Rotate your methods', '轮换你的方法']]
    }
  });
  /* LAB2 — 压力风格 */
  add({
    id: 'stress-style', cat: 'lab', theme: 'personality',
    title: ['What is Your Stress Style?', '你的压力风格是？'],
    desc: ['How you handle pressure says more about you than your CV does.', '你在压力下的反应，比简历更能说明你这个人。'],
    level: ['Medium', '进阶'], minutes: 3,
    questions: [
      { q: ['A deadline lands 24 hours before it is due. You…', '截止日期在到期前 24 小时才出现。你会…'],
        o: [['Start immediately and work deep', '立刻开工，进入深度状态'],
            ['Make a plan, then move fast', '先做计划，再快速推进'],
            ['Ask someone for a second opinion', '找个人给点意见'],
            ['Take a break and come back fresh', '先休息一下，再精神饱满地回来']], a: 0,
        f: ['You dive straight in — momentum is your fuel.', '你直接扎进去 —— 惯性就是你的燃料。'] },
      { q: ['Which sentence is closest to your inner voice during a crisis?', '危机时刻，你内心最接近哪一句话？'],
        o: [['"Let us work through this step by step."', '「我们一步一步来。」'],
            ['"What is the fastest way through this?"', '「最快的路是哪条？」'],
            ['"Who can help me with this?"', '「谁能帮我一把？」'],
            ['"Deep breath — I will be fine."', '「深呼吸，我会没事的。」']], a: 2,
        f: ['Asking for help is not weakness — it is the shortest route to the answer.', '求助不是软弱 —— 那反而是拿到答案最短的路。'] },
      { q: ['After a hard day, how do you reset?', '忙完难熬的一天，你怎样把自己调回来？'],
        o: [['Exercise until the noise stops', '运动到脑子安静下来'],
            ['Cook something from scratch', '从零做一顿饭'],
            ['Call a friend and talk it out', '打电话给朋友说说'],
            ['Write everything down and sleep', '全部写下来，然后睡觉']], a: 1,
        f: ['Cooking gives your hands a job while your mind cools down.', '做饭让双手有事做，脑子也慢慢凉下来。'] },
      { q: ['Someone else takes credit for your work. You…', '别人抢了你的功劳。你会…'],
        o: [['Let it go — starting a fight costs more', '算了 —— 吵一架成本更高'],
            ['Correct them privately and clearly', '私下明确地纠正对方'],
            ['Let it slide and out-work them', '咽下去，用工作量说话'],
            ['Celebrate their win and move on', '为对方高兴，然后翻篇']], a: 2,
        f: ['You answer pressure with output, not with an argument.', '你用产出来回应压力，而不是用争吵。'] },
      { q: ['What does a calm day look like for you?', '对你来说，安稳的一天长什么样？'],
        o: [['One thing at a time, done properly', '一次只做一件事，做好'],
            ['Four things at once, all moving', '同时四件事，全都在推进'],
            ['Nothing scheduled — free to improvise', '什么都不排 —— 自由发挥'],
            ['Something finished before lunch', '午饭前就搞定一件事']], a: 3,
        f: ['One completed thing beats five started ones.', '做完一件，胜过开了五件。'] }
    ]
  });

  /* LAB3 — 思考者类型 */
  add({
    id: 'thinker-type', cat: 'lab', theme: 'brain',
    title: ['What Kind of Thinker Are You?', '你是哪种思考者？'],
    desc: ['Five questions about how you think, argue and decide.', '五个关于你如何思考、争论与决策的问题。'],
    level: ['Easy', '入门'], minutes: 3,
    questions: [
      { q: ['A friend asks for advice on a big decision. You…', '朋友就一个重要决定来问你。你会…'],
        o: [['Ask them what they already want', '反问他们自己其实想要什么'],
            ['List the options and the trade-offs', '列出选项和各自的取舍'],
            ['Tell them what you would do', '直接说你会怎么做'],
            ['Encourage them and step back', '鼓励一下，然后交给他们自己']], a: 1,
        f: ['You think in trade-offs — a decision is a comparison, not a mood.', '你用取舍来思考 —— 决策是一场比较，不是一种情绪。'] },
      { q: ['You are wrong about something. How do you find out?', '你判断错了事情，通常是怎么发现的？'],
        o: [['Someone corrects me', '有人纠正我'],
            ['I notice the evidence myself', '我自己发现证据不对'],
            ['I never find out', '我永远发现不了'],
            ['I re-check it later, out of habit', '出于习惯，我过一阵再回头核对']], a: 3,
        f: ['Verification is a habit for you — slow, quiet and effective.', '核实对你来说是一种习惯 —— 慢、安静，但有效。'] },
      { q: ['In a debate, you…', '在一场辩论里，你会…'],
        o: [['Go for the strongest version of the other side', '先构建对方最强的版本'],
            ['Look for the flaw in their logic', '找对方逻辑里的漏洞'],
            ['Change the subject to what actually matters', '把话题引到真正要紧的地方'],
            ['Stay quiet and take notes', '保持安静，先做笔记']], a: 0,
        f: ['Steel-manning is your style — you half-win the argument before it starts.', '「先立对方最强版本」是你的风格 —— 辩论还没开始你就赢了一半。'] },
      { q: ['How many open tabs are on your screen right now?', '你屏幕上现在开着多少个标签页？'],
        o: [['More than I would like to admit', '比我愿意承认的还多'],
            ['Two or three, tidy', '两三个，整整齐齐'],
            ['Exactly one, full screen', '只有一个，占满全屏'],
            ['I do not use tabs at all', '我根本不开标签页']], a: 2,
        f: ['One context at a time — your attention was not built for split screens.', '一次只用一个上下文 —— 你的注意力不是为分屏而生的。'] },
      { q: ['When you are stuck on a hard problem, what happens next?', '卡在一个难题上时，接下来你会怎么做？'],
        o: [['I take a walk and come back later', '我出去走一圈，稍后再回来'],
            ['I work harder, for longer', '我更用力、更久地干'],
            ['I explain it to someone', '我把它讲给别人听'],
            ['I start over from scratch', '我从头再来一遍']], a: 2,
        f: ['Talking exposes the gap — you find the missing step while explaining.', '讲出来会暴露缺口 —— 你在解释的过程中找到了缺的那一步。'] }
    ]
  });

  /* LAB4 — 团队角色 */
  add({
    id: 'team-role', cat: 'lab', theme: 'game',
    title: ['What is Your Team Role?', '你在团队里的角色是？'],
    desc: ['Where you sit in a group — and what the group needs from you.', '你在团队里的位置 —— 以及团队需要你做什么。'],
    level: ['Medium', '进阶'], minutes: 3,
    questions: [
      { q: ['A group project starts. You…', '小组项目启动了。你会…'],
        o: [['Claim the hardest part', '抢最难的那块'],
            ['Agree the plan with everyone first', '先和大家把计划谈定'],
            ['Wait and see how it goes', '先看看情况再说'],
            ['Start quietly and let the others organise', '默默开始，让别人去组织']], a: 1,
        f: ['You stabilise the group first — clarity comes before contribution.', '你先把队伍稳住 —— 清晰比贡献来得早。'] },
      { q: ['A teammate makes a big mistake. You…', '队友犯了个大错。你会…'],
        o: [['Help them fix it immediately', '立刻帮他补救'],
            ['Tell them privately and clearly', '私下明确地告诉他'],
            ['Let the team sort it out', '交给团队处理'],
            ['Point it out in the meeting', '在会上直接指出']], a: 1,
        f: ['You shield people from public failure without giving up on the truth.', '你护住人不让他当众翻车，同时也不放弃说真话。'] },
      { q: ['The best compliment you can get is…', '你最想听到的夸奖是…'],
        o: [['"You are the most reliable."', '「你最可靠。」'],
            ['"You are the most creative."', '「你最有创意。」'],
            ['"You made everyone around you better."', '「你让身边的人都变好了。」'],
            ['"You always get it done."', '「你总能搞定。」']], a: 2,
        f: ['Your value is not in any single task — it is in the whole team rising.', '你的价值不在某一件任务 —— 而在于整个团队被抬起来。'] },
      { q: ['You are handed a task you think is pointless. You…', '你接到一个自己认为没意义的活。你会…'],
        o: [['Do it well anyway, and say why it matters', '照样做好，同时说清它的意义'],
            ['Push back until someone changes the plan', '推动，直到有人改方案'],
            ['Do it quickly and move on', '快速做完就翻篇'],
            ['Refuse it and pick something else', '拒绝，换一件事做']], a: 0,
        f: ['You buy in first, then improve the plan from the inside.', '你先接下，再从内部把方案改好。'] },
      { q: ['The team is stuck in a long debate. You…', '团队卡在一场长讨论里。你会…'],
        o: [['Push for a decision right now', '立刻推动做决定'],
            ['Name the real disagreement and cut it', '指出真正的分歧并切掉它'],
            ['Stay quiet and let it burn out', '保持沉默，让它自然烧完'],
            ['Write a short summary and circulate it', '写一份简短纪要发给大家']], a: 3,
        f: ['You make the thinking visible — writing settles most debates.', '你把思考写下来 —— 落成文字，大多数争论就结束了。'] }
    ]
  });
  /* =====================================================================
     导出 + 归一化
     ===================================================================== */
  CATEGORIES.forEach(function (c) {
    c.name = L(c.name);
    c.blurb = L(c.blurb);
  });

  /* 动态漏斗 Quiz 的结构归一化 */
  QUIZZES.forEach(function (qz) {
    if (qz.type !== 'funnel') return;
    qz.layers.forEach(function (layer) {
      layer.label = L(layer.label);
      Object.keys(layer.groups).forEach(function (gk) {
        var g = layer.groups[gk];
        g.label = L(g.label);
        g.questions.forEach(function (it) {
          it.q = L(it.q);
          it.o = (it.o || []).map(L);
          it.fb = Array.isArray(it.fb) ? it.fb.map(L) : [L(it.fb)];
          it.t = (it.t || []).map(function (m) { return m || {}; });
        });
      });
      layer.routes = (layer.routes || []).map(function (r) {
        return { tag: r[0], bucket: r[1], group: r[2] };
      });
    });
    qz.results.forEach(function (r) {
      r.title = L(r.title);
      r.desc = L(r.desc);
      r.traits = (r.traits || []).map(L);
      r.when = (r.when || []).map(function (w) {
        var kind = w[1].indexOf('tag:') === 0 ? 'tag' : 'bucket';
        return { layer: w[0], kind: kind, value: w[1].split(':')[1] };
      });
    });
    qz.defaultResult.title = L(qz.defaultResult.title);
    qz.defaultResult.desc = L(qz.defaultResult.desc);
    qz.defaultResult.traits = (qz.defaultResult.traits || []).map(L);
  });

  var byIdMap = {};
  QUIZZES.forEach(function (q) { byIdMap[q.id] = q; });

  function catById(id) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === id) return CATEGORIES[i];
    }
    return null;
  }

  global.CNTData = {
    categories: CATEGORIES,
    quizzes: QUIZZES,
    catById: catById,
    byId: function (id) { return byIdMap[id] || null; },
    byCategory: function (catId) {
      return QUIZZES.filter(function (q) { return q.cat === catId; });
    },
    /* 搜索：标题 / 描述 / 分类 */
    search: function (term) {
      var t = (term || '').trim().toLowerCase();
      if (!t) return [];
      return QUIZZES.filter(function (q) {
        var c = catById(q.cat);
        var hay = [q.title.en, q.title.zh, q.desc.en, q.desc.zh,
                   c ? c.name.en : '', c ? c.name.zh : '', q.id].join(' ').toLowerCase();
        return hay.indexOf(t) !== -1;
      });
    }
  };
})(window);