/* Mô phỏng Playwright MCP: ảnh chụp cấu trúc trang (accessibility snapshot) kèm mã ref.

   Định dạng giống Playwright MCP, mỗi dòng một phần tử:
     - button "Đặt lệnh" [disabled] [ref=e31]
   Role và tên lấy bằng pwRole / pwName, tức đúng thứ mà getByRole dùng để tìm phần tử.

   Vòng đời của ref (giống bản thật):
   - Phần tử giữ nguyên ref qua nhiều lần chụp, miễn là nó chưa bị vẽ lại và role, tên không đổi.
   - Phần tử mới (sau khi điều hướng, tải lại, hay vẽ lại bảng) nhận ref mới với số lớn hơn.
   - Mở "trình duyệt mới" (App.reset, ví dụ mỗi lần chạy test) thì mọi ref bị xóa. */

const MCP_REFS = { seq: 0, byEl: new WeakMap(), byRef: new Map() };
function mcpResetRefs(){ MCP_REFS.seq = 0; MCP_REFS.byEl = new WeakMap(); MCP_REFS.byRef = new Map(); }
App.resetHooks.push(mcpResetRefs);

function mcpRefOf(el, role, name){
  const c = MCP_REFS.byEl.get(el);
  if (c && c.role === role && c.name === name) return c.ref;
  const ref = 'e' + (++MCP_REFS.seq);
  MCP_REFS.byEl.set(el, { ref, role, name });
  MCP_REFS.byRef.set(ref, el);
  return ref;
}
// Phần tử ứng với một ref, hoặc null nếu ref chưa từng có hay phần tử đã bị gỡ khỏi trang.
function mcpElementOf(ref){
  const el = MCP_REFS.byRef.get(String(ref));
  return el && el.isConnected ? el : null;
}

// Đặt chuỗi trong nháy kép khi YAML có thể hiểu sai (giống yamlStringNeedsQuotes của Playwright).
function mcpYaml(str){
  const needs = str.length === 0 || /^\s|\s$/.test(str) || /^-/.test(str) || /[\n:](\s|$)/.test(str) || /\s#/.test(str) ||
    /^[&*\],?!>|@"'#%]/.test(str) || /[{}`]/.test(str) || /^\[/.test(str) ||
    !isNaN(Number(str)) || ['y', 'n', 'yes', 'no', 'true', 'false', 'on', 'off', 'null'].includes(str.toLowerCase());
  return needs ? JSON.stringify(str) : str;
}

const MCP_SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'HEAD', 'TITLE', 'NOSCRIPT']);
// Role của các thẻ định dạng chữ, chỉ hiện trong snapshot (Playwright thật cũng hiện chúng).
const MCP_TEXT_ROLES = { CODE: 'code', STRONG: 'strong', EM: 'emphasis' };
const MCP_VALUE_ROLES = new Set(['textbox', 'spinbutton', 'searchbox']);
function mcpHidden(el){
  if (el.hidden || el.getAttribute('aria-hidden') === 'true') return true;
  const cs = el.ownerDocument.defaultView.getComputedStyle(el);
  return cs.display === 'none' || cs.visibility === 'hidden';
}

// Cây rút gọn: phần tử có role được giữ lại; thẻ không có role (div, span...) bị "làm phẳng", chỉ giữ chữ và con của nó.
function mcpItems(parent){
  const items = [];
  const pushText = t => { const last = items[items.length - 1]; if (last && last.text !== undefined) last.text += ' ' + t; else items.push({ text: t }); };
  for (const c of parent.childNodes){
    if (c.nodeType === 3){ const t = pwNorm(c.textContent); if (t) pushText(t); continue; }
    if (c.nodeType !== 1 || MCP_SKIP_TAGS.has(c.tagName) || mcpHidden(c)) continue;
    const role = pwRole(c) || MCP_TEXT_ROLES[c.tagName];
    if (!role || role === 'presentation' || role === 'none'){
      for (const it of mcpItems(c)){ if (it.text !== undefined) pushText(it.text); else items.push(it); }
      continue;
    }
    items.push({ el: c, role, kids: mcpItems(c) });
  }
  return items;
}

function mcpRender(items, depth, lines){
  const pad = '  '.repeat(depth);
  for (const it of items){
    if (it.text !== undefined){ lines.push(pad + '- text: ' + mcpYaml(it.text)); continue; }
    const { el, role } = it, name = pwName(el), ref = mcpRefOf(el, role, name);
    let head = '- ' + role + (name ? ' ' + JSON.stringify(name) : '');
    if (role === 'heading') head += ' [level=' + (el.getAttribute('aria-level') || el.tagName.slice(1)) + ']';
    if ((role === 'checkbox' || role === 'radio') && el.checked) head += ' [checked]';
    if (role === 'option' && el.selected) head += ' [selected]';
    if (el.getAttribute('aria-pressed') === 'true') head += ' [pressed]';
    if (el.disabled) head += ' [disabled]';
    head += ' [ref=' + ref + ']';

    if (MCP_VALUE_ROLES.has(role)){
      // Ô role textbox có placeholder khác tên: placeholder và giá trị thành dòng con.
      const ph = role === 'textbox' ? el.getAttribute('placeholder') : null;
      if (ph && pwNorm(ph) !== name){
        lines.push(pad + head + ':', pad + '  - /placeholder: ' + mcpYaml(ph));
        if (el.value) lines.push(pad + '  - text: ' + mcpYaml(el.value));
      } else lines.push(pad + head + (el.value ? ': ' + mcpYaml(el.value) : ''));
      continue;
    }
    let kids = it.kids;
    const onlyText = kids.every(k => k.text !== undefined);
    if (onlyText && kids.length && pwNorm(kids.map(k => k.text).join(' ')) === name) kids = [];   // chữ trùng tên thì không lặp lại
    const url = role === 'link' ? el.getAttribute('href') : null;
    if (!kids.length && !url){ lines.push(pad + head); continue; }
    if (!url && kids.length === 1 && onlyText){ lines.push(pad + head + ': ' + mcpYaml(kids[0].text)); continue; }
    lines.push(pad + head + ':');
    if (url) lines.push(pad + '  - /url: ' + mcpYaml(url));
    mcpRender(kids, depth + 1, lines);
  }
}

// Ảnh chụp cấu trúc của cả trang, dạng chuỗi YAML như Playwright MCP trả về.
function mcpSnapshot(doc){
  if (!doc || !doc.body) return '';
  const lines = [];
  mcpRender(mcpItems(doc.body), 0, lines);
  return lines.join('\n');
}

// Mô tả ngắn của phần tử, dùng cho tham số "element" của các lệnh như browser_click.
function mcpDescribe(el){
  const role = pwRole(el) || el.tagName.toLowerCase(), name = pwName(el);
  return role + (name ? ' "' + name + '"' : '');
}
