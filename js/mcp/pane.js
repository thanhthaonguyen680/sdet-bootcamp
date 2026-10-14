/* Khung "Giao việc cho AI": người học giao việc bằng một câu, AI (ghi sẵn) tự làm từ đầu đến cuối qua Playwright MCP
   rồi viết test. Chi tiết từng lần gọi công cụ nằm trong mục "Xem AI làm gì bên trong".

   Bài khai báo trong thuộc tính mcp của tệp bài:
     mcp: {
       suggest: ['câu gợi ý 1', ...],              // nút bấm để điền sẵn câu giao việc
       tasks: [{                                   // việc AI làm được; chọn việc đầu tiên mà câu giao việc khớp mọi match
         match: [/dang nhap/, /dat lenh/],         // so trên câu đã bỏ dấu, chữ thường
         name: 'tên test', reply: 'AI trả lời trước khi làm', done: 'AI nói sau khi viết xong test',
         plan: (prompt, p) => ({ name, reply, steps, done }),   // không bắt buộc: dựng các mục trên theo câu giao việc
         steps: [
           { label: 'Mở trang Đăng nhập', tool: 'browser_navigate', url: '/login' },
           { label: 'Điền email', tool: 'browser_type', target: "page.getByLabel('Email')", text: '...' },
           { tool: 'browser_wait_for', text: 'Bảng giá' },           // không có label: chạy nhưng không hiện thành một bước
           { label: 'Kiểm tra: ...', expect: "await expect(...)...;" },   // chạy thật rồi ghi vào test
         ],
       }],
       unknown: 'AI trả lời khi không hiểu câu giao việc',
     }
   target chỉ dùng để tìm phần tử khi soạn bài; AI gọi công cụ bằng ref trong snapshot, như bản thật.
   Code trong test là code mà công cụ sinh ra (js/mcp/codegen.js), không viết tay trong tệp bài. */

const MCP_PANE = { exId: null, log: [], calls: [], busy: false, runId: 0 };
const mcpPage = () => new PWPage(App, { slowMo: 200 });
const mcpNorm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

// Gọi từ renderBrief mỗi khi tab "Giao việc cho AI" đang mở.
function mcpOpen(ex){
  if (MCP_PANE.exId !== ex.id){
    MCP_PANE.runId++;
    Object.assign(MCP_PANE, { exId: ex.id, log: [], calls: [], busy: false });
    document.getElementById('mcpPrompt').value = '';
  }
  mcpRenderAll();
}

async function mcpNewSession(){
  MCP_PANE.runId++;
  MCP_PANE.exId = current.id; MCP_PANE.log = []; MCP_PANE.calls = [];
  await App.init();
  App.reset(); App.navigate('about:blank');
}

async function mcpAsk(prompt){
  prompt = prompt.trim();
  if (MCP_PANE.busy || !prompt) return;
  const spec = current.mcp || {};
  MCP_PANE.busy = true; mcpRenderBusy();
  await mcpNewSession();
  const run = MCP_PANE.runId, alive = () => run === MCP_PANE.runId;
  mcpPush({ who: 'user', text: esc(prompt) });
  try {
    const p = mcpNorm(prompt), found = (spec.tasks || []).find(t => (t.match || []).every(re => re.test(p)));
    const task = found && found.plan ? { ...found, ...found.plan(prompt, p) } : found;
    await pwSleep(400); if (!alive()) return;
    if (!task){
      mcpPush({ who: 'ai', text: spec.unknown || 'Mình chưa rõ bạn muốn làm gì trên Sàn Demo. Hãy nói rõ trang nào, thao tác gì và cần kiểm tra điều gì, hoặc chọn một gợi ý ở trên.' });
      return;
    }
    mcpPush({ who: 'ai', text: task.reply || 'Mình làm ngay.' });
    const steps = { who: 'steps', items: [] }, lines = [];
    mcpPush(steps);
    for (const st of task.steps){
      await pwSleep(250); if (!alive()) return;
      const item = st.label ? { label: st.label, state: 'run' } : null;
      if (item){ steps.items.push(item); mcpRenderAll(); }
      const err = st.expect ? await mcpCheck(st.expect) : await mcpDo(st, lines);
      if (!alive()) return;
      if (st.expect && !err) lines.push(st.expect);
      if (item) item.state = err ? 'fail' : 'ok';
      if (err){
        if (!item) steps.items.push({ label: st.tool, state: 'fail' });
        mcpPush({ who: 'ai', text: '<span class="mcp-err">Mình bị kẹt ở bước này: ' + esc(err) + '</span>' });
        return;
      }
      mcpRenderAll();
    }
    mcpPush({ who: 'test', code: mcpTestCode(task.name, lines) });
    if (task.done) mcpPush({ who: 'ai', text: task.done });
  } catch (e){
    console.error(e);
    mcpPush({ who: 'ai', text: '<span class="mcp-err">Lỗi khi chạy phiên: ' + esc(e.message) + '</span>' });
  } finally {
    if (alive()){ MCP_PANE.busy = false; mcpRenderBusy(); }
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
  if (res.code && st.tool !== 'browser_wait_for') lines.push(res.code);
  return null;
}
// Chạy thật một câu kiểm tra trên trang trước khi đưa vào test.
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
  MCP_PANE.calls.push(entry); mcpRenderCalls();
  entry.res = await mcpCall(mcpPage(), tool, args);
  mcpRenderCalls();
  return entry.res;
}
function mcpTestCode(name, lines){
  return "import { test, expect } from '@playwright/test';\n\ntest(" + mcpQ(name) + ', async ({ page }) => {\n' +
    lines.flatMap(l => l.split('\n')).map(l => '  ' + l + '\n').join('') + '});\n';
}

/* ---------- Hiển thị ---------- */
function mcpPush(entry){ MCP_PANE.log.push(entry); mcpRenderAll(); }
const mcpSnapHtml = snap => esc(snap).replace(/\[ref=(e\d+)\]/g, '[ref=<button type="button" class="mcp-ref" data-ref="$1">$1</button>]');
const MCP_ICON = { run: '<span class="mcp-spin" aria-label="đang làm"></span>', ok: '<span class="mcp-ok" aria-label="xong">✓</span>', fail: '<span class="mcp-no" aria-label="lỗi">✕</span>' };
function mcpEntryHtml(e, i){
  if (e.who === 'steps') return '<ol class="mcp-steps">' + e.items.map(it => '<li class="' + it.state + '">' + MCP_ICON[it.state] + '<span>' + esc(it.label) + '</span></li>').join('') + '</ol>';
  if (e.who === 'test') return '<div class="mcp-test"><div class="mcp-lbl">Test AI viết</div><pre><code>' + highlight(e.code) + '</code></pre>' +
    '<div class="mcp-test-foot"><button type="button" class="btn small primary" data-mcp-use="' + i + '">Đưa vào ô soạn code</button><button type="button" class="btn ghost small" data-mcp-copy="' + i + '">Sao chép</button></div></div>';
  return '<div class="mcp-msg ' + e.who + '"><span class="who">' + (e.who === 'user' ? 'Bạn' : 'AI') + '</span>' + e.text + '</div>';
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
function mcpRenderAll(){
  const spec = (current && current.mcp) || {};
  document.getElementById('mcpChips').innerHTML = (spec.suggest || []).length
    ? '<span class="mcp-chips-lbl">Gợi ý:</span>' + spec.suggest.map((s, i) => '<button type="button" class="mcp-chip" data-mcp-suggest="' + i + '">' + esc(s) + '</button>').join('') : '';
  const log = document.getElementById('mcpLog');
  log.innerHTML = MCP_PANE.log.length ? MCP_PANE.log.map(mcpEntryHtml).join('')
    : '<p class="muted-s">Gõ một câu giao việc rồi bấm <b>Giao việc</b>. AI sẽ tự mở trang, thao tác trên trang web bên dưới và viết test cho bạn.</p>';
  log.scrollTop = log.scrollHeight;
  mcpRenderCalls(); mcpRenderBusy();
}
function mcpRenderCalls(){
  const inner = document.getElementById('mcpInner');
  inner.hidden = !MCP_PANE.calls.length;
  document.getElementById('mcpInnerCount').textContent = ' (' + MCP_PANE.calls.length + ' lần gọi công cụ)';
  document.getElementById('mcpCalls').innerHTML = MCP_PANE.calls.map(mcpCallHtml).join('');
}
function mcpRenderBusy(){
  const btn = document.getElementById('mcpSend');
  btn.disabled = MCP_PANE.busy; btn.textContent = MCP_PANE.busy ? 'AI đang làm…' : 'Giao việc';
}

/* ---------- Sự kiện ---------- */
{
  const input = document.getElementById('mcpPrompt');
  const send = () => mcpAsk(input.value);
  document.getElementById('mcpSend').addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing){ e.preventDefault(); send(); } });
  document.getElementById('mcpChips').addEventListener('click', e => {
    const b = e.target.closest('[data-mcp-suggest]'); if (!b) return;
    input.value = current.mcp.suggest[+b.dataset.mcpSuggest]; input.focus();
  });
  document.getElementById('mcpLog').addEventListener('click', async e => {
    const b = e.target.closest('[data-mcp-use], [data-mcp-copy]'); if (!b) return;
    const use = b.dataset.mcpUse !== undefined, entry = MCP_PANE.log[+(use ? b.dataset.mcpUse : b.dataset.mcpCopy)];
    if (use){ replaceRange(0, ta.value.length, entry.code, 0); ta.scrollTop = 0; syncScroll(); toast('Đã đưa test vào ô soạn code. Bấm Chạy để thử.'); }
    else {
      try { await navigator.clipboard.writeText(entry.code); toast('Đã sao chép test'); }
      catch (err){ toast('Không sao chép được, hãy bôi đen và chép tay'); }
    }
  });
  // Rê chuột vào ref trong snapshot: phần tử tương ứng sáng lên trong trang web mẫu.
  const calls = document.getElementById('mcpCalls');
  let lit = null;
  calls.addEventListener('mouseover', e => {
    const b = e.target.closest('.mcp-ref'), el = b ? mcpElementOf(b.dataset.ref) : null;
    if (lit && lit !== el) lit.classList.remove('__pw-find');
    lit = el; if (el) el.classList.add('__pw-find');
  });
  calls.addEventListener('mouseleave', () => { if (lit) lit.classList.remove('__pw-find'); lit = null; });
}
