/* Mô phỏng Playwright MCP: sinh locator cho phần tử mà AI vừa thao tác qua ref.

   Giống bản thật, locator được chọn sao cho DUY NHẤT tại thời điểm đó, theo thứ tự ưu tiên:
     getByRole(role, { name }) → getByLabel → getByPlaceholder → getByText → getByTestId
     → khoanh vùng theo phần tử cha có role và tên (dòng bảng, hộp thoại...) → nth().
   "Duy nhất lúc này" chưa chắc đã bền: khi phải khoanh theo dòng, tên dòng chứa cả giá,
   nên giá đổi là locator vỡ. Người viết test phải tự chọn chữ định danh ổn định. */

function mcpLocatorFor(el, page){
  const isUnique = loc => { try { const r = loc._resolve(); return r.length === 1 && r[0] === el; } catch (e){ return false; } };
  const pick = loc => ({ loc, expr: 'page.' + String(loc) });
  const role = pwRole(el), name = pwName(el);

  const own = [];
  if (role && name){ own.push(base => base.getByRole(role, { name }), base => base.getByRole(role, { name, exact: true })); }
  if (el.labels && el.labels.length){ const lt = pwNorm(pwTextName(el.labels[0], el)); if (lt) own.push(base => base.getByLabel(lt)); }
  const ph = el.getAttribute('placeholder'); if (ph) own.push(base => base.getByPlaceholder(ph));
  const txt = pwNorm(el.textContent);
  if (txt && txt.length <= 60 && !['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) own.push(base => base.getByText(txt), base => base.getByText(txt, { exact: true }));
  const tid = el.getAttribute('data-testid'); if (tid) own.push(base => base.getByTestId(tid));
  if (role && !name) own.push(base => base.getByRole(role));

  for (const make of own){ const loc = make(page); if (isUnique(loc)) return pick(loc); }

  // Khoanh vùng: tìm phần tử cha có role và tên duy nhất, rồi tìm phần tử bên trong nó.
  for (let a = el.parentElement; a && a !== page._doc.body; a = a.parentElement){
    const ar = pwRole(a); if (!ar || ['generic', 'presentation', 'none', 'cell', 'rowgroup', 'table', 'main'].includes(ar)) continue;
    const an = pwName(a); if (!an) continue;
    const scope = page.getByRole(ar, { name: an });
    const s = scope._resolve(); if (s.length !== 1 || s[0] !== a) continue;
    for (const make of own){ const loc = make(scope); if (isUnique(loc)) return pick(loc); }
  }

  if (role){
    const all = name ? page.getByRole(role, { name }) : page.getByRole(role);
    const i = all._resolve().indexOf(el);
    if (i >= 0) return pick(i === 0 ? all.first() : all.nth(i));
  }
  const css = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '');
  return pick(page.locator(css));
}
