/* Nạp thư viện YAML và tô màu cú pháp YAML. */

const YAML_URL = 'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js';
let yamlPromise = null;
function loadYaml(){
  if (window.jsyaml) return Promise.resolve(window.jsyaml);
  if (yamlPromise) return yamlPromise;
  yamlPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = YAML_URL; s.async = true;
    s.onload = () => window.jsyaml ? resolve(window.jsyaml) : reject(new Error('js-yaml không khởi tạo được'));
    s.onerror = () => { yamlPromise = null; reject(new Error('Không tải được thư viện đọc YAML')); };
    document.head.appendChild(s);
  });
  return yamlPromise;
}

/* ---------- Tô màu YAML ---------- */
function yamlVal(v){
  const t = v.trim();
  const wrapExpr = s => esc(s).replace(/\$\{\{[\s\S]*?\}\}/g, m => '<span class="f">' + m + '</span>');
  if (!t) return esc(v);
  if (/^(true|false|null|~)$/i.test(t)) return '<span class="l">' + esc(v) + '</span>';
  if (/^-?\d+(\.\d+)?$/.test(t)) return '<span class="n">' + esc(v) + '</span>';
  if (/^(['"]).*\1$/.test(t)) return '<span class="s">' + wrapExpr(v) + '</span>';
  if (/^[|>][-+]?$/.test(t)) return '<span class="k">' + esc(v) + '</span>';
  return wrapExpr(v);
}
function highlightYaml(src){
  return src.split('\n').map(line => {
    if (/^\s*\/\/\s*@file:/.test(line)) return '<span class="fh">' + esc(line) + '</span>';
    let inS = null, ci = -1;
    for (let i = 0; i < line.length; i++){
      const ch = line[i];
      if (inS){ if (ch === inS) inS = null; continue; }
      if (ch === '"' || ch === "'"){ inS = ch; continue; }
      if (ch === '#' && (i === 0 || /\s/.test(line[i - 1]))){ ci = i; break; }
    }
    const code = ci >= 0 ? line.slice(0, ci) : line, com = ci >= 0 ? line.slice(ci) : '';
    let h;
    const m = code.match(/^(\s*(?:-\s+)?)([^\s:#'"-][^:#]*?|"[^"]*"|'[^']*')(:)(\s+|$)(.*)$/);
    if (m) h = esc(m[1]) + '<span class="k">' + esc(m[2]) + '</span>' + esc(m[3]) + esc(m[4]) + yamlVal(m[5]);
    else { const d = code.match(/^(\s*-\s*)(.*)$/); h = d ? esc(d[1]) + yamlVal(d[2]) : yamlVal(code); }
    return h + (com ? '<span class="c">' + esc(com) + '</span>' : '');
  }).join('\n');
}
const isYamlPath = p => /\.(ya?ml)$/.test(p || '') || /(^|\/)\.env$/.test(p || '');
const activeIsYaml = () => !!(proj && isYamlPath(proj.active));
