/* Tô màu cú pháp trong ô soạn code. */

const KW = new Set('break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new of return super switch this throw try typeof var void while with yield async await static interface type private public protected readonly implements enum abstract declare'.split(' '));
const LIT = new Set(['true','false','null','undefined','NaN','Infinity']);
function highlight(src){
  let out = '', i = 0; const n = src.length;
  const span = (cls, s) => '<span class="'+cls+'">'+esc(s)+'</span>';
  while (i < n){
    const c = src[i], d = src[i+1];
    if (c === '/' && d === '/'){ let j = src.indexOf('\n', i); if (j < 0) j = n; const cm = src.slice(i, j); out += span(/^\/\/\s*@file:/.test(cm) ? 'fh' : 'c', cm); i = j; continue; }
    if (c === '/' && d === '*'){ let j = src.indexOf('*/', i+2); j = j < 0 ? n : j + 2; out += span('c', src.slice(i, j)); i = j; continue; }
    if (c === '"' || c === "'" || c === '`'){
      let j = i + 1;
      while (j < n && src[j] !== c){ if (src[j] === '\\') j++; else if (c !== '`' && src[j] === '\n') break; j++; }
      if (j < n && src[j] === c) j++;
      out += span('s', src.slice(i, j)); i = j; continue;
    }
    if (/[0-9]/.test(c)){ let j = i; while (j < n && /[0-9a-zA-Z._]/.test(src[j])) j++; out += span('n', src.slice(i, j)); i = j; continue; }
    if (/[A-Za-z_$\u00C0-\uFFFF]/.test(c)){
      let j = i; while (j < n && /[\w$\u00C0-\uFFFF]/.test(src[j])) j++;
      const w = src.slice(i, j); let cls = null;
      if (KW.has(w)) cls = 'k'; else if (LIT.has(w)) cls = 'l';
      else { let k = j; while (src[k] === ' ') k++; if (src[k] === '(') cls = 'f'; }
      out += cls ? span(cls, w) : esc(w); i = j; continue;
    }
    out += esc(c); i++;
  }
  return out;
}
let errLine = 0, lastLines = -1;
function renderHL(){ hlEl.innerHTML = (activeIsYaml() ? highlightYaml : highlight)(ta.value) + '\n'; }
