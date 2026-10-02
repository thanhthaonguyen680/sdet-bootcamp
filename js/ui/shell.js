/* Menu trượt trên điện thoại, đổi giao diện sáng/tối, thông báo nhỏ, lưu khi thoát. */

const menuBtn = $('#menuBtn'), scrim = $('#scrim');
function openDrawer(){ sideEl.classList.add('open'); scrim.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); }
function closeDrawer(){ sideEl.classList.remove('open'); scrim.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
menuBtn.addEventListener('click', () => sideEl.classList.contains('open') ? closeDrawer() : openDrawer());
scrim.addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sideEl.classList.contains('open')) closeDrawer(); });

function applyTheme(){ if (state.theme) document.documentElement.setAttribute('data-theme', state.theme); else document.documentElement.removeAttribute('data-theme'); }
$('#themeBtn').addEventListener('click', () => {
  const dark = state.theme ? state.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  state.theme = dark ? 'light' : 'dark'; applyTheme(); saveState();
});

let toastTimer = null;
function toast(msg){ const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1800); }

window.addEventListener('beforeunload', flushSave);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushSave(); });
