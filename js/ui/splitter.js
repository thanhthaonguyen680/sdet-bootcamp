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
