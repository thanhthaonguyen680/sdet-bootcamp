/* Mô phỏng Playwright: vai trò, tên truy cập (accessible name), mô tả phần tử. */

/* ---------- Bộ máy locator ---------- */
const PW_TIMEOUT = 4000;
const pwNorm = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
function pwMatch(actual, expected, exact){
  if (expected instanceof RegExp){ expected.lastIndex = 0; return expected.test(pwNorm(actual)); }
  const a = pwNorm(actual), e = pwNorm(expected);
  return exact ? a === e : a.toLowerCase().includes(e.toLowerCase());
}
function pwErr(msg){ const e = new Error(msg); e.name = 'Error'; e.__pw = true; return e; }
function pwHiddenA11y(el){
  for (let n = el; n && n.nodeType === 1; n = n.parentElement){
    if (n.hidden || n.getAttribute('aria-hidden') === 'true') return true;
    const cs = n.ownerDocument.defaultView.getComputedStyle(n);
    if (cs.display === 'none' || cs.visibility === 'hidden') return true;
  }
  return false;
}
function pwVisible(el){
  if (!el || !el.isConnected) return false;
  const cs = el.ownerDocument.defaultView.getComputedStyle(el);
  if (cs.visibility === 'hidden') return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}
const INPUT_ROLES = { button: 'button', submit: 'button', reset: 'button', image: 'button', checkbox: 'checkbox', radio: 'radio', range: 'slider', number: 'spinbutton', search: 'searchbox', hidden: null };
const NAME_FROM_CONTENT = new Set(['button', 'link', 'heading', 'cell', 'columnheader', 'rowheader', 'row', 'option', 'checkbox', 'radio', 'tab', 'menuitem', 'switch', 'tooltip', 'treeitem']);
function pwRole(el, forName){
  const r = el.getAttribute('role'); if (r && r.trim()) return r.trim().split(/\s+/)[0];
  const t = el.tagName.toLowerCase();
  switch (t){
    case 'a': return el.hasAttribute('href') ? 'link' : null;
    case 'button': return 'button';
    case 'input': { const ty = (el.getAttribute('type') || 'text').toLowerCase(); return Object.prototype.hasOwnProperty.call(INPUT_ROLES, ty) ? INPUT_ROLES[ty] : 'textbox'; }
    case 'textarea': return 'textbox';
    case 'select': return (el.multiple || el.size > 1) ? 'listbox' : 'combobox';
    case 'option': return 'option';
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': return 'heading';
    case 'img': return el.getAttribute('alt') === '' ? 'presentation' : 'img';
    case 'table': return 'table';
    case 'tr': return 'row';
    case 'td': return 'cell';
    case 'th': return 'columnheader';
    case 'thead': case 'tbody': case 'tfoot': return 'rowgroup';
    case 'ul': case 'ol': return 'list';
    case 'li': return 'listitem';
    case 'nav': return 'navigation';
    case 'main': return 'main';
    case 'header': return 'banner';
    case 'footer': return 'contentinfo';
    case 'aside': return 'complementary';
    case 'fieldset': return 'group';
    case 'dialog': return 'dialog';
    case 'p': return 'paragraph';
    case 'hr': return 'separator';
    case 'form': return forName ? null : (pwName(el) ? 'form' : null);
    case 'section': return forName ? null : (pwName(el) ? 'region' : null);
  }
  return null;
}
function pwTextName(node, skip){
  let s = '';
  for (const c of node.childNodes){
    if (c.nodeType === 3) s += c.textContent;
    else if (c.nodeType === 1){
      if (c === skip || c.hidden || c.getAttribute('aria-hidden') === 'true') continue;
      const tag = c.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE') continue;
      if (tag === 'IMG') s += ' ' + (c.getAttribute('alt') || '') + ' ';
      else if (c.getAttribute('aria-label')) s += ' ' + c.getAttribute('aria-label') + ' ';
      else s += ' ' + pwTextName(c, skip) + ' ';
    }
  }
  return s;
}
function pwName(el){
  const doc = el.ownerDocument;
  const lb = el.getAttribute('aria-labelledby');
  if (lb) return pwNorm(lb.split(/\s+/).map(id => { const n = doc.getElementById(id); return n ? pwTextName(n) : ''; }).join(' '));
  const al = el.getAttribute('aria-label'); if (al && al.trim()) return pwNorm(al);
  const t = el.tagName.toLowerCase();
  if (t === 'input' || t === 'select' || t === 'textarea'){
    const ty = (el.getAttribute('type') || '').toLowerCase();
    if (t === 'input' && ['button', 'submit', 'reset'].includes(ty)) return pwNorm(el.value || (ty === 'submit' ? 'Submit' : ty === 'reset' ? 'Reset' : ''));
    if (el.labels && el.labels.length) return pwNorm([...el.labels].map(l => pwTextName(l, el)).join(' '));
    return pwNorm(el.getAttribute('title') || el.getAttribute('placeholder') || '');
  }
  if (t === 'img') return pwNorm(el.getAttribute('alt') || el.getAttribute('title') || '');
  if (t === 'fieldset'){ const lg = el.querySelector('legend'); return lg ? pwNorm(pwTextName(lg)) : ''; }
  if (t === 'table'){ const c = el.querySelector('caption'); return c ? pwNorm(pwTextName(c)) : ''; }
  if (NAME_FROM_CONTENT.has(pwRole(el, true))) return pwNorm(pwTextName(el));
  return pwNorm(el.getAttribute('title') || '');
}
function pwTextOf(el){
  if (el.tagName === 'INPUT' && ['button', 'submit', 'reset'].includes((el.type || '').toLowerCase())) return el.value;
  return el.textContent;
}
function pwDescribe(el){
  if (!el || el.nodeType !== 1) return String(el);
  const t = el.tagName.toLowerCase();
  let a = '';
  if (el.id) a += ' id="' + el.id + '"';
  const cls = [...el.classList].filter(c => !c.startsWith('__pw')).join(' ');
  if (cls) a += ' class="' + cls + '"';
  for (const n of ['type', 'name', 'role', 'data-testid', 'placeholder', 'aria-label']) if (el.hasAttribute(n)) a += ' ' + n + '="' + el.getAttribute(n) + '"';
  let txt = pwNorm(el.textContent); if (txt.length > 32) txt = txt.slice(0, 30) + '…';
  const voidTag = ['input', 'img', 'br', 'hr'].includes(t);
  return '<' + t + a + '>' + (voidTag ? '' : txt + '</' + t + '>');
}
const pwQ = v => v instanceof RegExp ? String(v) : "'" + String(v).replace(/'/g, "\\'") + "'";
function pwOptsDesc(o){
  const parts = Object.entries(o || {}).filter(([, v]) => v !== undefined).map(([k, v]) => k + ': ' + (typeof v === 'string' || v instanceof RegExp ? pwQ(v) : v instanceof PWLocator ? String(v) : String(v)));
  return parts.length ? '{ ' + parts.join(', ') + ' }' : '';
}
function pwStepDesc(s){
  const o = pwOptsDesc(s.opts);
  switch (s.kind){
    case 'css': case 'xpath': return 'locator(' + pwQ(s.sel) + ')';
    case 'role': return 'getByRole(' + pwQ(s.role) + (o ? ', ' + o : '') + ')';
    case 'text': return 'getByText(' + pwQ(s.text) + (o ? ', ' + o : '') + ')';
    case 'label': return 'getByLabel(' + pwQ(s.text) + (o ? ', ' + o : '') + ')';
    case 'placeholder': return 'getByPlaceholder(' + pwQ(s.text) + (o ? ', ' + o : '') + ')';
    case 'testid': return 'getByTestId(' + pwQ(s.text) + ')';
    case 'alt': return 'getByAltText(' + pwQ(s.text) + ')';
    case 'title': return 'getByTitle(' + pwQ(s.text) + ')';
    case 'nth': return s.i === 0 ? 'first()' : s.i === -1 ? 'last()' : 'nth(' + s.i + ')';
    case 'filter': return 'filter(' + o + ')';
  }
  return s.kind;
}
function pwOrder(list){
  const uniq = [...new Set(list)];
  uniq.sort((a, b) => (a === b ? 0 : (a.compareDocumentPosition(b) & 4 ? -1 : 1)));
  return uniq;
}
const pwAllIn = root => [...root.querySelectorAll('*')];
