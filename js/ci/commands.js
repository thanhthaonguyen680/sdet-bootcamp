/* Mô phỏng GitHub Actions: lệnh npm, npx playwright test và shell. */

/* ---------- Cấu hình Playwright và package.json ---------- */
async function ciConfig(files, env){
  const src = files['playwright.config.ts'];
  if (!src) return { projects: [{ name: 'chromium' }] };
  const ts = await loadTS();
  const out = ts.transpileModule(src, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true }, reportDiagnostics: true, fileName: 'playwright.config.ts' });
  if (out.diagnostics && out.diagnostics.length){
    const d = out.diagnostics[0]; const pos = d.file && d.start != null ? d.file.getLineAndCharacterOfPosition(d.start) : null;
    throw Object.assign(ciErr('Lỗi cú pháp trong playwright.config.ts' + (pos ? ', dòng ' + (pos.line + 1) : '') + ': ' + ts.flattenDiagnosticMessageText(d.messageText, '\n')), { file: 'playwright.config.ts', line: pos ? pos.line + 1 : 0 });
  }
  const pwMod = { defineConfig: c => c, devices: new Proxy({}, { get: (_, k) => ({ __device: String(k) }) }) };
  const module = { exports: {} };
  const fn = compile(out.outputText, ['require', 'exports', 'module', 'process']);
  await fn(s => { if (s === '@playwright/test') return pwMod; if (s === 'dotenv' || s === 'dotenv/config') return { config(){} }; throw ciErr('playwright.config.ts: không tìm thấy module ' + s); }, module.exports, module, { env: { ...env } });
  return module.exports.default || module.exports;
}
function ciPkg(files){
  if (files['package.json'] === undefined) return null;
  try { return JSON.parse(files['package.json']); }
  catch (e){ throw Object.assign(ciErr('package.json chưa phải JSON hợp lệ: ' + e.message), { file: 'package.json' }); }
}
const ciBrowserOf = proj => { const n = (proj.name + ' ' + JSON.stringify(proj.use || {})).toLowerCase(); return n.includes('webkit') || n.includes('safari') ? 'webkit' : n.includes('firefox') ? 'firefox' : 'chromium'; };
function ciSplitArgs(s){ const out = []; const re = /"([^"]*)"|'([^']*)'|(\S+)/g; let m; while ((m = re.exec(s))) out.push(m[1] ?? m[2] ?? m[3]); return out; }

/* ---------- Mô phỏng npx playwright test ---------- */
async function ciPlaywrightTest(args, sh){
  const log = sh.log;
  if (!sh.deps){ log('Error: Cannot find module \'@playwright/test\'\n(Chưa cài thư viện. Hãy chạy npm ci trước.)'); return 1; }
  let cfg;
  try { cfg = await ciConfig(sh.files, sh.env); }
  catch (e){ log(e.message); return 1; }
  const a = { projects: [], grep: null, grepInvert: null, shard: null, workers: null, retries: null, reporter: null, files: [], headed: false };
  for (let i = 0; i < args.length; i++){
    const x = args[i]; const val = () => (x.includes('=') ? x.slice(x.indexOf('=') + 1) : args[++i]);
    if (x.startsWith('--project')) a.projects.push(val());
    else if (x === '-g' || x.startsWith('--grep=') || x === '--grep') a.grep = val();
    else if (x.startsWith('--grep-invert')) a.grepInvert = val();
    else if (x.startsWith('--shard')) a.shard = val();
    else if (x.startsWith('--workers') || x === '-j') a.workers = Number(String(val()).replace('%', ''));
    else if (x.startsWith('--retries')) a.retries = Number(val());
    else if (x.startsWith('--reporter')) a.reporter = val();
    else if (x === '--headed' || x === '--ui' || x === '--debug'){ if (sh.ci){ log('Error: Không mở được giao diện trình duyệt trên máy CI (không có màn hình). Bỏ tùy chọn ' + x + '.'); return 1; } a.headed = true; }
    else if (x === '--list' || x === '--quiet' || x.startsWith('--config') || x.startsWith('--max-failures') || x === '-x' || x.startsWith('--forbid-only') || x.startsWith('--pass-with-no-tests')) {}
    else if (x.startsWith('-')) {}
    else a.files.push(x);
  }
  let projects = (cfg.projects && cfg.projects.length ? cfg.projects : [{ name: 'chromium' }]);
  if (a.projects.length){
    const miss = a.projects.filter(n => !projects.some(p => p.name === n));
    if (miss.length){ log('Error: Project(s) "' + miss.join('", "') + '" not found. Available projects: "' + projects.map(p => p.name).join('", "') + '"'); return 1; }
    projects = projects.filter(p => a.projects.includes(p.name));
  }
  const needBrowsers = [...new Set(projects.map(ciBrowserOf))];
  for (const b of needBrowsers){
    if (!sh.browsers.has(b)){
      log('Error: browserType.launch: Executable doesn\'t exist at /home/runner/.cache/ms-playwright/' + b + '-1140/' + b + '\n╔════════════════════════════════════════════════════════╗\n║ Looks like Playwright Test or Playwright was just      ║\n║ installed or updated. Please run the following command ║\n║ to download new browsers:                              ║\n║     npx playwright install                             ║\n╚════════════════════════════════════════════════════════╝');
      return 1;
    }
    if (sh.ci && b !== 'chromium' && !sh.sysDeps){ log('Error: browserType.launch: Host system is missing dependencies to run ' + b + '.\n    Install them with: npx playwright install-deps\n(hoặc dùng npx playwright install --with-deps)'); return 1; }
  }
  const gRe = a.grep || cfg.grep ? new RegExp(a.grep || cfg.grep, 'i') : null;
  const giRe = a.grepInvert ? new RegExp(a.grepInvert, 'i') : null;
  let list = [];
  for (const pj of projects) for (const t of CI_SUITE){
    const full = t.title + ' ' + t.tags.join(' ');
    if (gRe && !gRe.test(full)) continue;
    if (giRe && giRe.test(full)) continue;
    if (a.files.length && !a.files.some(f => ('tests/' + t.file).includes(f.replace(/^\.\//, '')) || t.file.includes(f))) continue;
    list.push({ ...t, project: pj.name, browser: ciBrowserOf(pj) });
  }
  let shardInfo = '';
  if (a.shard){
    const m = String(a.shard).match(/^(\d+)\/(\d+)$/);
    if (!m || +m[1] < 1 || +m[1] > +m[2]){ log('Error: --shard phải có dạng "chỉ_số/tổng", ví dụ --shard=1/3 (nhận được "' + a.shard + '")'); return 1; }
    const i = +m[1], n = +m[2], per = Math.ceil(list.length / n);
    list = list.slice((i - 1) * per, i * per); shardInfo = ', shard ' + i + '/' + n;
  }
  const workers = a.workers || (typeof cfg.workers === 'number' ? cfg.workers : typeof cfg.workers === 'string' ? Math.max(1, Math.floor(sh.cores * parseInt(cfg.workers) / 100)) : Math.max(1, Math.floor(sh.cores / 2)));
  const retries = a.retries ?? (typeof cfg.retries === 'number' ? cfg.retries : 0);
  const scale = sh.durScale || 5;
  const envNeed = sh.needEnv || [];
  const base = cfg.use && cfg.use.baseURL;
  log('Running ' + list.length + ' test' + (list.length === 1 ? '' : 's') + ' using ' + Math.min(workers, Math.max(1, list.length)) + ' worker' + (workers > 1 ? 's' : '') + shardInfo + (sh.ci ? '' : ''));
  if (!list.length){ log('Error: No tests found'); return 1; }
  let total = 0, passed = 0, failed = 0, flaky = 0; const fails = []; let n = 0;
  for (const t of list){
    n++;
    let err = null, attemptsFail = 0;
    if (envNeed.includes('BASE_URL') && !base) err = 'Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL\n  (baseURL đang rỗng: biến môi trường BASE_URL chưa được truyền vào)';
    else if (envNeed.includes('TEST_USER_PASSWORD') && t.tags.includes('@auth') && !sh.env.TEST_USER_PASSWORD) err = 'Error: Thiếu biến môi trường TEST_USER_PASSWORD';
    else if (envNeed.includes('TEST_USER_PASSWORD') && t.tags.includes('@auth') && sh.env.TEST_USER_PASSWORD !== CI_REPO.secrets.TEST_USER_PASSWORD) err = 'expect(page).toHaveURL(/dashboard/)\n  Nhận được: "' + (base || '') + '/login" (sai mật khẩu test)';
    else if (sh.scenario === 'bug' && t.bug) err = 'expect(page.getByRole(\'status\')).toContainText(\'' + (t.title.includes('bán') ? 'BÁN' : 'MUA') + ' 7203\')\n  Nhận được: "Đặt lệnh thành công: ' + (t.title.includes('bán') ? 'MUA' : 'BÁN') + ' 7203 x100"';
    else if (sh.scenario === 'webkit' && t.webkitBug && t.browser === 'webkit') err = 'locator.click: Timeout 5000ms exceeded.\n  Đang chờ getByRole(\'button\', { name: \'Theo dõi\' })';
    if (err) attemptsFail = retries + 1;
    else if (sh.scenario === 'flaky' && t.flaky) attemptsFail = 1;
    const attempts = Math.min(retries + 1, attemptsFail + (attemptsFail > retries ? 0 : 1));
    const bf = { chromium: 1, firefox: 1.4, webkit: 0.9 }[t.browser] || 1;
    total += t.d * scale * attempts * bf;
    const tag = '[' + t.project + '] › ' + t.file + ' › ' + t.title;
    if (attemptsFail > retries){ failed++; fails.push({ tag, err: err || 'expect(locator).toHaveCount(1)\n  Timeout 5000ms exceeded (dữ liệu tải chậm hơn thường lệ)' }); log('  ✘  ' + n + ' ' + tag + ' (' + fmtDur(t.d * scale) + ')' + (retries ? ' (đã thử ' + (retries + 1) + ' lần)' : '')); }
    else if (attemptsFail > 0){ flaky++; log('  ✓  ' + n + ' ' + tag + ' (' + fmtDur(t.d * scale) + ') (pass ở lần thử lại)'); }
    else { passed++; log('  ✓  ' + n + ' ' + tag + ' (' + fmtDur(t.d * scale) + ')'); }
  }
  const dur = total / Math.min(workers, list.length) + 8;
  for (const f of fails) log('\n  ' + f.tag + '\n\n    ' + f.err.replace(/\n/g, '\n    '));
  log('');
  if (failed) log('  ' + failed + ' failed');
  if (flaky) log('  ' + flaky + ' flaky');
  log('  ' + (passed + flaky) + ' passed (' + fmtDur(dur) + ')');
  const rep = a.reporter ? [[a.reporter]] : Array.isArray(cfg.reporter) ? cfg.reporter.map(r => Array.isArray(r) ? r : [r]) : cfg.reporter ? [[cfg.reporter]] : [[sh.ci ? 'dot' : 'list']];
  const names = rep.map(r => r[0]);
  if (names.includes('html')){ sh.fs.add('playwright-report'); if (!sh.ci){ const o = (rep.find(r => r[0] === 'html')[1] || {}).open; if (o !== 'never' && failed) log('\n  Serving HTML report at http://localhost:9323. Press Ctrl+C to quit.'); } }
  if (names.includes('blob')) sh.fs.add('blob-report');
  if (names.includes('junit')) sh.fs.add('results.xml');
  if (names.includes('github')) for (const f of fails) sh.annotations.push({ level: 'error', text: f.tag });
  if (failed || flaky || (cfg.use && cfg.use.trace === 'on')) sh.fs.add('test-results');
  sh.time += dur;
  sh.summary = { total: list.length, passed, failed, flaky, workers: Math.min(workers, list.length), retries, projects: [...new Set(list.map(t => t.project))], shard: a.shard, baseURL: base || '', tests: list.map(t => t.title), grep: a.grep || cfg.grep || null, reporters: names };
  sh.summaries.push(sh.summary);
  return failed ? 1 : 0;
}

/* ---------- Shell mô phỏng ---------- */
function ciMask(s, secretVals){ let out = String(s); for (const v of secretVals) if (v && v.length > 2) out = out.split(v).join('***'); return out; }
async function ciShell(script, sh){
  const lines = [];
  let buf = '';
  for (const raw of String(script).split('\n')){
    const l = raw.replace(/\s+$/, '');
    if (l.endsWith('\\')){ buf += l.slice(0, -1) + ' '; continue; }
    buf += l; if (buf.trim()) lines.push(buf.trim()); buf = '';
  }
  if (buf.trim()) lines.push(buf.trim());
  for (const line of lines){
    if (line.startsWith('#')) continue;
    for (const part of line.split(/\s*&&\s*/)){
      const code = await ciCommand(part, sh);
      if (code !== 0){ sh.log('Error: Process completed with exit code ' + code + '.'); return code; }
    }
  }
  return 0;
}
async function ciCommand(cmdRaw, sh){
  const log = sh.log;
  let cmd = cmdRaw.replace(/\$\{(\w+)\}|\$(\w+)/g, (m, a, b) => { const k = a || b; return sh.env[k] !== undefined ? sh.env[k] : ''; });
  const localEnv = {};
  let m;
  while ((m = cmd.match(/^(\w+)=("[^"]*"|'[^']*'|\S*)\s+/))){ localEnv[m[1]] = m[2].replace(/^['"]|['"]$/g, ''); cmd = cmd.slice(m[0].length); }
  const saved = sh.env; if (Object.keys(localEnv).length){ sh.env = { ...sh.env, ...localEnv }; if (localEnv.CI) sh.ci = true; }
  try {
    const args = ciSplitArgs(cmd); const c = args[0];
    if (!c) return 0;
    if (c === 'echo'){ log(args.slice(1).join(' ')); return 0; }
    if (c === 'exit'){ return Number(args[1] || 0); }
    if (c === 'node' && (args[1] === '-v' || args[1] === '--version')){ log('v' + sh.node + '.11.0'); return 0; }
    if (c === 'npm' && (args[1] === '-v' || args[1] === '--version')){ log('10.8.2'); return 0; }
    if (c === 'ls'){ log(['package.json', 'package-lock.json', 'playwright.config.ts', 'tests', ...sh.fs].join('  ')); return 0; }
    if (c === 'pwd'){ log('/home/runner/work/sandemo-e2e/sandemo-e2e'); return 0; }
    if (c === 'npm' && (args[1] === 'ci' || args[1] === 'install' || args[1] === 'i')){
      if (!sh.checkout){ log('npm ERR! code ENOENT\nnpm ERR! syscall open\nnpm ERR! path /home/runner/work/sandemo-e2e/sandemo-e2e/package.json\nnpm ERR! enoent Could not read package.json\n(Chưa có mã nguồn: thiếu bước actions/checkout trước đó.)'); return 254; }
      const t = sh.cacheHit ? 12 : args[1] === 'ci' ? 45 : 70;
      if (args[1] !== 'ci') sh.warnings.push('Trong CI nên dùng "npm ci" thay cho "npm install": cài đúng phiên bản trong package-lock.json và nhanh hơn.');
      log((sh.cacheHit ? '(dùng lại thư viện từ cache) ' : '') + '\nadded 187 packages, and audited 188 packages in ' + t + 's\n\nfound 0 vulnerabilities');
      sh.deps = true; sh.time += t; sh.npmInstalled = args[1]; return 0;
    }
    if (c === 'npm' && (args[1] === 'test' || args[1] === 't' || args[1] === 'run' || args[1] === 'run-script')){
      const name = args[1] === 'run' || args[1] === 'run-script' ? args[2] : 'test';
      const extra = args.slice(args[1] === 'run' || args[1] === 'run-script' ? 3 : 2); const dd = extra.indexOf('--'); const pass = dd >= 0 ? extra.slice(dd + 1) : extra;
      let pkg; try { pkg = ciPkg(sh.files); } catch (e){ log(e.message); return 1; }
      if (!pkg){ log('npm ERR! enoent Could not read package.json'); return 254; }
      const script = pkg.scripts && pkg.scripts[name];
      if (!name){ log('Lifecycle scripts included in ' + (pkg.name || 'project') + ':\n' + Object.entries(pkg.scripts || {}).map(([k, v]) => '  ' + k + '\n    ' + v).join('\n')); return 0; }
      if (!script){ log('npm ERR! Missing script: "' + name + '"\n\nnpm ERR! To see a list of scripts, run:\nnpm ERR!   npm run'); return 1; }
      log('\n> ' + (pkg.name || 'project') + '@' + (pkg.version || '1.0.0') + ' ' + name + '\n> ' + script + (pass.length ? ' ' + pass.join(' ') : '') + '\n');
      return await ciCommand(script + (pass.length ? ' ' + pass.map(x => /\s/.test(x) ? '"' + x + '"' : x).join(' ') : ''), sh);
    }
    let rest = null;
    if (c === 'npx' && args[1] === 'playwright') rest = args.slice(2);
    else if (c === 'playwright') rest = args.slice(1);
    if (rest){
      if (!sh.deps){ log('npm ERR! could not determine executable to run\n(Chưa cài thư viện. Hãy chạy npm ci trước.)'); return 1; }
      const sub = rest[0];
      if (sub === 'test') return await ciPlaywrightTest(rest.slice(1), sh);
      if (sub === 'install' || sub === 'install-deps'){
        const withDeps = sub === 'install-deps' || rest.includes('--with-deps');
        let br = rest.slice(1).filter(x => !x.startsWith('-'));
        if (sub === 'install-deps'){ sh.sysDeps = true; log('Installing dependencies... (sudo apt-get install ...)'); sh.time += 35; return 0; }
        if (!br.length) br = ['chromium', 'firefox', 'webkit'];
        for (const b of br){ if (!['chromium', 'firefox', 'webkit', 'chrome', 'msedge'].includes(b)){ log('Error: Invalid installation targets: \'' + b + '\'. Expecting one of: chromium, firefox, webkit'); return 1; } sh.browsers.add(b === 'chrome' || b === 'msedge' ? 'chromium' : b); log('Downloading ' + b + ' (playwright build) ... 100%'); }
        if (withDeps){ sh.sysDeps = true; log('Installing dependencies... done'); }
        sh.installed = br; sh.time += br.length * 25 + (withDeps ? 30 : 0); return 0;
      }
      if (sub === 'merge-reports'){
        const dir = rest.slice(1).filter(x => !x.startsWith('-')).pop();
        const repI = rest.findIndex(x => x.startsWith('--reporter')); const rep = repI >= 0 ? (rest[repI].includes('=') ? rest[repI].split('=')[1] : rest[repI + 1]) : 'list';
        const blobs = (sh.dirs[dir ? dir.replace(/^\.\//, '').replace(/\/$/, '') : ''] || []);
        if (!dir || !blobs.length){ log('Error: No report files found in ' + (dir || '(chưa chỉ định thư mục)') + '\n(Hãy tải các blob report về thư mục này bằng actions/download-artifact trước.)'); return 1; }
        log('Merging ' + blobs.length + ' blob reports...');
        if (rep.includes('html')) sh.fs.add('playwright-report');
        sh.merged = blobs.length; sh.time += 15; return 0;
      }
      if (sub === 'show-report'){ if (!sh.fs.has('playwright-report')){ log('Error: No report found at "playwright-report"'); return 1; } log('Serving HTML report at http://localhost:9323. Press Ctrl+C to quit.'); return 0; }
      if (sub === '--version' || sub === '-V'){ log('Version 1.48.2'); return 0; }
      log('(sân tập mô phỏng) playwright ' + sub); return 0;
    }
    if (c === 'npx' && args[1] === 'tsc'){
      if (!sh.deps){ log('npm ERR! could not determine executable to run'); return 1; }
      if (sh.scenario === 'type-error'){ log('tests/order/place-order.spec.ts(18,31): error TS2345: Argument of type \'number\' is not assignable to parameter of type \'string\'.\n\nFound 1 error in tests/order/place-order.spec.ts:18'); sh.time += 10; return 2; }
      log('(không có lỗi TypeScript)'); sh.time += 10; return 0;
    }
    if (c === 'curl'){
      const url = args.slice(1).find(x => /^https?:\/\//.test(x));
      const di = args.findIndex(x => x === '-d' || x === '--data' || x === '--data-raw');
      const body = di >= 0 ? args[di + 1] : '';
      if (!url){ log('curl: (3) URL using bad/illegal format or missing URL\n(Có thể secret chưa được khai báo hoặc tên secret bị sai nên URL rỗng.)'); return 3; }
      sh.notifications.push({ url, body }); log('ok'); sh.time += 1; return 0;
    }
    if (c === 'cat' || c === 'mkdir' || c === 'cd' || c === 'true' || c === 'printenv' || c === 'env'){ if (c === 'printenv' || c === 'env') log(Object.entries(sh.env).map(([k, v]) => k + '=' + v).join('\n')); return 0; }
    sh.warnings.push('Sân tập bỏ qua lệnh chưa hỗ trợ: ' + cmd);
    log('(sân tập mô phỏng: bỏ qua lệnh "' + cmd + '")'); return 0;
  } finally { sh.env = saved; if (localEnv.CI) sh.ci = !!(saved.CI); }
}
