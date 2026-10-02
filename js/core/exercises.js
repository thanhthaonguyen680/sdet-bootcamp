/* Truy vấn trên danh mục bài: bài tính điểm, nhãn bài, trạng thái, thông tin tuần. */

// Bài optional hiện trong danh sách nhưng không tính vào thanh tiến độ và số bài xong.
function graded(w){ return EX.filter(e => !e.free && !e.optional && e.week === w); }
function exLabel(ex){ return ex.free ? 'Luyện tự do' : (ex.week > 1 ? 'Tuần ' + ex.week + ', bài ' : 'Bài ') + ex.num; }
function codeOf(ex){ return state.codes[ex.id] != null ? state.codes[ex.id] : ex.starter; }
function statusOf(ex){
  if (ex.free) return 'free';
  const s = state.status[ex.id]; if (s) return s;
  const c = state.codes[ex.id]; return (c != null && c !== ex.starter) ? 'edited' : '';
}

// Thông tin tuần lấy từ CURRICULUM (content/curriculum.js), không lặp lại ở nơi khác.
const weekInfo = w => CURRICULUM.weeks.find(x => x.week === w);
const weekSubtitle = w => 'Tuần ' + w + ': ' + weekInfo(w).title;
const weekTip = w => weekInfo(w).tip.replace(/\{n\}/g, graded(w).length);
