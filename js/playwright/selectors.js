/* Mô phỏng Playwright: áp dụng từng bước tìm phần tử (getBy..., locator, filter, nth). */

function pwApply(roots, step, doc){
  if (step.kind === 'nth'){ const i = step.i < 0 ? roots.length + step.i : step.i; return roots[i] ? [roots[i]] : []; }
  if (step.kind === 'filter'){
    const o = step.opts || {};
    return roots.filter(el => {
      if (o.hasText !== undefined && !pwMatch(el.textContent, o.hasText, false)) return false;
      if (o.hasNotText !== undefined && pwMatch(el.textContent, o.hasNotText, false)) return false;
      if (o.has && o.has._resolveFrom([el]).length === 0) return false;
      if (o.hasNot && o.hasNot._resolveFrom([el]).length > 0) return false;
      if (o.visible !== undefined && pwVisible(el) !== o.visible) return false;
      return true;
    });
  }
  const out = [];
  for (const r of roots){
    const all = () => pwAllIn(r);
    const o = step.opts || {};
    switch (step.kind){
      case 'css': {
        let found;
        try { found = r.querySelectorAll(step.sel); }
        catch (e){ throw pwErr('Selector CSS không hợp lệ: ' + step.sel + (/:has-text|:text\(/.test(step.sel) ? '\n(Sân tập chưa hỗ trợ :has-text(), hãy dùng .filter({ hasText: ... }))' : '')); }
        out.push(...found); break;
      }
      case 'xpath': {
        let ex = step.sel.replace(/^xpath=/, '');
        if (r.nodeType !== 9 && ex.startsWith('/')) ex = '.' + ex;
        let snap;
        try { snap = doc.evaluate(ex, r, null, 7, null); }
        catch (e){ throw pwErr('XPath không hợp lệ: ' + step.sel); }
        for (let i = 0; i < snap.snapshotLength; i++){ const n = snap.snapshotItem(i); if (n.nodeType === 1) out.push(n); }
        break;
      }
      case 'role':
        out.push(...all().filter(el => {
          if (pwRole(el) !== step.role) return false;
          if (!o.includeHidden && pwHiddenA11y(el)) return false;
          if (o.name !== undefined && !pwMatch(pwName(el), o.name, o.exact)) return false;
          if (o.level !== undefined && el.tagName !== 'H' + o.level && el.getAttribute('aria-level') !== String(o.level)) return false;
          if (o.checked !== undefined && !!el.checked !== o.checked) return false;
          if (o.pressed !== undefined && (el.getAttribute('aria-pressed') === 'true') !== o.pressed) return false;
          if (o.disabled !== undefined && !!el.disabled !== o.disabled) return false;
          return true;
        }));
        break;
      case 'text': {
        const cands = all().filter(el => !['SCRIPT', 'STYLE', 'TITLE', 'HEAD'].includes(el.tagName) && pwMatch(pwTextOf(el), step.text, o.exact));
        out.push(...cands.filter(el => !cands.some(c => c !== el && el.contains(c))));
        break;
      }
      case 'label':
        for (const el of all()){
          if (el.tagName === 'LABEL' && el.control && pwMatch(pwTextName(el, el.control), step.text, o.exact)) out.push(el.control);
          else if (el.getAttribute('aria-label') && pwMatch(el.getAttribute('aria-label'), step.text, o.exact)) out.push(el);
          else if (el.getAttribute('aria-labelledby') && pwMatch(pwName(el), step.text, o.exact)) out.push(el);
        }
        break;
      case 'placeholder': out.push(...all().filter(el => el.hasAttribute('placeholder') && pwMatch(el.getAttribute('placeholder'), step.text, o.exact))); break;
      case 'testid': out.push(...all().filter(el => el.hasAttribute('data-testid') && (step.text instanceof RegExp ? step.text.test(el.getAttribute('data-testid')) : el.getAttribute('data-testid') === step.text))); break;
      case 'alt': out.push(...all().filter(el => el.hasAttribute('alt') && pwMatch(el.getAttribute('alt'), step.text, o.exact))); break;
      case 'title': out.push(...all().filter(el => el.hasAttribute('title') && pwMatch(el.getAttribute('title'), step.text, o.exact))); break;
    }
  }
  return pwOrder(out);
}
function pwSelStep(sel){
  const s = String(sel).trim();
  return (s.startsWith('/') || s.startsWith('(') || s.startsWith('xpath=')) ? { kind: 'xpath', sel: s } : { kind: 'css', sel: s };
}
