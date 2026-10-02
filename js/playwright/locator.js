/* Mô phỏng Playwright: lớp Locator và Page. */

class PWLocator {
  constructor(page, steps){ this._page = page; this._steps = steps; }
  _with(step){ return new PWLocator(this._page, [...this._steps, step]); }
  getByRole(role, opts){ return this._with({ kind: 'role', role, opts: opts || {} }); }
  getByText(text, opts){ return this._with({ kind: 'text', text, opts: opts || {} }); }
  getByLabel(text, opts){ return this._with({ kind: 'label', text, opts: opts || {} }); }
  getByPlaceholder(text, opts){ return this._with({ kind: 'placeholder', text, opts: opts || {} }); }
  getByTestId(text){ return this._with({ kind: 'testid', text }); }
  getByAltText(text, opts){ return this._with({ kind: 'alt', text, opts: opts || {} }); }
  getByTitle(text, opts){ return this._with({ kind: 'title', text, opts: opts || {} }); }
  locator(sel, opts){ let l = sel instanceof PWLocator ? new PWLocator(this._page, [...this._steps, ...sel._steps]) : this._with(pwSelStep(sel)); if (opts) l = l.filter(opts); return l; }
  filter(opts){ return this._with({ kind: 'filter', opts: opts || {} }); }
  nth(i){ return this._with({ kind: 'nth', i }); }
  first(){ return this.nth(0); }
  last(){ return this.nth(-1); }
  _resolveFrom(roots){ const doc = this._page._doc; let cur = roots; for (const s of this._steps) cur = pwApply(cur, s, doc); return cur; }
  _resolve(){ return this._resolveFrom([this._page._doc]); }
  toString(){ return this._steps.map(pwStepDesc).join('.'); }
  _strict(els, action){
    if (els.length > 1) throw pwErr((action ? action + ': ' : '') + 'strict mode violation: ' + this + ' khớp ' + els.length + ' phần tử:\n' +
      els.slice(0, 5).map((e, i) => '  ' + (i + 1) + ') ' + pwDescribe(e)).join('\n') + (els.length > 5 ? '\n  ...' : '') +
      '\nHãy làm locator cụ thể hơn, hoặc dùng filter(), nth(), first() nếu thật sự muốn chọn một trong số đó.');
  }
  async _one(action, opt = {}){
    const start = performance.now(), timeout = opt.timeout ?? PW_TIMEOUT;
    let why = '';
    for (;;){
      const els = this._resolve();
      this._strict(els, action);
      if (els.length === 1){
        const el = els[0];
        if (opt.visible !== false && !pwVisible(el)) why = 'phần tử đang bị ẩn';
        else if (opt.enabled && el.disabled) why = 'phần tử đang bị vô hiệu hóa (disabled)';
        else return el;
      } else why = 'chưa tìm thấy phần tử nào khớp';
      if (performance.now() - start > timeout) throw pwErr(action + ': Timeout ' + timeout + 'ms exceeded.\nĐang chờ ' + this + '\n  → ' + why);
      await pwSleep(50);
    }
  }
  async _do(name, arg, fn){ return this._page._track(name, this, arg, fn); }
  click(o){ return this._do('click', undefined, async () => { const el = await this._one('click', { enabled: true, timeout: o && o.timeout }); await this._page._flash(el); el.click(); await pwSleep(10); }); }
  dblclick(o){ return this.click(o); }
  hover(){ return this._do('hover', undefined, async () => { const el = await this._one('hover'); await this._page._flash(el); }); }
  focus(){ return this._do('focus', undefined, async () => { const el = await this._one('focus'); el.focus(); }); }
  fill(value){ return this._do('fill', value, async () => {
    const el = await this._one('fill', { enabled: true });
    const tag = el.tagName;
    if (!(tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable) || (tag === 'INPUT' && ['checkbox', 'radio', 'button', 'submit'].includes(el.type))) throw pwErr('fill: phần tử không phải ô nhập liệu: ' + pwDescribe(el));
    const v = String(value);
    if (tag === 'INPUT' && el.type === 'number' && v !== '' && isNaN(Number(v))) throw pwErr('fill: Cannot type text into input[type=number] (giá trị "' + v + '")');
    await this._page._flash(el);
    el.focus(); el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
  }); }
  clear(){ return this.fill(''); }
  pressSequentially(text){ return this.fill(text); }
  press(key){ return this._do('press', key, async () => {
    const el = await this._one('press');
    await this._page._flash(el);
    const opts = { key, bubbles: true, cancelable: true };
    el.dispatchEvent(new KeyboardEvent('keydown', opts));
    if (key === 'Enter' && el.form){ if (el.form.requestSubmit) el.form.requestSubmit(); else el.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); }
    el.dispatchEvent(new KeyboardEvent('keyup', opts));
  }); }
  check(){ return this._setChecked(true, 'check'); }
  uncheck(){ return this._setChecked(false, 'uncheck'); }
  setChecked(v){ return this._setChecked(!!v, 'setChecked'); }
  _setChecked(v, name){ return this._do(name, undefined, async () => {
    const el = await this._one(name, { enabled: true });
    if (!(el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio'))) throw pwErr(name + ': phần tử không phải checkbox hoặc radio: ' + pwDescribe(el));
    if (!v && el.type === 'radio') throw pwErr(name + ': không thể bỏ chọn radio button');
    await this._page._flash(el);
    if (el.checked !== v) el.click();
    if (el.checked !== v) throw pwErr(name + ': trạng thái không thay đổi sau khi click');
  }); }
  selectOption(values){ return this._do('selectOption', values, async () => {
    const start = performance.now();
    const el = await this._one('selectOption', { enabled: true });
    if (el.tagName !== 'SELECT') throw pwErr('selectOption: phần tử không phải <select>: ' + pwDescribe(el));
    const list = Array.isArray(values) ? values : [values];
    const picked = [];
    for (const v of list){
      let opt = null;
      for (;;){
        opt = [...el.options].find(o => (typeof v === 'object' && v !== null) ? (v.value !== undefined ? o.value === v.value : v.label !== undefined ? pwNorm(o.label) === pwNorm(v.label) : o.index === v.index) : (o.value === String(v) || pwNorm(o.label) === pwNorm(v)));
        if (opt || performance.now() - start > PW_TIMEOUT) break;
        await pwSleep(50);
      }
      if (!opt) throw pwErr('selectOption: không tìm thấy lựa chọn ' + JSON.stringify(v) + ' trong ' + this + '\nCác lựa chọn có: ' + [...el.options].map(o => JSON.stringify(o.value) + ' (' + pwNorm(o.label) + ')').join(', '));
      picked.push(opt);
    }
    await this._page._flash(el);
    [...el.options].forEach(o => { o.selected = picked.includes(o); });
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
    return picked.map(o => o.value);
  }); }
  async textContent(){ return (await this._one('textContent', { visible: false })).textContent; }
  async innerText(){ return (await this._one('innerText', { visible: false })).innerText; }
  async inputValue(){ return (await this._one('inputValue', { visible: false })).value; }
  async getAttribute(n){ return (await this._one('getAttribute', { visible: false })).getAttribute(n); }
  async isVisible(){ const els = this._resolve(); this._strict(els, 'isVisible'); return els.length ? pwVisible(els[0]) : false; }
  async isHidden(){ return !(await this.isVisible()); }
  async isChecked(){ return !!(await this._one('isChecked', { visible: false })).checked; }
  async isEnabled(){ return !(await this._one('isEnabled', { visible: false })).disabled; }
  async isDisabled(){ return !!(await this._one('isDisabled', { visible: false })).disabled; }
  async count(){ return this._resolve().length; }
  async allTextContents(){ return this._resolve().map(e => e.textContent); }
  async allInnerTexts(){ return this._resolve().map(e => e.innerText); }
  async all(){ return this._resolve().map((_, i) => this.nth(i)); }
  waitFor(o = {}){ return this._do('waitFor', o.state || 'visible', async () => {
    const state = o.state || 'visible', timeout = o.timeout ?? PW_TIMEOUT, start = performance.now();
    for (;;){
      const els = this._resolve();
      if (state !== 'detached' && state !== 'hidden') this._strict(els, 'waitFor');
      const ok = state === 'attached' ? els.length === 1 : state === 'detached' ? els.length === 0 : state === 'hidden' ? (els.length === 0 || !pwVisible(els[0])) : (els.length === 1 && pwVisible(els[0]));
      if (ok) return;
      if (performance.now() - start > timeout) throw pwErr('waitFor: Timeout ' + timeout + 'ms exceeded khi chờ ' + this + ' ở trạng thái "' + state + '"');
      await pwSleep(50);
    }
  }); }
}

class PWPage {
  constructor(app, opts = {}){ this._app = app; this._slow = opts.slowMo || 0; this._log = opts.log || null; this._rec = opts.rec || null; }
  get _doc(){ return this._app.doc; }
  async _flash(el){
    if (!this._slow) return;
    el.classList.add('__pw-hl');
    try { el.scrollIntoView({ block: 'nearest' }); } catch (e){}
    await pwSleep(this._slow);
    el.classList.remove('__pw-hl');
  }
  _track(name, target, arg, fn){
    const rec = this._rec;
    const desc = (target ? target + '.' : 'page.') + name + '(' + (arg !== undefined ? JSON.stringify(arg) : '') + ')';
    const entry = { type: name, target: target ? String(target) : '', kinds: target && target._steps ? target._steps.map(s => s.kind) : [], arg };
    if (rec){ rec.actions.push(entry); rec.pending++; }
    if (this._log) this._log('→ ' + desc);
    const p = (async () => { try { return await fn(); } finally { if (rec) rec.pending--; } })();
    return pwThenable(p, rec, desc);
  }
  _loc(step){ return new PWLocator(this, [step]); }
  getByRole(role, opts){ return this._loc({ kind: 'role', role, opts: opts || {} }); }
  getByText(text, opts){ return this._loc({ kind: 'text', text, opts: opts || {} }); }
  getByLabel(text, opts){ return this._loc({ kind: 'label', text, opts: opts || {} }); }
  getByPlaceholder(text, opts){ return this._loc({ kind: 'placeholder', text, opts: opts || {} }); }
  getByTestId(text){ return this._loc({ kind: 'testid', text }); }
  getByAltText(text, opts){ return this._loc({ kind: 'alt', text, opts: opts || {} }); }
  getByTitle(text, opts){ return this._loc({ kind: 'title', text, opts: opts || {} }); }
  locator(sel, opts){ let l = this._loc(pwSelStep(sel)); if (opts) l = l.filter(opts); return l; }
  url(){ return this._app.fullUrl(); }
  async title(){ return this._doc.title; }
  goto(url){ return this._track('goto', null, url, async () => { this._app.navigate(url); await pwSleep(20 + this._slow / 2); return null; }); }
  reload(){ return this._track('reload', null, undefined, async () => { this._app.navigate(this._app.fullUrl()); await pwSleep(20); }); }
  waitForTimeout(ms){ return this._track('waitForTimeout', null, ms, () => pwSleep(ms)); }
  waitForURL(url, o = {}){ return this._track('waitForURL', null, String(url), async () => {
    const start = performance.now(), timeout = o.timeout ?? PW_TIMEOUT;
    while (!pwUrlMatch(this.url(), url)){ if (performance.now() - start > timeout) throw pwErr('waitForURL: Timeout ' + timeout + 'ms exceeded. URL hiện tại: ' + this.url()); await pwSleep(50); }
  }); }
  waitForLoadState(){ return Promise.resolve(); }
  async screenshot(){ if (this._log) this._log('(screenshot được bỏ qua trong sân tập)'); return null; }
  async content(){ return this._doc.documentElement.outerHTML; }
  async close(){}
  get keyboard(){ const page = this; return { async press(key){ const el = page._doc.activeElement; if (el && el !== page._doc.body){ const tmp = new PWLocator(page, []); tmp._resolve = () => [el]; return tmp.press(key); } } }; }
}
function pwThenable(p, rec, desc){
  if (!rec) return p;
  const token = { awaited: false, desc };
  rec.tokens.push(token);
  p.catch(() => {});
  return {
    then(a, b){ token.awaited = true; return p.then(a, b); },
    catch(b){ token.awaited = true; return p.catch(b); },
    finally(f){ token.awaited = true; return p.finally(f); },
  };
}
function pwUrlMatch(actual, exp){
  if (exp instanceof RegExp){ exp.lastIndex = 0; return exp.test(actual); }
  if (typeof exp === 'function') return !!exp(new URL(actual.startsWith('about:') ? 'about:blank' : actual));
  const e = String(exp);
  return actual === e || actual === APP_BASE + (e.startsWith('/') ? e : '/' + e);
}
