defineExercise({
  id: 'w3.10',
  title: 'Tổng hợp: báo cáo kết quả test',
  desc: `<p>Mỗi phần tử trong <code>results</code> có dạng <code>{ name, status, duration }</code>, với <code>status</code> là <code>"pass"</code>, <code>"fail"</code> hoặc <code>"skip"</code>. Viết <code>summarize(results)</code> trả về:</p>
<pre>{
  total,        // tổng số test
  passed,       // số pass
  failed,       // số fail
  skipped,      // số skip
  failedNames,  // mảng tên các test fail
  passRate,     // % pass trên số test đã chạy (không tính skip), làm tròn số nguyên; chưa chạy test nào → 0
  slowest,      // tên test có duration lớn nhất; mảng rỗng → null
}</pre>
<p>Chỉ dùng method của mảng, không dùng vòng lặp.</p>`,
  hints: [
    'Viết một hàm phụ đếm theo trạng thái: <code>const count = s =&gt; results.filter(r =&gt; r.status === s).length;</code>',
    'passRate: số test đã chạy là <code>passed + failed</code>. Chia xong nhân 100 rồi <code>Math.round</code>. Nhớ trường hợp chia cho 0.',
    'slowest: dùng <code>reduce</code> giữ lại test có <code>duration</code> lớn hơn, hoặc sao chép rồi <code>sort</code> giảm dần theo duration và lấy phần tử đầu.'],
  starter: String.raw`const summarize = (results) => {

};

const results = [
  { name: "login", status: "pass", duration: 1200 },
  { name: "order", status: "fail", duration: 3400 },
  { name: "search", status: "pass", duration: 800 },
  { name: "logout", status: "skip", duration: 0 },
];
console.log(summarize(results));
`,
  tests: STRIP + String.raw`
const __r = [
  { name: "login", status: "pass", duration: 1200 },
  { name: "order", status: "fail", duration: 3400 },
  { name: "search", status: "pass", duration: 800 },
  { name: "logout", status: "skip", duration: 0 },
];
test('Đếm total, passed, failed, skipped', () => { const s = summarize(__r); expect([s.total, s.passed, s.failed, s.skipped]).toEqual([4, 2, 1, 1]); });
test('failedNames', () => expect(summarize(__r).failedNames).toEqual(["order"]));
test('passRate = 67 (2/3, không tính skip)', () => expect(summarize(__r).passRate).toBe(67));
test('slowest = "order"', () => expect(summarize(__r).slowest).toBe("order"));
test('Mảng rỗng', () => expect(summarize([])).toEqual({ total: 0, passed: 0, failed: 0, skipped: 0, failedNames: [], passRate: 0, slowest: null }));
test('Toàn skip → passRate 0', () => expect(summarize([{ name: "a", status: "skip", duration: 5 }]).passRate).toBe(0));
test('Không dùng vòng lặp', __noLoop);
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Chia bài thành các câu hỏi nhỏ</h3>
<p>Mỗi trường trong kết quả là một câu hỏi riêng, và mỗi câu hỏi ứng với một method:</p>
${TRACE(['Câu hỏi', 'Method'], [['Có bao nhiêu test pass?', '<code>filter(...).length</code>'], ['Tên các test fail?', '<code>filter</code> rồi <code>map</code>'], ['Test nào chạy lâu nhất?', '<code>reduce</code> (hoặc sort)'], ['Tỉ lệ pass?', 'phép tính từ các số đã có']])}
<h3>Hàm phụ tránh lặp code</h3>
{{ex0}}
<h3>Trả về object gọn</h3>
<p>Khi tên biến trùng tên key, dùng cú pháp viết gọn <code>return { total, passed, failed };</code> như đã học ở tuần 1.</p>
<p class="note">Góc QA: đây chính là phần "summary" của mọi test reporter (Playwright HTML report, Allure). Viết được hàm này là bạn đã hiểu dữ liệu báo cáo được tạo ra thế nào.</p>`,
examples:[String.raw`const results = [{ status: "pass" }, { status: "fail" }, { status: "pass" }];
const count = s => results.filter(r => r.status === s).length;
console.log("pass:", count("pass"), "fail:", count("fail"), "skip:", count("skip"));

const longest = [{ n: "a", d: 5 }, { n: "b", d: 9 }, { n: "c", d: 7 }]
  .reduce((best, x) => (x.d > best.d ? x : best));
console.log(longest.n);`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Hàm phụ <code>count</code> dùng lại cho ba trạng thái, tránh viết lặp <code>filter</code> ba lần.</li>
<li><code>executed = passed + failed</code> là số test thực sự chạy. Kiểm tra bằng 0 trước khi chia để không ra <code>NaN</code>.</li>
<li><code>slowest</code> dùng <code>reduce</code> không có giá trị đầu để so sánh từng cặp. Vì cách này lỗi với mảng rỗng, cần kiểm tra <code>results.length</code> trước.</li>
</ul>
<h3>Lỗi hay gặp</h3>
<ul>
<li>Tính passRate trên <code>total</code> (tính cả skip): ra 50 thay vì 67.</li>
<li>Quên trường hợp toàn skip: chia 0 cho 0 ra <code>NaN</code>.</li>
</ul>`,
examples:[String.raw`const summarize = (results) => {
  const count = (s) => results.filter(r => r.status === s).length;
  const passed = count("pass");
  const failed = count("fail");
  const skipped = count("skip");
  const executed = passed + failed;
  return {
    total: results.length,
    passed,
    failed,
    skipped,
    failedNames: results.filter(r => r.status === "fail").map(r => r.name),
    passRate: executed === 0 ? 0 : Math.round((passed / executed) * 100),
    slowest: results.length === 0
      ? null
      : results.reduce((a, b) => (b.duration > a.duration ? b : a)).name,
  };
};

console.log(summarize([
  { name: "login", status: "pass", duration: 1200 },
  { name: "order", status: "fail", duration: 3400 },
  { name: "search", status: "pass", duration: 800 },
  { name: "logout", status: "skip", duration: 0 },
]));`]},
});
