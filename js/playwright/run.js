/* Chạy test Playwright của người học và chấm điểm. */

async function runPW(withTests, override){
  if (running) return;
  const ex = current;
  const isExample = typeof override === 'string';
  if (isExample || (withTests && !ex.tests)) withTests = false;
  running = true; runBtn.disabled = true; checkBtn.disabled = true;
  if (!isExample) flushSave();
  let projectFiles = null;
  if (ex.files){
    if (!isExample){ projSync(); projectFiles = { ...proj.files }; }
    else if (/^\s*\/\/\s*@file:/m.test(override)) projectFiles = splitMarked(override);
  }
  const src = projectFiles ? joinMarked(projectFiles) : (isExample ? override : ta.value);
  clearConsole(false);
  const meta = t => { const d = document.createElement('div'); d.className = 'line meta'; d.textContent = t; consoleEl.appendChild(d); consoleEl.scrollTop = consoleEl.scrollHeight; };
  if (isExample) meta('Kết quả chạy ví dụ:');
  if (withTests){ testsEl.innerHTML = '<p class="empty">Đang chấm…</p>'; badgeEl.hidden = true; showTab('tests'); } else showTab('console');
  if (errLine){ errLine = 0; gutterDirty = true; renderGutter(); }
  if (briefView !== 'app'){ briefView = 'app'; renderBrief(); }
  const finish = () => { App.fast = false; running = false; runBtn.disabled = false; checkBtn.disabled = false; };
  const failGrade = (msg) => { if (withTests){ renderTestError({ message: msg, __assert: true }); setStatus(ex.id, 'fail'); } };

  let ts;
  try {
    if (!(window.ts && window.ts.transpileModule)) meta('Đang tải bộ dịch TypeScript (chỉ lần đầu, khoảng 3 MB)…');
    ts = await loadTS();
  } catch (e){
    logLine('error', 'Không tải được bộ dịch TypeScript. Hãy kiểm tra kết nối mạng rồi thử lại.');
    failGrade('Không tải được bộ dịch TypeScript.'); finish(); return;
  }
  await App.init();

  let js = '';
  if (!projectFiles){
    let prepared;
    try { prepared = tsPrepare(src); }
    catch (e){ logLine('error', e.message); failGrade(e.message); finish(); return; }
    const maxLine = src.split('\n').length;
    const out = ts.transpileModule(prepared, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None, useDefineForClassFields: false }, reportDiagnostics: true, fileName: 'bai-tap.ts' });
    if (out.diagnostics && out.diagnostics.length){
      const d = out.diagnostics[0];
      const pos = d.file && d.start != null ? d.file.getLineAndCharacterOfPosition(d.start) : null;
      const msg = 'Lỗi cú pháp TypeScript: ' + ts.flattenDiagnosticMessageText(d.messageText, '\n') + (pos ? '\n(tại dòng ' + (pos.line + 1) + ')' : '');
      logLine('error', msg);
      if (pos && !isExample){ errLine = pos.line + 1; gutterDirty = true; renderGutter(); }
      failGrade(msg); finish(); return;
    }
    js = out.outputText.replace(/^"use strict";\s*/, '');
  }

  const logs = [];
  const emit = (kind, args) => { let line; try { line = args.map(a => fmt(a, 0, true)).join(' '); } catch (e){ line = String(args); } logs.push(line); logLine(kind, line); };
  const con = { log: (...a) => emit('log', a), info: (...a) => emit('info', a), debug: (...a) => emit('log', a), warn: (...a) => emit('warn', a), error: (...a) => emit('error', a), table: d => emit('log', [d]), clear: () => {} };
  let iter = 0, t0 = performance.now();
  const guard = () => { if ((++iter & 1023) === 0 && performance.now() - t0 > 5000){ const e = new Error('Code chạy quá lâu nên đã bị dừng. Có thể vòng lặp không có điểm dừng.'); e.__loop = true; throw e; } };

  const reg = [], hooks = { beforeEach: [], afterEach: [] }, prefix = [];
  let curRec = null;
  const runFx = (defs, fx, fn) => {
    const keys = Object.keys(defs);
    const step = (i) => {
      if (i >= keys.length) return Promise.resolve().then(() => fn(fx));
      const k = keys[i];
      return new Promise((resolve, reject) => {
        let used = false;
        Promise.resolve().then(() => defs[k](fx, async (v) => { used = true; fx[k] = v; await step(i + 1); }))
          .then(() => (used ? resolve() : reject(pwErr('Fixture "' + k + '" chưa gọi await use(...)'))), reject);
      });
    };
    return step(0);
  };
  const makeTest = (defs) => {
    const wrap = fn => (Object.keys(defs).length ? (fx => runFx(defs, { ...fx }, fn)) : fn);
    const full = name => [...prefix, name].join(' › ');
    const t = (name, fn) => { reg.push({ name: full(name), fn: wrap(fn) }); };
    t.describe = (name, fn) => { prefix.push(name); try { fn(); } finally { prefix.pop(); } };
    t.describe.serial = t.describe; t.describe.parallel = t.describe; t.describe.configure = () => {};
    t.beforeEach = fn => { hooks.beforeEach.push(wrap(fn)); };
    t.afterEach = fn => { hooks.afterEach.push(wrap(fn)); };
    t.skip = (name, fn) => { if (typeof name === 'string') reg.push({ name: full(name), fn: wrap(fn), skip: true }); };
    t.only = (name, fn) => { reg.push({ name: full(name), fn: wrap(fn), only: true }); };
    t.use = () => {}; t.setTimeout = () => {}; t.slow = () => {};
    t.step = async (name, fn) => { meta('  • ' + name); return await fn(); };
    t.extend = more => makeTest({ ...defs, ...more });
    return t;
  };
  const pwTest = makeTest({});
  const pwExpect = pwMakeExpect(() => curRec);

  const exportNames = ex.exports || [];
  const trailer = '\n;return {' + exportNames.map(n => n + ': typeof ' + n + ' !== "undefined" ? ' + n + ' : undefined').join(', ') + '};';
  let exported = {};
  if (projectFiles){
    const r = await runProject(projectFiles, ts, { con, pwTest, pwExpect, guard });
    if (r.error){
      const msg = r.error.__pw || r.error.__assert ? r.error.message : explain(r.error) + (r.file ? '\n(khi nạp tệp ' + r.file + ')' : '');
      logLine('error', msg);
      if (!isExample && r.file && proj && proj.files[r.file] !== undefined){ openFile(r.file); if (r.line){ errLine = r.line; gutterDirty = true; renderGutter(); } }
      failGrade(msg); finish(); return;
    }
    exported = r.exports;
  } else try {
    const fn = compile('const test = __pwTest, expect = __pwExpect; {' + instrument(js) + trailer + '\n}', ['console', '__pwTest', '__pwExpect', '__guard']);
    exported = (await withLimit(fn(con, pwTest, pwExpect, guard), 8000, 'Code chờ quá 8 giây mà chưa chạy xong.')) || {};
  } catch (e){
    logLine('error', explain(e));
    failGrade(explain(e)); finish(); return;
  }

  const slow = isExample || !withTests ? 160 : 0;
  const runTests = async ({ silent = false, bugs = [], slowMo = slow } = {}) => {
    const only = reg.some(t => t.only);
    const list = reg.filter(t => !only || t.only);
    const recs = [];
    if (!silent) meta('Running ' + list.length + ' test' + (list.length > 1 ? 's' : ''));
    for (let i = 0; i < list.length; i++){
      const t = list[i];
      const rec = { name: t.name, status: 'passed', error: null, actions: [], asserts: [], pending: 0, tokens: [], url: '', ms: 0 };
      recs.push(rec);
      if (t.skip){ rec.status = 'skipped'; if (!silent) logLine('info', '  -  ' + (i + 1) + ' ' + t.name + ' (bỏ qua)'); continue; }
      App.reset(); App.bugs = new Set(bugs); App.navigate('about:blank');
      curRec = rec;
      const page = new PWPage(App, { slowMo, rec, log: silent ? null : (m => { const d = document.createElement('div'); d.className = 'line meta'; d.textContent = '     ' + m; consoleEl.appendChild(d); consoleEl.scrollTop = consoleEl.scrollHeight; }) });
      const fixtures = { page, baseURL: APP_BASE, context: {}, browserName: 'chromium' };
      const start = performance.now();
      iter = 0; t0 = performance.now();
      try {
        for (const h of hooks.beforeEach) await withLimit(Promise.resolve().then(() => h(fixtures)), 20000, 'beforeEach chạy quá 20 giây.');
        await withLimit(Promise.resolve().then(() => t.fn(fixtures)), 20000, 'Test chạy quá 20 giây nên đã bị dừng.');
        const missed = rec.tokens.filter(k => !k.awaited);
        if (missed.length){
          await pwSleep(30);
          throw pwErr('Thiếu await trước lệnh:\n  ' + missed.slice(0, 3).map(k => k.desc).join('\n  ') +
            '\nMọi thao tác (goto, click, fill...) và mọi expect với locator/page đều phải có await. Thiếu await, test có thể kết thúc trước khi lệnh chạy xong và "pass" dù chưa kiểm tra gì.');
        }
        if (rec.pending > 0){
          await pwSleep(30);
          throw pwErr('Test kết thúc trong khi vẫn còn ' + rec.pending + ' thao tác chưa xong.\nCó phải bạn quên await trước một lệnh (click, fill, expect...)? Trong Playwright, thiếu await làm test kết thúc sớm và có thể "pass" dù chưa kiểm tra gì.');
        }
      } catch (e){ rec.status = 'failed'; rec.error = e; }
      finally {
        for (const h of hooks.afterEach){ try { await h(fixtures); } catch (e){} }
        rec.ms = Math.round(performance.now() - start); rec.url = App.fullUrl(); rec.state = App.state; curRec = null;
      }
      if (!silent){
        if (rec.status === 'passed') logLine('info', '  ✓  ' + (i + 1) + ' ' + t.name + ' (' + rec.ms + 'ms)');
        else logLine('error', '  ✘  ' + (i + 1) + ' ' + t.name + ' (' + rec.ms + 'ms)\n\n' + (rec.error && rec.error.__pw ? rec.error.message : explain(rec.error)));
      }
    }
    if (!silent){
      const p = recs.filter(r => r.status === 'passed').length, f = recs.filter(r => r.status === 'failed').length;
      meta(recs.length ? (p ? p + ' passed' : '') + (p && f ? ', ' : '') + (f ? f + ' failed' : '') : '');
    }
    return recs;
  };

  const checkLocators = async (silent) => {
    App.reset(); App.fast = true; App.navigate(ex.route || '/login'); await appWaitReady(); App.fast = false;
    const page = new PWPage(App, {});
    const map = typeof exported.locators === 'function' ? exported.locators(page) : null;
    if (!map){ if (!silent) logLine('error', 'Chưa có hàm locators(page) trả về object các locator.'); return; }
    const all = [];
    for (const [k, loc] of Object.entries(map)){
      if (!(loc instanceof PWLocator)){ if (!silent) logLine('warn', k + ': chưa phải là locator'); continue; }
      let els;
      try { els = loc._resolve(); } catch (e){ if (!silent) logLine('error', k + ': ' + e.message); continue; }
      all.push(...els);
      if (!silent) logLine(els.length === 1 ? 'log' : 'warn', k + ' → ' + els.length + ' phần tử' + (els.length ? '\n   ' + els.slice(0, 4).map(pwDescribe).join('\n   ') + (els.length > 4 ? '\n   …' : '') : '') + '\n   ' + loc);
    }
    if (!silent){ all.forEach(el => el.classList.add('__pw-find')); setTimeout(() => all.forEach(el => el.classList.remove('__pw-find')), 2500); }
  };

  let recs = [];
  try {
    if (reg.length) recs = await runTests();
    else if (typeof exported.locators === 'function'){ meta('Kết quả các locator trên trang ' + (ex.route || '/login') + ':'); await checkLocators(false); }
    else if (!logs.length) meta('Không có test nào. Hãy viết test bằng test(\'tên\', async ({ page }) => { ... }).');
  } catch (e){ logLine('error', explain(e)); }

  if (withTests){
    const grades = [];
    const check = (name, fn) => grades.push({ name, fn });
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const H = {
      async locator(key, target, o = {}){
        if (typeof exported.locators !== 'function') assertFail('Chưa định nghĩa hàm locators(page)');
        App.reset(); App.fast = true; App.navigate(o.route || ex.route || '/login'); await appWaitReady(); App.fast = false;
        const page = new PWPage(App, {});
        let map; try { map = exported.locators(page); } catch (e){ assertFail('Hàm locators bị lỗi: ' + explain(e)); }
        const loc = map && map[key];
        if (!(loc instanceof PWLocator)) assertFail('"' + key + '" chưa phải là locator. Hãy dùng page.getBy...() hoặc page.locator().');
        if (o.kinds){ const used = loc._steps.map(s => s.kind); if (!o.kinds.some(k => used.includes(k))) assertFail('"' + key + '" cần dùng ' + o.kindLabel + '. Locator hiện tại: ' + loc); }
        let els; try { els = loc._resolve(); } catch (e){ assertFail(e.message); }
        const want = typeof target === 'function' ? target(App.doc) : [...App.doc.querySelectorAll(target)];
        const same = els.length === want.length && els.every(e => want.includes(e));
        if (!same) assertFail('"' + key + '" đang khớp ' + els.length + ' phần tử' + (els.length ? ':\n  ' + els.slice(0, 3).map(pwDescribe).join('\n  ') : '') +
          '\nCần khớp đúng ' + want.length + ' phần tử' + (want.length ? ':\n  ' + want.slice(0, 3).map(pwDescribe).join('\n  ') : '') + '\nLocator: ' + loc);
      },
      rerun: (bug) => runTests({ silent: true, bugs: [bug], slowMo: 0 }),
      page(){ App.reset(); App.navigate('about:blank'); return new PWPage(App, {}); },
      url: () => App.fullUrl(),
      doc: () => App.doc,
      isLocator: x => x instanceof PWLocator,
      resolve: loc => loc._resolve(),
      async waitUrl(path, ms = 2500){ const s = performance.now(); while (!pwUrlMatch(App.fullUrl(), path) && performance.now() - s < ms) await pwSleep(40); return pwUrlMatch(App.fullUrl(), path); },
      state: () => App.state,
    };
    try {
      const gfn = compile(ex.tests, ['check', 'expect', '__pw', '__source', '__code', 'H']);
      await gfn(check, expect, { tests: recs, exports: exported, registered: reg.length, files: projectFiles }, src, code, H);
      const results = [];
      for (const g of grades){
        iter = 0; t0 = performance.now();
        try { await withLimit(Promise.resolve().then(() => g.fn()), 30000, 'Chấm quá lâu.'); results.push({ name: g.name, ok: true }); }
        catch (e){ results.push({ name: g.name, ok: false, msg: e.__assert || e.__pw ? e.message : explain(e) }); }
      }
      const all = results.length > 0 && results.every(r => r.ok);
      renderResults(results, all);
      setStatus(ex.id, all ? 'pass' : 'fail');
    } catch (e){ renderTestError(e); setStatus(ex.id, 'fail'); }
  }
  finish();
}
