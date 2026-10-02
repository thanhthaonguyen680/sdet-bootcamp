/* Nạp trình biên dịch TypeScript để chạy code bài tập. */

const TS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/typescript/5.9.2/typescript.min.js';

/* ---------- Tải TypeScript và chạy test ---------- */
let tsPromise = null;
function loadTS(){
  if (window.ts && window.ts.transpileModule) return Promise.resolve(window.ts);
  if (tsPromise) return tsPromise;
  tsPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = TS_URL; s.async = true;
    s.onload = () => window.ts ? resolve(window.ts) : reject(new Error('TypeScript không khởi tạo được'));
    s.onerror = () => { tsPromise = null; reject(new Error('Không tải được bộ dịch TypeScript')); };
    document.head.appendChild(s);
  });
  return tsPromise;
}
function tsPrepare(src){
  const lines = src.split('\n');
  const marks = [];
  lines.forEach((l, i) => { const m = l.match(/^\s*\/\/\s*@file:\s*(\S+)/); if (m) marks.push({ i, file: m[1] }); });
  const json = {};
  marks.forEach((m, k) => {
    if (!/\.json$/i.test(m.file)) return;
    const end = k + 1 < marks.length ? marks[k + 1].i : lines.length;
    const text = lines.slice(m.i + 1, end).join('\n');
    let val;
    try { val = JSON.parse(text); }
    catch (e){ throw pwErr('Tệp ' + m.file + ' chưa phải JSON hợp lệ: ' + e.message + '\n(Nhớ: key và chuỗi dùng nháy kép, không có dấu phẩy ở phần tử cuối, không có comment.)'); }
    json[m.file.split('/').pop()] = JSON.stringify(val);
    for (let i = m.i + 1; i < end; i++) lines[i] = '';
  });
  return lines.map(l => {
    const jm = l.match(/^\s*import\s+(\w+)\s+from\s+['"]([^'"]+\.json)['"]\s*;?\s*$/);
    if (jm){
      const f = json[jm[2].split('/').pop()];
      if (f === undefined) throw pwErr('Không tìm thấy tệp ' + jm[2] + '. Hãy thêm phần // @file: ' + jm[2].replace(/^(\.\.?\/)+/, '') + ' chứa nội dung JSON.');
      return 'const ' + jm[1] + ' = ' + f + ';';
    }
    const pm = l.match(/^\s*import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]@playwright\/test['"]\s*;?\s*$/);
    if (pm) return pm[1].split(',').map(s => s.trim().match(/^(test|expect)\s+as\s+(\w+)$/)).filter(Boolean).map(m => 'const ' + m[2] + ' = __pw' + (m[1] === 'test' ? 'Test' : 'Expect') + ';').join(' ');
    if (/^\s*import\s[\s\S]*from\s+['"][^'"]+['"]\s*;?\s*$/.test(l) || /^\s*import\s+['"][^'"]+['"]\s*;?\s*$/.test(l)) return '';
    if (/^\s*export\s*\{[^}]*\}\s*(from\s*['"][^'"]+['"])?\s*;?\s*$/.test(l)) return '';
    if (/^\s*export\s+default\s+/.test(l) && !/\b(class|function)\b/.test(l)) return '';
    return l.replace(/^(\s*)export\s+(default\s+)?(?=(const|let|var|function|class|async|interface|type|enum|abstract)\b)/, '$1');
  }).join('\n');
}
