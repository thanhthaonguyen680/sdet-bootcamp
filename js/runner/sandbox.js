/* Biên dịch và chạy code người học: chống vòng lặp vô hạn, báo dòng lỗi. */

function instrument(src){
  let out = '', i = 0; const n = src.length;
  const skipStr = (k, q) => { k++; while (k < n && src[k] !== q){ if (src[k] === '\\') k++; k++; } return k; };
  while (i < n){
    const c = src[i];
    if (c === '/' && src[i+1] === '/'){ let j = src.indexOf('\n', i); if (j < 0) j = n; out += src.slice(i, j); i = j; continue; }
    if (c === '/' && src[i+1] === '*'){ let j = src.indexOf('*/', i + 2); j = j < 0 ? n : j + 2; out += src.slice(i, j); i = j; continue; }
    if (c === '"' || c === "'" || c === '`'){ const j = Math.min(skipStr(i, c) + 1, n); out += src.slice(i, j); i = j; continue; }
    if (/[A-Za-z_$]/.test(c)){
      let j = i; while (j < n && /[\w$]/.test(src[j])) j++;
      const w = src.slice(i, j);
      out += w; i = j;
      if (w === 'for' || w === 'while'){
        let k = j; while (k < n && /\s/.test(src[k])) k++;
        if (src[k] === '('){
          let depth = 0, m = k;
          for (; m < n; m++){
            const ch = src[m];
            if (ch === '"' || ch === "'" || ch === '`'){ m = skipStr(m, ch); continue; }
            if (ch === '(') depth++;
            else if (ch === ')'){ depth--; if (depth === 0) break; }
          }
          let p = m + 1; while (p < n && /\s/.test(src[p])) p++;
          if (src[p] === '{'){ out += src.slice(j, p + 1) + '__guard();'; i = p + 1; }
        }
      } else if (w === 'do'){
        let k = j; while (k < n && /\s/.test(src[k])) k++;
        if (src[k] === '{'){ out += src.slice(j, k + 1) + '__guard();'; i = k + 1; }
      }
      continue;
    }
    out += c; i++;
  }
  return out;
}

const PARAMS = ['console', 'test', 'expect', 'captureLogs', '__guard', '__source', '__out'];
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
let compileMode = 'function';
function compile(body, params = PARAMS){
  if (compileMode === 'function'){
    try { return new AsyncFunction(...params, body); }
    catch (e){ if (e instanceof SyntaxError) throw e; compileMode = 'script'; }
  }
  window.__userFn = null; let err = null;
  const onErr = ev => { err = ev.error || new SyntaxError(ev.message); ev.preventDefault(); };
  window.addEventListener('error', onErr);
  const s = document.createElement('script');
  s.textContent = 'window.__userFn = async function(' + params.join(',') + '){\n' + body + '\n};';
  document.head.appendChild(s); s.remove();
  window.removeEventListener('error', onErr);
  if (err) throw err;
  if (!window.__userFn) throw new Error('Trình duyệt không cho phép chạy code trong trang này.');
  return window.__userFn;
}
function errorLineOf(e, max){
  if (compileMode !== 'function') return 0;
  const st = String((e && e.stack) || '');
  const m = st.match(/<anonymous>:(\d+):\d+/) || st.match(/> (?:Function|eval):(\d+):\d+/);
  if (!m) return 0;
  const ln = +m[1] - 2;
  return (ln >= 1 && ln <= max) ? ln : 0;
}
