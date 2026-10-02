/* Ô soạn code: số dòng, tự lưu, thụt lề, đóng ngoặc, phím tắt. */

function renderGutter(){
  const n = (ta.value.match(/\n/g) || []).length + 1;
  if (n === lastLines && !gutterDirty) return;
  lastLines = n; gutterDirty = false;
  let h = ''; for (let i = 1; i <= n; i++) h += (i === errLine ? '<div class="err">' : '<div>') + i + '</div>';
  gutEl.innerHTML = h;
}
let gutterDirty = false;
function syncScroll(){
  hlEl.style.transform = 'translate(' + (-ta.scrollLeft) + 'px,' + (-ta.scrollTop) + 'px)';
  gutEl.style.transform = 'translateY(' + (-ta.scrollTop) + 'px)';
}
let saveTimer = null;
// Chỉ lưu sau khi ô soạn thảo đã nạp code của bài. Trước đó ta.value còn rỗng và sẽ ghi đè code gốc của bài 1.1.
let editorReady = false;
function scheduleSave(){ clearTimeout(saveTimer); saveTimer = setTimeout(flushSave, 350); }
function flushSave(){
  if (saveTimer){ clearTimeout(saveTimer); saveTimer = null; }
  if (!current || !editorReady) return;
  const val = proj ? (projSync(), JSON.stringify(proj.files)) : ta.value;
  if (val === current.starter) delete state.codes[current.id]; else state.codes[current.id] = val;
  saveState(); refreshStatus();
}
function onEdit(){
  renderHL();
  if (proj){ projSync(); if ((proj.files[proj.active] !== current.files[proj.active]) !== proj.dirty) renderProjTree(); }
  renderFileBar();
  if (errLine){ errLine = 0; gutterDirty = true; }
  renderGutter(); syncScroll(); scheduleSave();
}
ta.addEventListener('input', onEdit);
ta.addEventListener('scroll', syncScroll);

function replaceRange(start, end, text, selStart, selEnd){
  ta.focus(); ta.setSelectionRange(start, end);
  let ok = false;
  try { ok = text === '' ? (start === end || document.execCommand('delete')) : document.execCommand('insertText', false, text); } catch(e){ ok = false; }
  if (!ok) ta.setRangeText(text, start, end, 'end');
  if (selStart != null) ta.setSelectionRange(selStart, selEnd == null ? selStart : selEnd);
  onEdit();
}
function lineBounds(){
  const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
  const ls = v.lastIndexOf('\n', s - 1) + 1;
  let le = v.indexOf('\n', (e > s && v[e-1] === '\n') ? e - 1 : e); if (le < 0) le = v.length;
  return [ls, le];
}
function indentLines(dir){
  const s = ta.selectionStart, e = ta.selectionEnd;
  const [ls, le] = lineBounds();
  const lines = ta.value.slice(ls, le).split('\n');
  let first = 0, total = 0;
  const nl = lines.map((l, i) => {
    if (dir > 0){ if (i === 0) first = 2; total += 2; return '  ' + l; }
    const m = l.match(/^( {1,2}|\t)/); const r = m ? m[0].length : 0;
    if (i === 0) first = -r; total -= r; return l.slice(r);
  });
  const nb = nl.join('\n');
  const ns = Math.max(ls, s + first);
  replaceRange(ls, le, nb, ns, s === e ? ns : Math.max(ns, e + total));
}
function toggleComment(){
  const [ls, le] = lineBounds();
  const lines = ta.value.slice(ls, le).split('\n');
  const y = activeIsYaml();
  const all = lines.filter(l => l.trim()).every(l => y ? /^\s*#/.test(l) : /^\s*\/\//.test(l));
  const nl = lines.map(l => !l.trim() ? l : all ? (y ? l.replace(/^(\s*)# ?/, '$1') : l.replace(/^(\s*)\/\/ ?/, '$1')) : l.replace(/^(\s*)/, y ? '$1# ' : '$1// '));
  const nb = nl.join('\n');
  replaceRange(ls, le, nb, ls, ls + nb.length);
}
const PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
const CLOSERS = new Set([')', ']', '}']);
let tabEscape = false;
ta.addEventListener('keydown', e => {
  if (e.isComposing || e.keyCode === 229) return;
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key === 'Enter'){ e.preventDefault(); run(e.shiftKey && !!current.tests); return; }
  if (mod && e.key === '/'){ e.preventDefault(); toggleComment(); return; }
  if (mod && (e.key === 's' || e.key === 'S')){ e.preventDefault(); flushSave(); toast('Đã lưu'); return; }
  if (e.key === 'Escape'){ tabEscape = true; return; }
  if (e.key === 'Tab'){
    if (tabEscape){ tabEscape = false; return; }
    e.preventDefault();
    const s = ta.selectionStart, en = ta.selectionEnd;
    if (e.shiftKey || ta.value.slice(s, en).includes('\n')) indentLines(e.shiftKey ? -1 : 1);
    else replaceRange(s, en, '  ', s + 2);
    return;
  }
  tabEscape = false;
  if (mod || e.altKey) return;
  const v = ta.value, s = ta.selectionStart, en = ta.selectionEnd;
  if (e.key === 'Enter'){
    e.preventDefault();
    const ls = v.lastIndexOf('\n', s - 1) + 1;
    const line = v.slice(ls, s);
    const ind = line.match(/^[ \t]*/)[0];
    const opens = /[{[(]\s*$/.test(line) || (activeIsYaml() && /:\s*$/.test(line.replace(/\s+#.*$/, '')) && !/^\s*#/.test(line));
    const before = line.trimEnd().slice(-1), after = v[en];
    if (opens && after && PAIRS[before] === after){
      const ins = '\n' + ind + '  ' + '\n' + ind;
      replaceRange(s, en, ins, s + 1 + ind.length + 2);
    } else {
      const ins = '\n' + ind + (opens ? '  ' : '');
      replaceRange(s, en, ins, s + ins.length);
    }
    return;
  }
  if (e.key === 'Backspace' && s === en && s > 0){
    const b = v[s-1], a = v[s];
    if (PAIRS[b] && PAIRS[b] === a){ e.preventDefault(); replaceRange(s - 1, s + 1, '', s - 1); return; }
    return;
  }
  if (CLOSERS.has(e.key) && s === en && v[s] === e.key){ e.preventDefault(); ta.setSelectionRange(s + 1, s + 1); return; }
  if (PAIRS[e.key]){
    const quote = e.key === '"' || e.key === "'" || e.key === '`';
    if (quote && s === en && v[s] === e.key){ e.preventDefault(); ta.setSelectionRange(s + 1, s + 1); return; }
    if (s !== en){ e.preventDefault(); replaceRange(s, en, e.key + v.slice(s, en) + PAIRS[e.key], s + 1, en + 1); return; }
    if (quote && s > 0 && /[\w$\u00C0-\uFFFF]/.test(v[s-1])) return;
    const next = v[s];
    if (next === undefined || /[\s)\]};,]/.test(next)){ e.preventDefault(); replaceRange(s, en, e.key + PAIRS[e.key], s + 1); }
  }
});
