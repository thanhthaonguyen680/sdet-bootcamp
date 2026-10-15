/* Nút "AI viết test": người học viết yêu cầu vào dòng "// AI: ..." trong ô soạn code. AI (ghi sẵn) đọc yêu cầu,
   tự làm trên trang web mẫu qua Playwright MCP, rồi viết test ngay bên dưới dòng yêu cầu.
   Các bước AI làm hiện ở tab Console; chi tiết từng lần gọi công cụ nằm trong mục "Xem AI làm gì bên trong".

   Bài khai báo trong thuộc tính mcp của tệp bài:
     mcp: {
       file: 'tests/mua.spec.ts',                  // bài project: tệp chứa dòng "// AI:" và nhận test (mặc định: ô soạn code)
       rules: 'AGENTS.md',                         // bài project: tệp rule AI đọc trước mỗi lần viết test
       tasks: [{                                   // việc AI làm được; chọn việc đầu tiên mà yêu cầu khớp mọi match
         match: [/dang nhap/, /dat lenh/],         // so trên yêu cầu đã bỏ dấu, chữ thường
         name: 'tên test', reply: 'AI trả lời trước khi làm', done: 'AI nói sau khi viết xong test',
         plan: (prompt, p, rules) => ({ name, reply, steps, done }),   // không bắt buộc: dựng các mục trên theo yêu cầu và rule
         steps: [
           { label: 'Mở trang Đăng nhập', tool: 'browser_navigate', url: '/login' },
           { label: 'Điền email', tool: 'browser_type', target: "page.getByLabel('Email')", text: '...' },
           { tool: 'browser_wait_for', text: 'Bảng giá' },           // không có label: chạy nhưng không hiện thành một bước
           { label: 'Kiểm tra: ...', expect: "await expect(...)...;" },   // chạy thật rồi ghi vào test (code: tương tự, cho dòng không phải kiểm tra)
           { label: '...', tool: 'browser_click', target: '...', rewrite: code => '...' },   // AI viết lại dòng code trước khi ghi vào test
         ],
       }],
       unknown: 'AI trả lời khi không hiểu yêu cầu',
     }
   target chỉ dùng để tìm phần tử khi soạn bài; AI gọi công cụ bằng ref trong snapshot, như bản thật.
   Code trong test là code mà công cụ sinh ra (js/mcp/codegen.js), không viết tay trong tệp bài. */

const MCP_AI = { log: [], calls: [], busy: false, runId: 0, box: null };
const aiBtn = document.getElementById('aiBtn');
const mcpPage = () => new PWPage(App, { slowMo: 200 });
const mcpNorm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

// Dòng "// AI: ..." và các dòng comment viết tiếp ngay dưới nó. Trả về yêu cầu và vị trí kết thúc khối yêu cầu.
function mcpPromptOf(text){
  const lines = text.split('\n'), i = lines.findIndex(l => /^\s*\/\/\s*AI\s*:/i.test(l));
  if (i < 0) return null;
  let j = i + 1;
  while (j < lines.length && /^\s*\/\/\s*\S/.test(lines[j])) j++;
  const prompt = lines.slice(i, j).map(l => l.replace(/^\s*\/\/\s*(AI\s*:)?\s*/i, '')).join(' ').trim();
  return { prompt, end: lines.slice(0, j).join('\n').length };
}

// Bấm "AI viết test"
async function mcpWrite(){
  if (MCP_AI.busy || running || !current.mcp) return;
  const ex = current, spec = ex.mcp;
  if (proj && spec.file && proj.active !== spec.file) openFile(spec.file);
  const found = mcpPromptOf(ta.value);
  clearConsole(false); showTab('console');
  if (!found || !found.prompt){
    logLine('warn', 'Chưa có yêu cầu cho AI. Viết một dòng bắt đầu bằng // AI: rồi bấm lại, ví dụ:\n// AI: Đăng nhập rồi đặt lệnh mua 100 cổ phiếu Toyota, viết test cho luồng này');
    return;
  }
  const run = ++MCP_AI.runId, alive = () => run === MCP_AI.runId && current === ex;
  MCP_AI.busy = running = true; mcpButtons();
  MCP_AI.log = []; MCP_AI.calls = [];
  MCP_AI.box = document.createElement('div'); MCP_AI.box.className = 'ai-run'; consoleEl.appendChild(MCP_AI.box);
  if (briefView !== 'app'){ briefView = 'app'; renderBrief(); }
  try {
    await App.init(); App.reset(); App.navigate('about:blank');
    const rules = spec.rules && proj ? (proj.files[spec.rules] || '') : '';
    const p = mcpNorm(found.prompt), match = (spec.tasks || []).find(t => (t.match || []).every(re => re.test(p)));
    const task = match && match.plan ? { ...match, ...match.plan(found.prompt, p, rules) } : match;
    mcpPush({ who: 'user', text: esc(found.prompt) });
    await pwSleep(300); if (!alive()) return;
    if (!task){
      mcpPush({ who: 'ai', text: spec.unknown || 'Mình chưa rõ bạn muốn làm gì trên Sàn Demo. Hãy nói rõ trang nào, thao tác gì và cần kiểm tra điều gì.' });
      return;
    }
    mcpPush({ who: 'ai', text: task.reply || 'Mình làm ngay.' });
    const steps = { who: 'steps', items: [] }, lines = [];
    mcpPush(steps);
    for (const st of task.steps){
      await pwSleep(250); if (!alive()) return;
      const item = st.label ? { label: st.label, state: 'run' } : null;
      if (item){ steps.items.push(item); mcpShow(); }
      const code = st.expect || st.code;
      const err = code ? await mcpCheck(code) : await mcpDo(st, lines);
      if (!alive()) return;
      if (code && !err) lines.push(code);
      if (item) item.state = err ? 'fail' : 'ok';
      if (err){
        if (!item) steps.items.push({ label: st.tool, state: 'fail' });
        mcpPush({ who: 'ai', text: '<span class="mcp-err">Mình bị kẹt ở bước này: ' + esc(err) + '</span>' });
        return;
      }
      mcpShow();
    }
    // Giữ nguyên phần đầu tệp tới hết khối yêu cầu, thay mọi thứ bên dưới bằng test mới
    const head = ta.value.slice(0, mcpPromptOf(ta.value).end);
    replaceRange(0, ta.value.length, head + '\n\n' + mcpTestCode(task.name, lines), 0);
    ta.scrollTop = 0; syncScroll(); flushSave();
    mcpPush({ who: 'ai', text: (task.done || 'Xong!') + ' Test đã nằm trong ô soạn code, bên dưới dòng yêu cầu. Bấm <b>Chạy</b> để chạy thử.' });
  } catch (e){
    console.error(e);
    if (alive()) mcpPush({ who: 'ai', text: '<span class="mcp-err">Lỗi khi chạy phiên: ' + esc(e.message) + '</span>' });
  } finally {
    if (run === MCP_AI.runId){ MCP_AI.busy = running = false; mcpButtons(); }
  }
}

// Một bước gọi công cụ. Code của thao tác (không tính chờ và snapshot) được ghi vào test.
async function mcpDo(st, lines){
  const args = {};
  for (const k of ['url', 'text', 'values', 'time']) if (st[k] !== undefined) args[k] = st[k];
  if (st.target){
    const el = await mcpResolve(st.target);
    if (!MCP_REFS.byEl.get(el)) await mcpRun('browser_snapshot', {});     // phần tử chưa có ref: chụp lại trang như AI thật
    const known = MCP_REFS.byEl.get(el);
    args.element = st.element || mcpDescribe(el);
    args.ref = known ? known.ref : '?';
  }
  const res = await mcpRun(st.tool, args);
  if (res.error) return res.error;
  if (res.code && st.tool !== 'browser_wait_for') lines.push(st.rewrite ? st.rewrite(res.code) : res.code);
  return null;
}
// Chạy thật một dòng code trên trang trước khi đưa vào test.
async function mcpCheck(code){
  try { await compile(code, ['page', 'expect'])(mcpPage(), pwMakeExpect(() => null)); return null; }
  catch (e){ return e.message; }
}
// Phần tử duy nhất ứng với một biểu thức locator (dùng khi soạn bài).
async function mcpResolve(expr){
  const loc = await compile('return (' + expr + ');', ['page'])(mcpPage());
  const els = loc._resolve();
  if (els.length !== 1) throw new Error('Bài khai báo "' + expr + '" khớp ' + els.length + ' phần tử, cần đúng 1');
  return els[0];
}
async function mcpRun(tool, args){
  const entry = { tool, args, res: null };
  MCP_AI.calls.push(entry); mcpShow();
  entry.res = await mcpCall(mcpPage(), tool, args);
  mcpShow();
  return entry.res;
}
function mcpTestCode(name, lines){
  return "import { test, expect } from '@playwright/test';\n\ntest(" + mcpQ(name) + ', async ({ page }) => {\n' +
    lines.flatMap(l => l.split('\n')).map(l => '  ' + l + '\n').join('') + '});\n';
}

/* ---------- Hiển thị trong tab Console ---------- */
function mcpPush(entry){ MCP_AI.log.push(entry); mcpShow(); }
const mcpSnapHtml = snap => esc(snap).replace(/\[ref=(e\d+)\]/g, '[ref=<button type="button" class="mcp-ref" data-ref="$1">$1</button>]');
const MCP_ICON = { run: '<span class="mcp-spin" aria-label="đang làm"></span>', ok: '<span class="mcp-ok" aria-label="xong">✓</span>', fail: '<span class="mcp-no" aria-label="lỗi">✕</span>' };
function mcpEntryHtml(e){
  if (e.who === 'steps') return '<ol class="mcp-steps">' + e.items.map(it => '<li class="' + it.state + '">' + MCP_ICON[it.state] + '<span>' + esc(it.label) + '</span></li>').join('') + '</ol>';
  return '<div class="mcp-msg ' + e.who + '"><span class="who">' + (e.who === 'user' ? 'Yêu cầu' : 'AI') + '</span>' + e.text + '</div>';
}
function mcpCallHtml(e){
  const args = Object.fromEntries(Object.entries(e.args).filter(([, v]) => v !== undefined));
  let body = '';
  if (!e.res) body = '<div class="mcp-page">Đang chạy…</div>';
  else {
    const r = e.res;
    if (r.error) body += '<div class="mcp-err">Lỗi: ' + esc(r.error) + '</div>';
    if (r.code) body += '<div class="mcp-lbl">Code Playwright đã chạy</div><pre><code>' + highlight(r.code) + '</code></pre>';
    if (r.url) body += '<div class="mcp-page">Trang: <code>' + esc(r.url) + '</code> · ' + esc(r.title) + '</div>';
    if (r.snapshot) body += '<details><summary>Snapshot AI nhận được</summary><pre class="mcp-snap">' + mcpSnapHtml(r.snapshot) + '</pre></details>';
  }
  return '<div class="mcp-call"><div class="mcp-call-head"><b>' + esc(e.tool) + '</b> <span>' + esc(JSON.stringify(args)) + '</span></div><div class="mcp-call-body">' + body + '</div></div>';
}
function mcpShow(){
  const box = MCP_AI.box;
  if (!box || !box.isConnected) return;
  const inner = box.querySelector('.mcp-inner'), open = !!(inner && inner.open);
  box.innerHTML = MCP_AI.log.map(mcpEntryHtml).join('') + (MCP_AI.calls.length
    ? '<details class="mcp-inner"' + (open ? ' open' : '') + '><summary>Xem AI làm gì bên trong<span>(' + MCP_AI.calls.length + ' lần gọi công cụ)</span></summary>' +
      '<p class="muted-s">Mỗi bước, AI gọi một công cụ của Playwright MCP. Công cụ trả về code Playwright vừa chạy và <b>snapshot</b> (cấu trúc trang) để AI chọn bước tiếp theo. Rê chuột vào một ref để xem phần tử trên trang.</p>' +
      '<div class="mcp-calls">' + MCP_AI.calls.map(mcpCallHtml).join('') + '</div></details>' : '');
  consoleEl.scrollTop = consoleEl.scrollHeight;
}
// Nút "AI viết test" chỉ hiện ở bài có mcp; ở các bài đó nó là nút chính, Chạy thành nút phụ.
function mcpButtons(){
  const on = !!(current && current.mcp);
  aiBtn.hidden = !on; runBtn.classList.toggle('primary', !on);
  aiBtn.disabled = MCP_AI.busy; aiBtn.textContent = MCP_AI.busy ? 'AI đang làm…' : 'AI viết test';
  runBtn.disabled = checkBtn.disabled = running;
}

/* ---------- Sự kiện ---------- */
aiBtn.addEventListener('click', mcpWrite);
{
  // Rê chuột vào ref trong snapshot: phần tử tương ứng sáng lên trong trang web mẫu.
  let lit = null;
  consoleEl.addEventListener('mouseover', e => {
    const b = e.target.closest('.mcp-ref'), el = b ? mcpElementOf(b.dataset.ref) : null;
    if (lit && lit !== el) lit.classList.remove('__pw-find');
    lit = el; if (el) el.classList.add('__pw-find');
  });
  consoleEl.addEventListener('mouseleave', () => { if (lit) lit.classList.remove('__pw-find'); lit = null; });
}
