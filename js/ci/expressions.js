/* Mô phỏng GitHub Actions: biểu thức ${{ ... }} và điều kiện if. */

/* ---------- Biểu thức ${{ }} ---------- */
function ciTokens(src){
  const out = []; let i = 0;
  while (i < src.length){
    const c = src[i];
    if (/\s/.test(c)){ i++; continue; }
    if (c === "'"){ let j = i + 1, s = ''; while (j < src.length){ if (src[j] === "'" && src[j + 1] === "'"){ s += "'"; j += 2; continue; } if (src[j] === "'") break; s += src[j++]; } out.push({ t: 'str', v: s }); i = j + 1; continue; }
    if (/[0-9]/.test(c)){ let j = i; while (j < src.length && /[0-9.]/.test(src[j])) j++; out.push({ t: 'num', v: Number(src.slice(i, j)) }); i = j; continue; }
    if (/[A-Za-z_]/.test(c)){ let j = i; while (j < src.length && /[\w\-]/.test(src[j])) j++; out.push({ t: 'id', v: src.slice(i, j) }); i = j; continue; }
    const two = src.slice(i, i + 2);
    if (['==', '!=', '&&', '||', '<=', '>='].includes(two)){ out.push({ t: 'op', v: two }); i += 2; continue; }
    if ('()!<>.,[]*'.includes(c)){ out.push({ t: 'op', v: c }); i++; continue; }
    throw ciErr('Ký tự không hợp lệ trong biểu thức: ' + c);
  }
  return out;
}
function ciEval(expr, ctx){
  const tk = ciTokens(expr); let p = 0;
  const peek = () => tk[p], eat = v => { if (tk[p] && tk[p].v === v){ p++; return true; } return false; };
  const truthy = v => !(v === false || v === null || v === undefined || v === 0 || v === '' || Number.isNaN(v));
  const eq = (a, b) => (typeof a === 'string' && typeof b === 'string') ? a.toLowerCase() === b.toLowerCase() : a == b;
  const FN = {
    always: () => { ctx.__status = true; return true; }, success: () => { ctx.__status = true; return ctx.__jobOk; }, failure: () => { ctx.__status = true; return !ctx.__jobOk; }, cancelled: () => { ctx.__status = true; return !!ctx.__cancelled; },
    contains: (a, b) => Array.isArray(a) ? a.some(x => eq(x, b)) : String(a ?? '').toLowerCase().includes(String(b ?? '').toLowerCase()),
    startsWith: (a, b) => String(a ?? '').toLowerCase().startsWith(String(b ?? '').toLowerCase()),
    endsWith: (a, b) => String(a ?? '').toLowerCase().endsWith(String(b ?? '').toLowerCase()),
    format: (f, ...a) => String(f).replace(/\{(\d+)\}/g, (m, i) => a[+i] ?? ''),
    join: (a, s) => Array.isArray(a) ? a.join(s ?? ',') : String(a ?? ''),
    toJSON: v => JSON.stringify(v, null, 2), fromJSON: v => JSON.parse(v),
  };
  const primary = () => {
    const t = tk[p++];
    if (!t) throw ciErr('Biểu thức chưa hoàn chỉnh: ' + expr);
    if (t.t === 'str' || t.t === 'num') return t.v;
    if (t.v === '('){ const v = or(); if (!eat(')')) throw ciErr('Thiếu dấu ) trong: ' + expr); return v; }
    if (t.v === '!') return !truthy(unary());
    if (t.t === 'id'){
      if (t.v === 'true') return true; if (t.v === 'false') return false; if (t.v === 'null') return null;
      if (peek() && peek().v === '('){
        p++; const args = [];
        if (!eat(')')){ do { args.push(or()); } while (eat(',')); if (!eat(')')) throw ciErr('Thiếu dấu ) trong: ' + expr); }
        const f = FN[t.v]; if (!f) throw ciErr('Hàm không tồn tại: ' + t.v + '()'); return f(...args);
      }
      let v = ctx[t.v];
      if (v === undefined && !(t.v in ctx)) throw ciErr('Không có ngữ cảnh "' + t.v + '" trong biểu thức ${{ ' + expr + ' }}');
      for (;;){
        if (eat('.')){ const k = tk[p++]; v = (v == null) ? null : (k.v === '*' ? v : v[k.v]); if (v === undefined) v = null; }
        else if (eat('[')){ const k = or(); eat(']'); v = v == null ? null : v[k]; if (v === undefined) v = null; }
        else break;
      }
      return v;
    }
    throw ciErr('Không hiểu biểu thức: ' + expr);
  };
  const unary = () => primary();
  const cmp = () => { let a = unary(); for (;;){ const t = peek(); if (!t || !['==', '!=', '<', '>', '<=', '>='].includes(t.v)) return a; p++; const b = unary(); a = t.v === '==' ? eq(a, b) : t.v === '!=' ? !eq(a, b) : t.v === '<' ? a < b : t.v === '>' ? a > b : t.v === '<=' ? a <= b : a >= b; } };
  const and = () => { let a = cmp(); while (eat('&&')){ const b = cmp(); a = truthy(a) ? b : a; } return a; };
  const or = () => { let a = and(); while (eat('||')){ const b = and(); a = truthy(a) ? a : b; } return a; };
  const v = or();
  if (p < tk.length) throw ciErr('Không hiểu phần "' + tk.slice(p).map(t => t.v).join(' ') + '" trong biểu thức: ' + expr);
  return v;
}
const ciTruthy = v => !(v === false || v === null || v === undefined || v === 0 || v === '');
function ciInterp(val, ctx){
  if (typeof val !== 'string') return val;
  return val.replace(/\$\{\{\s*([\s\S]*?)\s*\}\}/g, (m, e) => { const v = ciEval(e, ctx); return v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v); });
}
function ciCond(cond, ctx){
  if (cond === undefined || cond === null) return ctx.__jobOk;
  if (typeof cond === 'boolean') return cond && ctx.__jobOk;
  let e = String(cond).trim(); const m = e.match(/^\$\{\{([\s\S]*)\}\}$/); if (m) e = m[1];
  ctx.__status = false;
  const v = ciTruthy(ciEval(e, ctx));
  return ctx.__status ? v : (v && ctx.__jobOk);
}
