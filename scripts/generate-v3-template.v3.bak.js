// v3 Excel template generator (no external deps)
// 4 sheets: 层级结构 / 标签分数 / 结果页 / 跳转逻辑
// 与业务沟通后定稿：condition 在 Routing，结果页只管 ID+content；加 content 列存 article intro；加 (DEFAULT) 兜底

const fs = require('fs');
const zlib = require('zlib');

// ---- 1. Data (v3) ----
const data = {
  sheets: [
    {
      name: "层级结构",
      headers: ["Layer", "group", "question_id", "sub_title", "option", "content"],
      widths: [8, 8, 12, 36, 50, 42],
      dataValidations: [],
      // 第 2 行 = article intro（content 列）
      // group 元数据行：question_id 空，sub_title 写 group 展示名
      // question 数据行：question_id 有值，sub_title 写题干，option 写选项（&split&）
      rows: [
        ["","","","","","宠物清洁困扰的朋友，欢迎来到我们的方案推荐 quiz。花 1 分钟回答几道题，我们会根据你的具体情况推荐最合适的清洁方案。"],
        ["L1","G0","","基础信息","",""],
        ["L1","G0","1","你家最主要的问题是？","宠物毛发&split&灰尘&split&顽固污渍&split&其他",""],
        ["L1","G0","2","你的房屋面积是？","小于50㎡&split&50-100㎡&split&大于100㎡",""],
        ["L1","G0","3","你家有宠物吗？","有&split&没有",""],
        ["L2","G1","","严重宠物","",""],
        ["L2","G1","4","严重程度如何？","非常严重&split&比较严重",""],
        ["L2","G1","5","想要专业服务吗？","专业服务&split&自己动手",""],
        ["L2","G2","","灰尘场景","",""],
        ["L2","G2","6","灰尘主要在哪？","地板&split&家具&split&窗帘",""],
        ["L2","G2","7","想要专业服务吗？","专业服务&split&自己动手",""],
        ["L2","G3","","通用兜底","",""],
        ["L2","G3","8","你最想先解决哪类问题？","节省时间&split&节省体力&split&产品升级&split&整体收纳",""]
      ]
    },
    {
      name: "标签分数",
      headers: ["question_id", "option", "tag", "score"],
      widths: [12, 12, 16, 10],
      dataValidations: [
        {col:"B", title:"option", prompt:"A=第 1 个选项, B=第 2 个选项...", formula1:"A,B,C,D,E,F,G,H,I,J"},
        {col:"D", title:"score", prompt:"正整数，分值越高严重程度越高", formula1:"1,2,3,4,5,6,7,8,9,10"}
      ],
      rows: [
        [1,"A","pet_hair",7],
        [1,"B","dust",5],
        [1,"C","grease",5],
        [1,"D","other",1],
        [2,"A","small",3],
        [2,"B","medium",5],
        [2,"C","large",7],
        [3,"A","has_pet",5],
        [3,"B","no_pet",0],
        [4,"A","heavy",7],
        [4,"B","light",3],
        [5,"A","wants_pro",7],
        [5,"B","wants_diy",3],
        [6,"A","floor",5],
        [6,"B","furniture",5],
        [6,"C","curtain",5],
        [7,"A","wants_pro",7],
        [7,"B","wants_diy",3],
        [8,"A","time",5],
        [8,"B","effort",5],
        [8,"C","upgrade",5],
        [8,"D","organize",5]
      ]
    },
    {
      name: "结果页",
      headers: ["result", "content", "is_default"],
      widths: [10, 50, 12],
      dataValidations: [
        {col:"C", title:"is_default", prompt:"全文必须且仅能有 1 行 true 作为兜底", formula1:"true,false"}
      ],
      rows: [
        ["R1","严重宠物毛发+专业服务 → 推荐专业深度清洁方案。","false"],
        ["R2","严重宠物毛发+DIY → 推荐专业工具与教程。","false"],
        ["R3","灰尘场景+专业服务 → 推荐除尘专项服务。","false"],
        ["R4","灰尘场景+DIY → 推荐除尘工具与教程。","false"],
        ["R5","通用清洁方案：根据你的情况推荐适合的入门产品。","true"]
      ]
    },
    {
      name: "跳转逻辑",
      headers: ["type", "from_layer_id", "condition_expr", "target"],
      widths: [10, 14, 36, 14],
      dataValidations: [
        {col:"A", title:"type", prompt:"group=跳到下一层 group；result=直接出结果页", formula1:"group,result"},
        {col:"C", title:"condition_expr", prompt:"tag:X / tag:X&Y / score:X>=N / layer:L1 / (DEFAULT)", formula1:"tag:pet_hair,tag:dust,tag:wants_pro,(DEFAULT)"}
      ],
      rows: [
        // L1：根据宠物毛发/灰尘 tag 跳到对应题组；都不匹配 → G3 兜底
        ["group","L1","tag:pet_hair","G1"],
        ["group","L1","tag:dust","G2"],
        ["group","L1","(DEFAULT)","G3"],
        // L2：根据 wants_pro/wants_diy tag 跳到对应结果；兜底 → R5
        ["result","L2","tag:wants_pro","R1"],
        ["result","L2","tag:wants_diy","R2"],
        ["result","L2","(DEFAULT)","R5"]
      ]
    }
  ]
};

// ---- 2. XML helpers ----
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
    xml += `<col min="${c}" max="${c}" width="${widths[c-1]}" customWidth="1"/>`;
  }
  xml += '</cols>';
  xml += '<sheetData>';
  // header row
  xml += '<row r="1">';
  for (let c = 1; c <= headers.length; c++) {
    const ref = `${colLetter(c)}1`;
    const idx = addString(headers[c-1]);
    xml += `<c r="${ref}" t="s"><v>${idx}</v></c>`;
  }
  xml += '</row>';
  // data rows
  rows.forEach((row, ri) => {
    const rn = ri + 2;
    xml += `<row r="${rn}">`;
    for (let c = 1; c <= headers.length; c++) {
      const ref = `${colLetter(c)}${rn}`;
      let v = row[c-1];
      if (v === null || v === undefined) v = "";
      const colName = headers[c-1];
      const isStr = !(numCols.has(colName) && /^-?\d+$/.test(String(v)));
      if (isStr) {
        const idx = addString(v);
        xml += `<c r="${ref}" t="s"><v>${idx}</v></c>`;
      } else {
        xml += `<c r="${ref}"><v>${v}</v></c>`;
      }
    }
    xml += '</row>';
  });
  xml += '</sheetData>';
  if (dataValidations.length > 0) {
    xml += `<dataValidations count="${dataValidations.length}">`;
    dataValidations.forEach(dv => {
      xml += `<dataValidation type="list" allowBlank="1" showInputMessage="1" promptTitle="${escapeXml(dv.title)}" prompt="${escapeXml(dv.prompt)}" sqref="${dv.col}2:${dv.col}1000"><formula1>"${escapeXml(dv.formula1)}"</formula1></dataValidation>`;
    });
    xml += '</dataValidations>';
  }
  xml += '</worksheet>';
  return xml;
}

function buildSharedStringsXml() {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">`;
  sharedStrings.forEach(s => {
    xml += `<si><t xml:space="preserve">${escapeXml(s)}</t></si>`;
  });
  xml += '</sst>';
  return xml;
}

function buildWorkbookXml() {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">';
  xml += '<sheets>';
  data.sheets.forEach((s, i) => {
    xml += `<sheet name="${escapeXml(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`;
  });
  xml += '</sheets></workbook>';
  return xml;
}

function buildWorkbookRelsXml() {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
  data.sheets.forEach((s, i) => {
    xml += `<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`;
  });
  const ssId = data.sheets.length + 1;
  xml += `<Relationship Id="rId${ssId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>`;
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
    xml += `<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`;
  });
  xml += '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>';
  xml += '</Types>';
  return xml;
}

function buildRelsXml() {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
}

// ---- 3. Zip writer ----
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

// ---- 4. Generate ----
const sheetXmls = data.sheets.map(buildSheetXml);

const files = [
  { path: "[Content_Types].xml", content: Buffer.from(buildContentTypesXml(), "utf8") },
  { path: "_rels/.rels", content: Buffer.from(buildRelsXml(), "utf8") },
  { path: "xl/workbook.xml", content: Buffer.from(buildWorkbookXml(), "utf8") },
  { path: "xl/_rels/workbook.xml.rels", content: Buffer.from(buildWorkbookRelsXml(), "utf8") },
  { path: "xl/sharedStrings.xml", content: Buffer.from(buildSharedStringsXml(), "utf8") }
];
sheetXmls.forEach((xml, i) => {
  files.push({ path: `xl/worksheets/sheet${i+1}.xml`, content: Buffer.from(xml, "utf8") });
});

const zipBuf = buildZip(files);
const outPath = "E:\\Codex\\CNT\\docs\\requirements\\quiz-dynamic-template-v3.xlsx";
fs.writeFileSync(outPath, zipBuf);
console.log(`OK xlsx generated: ${outPath}`);
console.log(`   Size: ${(zipBuf.length / 1024).toFixed(1)} KB`);
console.log(`   Shared strings: ${sharedStrings.length}`);
console.log(`   Sheets: ${data.sheets.map(s => s.name).join(" / ")}`);
console.log(`   Total fields: ${data.sheets.reduce((sum, s) => sum + s.headers.length, 0)}`);