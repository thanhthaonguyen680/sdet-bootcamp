/* =============================================================================
   Danh mục bài học: ghép dữ liệu trong content/ thành các cấu trúc mà trang dùng.

   - Mỗi tệp bài học gọi defineExercise({...}) để đăng ký đề bài, bài giảng và lời giải.
   - Thứ tự, tuần, nhóm, số thứ tự và cờ "không bắt buộc" lấy từ CURRICULUM
     (content/curriculum.js), nên KHÔNG khai báo lại trong từng bài.
   - Kết quả: EX (danh sách bài theo thứ tự), LESSONS và SOLUTIONS (tra theo id).
   ========================================================================== */
const EX = [];
const LESSONS = {};
const SOLUTIONS = {};
const EXERCISE_DEFS = {};

function defineExercise(def){
  if (!def || !def.id) throw new Error('defineExercise: thiếu id');
  if (EXERCISE_DEFS[def.id]) throw new Error('Trùng id bài: ' + def.id);
  EXERCISE_DEFS[def.id] = def;
}

function buildCatalog(){
  EX.length = 0;
  for (const k of Object.keys(LESSONS)) delete LESSONS[k];
  for (const k of Object.keys(SOLUTIONS)) delete SOLUTIONS[k];
  const used = new Set();
  const add = (id, meta) => {
    const def = EXERCISE_DEFS[id];
    if (!def) throw new Error('CURRICULUM nhắc tới bài "' + id + '" nhưng chưa có tệp của bài này');
    used.add(id);
    const { lesson, solution, ...ex } = def;
    Object.assign(ex, meta);
    // Bài làm theo project nhiều tệp: code khởi đầu chính là bộ tệp mẫu, không cần viết hai lần.
    if (ex.files && ex.starter === undefined) ex.starter = JSON.stringify(ex.files);
    EX.push(ex);
    if (lesson) LESSONS[id] = lesson;
    if (solution) SOLUTIONS[id] = solution;
  };
  CURRICULUM.free.exercises.forEach(id => add(id, { free: true, group: CURRICULUM.free.group, num: '' }));
  for (const wk of CURRICULUM.weeks){
    let n = 0;
    wk.groups.forEach((g, gi) => g.exercises.forEach((id, i) => {
      n++;
      add(id, {
        week: wk.week,
        group: g.name,
        num: wk.numbering === 'group' ? (gi + 1) + '.' + (i + 1) : String(n),
        ...(g.optional ? { optional: true } : {}),
      });
    }));
  }
  for (const id of Object.keys(EXERCISE_DEFS)) if (!used.has(id)) console.warn('Bài "' + id + '" có tệp nhưng chưa được liệt kê trong CURRICULUM');
}
