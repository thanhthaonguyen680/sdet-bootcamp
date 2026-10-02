defineExercise({
  id: '3.3',
  title: 'Đếm kết quả test',
  desc: `<p>Viết function <code>countResults(results)</code> dùng <code>for...in</code> để đếm số test pass, fail, skip và trả về chuỗi:</p>
<pre>"Pass: 2, Fail: 1, Skip: 1"</pre>`,
  hint: `<code>for (const key in results)</code> cho bạn tên từng test, lấy giá trị bằng <code>results[key]</code>.`,
  starter: String.raw`const results = { login: "pass", logout: "pass", order: "fail", search: "skip" };

function countResults(results) {
  // Dùng for...in
}

console.log(countResults(results));
`,
  tests: String.raw`
test('Dữ liệu mẫu → "Pass: 2, Fail: 1, Skip: 1"', () => expect(countResults({ login: "pass", logout: "pass", order: "fail", search: "skip" })).toBe("Pass: 2, Fail: 1, Skip: 1"));
test('Chỉ có fail → "Pass: 0, Fail: 1, Skip: 0"', () => expect(countResults({ a: "fail" })).toBe("Pass: 0, Fail: 1, Skip: 0"));
test('Object rỗng → "Pass: 0, Fail: 0, Skip: 0"', () => expect(countResults({})).toBe("Pass: 0, Fail: 0, Skip: 0"));
test('Có dùng for...in', () => expect(/for\s*\(\s*(const|let)\s+\w+\s+in\b/.test(__source), 'Hãy dùng vòng lặp for...in').toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Object</h3>
<p>Object lưu dữ liệu dạng cặp <code>key: value</code>. Truy cập bằng dấu chấm <code>obj.key</code>, hoặc bằng ngoặc vuông <code>obj["key"]</code> khi tên key nằm trong một biến.</p>
${ANAT('const stock = ', ['{', 'Ngoặc nhọn mở đầu object.'], ' ', ['code', 'Key (tên thuộc tính).'], [':', 'Dấu hai chấm nối key với giá trị.'], ' ', ['"7203"', 'Value (giá trị) của key <code>code</code>.'], [',', 'Dấu phẩy ngăn cách các cặp key: value.'], ' name: "Toyota" ', ['}', 'Ngoặc nhọn đóng object.'], ';')}
<p>Mảng dùng số thứ tự để lấy dữ liệu (<code>codes[0]</code>), còn object dùng tên (<code>stock.code</code>). Response API thường là object.</p>
{{ex0}}
<h3>for...in duyệt object</h3>
<p><code>for...in</code> lấy lần lượt từng <strong>key</strong> của object. Muốn lấy giá trị thì dùng <code>obj[key]</code>.</p>
${ANAT('for (', ['const subject', 'Biến nhận từng <strong>key</strong>: vòng 1 là <code>"math"</code>, vòng 2 là <code>"english"</code>...'], ' ', ['in', '"lấy từng key trong".'], ' ', ['scores', 'Object cần duyệt.'], ') {\n  console.log(subject, "→", ', ['scores[subject]', 'Lấy giá trị ứng với key đang xét. Phải dùng ngoặc vuông vì tên key nằm trong biến <code>subject</code>.'], ');\n}')}
{{ex1}}
<h3>Mẫu đếm theo điều kiện</h3>
{{ex2}}
<p class="note">Ghi nhớ: <code>for...of</code> dùng cho mảng (lấy giá trị), <code>for...in</code> dùng cho object (lấy key).</p>`,
examples:[String.raw`const stock = { code: "7203", name: "Toyota" };
console.log(stock.code);

const field = "name";
console.log(stock[field]);  // truy cập bằng biến

stock.price = 2850;         // thêm key mới
console.log(stock);`,
String.raw`const scores = { math: 8, english: 6, it: 9 };
for (const subject in scores) {
  console.log(subject, "→", scores[subject]);
}`,
String.raw`const statuses = { a: "ok", b: "ng", c: "ok" };
let ok = 0;
for (const k in statuses) {
  if (statuses[k] === "ok") ok++;
}
console.log("OK: " + ok);`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>for...in</code> duyệt qua <strong>key</strong> của object (<code>"login"</code>, <code>"logout"</code>...), lấy giá trị bằng <code>results[key]</code>.</li>
<li>Ba biến đếm khởi tạo bằng 0 nên object rỗng vẫn trả về đúng <code>"Pass: 0, Fail: 0, Skip: 0"</code>.</li>
</ul>
<h3>Lưu ý</h3>
<p><code>for...in</code> dùng cho object, <code>for...of</code> dùng cho mảng. Dùng <code>for...in</code> với mảng sẽ nhận về index dạng chuỗi <code>"0"</code>, <code>"1"</code>...</p>`,
examples:[String.raw`const results = { login: "pass", logout: "pass", order: "fail", search: "skip" };

function countResults(results) {
  let pass = 0;
  let fail = 0;
  let skip = 0;
  for (const key in results) {
    const status = results[key];
    if (status === "pass") pass++;
    else if (status === "fail") fail++;
    else if (status === "skip") skip++;
  }
  return "Pass: " + pass + ", Fail: " + fail + ", Skip: " + skip;
}

console.log(countResults(results));`]},
});
