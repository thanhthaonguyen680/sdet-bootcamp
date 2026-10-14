/* Khung "Phiên MCP": phát lại phiên AI ghi sẵn của bài, hoặc để người học tự gọi công cụ như AI.

   Bài khai báo phiên trong thuộc tính mcp của tệp bài:
     mcp: {
       prompt: 'yêu cầu của người dùng',
       steps: [
         { say: 'AI nói gì đó; {{ref:<locator>}} được thay bằng ref thật của phần tử' },
         { tool: 'browser_navigate', url: '/order' },
         { tool: 'browser_snapshot' },
         { tool: 'browser_click', target: "page.getByRole('button', { name: 'Đặt lệnh' })" },
         { tool: 'browser_type', target: '...', text: '...' },
         { tool: 'browser_select_option', target: '...', values: ['...'] },
         { tool: 'browser_wait_for', text: '...' },
       ],
     }
   target chỉ dùng để tìm phần tử khi soạn phiên; khung hiển thị đúng như AI thật gửi: { element, ref }. */

const MCP_PANE = { exId: null, log: [], draft: [], busy: false, runId: 0 };
const mcpPage = () => new PWPage(App, { slowMo: 200 });

// Gọi từ renderBrief mỗi khi tab "Phiên MCP" đang mở.
function mcpOpen(ex){
  if (MCP_PANE.exId === ex.id){ mcpRenderAll(); return; }
  mcpReplay();
}

async function mcpNewSession(){
  MCP_PANE.runId++;
  MCP_PANE.exId = current.id; MCP_PANE.log = []; MCP_PANE.draft = [];
  await App.init();
  App.reset(); App.navigate('about:blank');
  mcpRenderAll();
}

async function mcpReplay(){
  const ex = current;
  await mcpNewSession();
  const run = MCP_PANE.runId;
  const spec = ex.mcp || {};
  MCP_PANE.busy = true; mcpRenderBusy();
  try {
    if (spec.prompt) mcpPush({ who: 'user', text: esc(spec.prompt) });
    for (const st of spec.steps || []){
      await pwSleep(320);
      if (run !== MCP_PANE.runId) return;                    // đã bắt đầu phiên khác hoặc chuyển bài
      if (st.say){ mcpPush({ who: 'ai', text: await mcpFill(st.say) }); continue; }
      const args = {};
      for (const k of ['url', 'text', 'values', 'time']) if (st[k] !== undefined) args[k] = st[k];
      if (st.target){
        const el = await mcpResolve(st.target), known = MCP_REFS.byEl.get(el);
        args.element = st.element || mcpDescribe(el);
        args.ref = known ? known.ref : '(chưa có trong snapshot)';
      }
      await mcpRun(st.tool, args);
    }
  } catch (e){
    mcpPush({ who: 'ai', text: '<span class="mcp-err">Lỗi khi phát lại phiên: ' + esc(e.message) + '</span>' });
    console.error(e);
  } finally {
    if (run === MCP_PANE.runId){ MCP_PANE.busy = false; mcpRenderBusy(); }
  }
}

// Phần tử duy nhất ứng với một biểu thức locator (dùng khi soạn phiên).
async function mcpResolve(expr){
  const loc = await compile('return (' + expr + ');', ['page'])(mcpPage());
  const els = loc._resolve();
  if (els.length !== 1) throw new Error('Phiên MCP của bài: "' + expr + '" khớp ' + els.length + ' phần tử, cần đúng 1');
  return els[0];
}
async function mcpFill(text){
  let out = '', last = 0;
  for (const m of text.matchAll(/\{\{ref:(.+?)\}\}/g)){
    const k = MCP_REFS.byEl.get(await mcpResolve(m[1]));
    out += text.slice(last, m.index) + '<code>' + (k ? k.ref : '?') + '</code>'; last = m.index + m[0].length;
  }
  return out + text.slice(last);
}

async function mcpRun(tool, args){
  const entry = { who: 'call', tool, args, res: null };
  mcpPush(entry);
  entry.res = await mcpCall(mcpPage(), tool, args);
  if (entry.res.code && !entry.res.error) MCP_PANE.draft.push(entry.res.code);
  mcpRenderAll();
}

// Lệnh gõ tay: "browser_click e12", "click e12", "type e8 nội dung", "select_option e20 Chờ khớp", "wait_for Sony Group"
function mcpParse(line){
  const m = line.trim().match(/^(\S+)\s*([\s\S]*)$/); if (!m) return null;
  const tool = m[1].startsWith('browser_') ? m[1] : 'browser_' + m[1];
  const rest = m[2].trim(), unquote = s => s.replace(/^(['"])([\s\S]*)\1$/, '$2');
  const [ref, ...more] = rest.split(/\s+/), tail = unquote(rest.slice(ref ? ref.length : 0).trim());
  const target = () => { const el = mcpElementOf(ref); return { element: el ? mcpDescribe(el) : undefined, ref: ref || undefined }; };
  switch (tool){
    case 'browser_navigate': return { tool, args: { url: unquote(rest) } };
    case 'browser_click': return { tool, args: target() };
    case 'browser_type': return { tool, args: { ...target(), text: tail } };
    case 'browser_select_option': return { tool, args: { ...target(), values: [tail] } };
    case 'browser_wait_for': return { tool, args: /^\d+(\.\d+)?s?$/.test(rest) ? { time: parseFloat(rest) } : { text: unquote(rest) } };
    default: return { tool, args: {} };
  }
}
async function mcpManual(line){
  if (MCP_PANE.busy || !line.trim()) return;
  if (MCP_PANE.exId !== current.id) await mcpNewSession();
  const cmd = mcpParse(line);
  MCP_PANE.busy = true; mcpRenderBusy();
  try { await mcpRun(cmd.tool, cmd.args); } finally { MCP_PANE.busy = false; mcpRenderBusy(); }
}

/* ---------- Hiển thị ---------- */
function mcpPush(entry){ MCP_PANE.log.push(entry); mcpRenderAll(); }
const mcpSnapHtml = snap => esc(snap).replace(/\[ref=(e\d+)\]/g, '[ref=<button type="button" class="mcp-ref" data-ref="$1">$1</button>]');
function mcpEntryHtml(e){
  if (e.who !== 'call') return '<div class="mcp-msg ' + e.who + '"><span class="who">' + (e.who === 'user' ? 'Bạn' : 'AI') + '</span>' + e.text + '</div>';
  const args = Object.fromEntries(Object.entries(e.args).filter(([, v]) => v !== undefined));
  let body = '';
  if (!e.res) body = '<div class="mcp-page">Đang chạy…</div>';
  else {
    const r = e.res;
    if (r.error) body += '<div class="mcp-err">Lỗi: ' + esc(r.error) + '</div>';
    if (r.code) body += '<div class="mcp-lbl">Code Playwright đã chạy</div><pre><code>' + highlight(r.code) + '</code></pre>';
    if (r.url) body += '<div class="mcp-page">Trang: <code>' + esc(r.url) + '</code> · ' + esc(r.title) + '</div>';
    if (r.snapshot) body += r.snapshotOnly
      ? '<div class="mcp-lbl">Snapshot</div><pre class="mcp-snap">' + mcpSnapHtml(r.snapshot) + '</pre>'
      : '<details><summary>Snapshot sau thao tác</summary><pre class="mcp-snap">' + mcpSnapHtml(r.snapshot) + '</pre></details>';
  }
  return '<div class="mcp-call"><div class="mcp-call-head"><b>' + esc(e.tool) + '</b> <span>' + esc(JSON.stringify(args)) + '</span></div><div class="mcp-call-body">' + body + '</div></div>';
}
function mcpDraftText(){
  return "import { test, expect } from '@playwright/test';\n\ntest('test từ phiên MCP', async ({ page }) => {\n" +
    MCP_PANE.draft.map(l => '  ' + l + '\n').join('') +
    '  // Thêm assertion: phiên MCP chỉ ghi lại thao tác, không tự biết cần kiểm tra điều gì.\n});\n';
}
function mcpRenderAll(){
  const log = document.getElementById('mcpLog');
  log.innerHTML = MCP_PANE.log.length ? MCP_PANE.log.map(mcpEntryHtml).join('')
    : '<p class="muted-s">Chưa có gì. Bấm Phát lại phiên của AI, hoặc tự gọi công cụ ở ô bên dưới.</p>';
  log.scrollTop = log.scrollHeight;
  document.getElementById('mcpDraft').innerHTML = highlight(mcpDraftText());
  document.getElementById('mcpDraftCount').textContent = MCP_PANE.draft.length + ' dòng thao tác';
  mcpRenderBusy();
}
function mcpRenderBusy(){
  const hasScript = !!(current && current.mcp && (current.mcp.steps || []).some(s => s.tool));
  document.getElementById('mcpReplay').hidden = !hasScript;
  for (const id of ['mcpReplay', 'mcpRun', 'mcpClear']) document.getElementById(id).disabled = MCP_PANE.busy;
}

/* ---------- Sự kiện ---------- */
document.getElementById('mcpReplay').addEventListener('click', mcpReplay);
document.getElementById('mcpClear').addEventListener('click', mcpNewSession);
{
  const input = document.getElementById('mcpCmd');
  const send = () => { const v = input.value; input.value = ''; mcpManual(v); };
  document.getElementById('mcpRun').addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); send(); } });
  const log = document.getElementById('mcpLog');
  // Bấm vào ref trong snapshot: điền sẵn lệnh vào ô gọi công cụ.
  log.addEventListener('click', e => {
    const b = e.target.closest('.mcp-ref'); if (!b) return;
    input.value = (input.value.trim() || 'browser_click') + ' ' + b.dataset.ref;
    input.focus();
  });
  // Rê chuột vào ref: phần tử tương ứng sáng lên trong trang web mẫu.
  let lit = null;
  log.addEventListener('mouseover', e => {
    const b = e.target.closest('.mcp-ref'), el = b ? mcpElementOf(b.dataset.ref) : null;
    if (lit && lit !== el) lit.classList.remove('__pw-find');
    lit = el; if (el) el.classList.add('__pw-find');
  });
  log.addEventListener('mouseleave', () => { if (lit) lit.classList.remove('__pw-find'); lit = null; });
  document.getElementById('mcpCopy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(mcpDraftText()); toast('Đã sao chép bản nháp test'); }
    catch (e){ toast('Không sao chép được, hãy bôi đen và chép tay'); }
  });
}
