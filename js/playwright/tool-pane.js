/* Khung trang web mẫu: công cụ Thử locator và Chọn phần tử. */

/* ---------- Khung "Trang web": thanh địa chỉ, thử locator, chọn phần tử ---------- */
let pickMode = false;
function appPaneInit(){
  const input = document.getElementById('locInput'), out = document.getElementById('locOut');
  const tryLoc = async () => {
    const expr = input.value.trim(); if (!expr) return;
    await App.init();
    const page = new PWPage(App, {});
    let loc;
    try { loc = compile('return (' + expr + ');', ['page'])(page); }
    catch (e){ out.innerHTML = '<span class="bad">' + esc(explain(e)) + '</span>'; return; }
    loc = await loc;
    if (!(loc instanceof PWLocator)){ out.innerHTML = '<span class="bad">Biểu thức không trả về locator.</span>'; return; }
    let els;
    try { els = loc._resolve(); } catch (e){ out.innerHTML = '<span class="bad">' + esc(e.message) + '</span>'; return; }
    out.innerHTML = '<b class="' + (els.length === 1 ? 'good' : 'warnc') + '">' + els.length + ' phần tử</b>' + (els.length === 1 ? ' (duy nhất)' : els.length > 1 ? ' (thao tác click/fill sẽ báo lỗi strict mode)' : '') +
      (els.length ? '<ul>' + els.slice(0, 5).map(e => '<li><code>' + esc(pwDescribe(e)) + '</code></li>').join('') + (els.length > 5 ? '<li>…</li>' : '') + '</ul>' : '');
    els.forEach(el => el.classList.add('__pw-find'));
    if (els[0]) try { els[0].scrollIntoView({ block: 'nearest' }); } catch (e){}
    setTimeout(() => els.forEach(el => el.classList.remove('__pw-find')), 2500);
  };
  document.getElementById('locTry').addEventListener('click', tryLoc);
  input.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); tryLoc(); } });
  document.getElementById('appReload').addEventListener('click', async () => { await App.init(); App.navigate(App.path === 'about:blank' ? (current.route || '/login') : App.fullUrl()); });
  document.getElementById('appHome').addEventListener('click', async () => { await App.init(); App.reset(); App.navigate(current.route || '/login'); });
  const pickBtn = document.getElementById('appPick');
  let hoverEl = null;
  const stopPick = () => { pickMode = false; pickBtn.classList.remove('on'); pickBtn.textContent = 'Chọn phần tử'; if (hoverEl){ hoverEl.classList.remove('__pw-hover'); hoverEl = null; } };
  pickBtn.addEventListener('click', async () => {
    await App.init();
    if (pickMode){ stopPick(); return; }
    pickMode = true; pickBtn.classList.add('on'); pickBtn.textContent = 'Đang chọn… (bấm để hủy)';
    out.innerHTML = 'Rê chuột và bấm vào một phần tử trong trang web mẫu.';
    const d = App.doc;
    if (!d.__pickWired){
      d.__pickWired = true;
      d.addEventListener('mouseover', e => { if (!pickMode) return; if (hoverEl) hoverEl.classList.remove('__pw-hover'); hoverEl = e.target; hoverEl.classList.add('__pw-hover'); }, true);
      d.addEventListener('click', e => {
        if (!pickMode) return;
        e.preventDefault(); e.stopPropagation();
        const el = e.target; stopPick();
        showSuggestions(el);
      }, true);
    }
  });
  const showSuggestions = (el) => {
    const page = new PWPage(App, {});
    const sugg = [];
    const q = s => "'" + s.replace(/'/g, "\\'") + "'";
    const add = (expr, build, why) => { try { const n = build()._resolve().length; sugg.push({ expr, n, why }); } catch (e){} };
    const role = pwRole(el), name = pwName(el);
    if (role && name && name.length <= 50){
      add('page.getByRole(' + q(role) + ', { name: ' + q(name) + ' })', () => page.getByRole(role, { name }), 'theo vai trò và tên');
      add('page.getByRole(' + q(role) + ', { name: ' + q(name) + ', exact: true })', () => page.getByRole(role, { name, exact: true }), 'khớp chính xác tên');
    }
    if (el.labels && el.labels.length){ const lt = pwNorm(pwTextName(el.labels[0], el)); if (lt) add('page.getByLabel(' + q(lt) + ')', () => page.getByLabel(lt), 'theo nhãn'); }
    const ph = el.getAttribute('placeholder');
    if (ph) add('page.getByPlaceholder(' + q(ph) + ')', () => page.getByPlaceholder(ph), 'theo placeholder');
    const txt = pwNorm(el.textContent);
    if (txt && txt.length <= 40 && !['INPUT', 'SELECT', 'TEXTAREA', 'TABLE', 'TBODY', 'TR', 'BODY', 'MAIN', 'FORM'].includes(el.tagName)) add('page.getByText(' + q(txt) + ')', () => page.getByText(txt), 'theo chữ hiển thị');
    const tid = el.getAttribute('data-testid');
    if (tid) add('page.getByTestId(' + q(tid) + ')', () => page.getByTestId(tid), 'theo data-testid');
    if (el.id) add('page.locator(' + q('#' + el.id) + ')', () => page.locator('#' + el.id), /-[0-9a-f]{5}$/.test(el.id) ? 'cảnh báo: id sinh ngẫu nhiên, đổi sau mỗi lần tải trang' : 'theo id');
    const cls = [...el.classList].filter(c => !c.startsWith('__pw'));
    const css = el.tagName.toLowerCase() + (cls.length ? '.' + cls.join('.') : '');
    add('page.locator(' + q(css) + ')', () => page.locator(css), 'CSS theo thẻ và class');
    out.innerHTML = '<div>Phần tử: <code>' + esc(pwDescribe(el)) + '</code></div><div class="sugg-note">Gợi ý (bấm để thử):</div><ul class="sugg">' +
      sugg.map(s => '<li><button type="button" data-expr="' + esc(s.expr) + '"><code>' + esc(s.expr) + '</code></button><span class="' + (s.n === 1 ? 'good' : 'warnc') + '">' + s.n + ' phần tử · ' + s.why + '</span></li>').join('') + '</ul>';
  };
  out.addEventListener('click', e => { const b = e.target.closest('[data-expr]'); if (b){ input.value = b.dataset.expr; tryLoc(); } });
}
