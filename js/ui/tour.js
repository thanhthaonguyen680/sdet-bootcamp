/* Hướng dẫn nhanh: tự hiện lần đầu, xem lại bằng nút ?. */

const TOUR = [
  { sel: '.weeks', title: 'Chọn tuần học', text: 'Khóa học có ' + CURRICULUM.weeks.length + ' tuần, từ JavaScript nền tảng đến Playwright, CI/CD và dùng AI để viết test. Rê chuột vào từng tuần để xem tuần đó học gì.' },
  { sel: '#side', title: 'Danh sách bài', text: 'Các bài của tuần đang chọn. Chấm tròn cho biết trạng thái: xanh là đã pass, đỏ là chưa đạt, xám đậm là đang làm dở.' },
  { sel: '#menuBtn', title: 'Danh sách bài', text: 'Bấm vào đây để mở danh sách bài của tuần. Chấm tròn cho biết trạng thái: xanh là đã pass, đỏ là chưa đạt, xám đậm là đang làm dở.' },
  { sel: '.seg', title: 'Bài giảng, Đề bài, Lời giải', text: 'Bắt đầu từ Bài giảng: đọc và bấm Chạy ví dụ. Sau đó sang Đề bài để làm. Lời giải chỉ nên mở khi đã tự làm 15–20 phút.' },
  { sel: '.editor', title: 'Ô soạn code', text: 'Viết code ở đây. Code tự lưu trên trình duyệt này, đóng tab hay tải lại trang vẫn còn.' },
  { sel: '#runBtn', title: 'Chạy', text: 'Chạy code để xem kết quả ở tab Console bên dưới. Phím tắt: Ctrl + Enter.' },
  { sel: '#checkBtn', title: 'Kiểm tra bài', text: 'Chạy các test case chấm tự động. Pass hết thì bài được tính là xong, ô tiến độ trên cùng chuyển xanh và hiện nút Sang bài tiếp.' },
  { sel: '#helpBtn', title: 'Cần nhắc lại?', text: 'Rê chuột vào nút bất kỳ để xem giải thích. Bấm nút ? này để xem lại hướng dẫn.' },
];
let tourActive = false, tourIdx = 0, tourEls = null, tourReturn = null;
// Bỏ qua phần tử bị ẩn hoặc nằm ngoài màn hình theo chiều ngang (menu trượt trên điện thoại).
function tourVisible(el){ if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.right > 0 && r.left < innerWidth; }
function startTour(){
  hideTip();
  tourReturn = document.activeElement;
  tourActive = true;
  const block = document.createElement('div'); block.className = 'tour-block';
  const spot = document.createElement('div'); spot.className = 'tour-spot';
  const card = document.createElement('div'); card.className = 'tour-card';
  card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true'); card.setAttribute('aria-labelledby', 'tourTitle');
  card.innerHTML = '<h2 id="tourTitle"></h2><p id="tourText"></p><div class="tour-foot"><span class="tour-step" id="tourStep"></span>' +
    '<button type="button" class="btn ghost small" id="tourSkip">Bỏ qua</button><button type="button" class="btn small" id="tourPrev">Trước</button><button type="button" class="btn primary small" id="tourNext">Tiếp</button></div>';
  document.body.append(block, spot, card);
  tourEls = { block, spot, card };
  card.querySelector('#tourSkip').addEventListener('click', endTour);
  card.querySelector('#tourPrev').addEventListener('click', () => tourGo(-1));
  card.querySelector('#tourNext').addEventListener('click', () => tourGo(1));
  tourIdx = -1; tourGo(1);
}
function tourSteps(){ return TOUR.filter(t => tourVisible(document.querySelector(t.sel))); }
function tourGo(dir){
  const steps = tourSteps();
  tourIdx += dir;
  if (tourIdx >= steps.length) return endTour();
  tourIdx = Math.max(0, tourIdx);
  const step = steps[tourIdx], c = tourEls.card;
  c.querySelector('#tourTitle').textContent = step.title;
  c.querySelector('#tourText').textContent = step.text;
  c.querySelector('#tourStep').textContent = (tourIdx + 1) + ' / ' + steps.length;
  c.querySelector('#tourPrev').hidden = tourIdx === 0;
  c.querySelector('#tourNext').textContent = tourIdx === steps.length - 1 ? 'Bắt đầu học' : 'Tiếp';
  document.querySelector(step.sel).scrollIntoView({ block: 'nearest' });
  tourPlace();
  c.querySelector('#tourNext').focus();
}
function tourPlace(){
  if (!tourActive) return;
  const step = tourSteps()[tourIdx]; if (!step) return;
  const r = document.querySelector(step.sel).getBoundingClientRect(), pad = 6;
  const { spot, card } = tourEls;
  Object.assign(spot.style, { top: (r.top - pad) + 'px', left: (r.left - pad) + 'px', width: (r.width + pad * 2) + 'px', height: (r.height + pad * 2) + 'px' });
  const w = card.offsetWidth, h = card.offsetHeight, gap = 14, m = 16;
  const fits = [
    [r.bottom + gap, r.left + r.width / 2 - w / 2, r.bottom + gap + h <= innerHeight - m],
    [r.top - gap - h, r.left + r.width / 2 - w / 2, r.top - gap - h >= m],
    [r.top, r.right + gap, r.right + gap + w <= innerWidth - m],
    [r.top, r.left - gap - w, r.left - gap - w >= m],
  ].find(f => f[2]) || [innerHeight / 2 - h / 2, innerWidth / 2 - w / 2];
  card.style.top = Math.max(m, Math.min(fits[0], innerHeight - h - m)) + 'px';
  card.style.left = Math.max(m, Math.min(fits[1], innerWidth - w - m)) + 'px';
}
function endTour(){
  if (!tourActive) return;
  tourActive = false;
  Object.values(tourEls).forEach(el => el.remove()); tourEls = null;
  state.onboarded = true; saveState();
  if (tourReturn && tourReturn.focus) tourReturn.focus();
}
window.addEventListener('resize', tourPlace);
document.addEventListener('keydown', e => {
  if (!tourActive) return;
  if (e.key === 'Escape'){ e.preventDefault(); endTour(); }
  else if (e.key === 'Tab'){
    const btns = [...tourEls.card.querySelectorAll('button:not([hidden])')];
    const i = btns.indexOf(document.activeElement);
    e.preventDefault();
    btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
  }
}, true);
$('#helpBtn').addEventListener('click', startTour);
