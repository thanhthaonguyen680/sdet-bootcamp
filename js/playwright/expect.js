/* Mô phỏng Playwright: expect và các matcher tự thử lại. */

/* ---------- expect kiểu Playwright ---------- */
function pwFmt(v){ return v instanceof RegExp ? String(v) : typeof v === 'string' ? JSON.stringify(v) : fmt(v); }
function pwMakeExpect(getRec){
  const expectFn = (target, message) => {
    const rec = getRec();
    // Như Playwright thật: expect(locator) có cả matcher chung (toBeTruthy, toBe...). Chúng kiểm tra bản thân object locator, nên toBeTruthy() luôn đúng.
    const withGeneric = (api) => {
      const g = pwValueAsserts(target, rec, message);
      for (const k of Object.keys(g)) if (k !== 'not' && !(k in api)) api[k] = g[k];
      for (const k of Object.keys(g.not)) if (!(k in api.not)) api.not[k] = g.not[k];
      return api;
    };
    if (target instanceof PWLocator) return withGeneric(pwLocatorAsserts(target, rec, message));
    if (target instanceof PWPage) return withGeneric(pwPageAsserts(target, rec, message));
    return pwValueAsserts(target, rec, message);
  };
  expectFn.soft = expectFn;
  return expectFn;
}
function pwRetrying(rec, label, targetDesc, run, message){
  const make = (negate) => (opts = {}) => pwThenable(makeP(negate)(opts), rec, 'expect(' + targetDesc + ').' + (negate ? 'not.' : '') + label);
  const makeP = (negate) => async (opts = {}) => {
    const entry = { matcher: label.split('(')[0], negate, target: targetDesc, pass: false };
    if (rec){ rec.asserts.push(entry); rec.pending++; }
    const timeout = opts.timeout ?? 5000, start = performance.now();
    try {
      for (;;){
        const r = run();
        if (r.error) throw r.error;
        if (r.pass !== negate){ entry.pass = true; return; }
        if (performance.now() - start > timeout){
          throw pwErr((message ? message + '\n\n' : '') + 'expect(' + targetDesc + ').' + (negate ? 'not.' : '') + label + '\n\n' +
            (r.expected !== undefined ? 'Mong đợi: ' + (negate ? 'không phải ' : '') + r.expected + '\n' : '') +
            'Nhận được: ' + r.received + '\nHết thời gian chờ ' + timeout + 'ms');
        }
        await pwSleep(50);
      }
    } finally { if (rec) rec.pending--; }
  };
  return make;
}
function pwLocatorAsserts(loc, rec, message){
  const one = () => { const els = loc._resolve(); if (els.length > 1){ try { loc._strict(els, 'expect'); } catch (e){ return { error: e }; } } return { el: els[0] }; };
  const textOf = el => pwNorm(el.textContent);
  const defs = {
    toBeVisible: () => () => { const r = one(); if (r.error) return r; return { pass: !!r.el && pwVisible(r.el), expected: 'hiển thị', received: !r.el ? '<không tìm thấy phần tử>' : pwVisible(r.el) ? 'hiển thị' : 'bị ẩn' }; },
    toBeHidden: () => () => { const r = one(); if (r.error) return r; return { pass: !r.el || !pwVisible(r.el), expected: 'bị ẩn', received: !r.el ? '<không tìm thấy phần tử>' : pwVisible(r.el) ? 'hiển thị' : 'bị ẩn' }; },
    toHaveText: (exp) => () => {
      if (Array.isArray(exp)){ const els = loc._resolve(); const got = els.map(textOf); return { pass: got.length === exp.length && got.every((g, i) => exp[i] instanceof RegExp ? exp[i].test(g) : g === pwNorm(exp[i])), expected: pwFmt(exp), received: pwFmt(got) }; }
      const r = one(); if (r.error) return r;
      const got = r.el ? textOf(r.el) : null;
      return { pass: got !== null && (exp instanceof RegExp ? exp.test(got) : got === pwNorm(exp)), expected: pwFmt(exp), received: got === null ? '<không tìm thấy phần tử>' : JSON.stringify(got) };
    },
    toContainText: (exp, o = {}) => () => {
      const r = one(); if (r.error) return r;
      const got = r.el ? textOf(r.el) : null;
      const pass = got !== null && (exp instanceof RegExp ? exp.test(got) : (o.ignoreCase ? got.toLowerCase().includes(pwNorm(exp).toLowerCase()) : got.includes(pwNorm(exp))));
      return { pass, expected: 'chứa ' + pwFmt(exp), received: got === null ? '<không tìm thấy phần tử>' : JSON.stringify(got) };
    },
    toHaveValue: (exp) => () => { const r = one(); if (r.error) return r; const got = r.el ? r.el.value : null; return { pass: got !== null && (exp instanceof RegExp ? exp.test(got) : got === String(exp)), expected: pwFmt(exp), received: got === null ? '<không tìm thấy phần tử>' : JSON.stringify(got) }; },
    toHaveCount: (n) => () => { const c = loc._resolve().length; return { pass: c === n, expected: String(n), received: String(c) }; },
    toBeChecked: (o = {}) => () => { const r = one(); if (r.error) return r; const want = o.checked !== false; return { pass: !!r.el && !!r.el.checked === want, expected: want ? 'được chọn' : 'không được chọn', received: !r.el ? '<không tìm thấy phần tử>' : r.el.checked ? 'được chọn' : 'không được chọn' }; },
    toBeEnabled: () => () => { const r = one(); if (r.error) return r; return { pass: !!r.el && !r.el.disabled, expected: 'enabled', received: !r.el ? '<không tìm thấy phần tử>' : r.el.disabled ? 'disabled' : 'enabled' }; },
    toBeDisabled: () => () => { const r = one(); if (r.error) return r; return { pass: !!r.el && !!r.el.disabled, expected: 'disabled', received: !r.el ? '<không tìm thấy phần tử>' : r.el.disabled ? 'disabled' : 'enabled' }; },
    toHaveAttribute: (name, val) => () => { const r = one(); if (r.error) return r; const got = r.el ? r.el.getAttribute(name) : null; return { pass: got !== null && (val === undefined || (val instanceof RegExp ? val.test(got) : got === String(val))), expected: name + (val !== undefined ? '=' + pwFmt(val) : ''), received: got === null ? '<không có thuộc tính>' : JSON.stringify(got) }; },
    toHaveClass: (exp) => () => { const r = one(); if (r.error) return r; const got = r.el ? [...r.el.classList].filter(c => !c.startsWith('__pw')).join(' ') : null; return { pass: got !== null && (exp instanceof RegExp ? exp.test(got) : got === exp), expected: pwFmt(exp), received: JSON.stringify(got) }; },
    toBeAttached: () => () => { const c = loc._resolve().length; return { pass: c > 0, expected: 'có trong trang', received: c ? 'có trong trang' : '<không tìm thấy phần tử>' }; },
  };
  const build = (negate) => {
    const o = {};
    for (const [k, mk] of Object.entries(defs)){
      o[k] = (...args) => {
        const optsArg = k === 'toHaveCount' || k === 'toHaveText' || k === 'toHaveValue' || k === 'toHaveClass' ? args[1] : k === 'toContainText' ? args[1] : k === 'toHaveAttribute' ? args[2] : args[0];
        return pwRetrying(rec, k + '(' + args.filter(a => !(a && typeof a === 'object' && !Array.isArray(a) && !(a instanceof RegExp))).map(pwFmt).join(', ') + ')', String(loc), mk(...args), message)(negate)(optsArg && typeof optsArg === 'object' && !Array.isArray(optsArg) && !(optsArg instanceof RegExp) ? optsArg : {});
      };
    }
    return o;
  };
  const api = build(false); api.not = build(true);
  return api;
}
function pwPageAsserts(page, rec, message){
  const defs = {
    toHaveURL: (exp) => () => ({ pass: pwUrlMatch(page.url(), exp), expected: pwFmt(exp), received: JSON.stringify(page.url()) }),
    toHaveTitle: (exp) => () => { const t = page._doc.title; return { pass: exp instanceof RegExp ? exp.test(t) : t === exp, expected: pwFmt(exp), received: JSON.stringify(t) }; },
  };
  const build = (negate) => {
    const o = {};
    for (const [k, mk] of Object.entries(defs)) o[k] = (exp, opts) => pwRetrying(rec, k + '(' + pwFmt(exp) + ')', 'page', mk(exp), message)(negate)(opts || {});
    return o;
  };
  const api = build(false); api.not = build(true);
  return api;
}
function pwValueAsserts(actual, rec, message){
  const defs = {
    toBe: e => [Object.is(actual, e), pwFmt(e)],
    toEqual: e => [deepEqual(actual, e), pwFmt(e)],
    toStrictEqual: e => [deepEqual(actual, e), pwFmt(e)],
    toContain: e => [actual != null && typeof actual.includes === 'function' && actual.includes(e), 'chứa ' + pwFmt(e)],
    toBeTruthy: () => [!!actual, 'truthy'],
    toBeFalsy: () => [!actual, 'falsy'],
    toBeNull: () => [actual === null, 'null'],
    toBeUndefined: () => [actual === undefined, 'undefined'],
    toBeDefined: () => [actual !== undefined, 'khác undefined'],
    toBeGreaterThan: e => [actual > e, '> ' + e],
    toBeGreaterThanOrEqual: e => [actual >= e, '>= ' + e],
    toBeLessThan: e => [actual < e, '< ' + e],
    toBeLessThanOrEqual: e => [actual <= e, '<= ' + e],
    toHaveLength: e => [actual != null && actual.length === e, 'độ dài ' + e],
    toMatch: e => [typeof actual === 'string' && (e instanceof RegExp ? e.test(actual) : actual.includes(e)), pwFmt(e)],
  };
  const build = (negate) => {
    const o = {};
    for (const [k, fn] of Object.entries(defs)) o[k] = (...a) => {
      if (actual instanceof Promise) throw pwErr('expect(...).' + k + ': giá trị nhận được là một Promise. Có phải bạn quên await? Ví dụ: expect(await locator.count()).' + k + '(...)');
      const [ok, exp] = fn(...a);
      const entry = { matcher: k, negate, target: 'value', pass: ok !== negate };
      if (rec) rec.asserts.push(entry);
      if (ok === negate) throw pwErr((message ? message + '\n\n' : '') + 'expect(received).' + (negate ? 'not.' : '') + k + '\n\nMong đợi: ' + (negate ? 'không phải ' : '') + exp + '\nNhận được: ' + pwFmt(actual));
    };
    return o;
  };
  const api = build(false); api.not = build(true);
  return api;
}
