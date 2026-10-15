// Kiểm tra toàn bộ khóa học bằng trình duyệt thật:
//   1. Trang nạp không lỗi (JavaScript, thiếu tệp, bài chưa được liệt kê trong CURRICULUM...).
//   2. Mọi bài có bộ chấm đều đạt khi nộp đúng lời giải của chính nó.
//
// Chạy:  npm run verify                       (tất cả các bài)
//        npm run verify -- --week=4           (chỉ một tuần)
//        npm run verify -- --only=1.1,w4.3    (chỉ vài bài)
//        npm run verify -- --workers=4        (số trình duyệt chạy song song, mặc định 3)
// Lần đầu cần:  npm install  rồi  npx playwright install chromium
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]), file = path.join(root, rel === '/' ? 'index.html' : rel);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise(r => server.listen(0, r));
const base = `http://localhost:${server.address().port}/`;
const browser = await chromium.launch();

async function openPage() {
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('js-week1-practice-v1', JSON.stringify({ onboarded: true })));
  const page = await ctx.newPage();
  const problems = [];
  page.on('pageerror', e => problems.push('lỗi JavaScript: ' + e.message));
  page.on('console', m => {
    if (!['error', 'warning'].includes(m.type()) || !m.location().url.startsWith(base)) return;   // bỏ qua lỗi tải font ngoài
    problems.push('console ' + m.type() + ': ' + m.text());
  });
  await page.goto(base);
  await page.waitForFunction(() => document.querySelectorAll('#side .nav-item').length > 0, null, { timeout: 60000 });
  return { ctx, page, problems };
}

// 1. Nạp trang
const first = await openPage();
let ids = await first.page.evaluate(() => EX.filter(e => e.tests).map(e => ({ id: e.id, week: e.week, solution: !!SOLUTIONS[e.id] })));
const noSolution = ids.filter(x => !x.solution).map(x => x.id);
if (args.week) ids = ids.filter(x => String(x.week) === String(args.week));
if (args.only) ids = ids.filter(x => String(args.only).split(',').includes(x.id));
const catalogProblems = [...first.problems];
for (const id of noSolution) catalogProblems.push(`bài ${id} có bộ chấm nhưng chưa có lời giải`);
// Tệp .js nằm trong content/ nhưng chưa ghi vào curriculum.js sẽ không bao giờ được nạp: học viên không thấy bài đó.
const listed = new Set(await first.page.evaluate(() => contentFiles()));
const onDisk = fs.readdirSync(path.join(root, 'content'), { recursive: true }).map(f => 'content/' + String(f).split(path.sep).join('/')).filter(f => f.endsWith('.js') && !['content/curriculum.js', 'content/helpers.js'].includes(f));
for (const f of onDisk) if (!listed.has(f)) catalogProblems.push(`${f} nằm trong content/ nhưng chưa được ghi vào content/curriculum.js`);
for (const f of listed) if (!fs.existsSync(path.join(root, f))) catalogProblems.push(`curriculum.js nhắc tới ${f} nhưng tệp không tồn tại`);
await first.ctx.close();

// 2. Chấm lời giải của từng bài (thử lần lượt các ví dụ của lời giải, lấy ví dụ đầu tiên đạt)
async function grade(page, id) {
  const n = await page.evaluate(id => SOLUTIONS[id].examples.length, id);
  let last;
  for (let k = 0; k < n; k++) {
    await page.evaluate(([id, k]) => {
      select(id === 'w2.1' ? '1.2' : 'w2.1');   // chuyển bài khác để select() không lưu đè code mới
      const ex = EX.find(e => e.id === id), e0 = SOLUTIONS[id].examples[k], code = typeof e0 === 'string' ? e0 : e0.code;
      delete state.status[id];
      if (ex.files) { const files = splitMarked(code); for (const f of Object.keys(ex.files)) if (!(f in files)) files[f] = ex.files[f]; state.codes[id] = JSON.stringify(files); }
      else state.codes[id] = code;
      select(id);
    }, [id, k]);
    await page.click('#checkBtn');
    await page.waitForFunction(() => !document.getElementById('paneTests').textContent.includes('Đang chấm') && !document.getElementById('checkBtn').disabled, null, { timeout: 240000 });
    last = await page.evaluate(() => ({ badge: document.getElementById('testBadge').textContent, pass: state.status[current.id] === 'pass', bad: [...document.querySelectorAll('#paneTests li.bad')].map(li => li.innerText.replace(/\s+/g, ' ').slice(0, 140)) }));
    if (last.pass) break;
  }
  return last;
}

const results = {}, queue = [...ids], workers = Math.max(1, +args.workers || 3);
await Promise.all(Array.from({ length: workers }, async () => {
  const { ctx, page, problems } = await openPage();
  for (let x; (x = queue.shift());) {
    results[x.id] = await grade(page, x.id);
    console.log((results[x.id].pass ? '  ✓ ' : '  ✕ ') + x.id.padEnd(7) + results[x.id].badge);
  }
  catalogProblems.push(...problems.filter(p => !catalogProblems.includes(p)));
  await ctx.close();
}));
await browser.close(); server.close();

const failed = Object.entries(results).filter(([, r]) => !r.pass);
console.log('\n' + (catalogProblems.length ? 'Vấn đề khi nạp trang:\n' + catalogProblems.map(p => '  - ' + p).join('\n') + '\n' : 'Trang nạp không lỗi.\n'));
for (const [id, r] of failed) console.log(`✕ ${id} (${r.badge})\n${r.bad.map(b => '    ' + b).join('\n')}`);
console.log(`Đạt ${ids.length - failed.length}/${ids.length} bài.`);
process.exit(failed.length || catalogProblems.length ? 1 : 0);
