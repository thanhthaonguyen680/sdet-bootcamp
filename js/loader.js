/* =============================================================================
   Nạp nội dung khóa học (các tệp trong content/) theo CURRICULUM.

   Các tệp được tải song song nhưng chạy đúng thứ tự khai báo (script.async = false),
   nên tệp dùng chung của tuần (shared*.js) luôn chạy trước các bài dùng chúng.
   ========================================================================== */
function loadScript(src){
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Không tải được ' + src));
    document.head.appendChild(s);
  });
}

function contentFiles(){
  const dir = (section, name) => 'content/' + section.dir + '/' + name;
  const files = CURRICULUM.free.exercises.map(id => dir(CURRICULUM.free, id + '.js'));
  for (const wk of CURRICULUM.weeks){
    for (const f of wk.shared || []) files.push(dir(wk, f));
    for (const g of wk.groups) for (const id of g.exercises) files.push(dir(wk, id + '.js'));
  }
  return files;
}

function loadContent(){
  return Promise.all(contentFiles().map(loadScript));
}
