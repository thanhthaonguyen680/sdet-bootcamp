/* Kéo đổi độ rộng giữa phần code và phần bài giảng. */

const mainEl = document.querySelector('.main'), splitter = $('#splitter');
const BRIEF_MIN = 300, EDITOR_MIN = 360;
function briefKey(){ return mainEl.classList.contains('wide') ? 'wide' : 'normal'; }
function applyBriefWidth(){
  const w = (state.briefW || {})[briefKey()];
  if (w) mainEl.style.setProperty('--brief-w', w + 'px'); else mainEl.style.removeProperty('--brief-w');
}
function setBriefWidth(px){
  const max = mainEl.getBoundingClientRect().width - EDITOR_MIN;
  px = Math.round(Math.max(BRIEF_MIN, Math.min(px, max)));
  state.briefW = Object.assign({}, state.briefW, { [briefKey()]: px });
  mainEl.style.setProperty('--brief-w', px + 'px');
  splitter.setAttribute('aria-valuenow', px);
}
splitter.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  e.preventDefault(); hideTip();
  splitter.setPointerCapture(e.pointerId);
  document.body.classList.add('resizing');
});
splitter.addEventListener('pointermove', e => {
  if (splitter.hasPointerCapture(e.pointerId)) setBriefWidth(mainEl.getBoundingClientRect().right - e.clientX);
});
splitter.addEventListener('lostpointercapture', () => { document.body.classList.remove('resizing'); saveState(); });
splitter.addEventListener('dblclick', () => {
  if (state.briefW) delete state.briefW[briefKey()];
  applyBriefWidth(); saveState();
});
splitter.addEventListener('keydown', e => {
  const step = e.shiftKey ? 80 : 24, cur = $('#briefWrap').getBoundingClientRect().width;
  if (e.key === 'ArrowLeft') setBriefWidth(cur + step);
  else if (e.key === 'ArrowRight') setBriefWidth(cur - step);
  else return;
  e.preventDefault(); saveState();
});

/* Kéo đổi chiều cao khung Console (Console, Kết quả kiểm tra, Báo cáo); nút ▾ thu gọn chỉ còn hàng tab. */
const panelSplit = $('#panelSplit'), panelToggle = $('#panelToggle');
const PANEL_MIN = 120, PANEL_COLLAPSE = 80, EDITOR_MIN_H = 160;
function applyPanel(){
  const collapsed = !!state.panelCollapsed;
  mainEl.classList.toggle('panel-collapsed', collapsed);
  if (collapsed) mainEl.style.setProperty('--panel-row', 'auto');
  else if (state.panelH) mainEl.style.setProperty('--panel-row', state.panelH + 'px');
  else mainEl.style.removeProperty('--panel-row');
  panelToggle.textContent = collapsed ? '▴ Mở rộng' : '▾ Thu gọn';
  panelToggle.setAttribute('aria-expanded', !collapsed);
}
function setPanelHeight(px){
  const box = mainEl.getBoundingClientRect(), max = box.height - $('.toolbar').getBoundingClientRect().height - EDITOR_MIN_H;
  if (px < PANEL_COLLAPSE){ state.panelCollapsed = true; applyPanel(); return; }   // kéo gần hết xuống: thu gọn
  state.panelCollapsed = false;
  state.panelH = Math.round(Math.max(PANEL_MIN, Math.min(px, max)));
  applyPanel();
}
// Gọi khi có kết quả cần xem (Chạy, Kiểm tra bài, bấm tab): đang thu gọn thì mở ra.
function revealPanel(){ if (state.panelCollapsed){ state.panelCollapsed = false; applyPanel(); saveState(); } }
panelToggle.addEventListener('click', () => { state.panelCollapsed = !state.panelCollapsed; applyPanel(); saveState(); });
let panelHBefore;   // chiều cao trước khi kéo: kéo xuống để thu gọn thì lần mở sau trả về chiều cao này
panelSplit.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  e.preventDefault(); hideTip();
  panelHBefore = state.panelH;
  panelSplit.setPointerCapture(e.pointerId);
  document.body.classList.add('resizing-v');
});
panelSplit.addEventListener('pointermove', e => {
  if (panelSplit.hasPointerCapture(e.pointerId)) setPanelHeight(mainEl.getBoundingClientRect().bottom - e.clientY);
});
panelSplit.addEventListener('lostpointercapture', () => {
  document.body.classList.remove('resizing-v');
  if (state.panelCollapsed){ if (panelHBefore) state.panelH = panelHBefore; else delete state.panelH; }
  saveState();
});
panelSplit.addEventListener('dblclick', () => { delete state.panelH; state.panelCollapsed = false; applyPanel(); saveState(); });
panelSplit.addEventListener('keydown', e => {
  const step = e.shiftKey ? 80 : 24, cur = state.panelCollapsed ? 0 : $('.panel').getBoundingClientRect().height;
  if (e.key === 'ArrowUp') setPanelHeight(Math.max(cur, PANEL_MIN - step) + step);
  else if (e.key === 'ArrowDown') setPanelHeight(cur - step);
  else return;
  e.preventDefault(); saveState();
});
