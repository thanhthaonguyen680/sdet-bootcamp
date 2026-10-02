/* Phần đề bài, bài giảng, lời giải và thanh công cụ của bài. */

let briefView = 'task';
const VIEW_TIPS = {
  lesson: 'Lý thuyết của bài. Đọc và bấm Chạy ví dụ trước khi làm bài.',
  task: 'Yêu cầu của bài và các gợi ý. Mở gợi ý lần lượt khi bị bí.',
  app: 'Trang Sàn Demo mà code test điều khiển, kèm công cụ thử locator.',
  ci: 'Mô phỏng GitHub Actions: chọn sự kiện rồi chạy pipeline.',
  solution: 'Lời giải chi tiết. Nên tự làm ít nhất 15–20 phút trước khi mở.',
};
function exampleBlock(list, i, src){
  const item = (list || [])[i];
  if (item == null) return '';
  const code = typeof item === 'string' ? item : item.code;
  const runnable = typeof item === 'string' || item.run !== false;
  return '<div class="ex-block"><pre><code>' + ((item && item.lang === 'yaml') ? highlightYaml : highlight)(code) + '</code></pre>' +
    (runnable ? '<div class="ex-foot"><button class="btn small" data-run-ex="' + src + ':' + i + '">' + (src === 'sol' ? 'Chạy lời giải' : 'Chạy ví dụ') + '</button></div>' : '') + '</div>';
}
function fillExamples(html, list, src){ return html.replace(/\{\{ex(\d+)\}\}/g, (m, i) => exampleBlock(list, +i, src)); }
function renderBrief(){
  const ex = current;
  const idx = EX.indexOf(ex);
  const lesson = LESSONS[ex.id];
  const sol = SOLUTIONS[ex.id];
  if ((briefView === 'lesson' && !lesson) || (briefView === 'solution' && !sol) || (briefView === 'app' && !ex.pw) || (briefView === 'ci' && !ex.ci)) briefView = 'task';
  let tag = ex.free ? '<span class="tag">Không chấm điểm</span>' : ex.tests ? '<span class="tag auto">Có chấm tự động</span>' : '<span class="tag">Tự đánh giá</span>';
  if (ex.optional) tag += '<span class="tag">Nâng cao, không bắt buộc</span>';
  if (sol && state.revealed[ex.id]) tag += '<span class="tag">Đã xem lời giải</span>';
  let body;
  if (briefView === 'ci'){
    body = '<p class="app-hint">Mô phỏng GitHub Actions trên repo <b>thao/sandemo-e2e</b>. Chọn sự kiện, kịch bản code rồi chạy. Bấm vào từng job để xem các bước và log.</p>';
  } else if (briefView === 'app'){
    body = '<p class="app-hint">Đây là trang web mẫu mà code test của bạn điều khiển. Có thể bấm thử như người dùng, hoặc chuột phải → Inspect để xem HTML.</p>';
  } else if (briefView === 'lesson'){
    body = '<div class="lesson">' + fillExamples(lesson.html, lesson.examples, 'lesson') + '</div>' +
      '<div class="start-row"><button class="btn primary" data-view="task" data-focus="1">Vào làm bài</button><span>Bấm Chạy ví dụ để xem kết quả ở tab Console.</span></div>';
  } else if (briefView === 'solution'){
    if (!state.revealed[ex.id]){
      body = '<div class="gate"><p><strong>Bạn đã thử tự làm chưa?</strong></p>' +
        '<p>Nên dành ít nhất 15–20 phút tự làm và mở lần lượt các gợi ý trước. Lời giải đọc sau khi đã vật lộn với bài sẽ nhớ lâu hơn nhiều so với đọc ngay từ đầu.</p>' +
        '<button class="btn primary" data-reveal="1">Hiện lời giải</button></div>';
    } else {
      body = '<div class="lesson">' + fillExamples(sol.html, sol.examples, 'sol') + '</div>' +
        '<p class="note" style="margin-top:18px">Đã hiểu lời giải? Hãy bấm Khôi phục code gốc và tự viết lại từ đầu mà không nhìn. Đó là cách chắc chắn nhất để biến lời giải thành kỹ năng của mình.</p>';
    }
  } else {
    let hints = '';
    if (Array.isArray(ex.hints)){
      hints = '<p class="hint-note">Mở từng gợi ý một, chỉ mở gợi ý tiếp theo khi vẫn còn bí.</p>' +
        ex.hints.map((h, k) => '<details class="hint"><summary>Gợi ý ' + (k + 1) + '</summary><div>' + h + '</div></details>').join('');
    } else if (ex.hint){
      hints = '<details class="hint"><summary>Gợi ý</summary><div>' + ex.hint + '</div></details>';
    }
    const links = [];
    if (lesson) links.push('<button class="back-link" data-view="lesson">Xem lại bài giảng</button>');
    if (sol) links.push('<button class="back-link" data-view="solution">Xem lời giải chi tiết</button>');
    body = '<div class="desc">' + ex.desc + '</div>' + hints +
      (links.length ? '<p style="margin:16px 0 0;display:flex;gap:18px;flex-wrap:wrap">' + links.join('') + '</p>' : '');
  }
  const tabs = [];
  if (lesson) tabs.push(['lesson', 'Bài giảng']);
  if (lesson || sol) tabs.push(['task', 'Đề bài']);
  if (ex.pw) tabs.push(['app', 'Trang web']);
  if (ex.ci) tabs.push(['ci', 'Pipeline']);
  if (sol) tabs.push(['solution', 'Lời giải']);
  briefEl.innerHTML =
    '<div class="brief-meta">' + exLabel(ex) + tag + '</div>' +
    '<h2>' + esc(ex.title) + '</h2>' +
    (tabs.length ? '<div class="seg" role="tablist" aria-label="Nội dung bài">' +
      tabs.map(t => '<button role="tab" data-view="' + t[0] + '" data-tip="' + VIEW_TIPS[t[0]] + '" aria-selected="' + (briefView === t[0]) + '">' + t[1] + '</button>').join('') + '</div>' : '') +
    body +
    '<div class="brief-nav">' +
      '<button class="btn small" data-go="' + (idx - 1) + '" ' + (idx <= 0 ? 'disabled' : '') + '>Bài trước</button>' +
      '<button class="btn small" data-go="' + (idx + 1) + '" ' + (idx >= EX.length - 1 ? 'disabled' : '') + '>Bài tiếp</button>' +
    '</div>';
  document.getElementById('briefWrap').scrollTop = 0;
  const pane = document.getElementById('appPane');
  pane.className = 'app-pane ' + (!ex.pw ? 'none' : briefView === 'app' ? '' : 'off');
  document.getElementById('ciPane').hidden = !(ex.ci && briefView === 'ci');
}
function renderToolbar(){
  checkBtn.hidden = !current.tests;
  markBtn.hidden = !current.manual;
  markBtn.textContent = state.status[current.id] === 'pass' ? 'Bỏ đánh dấu đã xong' : 'Đánh dấu đã xong';
}
