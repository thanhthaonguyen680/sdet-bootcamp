defineExercise({
  id: 'w3.18',
  title: 'Giới hạn thời gian chờ (Promise.race)',
  desc: `<p>Viết <code>withTimeout(promise, ms)</code> trả về Promise mới:</p>
<ul>
<li>Nếu <code>promise</code> xong trước <code>ms</code> mili giây: trả về đúng kết quả (hoặc đúng lỗi) của nó.</li>
<li>Nếu quá <code>ms</code>: reject <code>new Error("Timeout after " + ms + "ms")</code>.</li>
</ul>
<p>Mọi framework test đều có cơ chế này. Playwright mặc định chờ một hành động tối đa vài giây rồi báo lỗi timeout.</p>`,
  hints: [
    '<code>Promise.race([p1, p2])</code> lấy kết quả của Promise nào xong trước, dù là resolve hay reject.',
    'Tạo một Promise "đồng hồ": <code>new Promise((_, reject) =&gt; setTimeout(() =&gt; reject(new Error(...)), ms))</code>.',
    '<code>return Promise.race([promise, dongHo]);</code> Nâng cao: lưu id của <code>setTimeout</code> và <code>clearTimeout</code> khi xong để không để lại bộ hẹn giờ thừa.'],
  starter: String.raw`const withTimeout = (promise, ms) => {

};

const slowApi = new Promise(resolve => setTimeout(() => resolve("dữ liệu"), 500));
// withTimeout(slowApi, 200).then(console.log).catch(err => console.log("Lỗi:", err.message));
`,
  tests: STRIP + String.raw`
const __after = (ms, v, fail) => new Promise((res, rej) => setTimeout(() => (fail ? rej(new Error(v)) : res(v)), ms));
test('Xong trước hạn → trả về kết quả', async () => expect(await withTimeout(__after(20, "ok"), 200)).toBe("ok"));
test('Quá hạn → reject "Timeout after 50ms"', async () => { const e = await __rejects(withTimeout(__after(300, "late"), 50)); expect(e && e.message).toBe("Timeout after 50ms"); });
test('Quá hạn thì báo lỗi ngay, không chờ promise gốc', async () => { const t = performance.now(); await __rejects(withTimeout(__after(400, "late"), 50)); expect(performance.now() - t < 200, 'Đang chờ promise gốc xong rồi mới báo').toBe(true); });
test('Giữ nguyên lỗi của promise gốc', async () => { const e = await __rejects(withTimeout(__after(10, "Server error", true), 200)); expect(e && e.message).toBe("Server error"); });
test('Có dùng Promise.race', () => expect(__code.includes("Promise.race(")).toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Promise.race</h3>
<p>Nhận mảng Promise và lấy kết quả của cái <strong>xong đầu tiên</strong>, dù là thành công hay lỗi. Các Promise còn lại vẫn chạy tiếp nhưng kết quả bị bỏ qua.</p>
{{ex0}}
<h3>Ý tưởng timeout</h3>
<p>Cho Promise thật "đua" với một Promise đồng hồ chỉ biết reject sau <code>ms</code> mili giây. Promise thật về trước thì lấy kết quả của nó, đồng hồ về trước thì báo timeout.</p>
<h3>Dọn dẹp bộ hẹn giờ</h3>
<p><code>setTimeout</code> trả về một id. Gọi <code>clearTimeout(id)</code> để hủy nếu không cần nữa. Trong code chạy lâu dài (server, bộ test hàng nghìn case), để lại bộ hẹn giờ thừa có thể làm chương trình không tự kết thúc.</p>
{{ex1}}
<p class="note">Góc QA: timeout của Playwright (thời gian chờ mặc định cho mỗi hành động và mỗi test) hoạt động theo đúng nguyên lý này. Hiểu nó giúp bạn đọc đúng thông báo lỗi "Timeout 30000ms exceeded" và biết nên sửa ở đâu.</p>`,
examples:[String.raw`const after = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
const winner = await Promise.race([after(300, "chậm"), after(100, "nhanh")]);
console.log(winner);`,
String.raw`const id = setTimeout(() => console.log("sẽ không in ra"), 200);
clearTimeout(id);
console.log("Đã hủy bộ hẹn giờ", id);`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Promise đồng hồ chỉ biết reject. Tham số đầu đặt tên <code>_</code> để thể hiện không dùng tới <code>resolve</code>.</li>
<li><code>Promise.race</code> lấy kết quả cái xong trước: <code>promise</code> thành công hay lỗi đều được giữ nguyên.</li>
<li><code>.finally(() =&gt; clearTimeout(timer))</code> hủy đồng hồ dù kết quả thế nào, không để lại bộ hẹn giờ thừa.</li>
</ul>
<h3>Kết hợp với retry</h3>
<p>Hai bài cuối ghép lại thành một mẫu rất thường gặp khi gọi API trong test: mỗi lần thử có giới hạn thời gian, lỗi thì thử lại.</p>
{{ex1}}`,
examples:[String.raw`const withTimeout = (promise, ms) => {
  let timer;
  const clock = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timeout after " + ms + "ms")), ms);
  });
  return Promise.race([promise, clock]).finally(() => clearTimeout(timer));
};

const slowApi = new Promise(resolve => setTimeout(() => resolve("dữ liệu"), 500));
try {
  console.log(await withTimeout(slowApi, 200));
} catch (err) {
  console.log("Lỗi:", err.message);
}`,
String.raw`const wait = (ms) => new Promise(r => setTimeout(r, ms));
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("Timeout")), ms))]);

let n = 0;
const api = () => { n++; return wait(n < 3 ? 500 : 50).then(() => "OK ở lần " + n); };

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    console.log(await withTimeout(api(), 200));
    break;
  } catch (err) {
    console.log("Lần", attempt, err.message);
  }
}`]},
});
