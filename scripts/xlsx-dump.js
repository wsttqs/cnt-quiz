// 读取 xlsx 并 dump 每个 sheet
const fs = require('fs');
const zlib = require('zlib');

function inflateRaw(buf) {
  return zlib.inflateRawSync(buf);
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

function parseZip(buf) {
  const entries = [];
  let p = 0;
  while (p < buf.length) {
    const sig = buf.readUInt32LE(p);
    if (sig !== 0x04034b50) break;
    const method = buf.readUInt16LE(p + 8);
    const compSize = buf.readUInt32LE(p + 18);
    const uncompSize = buf.readUInt32LE(p + 22);
    const nameLen = buf.readUInt16LE(p + 26);
    const extraLen = buf.readUInt16LE(p + 28);
    const name = buf.slice(p + 30, p + 30 + nameLen).toString('utf8');
    const data = buf.slice(p + 30 + nameLen + extraLen, p + 30 + nameLen + extraLen + compSize);
    const content = method === 8 ? inflateRaw(data) : data;
    entries.push({ name, content });
    p += 30 + nameLen + extraLen + compSize;
  }
  return entries;
}

function escapeXml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}

const xlsxPath = process.argv[2];
const buf = fs.readFileSync(xlsxPath);
const entries = parseZip(buf);

// shared strings
const ssEntry = entries.find(e => e.name === 'xl/sharedStrings.xml');
const ssMatches = [...ssEntry.content.toString('utf8').matchAll(/<si>(?:<t[^>]*>([^<]*)<\/t>|<r>.*?<\/r>)*<\/si>/g)];
// 更简单：直接解析所有 <si>...</si>
const ssXml = ssEntry.content.toString('utf8');
const siMatches = [...ssXml.matchAll(/<si>([\s\S]*?)<\/si>/g)];
const ss = siMatches.map(m => {
  // 提取所有 <t> 文本拼接
  const inner = m[1];
  const tMatches = [...inner.matchAll(/<t[^>]*>([^<]*)<\/t>/g)];
  return tMatches.map(t => t[1]).join('');
});

// workbook
const wbEntry = entries.find(e => e.name === 'xl/workbook.xml');
const wbXml = wbEntry.content.toString('utf8');
const sheetMatches = [...wbXml.matchAll(/<sheet name="([^"]+)"[^/]*r:id="(rId\d+)"/g)];
const sheetOrder = sheetMatches.map(m => ({ name: m[1], rId: m[2] }));

// rels
const relsEntry = entries.find(e => e.name === 'xl/_rels/workbook.xml.rels');
const relsXml = relsEntry.content.toString('utf8');
const relMatches = [...relsXml.matchAll(/<Relationship Id="(rId\d+)"[^/]*Target="([^"]+)"/g)];
const relMap = {};
relMatches.forEach(m => { relMap[m[1]] = m[2]; });

// dump each sheet
for (const s of sheetOrder) {
  const target = relMap[s.rId];
  const sheetPath = 'xl/' + target;
  const sheetEntry = entries.find(e => e.name === sheetPath);
  if (!sheetEntry) { console.log(`Sheet ${s.name}: NOT FOUND`); continue; }
  const xml = sheetEntry.content.toString('utf8');
  console.log(`\n===== Sheet: ${s.name} (${sheetPath}) =====`);

  // 解析 row
  const rowMatches = [...xml.matchAll(/<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)];
  for (const rm of rowMatches) {
    const rn = rm[1];
    const rowXml = rm[2];
    const cells = [];
    const cellRegex = /<c[^>]*r="([A-Z]+\d+)"(?:[^>]*t="([^"]*)")?[^>]*>(?:<v>([^<]*)<\/v>|<is><t[^>]*>([^<]*)<\/t><\/is>)?<\/c>/g;
    const cellMatches = [...rowXml.matchAll(cellRegex)];
    let lastCol = 0;
    for (const cm of cellMatches) {
      const ref = cm[1];
      const type = cm[2];
      const v = cm[3];
      const is = cm[4];
      // 提取列字母
      const colLetter = ref.replace(/\d+$/, '');
      const colIdx = colLetter.split('').reduce((acc, ch) => acc * 26 + (ch.charCodeAt(0) - 64), 0);

      let val = '';
      if (is) val = is;
      else if (type === 's' && v) val = ss[parseInt(v)];
      else if (v) val = v;

      // 填充中间空 cell
      while (lastCol < colIdx - 1) {
        cells.push('');
        lastCol++;
      }
      cells.push(val);
      lastCol = colIdx;
    }
    console.log(`Row ${rn.padStart(3)}: ` + cells.map(c => (c || '').toString().replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'")).join(' | '));
  }

  // dataValidations
  const dvMatch = xml.match(/<dataValidations[\s\S]*?<\/dataValidations>/);
  if (dvMatch) {
    console.log("DataValidations:");
    const dvs = [...dvMatch[0].matchAll(/<dataValidation[^>]*\/>/g)];
    dvs.forEach(d => console.log("  " + d[0]));
  }
}