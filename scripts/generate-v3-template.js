// v3.1 Excel template generator (no external deps)
// 4 sheets: 层级结构 / 标签分数 / 结果页 / 跳转逻辑
// v3.1 变更：
//   - 标签全部中文化（与产品表共用同一套词汇表）
//   - 结果页新增 product_tags 列（商品推荐规则）
//   - L2 跳转逻辑补全到 5 条规则（覆盖 R1-R4 + DEFAULT）

const fs = require('fs');
const zlib = require('zlib');

// ---- 1. Data (v3.1) ----
const COMMON_TAGS = [
  "宠物毛发","灰尘","顽固污渍","其他",
  "小户型","中户型","大户型",
  "有宠物","无宠物",
  "严重","轻微",
  "专业服务","自己动手",
  "地板","家具","窗帘",
  "节省时间","节省体力","产品升级","整体收纳"
];

const data = {
  sheets: [
    {
      name: "层级结构",
      headers: ["layer_id","layer_name","group_id","group_name","question_id","sub_title","option","content"],
      widths: [8, 14, 8, 14, 12, 36, 50, 42],
      dataValidations: [],
      rows: [
        ["","","","","","","","宠物清洁困扰的朋友，欢迎来到我们的方案推荐 quiz。花 1 分钟回答几道题，我们会根据你的具体情况推荐最合适的清洁方案。"],
        ["L1","问题诊断","G0","基础信息","","","",""],
        ["L1","问题诊断","G0","基础信息","1","你家最主要的问题是？","宠物毛发&split&灰尘&split&顽固污渍&split&其他",""],
        ["L1","问题诊断","G0","基础信息","2","你的房屋面积是？","小户型&split&中户型&split&大户型",""],
        ["L1","问题诊断","G0","基础信息","3","你家有宠物吗？","有宠物&split&无宠物",""],
        ["L2","动态验证","G1","严重宠物","","","",""],
        ["L2","动态验证","G1","严重宠物","4","宠物毛发的严重程度如何？","严重&split&轻微",""],
        ["L2","动态验证","G1","严重宠物","5","你更倾向于哪种方式？","专业服务&split&自己动手",""],
        ["L2","动态验证","G2","灰尘场景","","","",""],
        ["L2","动态验证","G2","灰尘场景","6","灰尘主要在哪里？","地板&split&家具&split&窗帘",""],
        ["L2","动态验证","G2","灰尘场景","7","你更倾向于哪种方式？","专业服务&split&自己动手",""],
        ["L2","动态验证","G3","通用兜底","","","",""],
        ["L2","动态验证","G3","通用兜底","8","你最想先解决哪类问题？","节省时间&split&节省体力&split&产品升级&split&整体收纳",""]
      ]
    },
    {
      name: "标签分数",
      headers: ["question_id","option","tag","score"],
      widths: [12, 10, 16, 10],
      dataValidations: [
        {col:"B", title:"option", prompt:"A=第 1 个选项, B=第 2 个选项...", formula1:"A,B,C,D,E,F,G,H,I,J"},
        {col:"C", title:"tag", prompt:"中文标签名（与产品表共用词汇表）", formula1: COMMON_TAGS.join(",")},
        {col:"D", title:"score", prompt:"正整数，分值越高严重程度越高", formula1:"1,2,3,4,5,6,7,8,9,10"}
      ],
      rows: [
        [1,"A","宠物毛发",7],
        [1,"B","灰尘",5],
        [1,"C","顽固污渍",5],
        [1,"D","其他",1],
        [2,"A","小户型",3],
        [2,"B","中户型",5],
        [2,"C","大户型",7],
        [3,"A","有宠物",5],
        [3,"B","无宠物",0],
        [4,"A","严重",7],
        [4,"B","轻微",3],
        [5,"A","专业服务",7],
        [5,"B","自己动手",3],
        [6,"A","地板",5],
        [6,"B","家具",5],
        [6,"C","窗帘",5],
        [7,"A","专业服务",7],
        [7,"B","自己动手",3],
        [8,"A","节省时间",5],
        [8,"B","节省体力",5],
        [8,"C","产品升级",5],
        [8,"D","整体收纳",5]
      ]
    },
    {
      name: "结果页",
      headers: ["result","content","is_default","product_tags"],
      widths: [10, 50, 12, 32],
      dataValidations: [
        {col:"C", title:"is_default", prompt:"全文必须且仅能有 1 行 true 作为兜底", formula1:"true,false"},
        {col:"D", title:"product_tags", prompt:"推荐商品 tag 规则（OR 匹配）：tag1||tag2 || (ALL)=全部商品 || (NONE)/留空=不推荐", formula1:"宠物毛发||专业服务,宠物毛发||自己动手,灰尘||专业服务,灰尘||自己动手,(ALL),(NONE)"}
      ],
      rows: [
        ["R1","根据你的回答，你家中的宠物毛发问题较为严重（重度），且更倾向于通过专业服务来解决。我们为你精选了专业深度清洁方案，专业团队上门高效处理宠物毛发困扰，让你和爱宠都能享受洁净家居。","false","宠物毛发||专业服务"],
        ["R2","看来你家中的宠物毛发问题比较严重（重度），不过你更希望通过自己动手来解决。我们为你挑选了高效的去毛工具套装，并附上详细的清洁教程，让你轻松搞定重度宠物毛发。","false","宠物毛发||自己动手"],
        ["R3","根据你的回答，家中灰尘问题较为明显，并且你倾向于让专业团队来处理。我们为你推荐专业的除尘专项服务，由专业团队上门高效清除家中的灰尘问题，还你洁净空间。","false","灰尘||专业服务"],
        ["R4","你家中存在灰尘困扰，并且希望自己动手解决。我们为你挑选了高效的除尘工具和实用的清洁教程，帮助你轻松打造无尘的家居环境。","false","灰尘||自己动手"],
        ["R5","感谢你完成问卷。综合你的回答，我们为你准备了一套通用的家庭清洁入门方案，包含实用的基础清洁工具和操作建议，适合多种家庭清洁场景。","true","(ALL)"]
      ]
    },
    {
      name: "跳转逻辑",
      headers: ["type","from_layer_id","condition_expr","target"],
      widths: [10, 14, 44, 14],
      dataValidations: [
        {col:"A", title:"type", prompt:"group=跳到下一层 group；result=直接出结果页", formula1:"group,result"},
        {col:"C", title:"condition_expr", prompt:"tag:X (含X) / tag:X&&tag:Y (同时含) / score:X>=N (分数比较) / (DEFAULT) (兜底)", formula1:"tag:宠物毛发,tag:灰尘,tag:宠物毛发&&tag:专业服务,tag:宠物毛发&&tag:自己动手,(DEFAULT)"}
      ],
      rows: [
        ["group","L1","tag:宠物毛发","G1"],
        ["group","L1","tag:灰尘","G2"],
        ["group","L1","(DEFAULT)","G3"],
        ["result","L2","tag:宠物毛发&&tag:专业服务","R1"],
        ["result","L2","tag:宠物毛发&&tag:自己动手","R2"],
        ["result","L2","tag:灰尘&&tag:专业服务","R3"],
        ["result","L2","tag:灰尘&&tag:自己动手","R4"],
        ["result","L2","(DEFAULT)","R5"]
      ]
    }
  ]
};

function escapeXml(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}
function colLetter(n) {
  let s = ""; let x = n;
  while (x > 0) {
    const r = (x - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

const sharedStrings = [];
const ssMap = new Map();
function addString(s) {
  const k = String(s);
  if (ssMap.has(k)) return ssMap.get(k);
  const idx = sharedStrings.length;
  sharedStrings.push(k);
  ssMap.set(k, idx);
  return idx;
}

function buildSheetXml(sheet) {
  const { headers, rows, widths, dataValidations } = sheet;
  const numCols = new Set(["question_id", "score"]);
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';
  xml += '<sheetViews><sheetView tabSelected="0" workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>';
  xml += '<sheetFormatPr defaultRowHeight="15"/>';
  xml += '<cols>';
  for (let c = 1; c <= headers.length; c++) {
    xml += '<col min="' + c + '" max="' + c + '" width="' + widths[c-1] + '" customWidth="1"/>';
  }
  xml += '</cols>';
  xml += '<sheetData>';
  xml += '<row r="1">';
  for (let c = 1; c <= headers.length; c++) {
    const ref = colLetter(c) + '1';
    const idx = addString(headers[c-1]);
    xml += '<c r="' + ref + '" t="s"><v>' + idx + '</v></c>';
  }
  xml += '</row>';
  rows.forEach((row, ri) => {
    const rn = ri + 2;
    xml += '<row r="' + rn + '">';
    for (let c = 1; c <= headers.length; c++) {
      const ref = colLetter(c) + rn;
      let v = row[c-1];
      if (v === null || v === undefined) v = "";
      const colName = headers[c-1];
      const isStr = !(numCols.has(colName) && /^-?\d+$/.test(String(v)));
      if (isStr) {
        const idx = addString(v);
        xml += '<c r="' + ref + '" t="s"><v>' + idx + '</v></c>';
      } else {
        xml += '<c r="' + ref + '"><v>' + v + '</v></c>';
      }
    }
    xml += '</row>';
  });
  xml += '</sheetData>';
  if (dataValidations && dataValidations.length > 0) {
    xml += '<dataValidations count="' + dataValidations.length + '">';
    dataValidations.forEach(dv => {
      xml += '<dataValidation type="list" allowBlank="1" showInputMessage="1" promptTitle="' + escapeXml(dv.title) + '" prompt="' + escapeXml(dv.prompt) + '" sqref="' + dv.col + '2:' + dv.col + '1000"><formula1>"' + escapeXml(dv.formula1) + '"</formula1></dataValidation>';
    });
    xml += '</dataValidations>';
  }
  xml += '</worksheet>';
  return xml;
}

function buildSharedStringsXml() {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="' + sharedStrings.length + '" uniqueCount="' + sharedStrings.length + '">';
  sharedStrings.forEach(s => {
    xml += '<si><t xml:space="preserve">' + escapeXml(s) + '</t></si>';
  });
  xml += '</sst>';
  return xml;
}

function buildWorkbookXml() {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">';
  xml += '<sheets>';
  data.sheets.forEach((s, i) => {
    xml += '<sheet name="' + escapeXml(s.name) + '" sheetId="' + (i+1) + '" r:id="rId' + (i+1) + '"/>';
  });
  xml += '</sheets></workbook>';
  return xml;
}

function buildWorkbookRelsXml() {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
  data.sheets.forEach((s, i) => {
    xml += '<Relationship Id="rId' + (i+1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i+1) + '.xml"/>';
  });
  const ssId = data.sheets.length + 1;
  xml += '<Relationship Id="rId' + ssId + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>';
  xml += '</Relationships>';
  return xml;
}

function buildContentTypesXml() {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">';
  xml += '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>';
  xml += '<Default Extension="xml" ContentType="application/xml"/>';
  xml += '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>';
  data.sheets.forEach((s, i) => {
    xml += '<Override PartName="/xl/worksheets/sheet' + (i+1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
  });
  xml += '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>';
  xml += '</Types>';
  return xml;
}

function buildRelsXml() {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const f of files) {
    const nameBuf = Buffer.from(f.path, 'utf8');
    const dataBuf = f.content;
    const compressed = zlib.deflateRawSync(dataBuf, { level: 9 });
    const useDeflate = compressed.length < dataBuf.length;
    const stored = useDeflate ? compressed : dataBuf;
    const method = useDeflate ? 8 : 0;
    const crc = crc32(dataBuf);
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(method, 8);
    lh.writeUInt16LE(0, 10);
    lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(stored.length, 18);
    lh.writeUInt32LE(dataBuf.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28);
    localParts.push(lh, nameBuf, stored);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0, 8);
    ch.writeUInt16LE(method, 10);
    ch.writeUInt16LE(0, 12);
    ch.writeUInt16LE(0, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(stored.length, 20);
    ch.writeUInt32LE(dataBuf.length, 24);
    ch.writeUInt16LE(nameBuf.length, 28);
    ch.writeUInt16LE(0, 30);
    ch.writeUInt16LE(0, 32);
    ch.writeUInt16LE(0, 34);
    ch.writeUInt16LE(0, 36);
    ch.writeUInt32LE(0, 38);
    ch.writeUInt32LE(offset, 42);
    centralParts.push(ch, nameBuf);
    offset += lh.length + nameBuf.length + stored.length;
  }
  const centralStart = offset;
  let centralSize = 0;
  centralParts.forEach(b => centralSize += b.length);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(centralStart, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, ...centralParts, eocd]);
}

const sheetXmls = data.sheets.map(buildSheetXml);
const files = [
  { path: "[Content_Types].xml", content: Buffer.from(buildContentTypesXml(), "utf8") },
  { path: "_rels/.rels", content: Buffer.from(buildRelsXml(), "utf8") },
  { path: "xl/workbook.xml", content: Buffer.from(buildWorkbookXml(), "utf8") },
  { path: "xl/_rels/workbook.xml.rels", content: Buffer.from(buildWorkbookRelsXml(), "utf8") },
  { path: "xl/sharedStrings.xml", content: Buffer.from(buildSharedStringsXml(), "utf8") }
];
sheetXmls.forEach((xml, i) => {
  files.push({ path: 'xl/worksheets/sheet' + (i+1) + '.xml', content: Buffer.from(xml, "utf8") });
});
const zipBuf = buildZip(files);
const outPath = 'E:\\Codex\\CNT\\docs\\requirements\\quiz-dynamic-template-v3-new.xlsx';
fs.writeFileSync(outPath, zipBuf);
console.log('OK xlsx generated: ' + outPath);
console.log('   Size: ' + (zipBuf.length / 1024).toFixed(1) + ' KB');
console.log('   Shared strings: ' + sharedStrings.length);
console.log('   Sheets: ' + data.sheets.map(s => s.name).join(' / '));
console.log('   Total fields: ' + data.sheets.reduce((sum, s) => sum + s.headers.length, 0));
