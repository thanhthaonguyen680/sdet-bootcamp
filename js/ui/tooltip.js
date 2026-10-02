/* Tooltip: phần tử có data-tip hiện giải thích khi rê chuột hoặc focus bàn phím. */

const tipEl = document.createElement('div');
tipEl.className = 'tip'; tipEl.id = 'tip'; tipEl.setAttribute('role', 'tooltip'); tipEl.hidden = true;
document.body.appendChild(tipEl);
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
let tipTarget = null, tipPending = null, tipTimer = null;
function showTip(el){
  tipPending = null; tipTarget = el;
  tipEl.innerHTML = (el.dataset.tipTitle ? '<strong>' + esc(el.dataset.tipTitle) + '</strong>' : '') + esc(el.dataset.tip);
  tipEl.hidden = false; el.setAttribute('aria-describedby', 'tip');
  const r = el.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
  let top = r.bottom + 8; if (top + h > innerHeight - 8) top = r.top - h - 8;
  tipEl.style.top = Math.max(8, top) + 'px';
  tipEl.style.left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 8)) + 'px';
}
function hideTip(){
  clearTimeout(tipTimer); tipPending = null;
  if (tipTarget) tipTarget.removeAttribute('aria-describedby');
  tipTarget = null; tipEl.hidden = true;
}
document.addEventListener('mouseover', e => {
  if (!canHover.matches || tourActive) return;
  const el = e.target.closest('[data-tip]');
  if (el && (el === tipTarget || el === tipPending)) return;
  hideTip();
  if (el){ tipPending = el; tipTimer = setTimeout(() => showTip(el), 400); }
});
document.addEventListener('mouseout', e => { if (!e.relatedTarget) hideTip(); });
document.addEventListener('focusin', e => {
  const el = e.target.closest('[data-tip]');
  if (el && !tourActive && el.matches(':focus-visible')) showTip(el); else hideTip();
});
document.addEventListener('focusout', hideTip);
document.addEventListener('pointerdown', hideTip);
document.addEventListener('scroll', hideTip, true);
document.addEventListener('keydown', e => { if (e.key === 'Escape') hideTip(); });
