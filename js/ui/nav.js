/* Danh sách bài, thanh tiến độ và chọn tuần. */

function buildNav(){
  let html = '', group = null;
  for (const ex of EX.filter(e => e.free || e.week === state.week)){
    if (ex.group !== group){ if (group !== null) html += '</div>'; group = ex.group; html += '<div><h3>'+esc(group)+'</h3>'; }
    html += '<button class="nav-item" data-id="'+ex.id+'"><span class="dot"></span><span class="nav-num">'+esc(ex.num)+'</span><span>'+esc(ex.title)+'</span></button>';
  }
  html += '</div>';
  sideEl.innerHTML = html;
  stripEl.innerHTML = graded(state.week).map(ex => '<button class="cell" data-id="'+ex.id+'" title="'+exLabel(ex)+': '+esc(ex.title)+'" aria-label="'+exLabel(ex)+'"></button>').join('');
  $('#weekSub').textContent = weekSubtitle(state.week);
  document.querySelectorAll('.weeks button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.week === state.week)));
}
function refreshStatus(){
  sideEl.querySelectorAll('.nav-item').forEach(b => {
    const ex = EX.find(e => e.id === b.dataset.id);
    b.setAttribute('aria-current', ex === current ? 'true' : 'false');
    b.querySelector('.dot').className = 'dot ' + statusOf(ex);
  });
  stripEl.querySelectorAll('.cell').forEach(c => {
    const ex = EX.find(e => e.id === c.dataset.id);
    c.className = 'cell ' + statusOf(ex) + (ex === current ? ' current' : '');
  });
  const list = graded(state.week);
  const done = list.filter(e => state.status[e.id] === 'pass').length;
  countEl.innerHTML = '<b>'+done+'</b>/'+list.length+' bài xong';
}
function switchWeek(w){
  if (w === state.week && !current.free) return;
  state.week = w; buildNav();
  const target = state.lastByWeek[w] || graded(w)[0].id;
  select(target, false);
}

// Các nút chọn tuần được dựng từ CURRICULUM nên thêm tuần chỉ cần sửa content/curriculum.js.
function buildWeekButtons(){
  $('#weeks').innerHTML = CURRICULUM.weeks.map(w =>
    '<button data-week="' + w.week + '" aria-pressed="false" data-tip-title="' + esc(weekSubtitle(w.week)) + '" data-tip="' + esc(weekTip(w.week)) + '">Tuần ' + w.week + '</button>'
  ).join('');
}
