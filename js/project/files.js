/* Chế độ project nhiều tệp: tách tệp theo // @file:, giải import/export, cây thư mục. */

function splitMarked(text){
  const files = {}; let cur = null; const buf = [];
  const flush = () => { if (cur !== null){ files[cur] = buf.join('\n').replace(/^\n+/, '').replace(/\s+$/, '') + '\n'; } buf.length = 0; };
  for (const l of text.split('\n')){
    const m = l.match(/^\s*\/\/\s*@file:\s*(\S+)/);
    if (m){ flush(); cur = m[1]; continue; }
    buf.push(l);
  }
  flush();
  return files;
}
function joinMarked(files){ return Object.entries(files).map(([p, c]) => '// @file: ' + p + '\n' + c).join('\n'); }
function parseEnv(text){
  const env = {};
  for (const raw of String(text || '').split('\n')){
    const l = raw.trim(); if (!l || l.startsWith('#')) continue;
    const i = l.indexOf('='); if (i <= 0) continue;
    env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return env;
}
function projResolve(files, from, spec){
  const parts = from.split('/').slice(0, -1);
  for (const seg of spec.split('/')){ if (seg === '.' || seg === '') continue; if (seg === '..') parts.pop(); else parts.push(seg); }
  const base = parts.join('/');
  return [base, base + '.ts', base + '/index.ts'].find(c => files[c] !== undefined) || null;
}
async function runProject(files, ts, ctx){
  const env = parseEnv(files['.env']);
  const processObj = { env, argv: [], platform: 'browser', cwd: () => '/' };
  const tsPaths = Object.keys(files).filter(p => /\.ts$/.test(p) && !/playwright\.config\.ts$/.test(p));
  for (const p of Object.keys(files).filter(p => p.endsWith('.json'))){
    try { JSON.parse(files[p]); } catch (e){ return { error: pwErr('Tệp ' + p + ' chưa phải JSON hợp lệ: ' + e.message + '\n(Nhớ: key và chuỗi dùng nháy kép, không có dấu phẩy ở phần tử cuối, không có comment.)'), file: p }; }
  }
  let body = 'return {';
  for (const p of tsPaths){
    const out = ts.transpileModule(files[p], { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true, useDefineForClassFields: false }, reportDiagnostics: true, fileName: p });
    if (out.diagnostics && out.diagnostics.length){
      const d = out.diagnostics[0];
      const pos = d.file && d.start != null ? d.file.getLineAndCharacterOfPosition(d.start) : null;
      return { error: pwErr('Lỗi cú pháp TypeScript trong ' + p + (pos ? ', dòng ' + (pos.line + 1) : '') + ':\n' + ts.flattenDiagnosticMessageText(d.messageText, '\n')), file: p, line: pos ? pos.line + 1 : 0 };
    }
    body += JSON.stringify(p) + ': function(require, exports, module, process){\n' + instrument(out.outputText) + '\n},\n';
  }
  body += '};';
  let factories;
  try { factories = await compile(body, ['console', '__guard'])(ctx.con, ctx.guard); }
  catch (e){ return { error: e }; }
  const pwModule = { test: ctx.pwTest, expect: ctx.pwExpect, defineConfig: c => c, devices: new Proxy({}, { get: () => ({}) }) };
  const cache = {};
  const load = (p) => {
    if (cache[p]) return cache[p].proxy;
    const module = { exports: {} };
    const entry = cache[p] = { module, proxy: null };
    entry.proxy = new Proxy({}, {
      get: (_, k) => {
        const ex = module.exports;
        if (typeof k === 'string' && !(k in ex) && !['__esModule', 'default', 'then', 'toJSON', 'constructor'].includes(k))
          throw pwErr('Tệp ' + p + ' không export "' + k + '".\nKiểm tra tệp đó đã có "export" trước khai báo ' + k + ' chưa, và tên có viết đúng hoa thường không.');
        return ex[k];
      },
      has: (_, k) => k in module.exports,
    });
    const req = (spec) => {
      if (spec === '@playwright/test' || spec === 'playwright/test') return pwModule;
      if (spec === 'dotenv' || spec === 'dotenv/config') return { config: () => ({ parsed: env }) };
      if (spec.startsWith('.')){
        const r = projResolve(files, p, spec);
        if (!r) throw pwErr('Tệp ' + p + ' import "' + spec + '" nhưng không tìm thấy tệp này.\nKiểm tra lại đường dẫn: ./ là cùng thư mục, ../ là lùi ra thư mục cha.');
        if (r.endsWith('.json')) return JSON.parse(files[r]);
        if (r === '.env') return {};
        return load(r);
      }
      throw pwErr('Sân tập không có thư viện "' + spec + '" (được import trong ' + p + ').');
    };
    factories[p](req, module.exports, module, processObj);
    return entry.proxy;
  };
  const order = [...tsPaths.filter(p => !/\.spec\.ts$/.test(p)), ...tsPaths.filter(p => /\.spec\.ts$/.test(p))];
  for (const p of order){
    try { load(p); }
    catch (e){ return { error: e, file: p }; }
  }
  const merged = {};
  for (const p of order){ const ex = cache[p] && cache[p].module.exports; if (ex) for (const k of Object.keys(ex)) if (k !== '__esModule' && ex[k] !== undefined) merged[k] = ex[k]; }
  return { exports: merged };
}

let proj = null;
function projInit(ex){
  let files = null;
  try { files = JSON.parse(codeOf(ex)); } catch (e){}
  if (!files || typeof files !== 'object') files = JSON.parse(ex.starter);
  for (const [p, c] of Object.entries(ex.files)) if (files[p] === undefined) files[p] = c;
  state.activeFile = state.activeFile || {};
  const active = files[state.activeFile[ex.id]] !== undefined ? state.activeFile[ex.id] : (ex.open || Object.keys(ex.files)[0]);
  proj = { files, active, dirty: null };
  return files[active];
}
function projSync(){ if (proj) proj.files[proj.active] = ta.value; }
function openFile(path){
  if (!proj || proj.files[path] === undefined) return;
  projSync();
  proj.active = path;
  state.activeFile = state.activeFile || {}; state.activeFile[current.id] = path;
  ta.value = proj.files[path];
  ta.scrollTop = 0; ta.scrollLeft = 0;
  errLine = 0; lastLines = -1;
  renderHL(); renderGutter(); syncScroll(); renderProjTree(); renderFileBar();
  scheduleSave();
}
function renderProjTree(){
  const el = document.getElementById('projTree'), ed = document.querySelector('.editor');
  if (!proj){ el.hidden = true; el.innerHTML = ''; ed.classList.remove('has-tree'); return; }
  el.hidden = false; ed.classList.add('has-tree');
  const root = { dirs: {}, files: [] };
  for (const p of Object.keys(proj.files)){
    const parts = p.split('/'); let node = root;
    for (const d of parts.slice(0, -1)) node = node.dirs[d] = node.dirs[d] || { dirs: {}, files: [] };
    node.files.push(p);
  }
  const starter = current.files;
  const draw = (node) => Object.keys(node.dirs).sort().map(d => '<li><span class="pt-dir">' + esc(d) + '/</span><ul>' + draw(node.dirs[d]) + '</ul></li>').join('') +
    node.files.sort().map(p => '<li><button type="button" data-path="' + esc(p) + '"' + (p === proj.active ? ' class="on" aria-current="true"' : '') + ' title="' + esc(p) + '">' + esc(p.split('/').pop()) +
      (proj.files[p] !== starter[p] ? '<span class="pt-dot" title="Đã sửa"></span>' : '') + '</button></li>').join('');
  el.innerHTML = '<div class="pt-head">' + esc(current.projectName || 'project') + '/</div><ul>' + draw(root) + '</ul>';
  proj.dirty = proj.files[proj.active] !== starter[proj.active];
}
document.getElementById('projTree').addEventListener('click', e => { const b = e.target.closest('[data-path]'); if (b) openFile(b.dataset.path); });
