defineExercise({
  id: 'w3.12',
  title: 'Tự tạo Promise',
  desc: `<p>Viết hai function trả về Promise:</p>
<ul>
<li><code>wait(ms)</code>: resolve sau <code>ms</code> mili giây.</li>
<li><code>fetchPrice(code)</code>: giả lập gọi API, sau 50 ms thì resolve giá lấy từ bảng <code>PRICES</code>. Mã không có trong bảng thì reject <code>new Error("Unknown code: " + code)</code>.</li>
</ul>
<p class="note">Trang này không gọi được API thật, nên tuần này dùng API giả lập. Cách viết code gọi API y hệt khi làm với API thật.</p>`,
  hints: [
    'Khung chung: <code>new Promise((resolve, reject) =&gt; { ... })</code>. Gọi <code>resolve(giá_trị)</code> khi thành công, <code>reject(lỗi)</code> khi thất bại.',
    '<code>const wait = ms =&gt; new Promise(resolve =&gt; setTimeout(resolve, ms));</code>',
    'Trong <code>fetchPrice</code>, đặt <code>setTimeout</code> 50 ms, bên trong kiểm tra <code>code in PRICES</code> để chọn gọi <code>resolve</code> hay <code>reject</code>.'],
  starter: String.raw`const PRICES = { "7203": 2850, "6758": 13200, "9984": 8900 };

const wait = (ms) => {

};

const fetchPrice = (code) => {

};

// Thử: in ra sau khi chờ
// wait(500).then(() => console.log("Đã chờ 500 ms"));
// fetchPrice("7203").then(price => console.log("Giá:", price));
`,
  tests: STRIP + String.raw`
test('wait trả về Promise', () => expect(wait(1) instanceof Promise, 'wait phải return một Promise').toBe(true));
test('wait(80) chờ đủ thời gian', async () => { const t = performance.now(); await wait(80); expect(performance.now() - t >= 70, 'Resolve quá sớm').toBe(true); });
test('fetchPrice("7203") → 2850', async () => expect(await fetchPrice("7203")).toBe(2850));
test('fetchPrice mất khoảng 50 ms', async () => { const t = performance.now(); await fetchPrice("6758"); expect(performance.now() - t >= 40, 'Resolve ngay lập tức, chưa có độ trễ').toBe(true); });
test('Mã không có → reject đúng thông báo', async () => { const e = await __rejects(fetchPrice("0000")); expect(e && e.message, 'Promise phải bị reject với Error("Unknown code: 0000")').toBe("Unknown code: 0000"); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Promise là gì</h3>
<p>Promise là một "phiếu hẹn" cho một giá trị sẽ có trong tương lai. Giống phiếu gửi xe: lúc nhận phiếu chưa có xe trong tay, nhưng sau này chắc chắn nhận được xe, hoặc được báo là có sự cố.</p>
<p>Promise có 3 trạng thái: <strong>pending</strong> (đang chờ), <strong>fulfilled</strong> (thành công, có giá trị) và <strong>rejected</strong> (thất bại, có lỗi). Đã chuyển sang fulfilled hay rejected thì không đổi nữa.</p>
<h3>Tạo Promise</h3>
{{ex0}}
<p>Hàm truyền vào <code>new Promise</code> nhận hai function: gọi <code>resolve(giá_trị)</code> khi thành công, <code>reject(lỗi)</code> khi thất bại. Chỉ lần gọi đầu tiên có tác dụng.</p>
<h3>Reject bằng Error</h3>
<p>Luôn reject bằng <code>new Error("thông báo")</code> thay vì chuỗi, để có <code>err.message</code> và thông tin vị trí lỗi (stack trace).</p>
{{ex1}}
<p>Trong trang này, bạn có thể dùng <code>await</code> ngay ở ngoài cùng code để chờ Promise, rất tiện để thử.</p>`,
examples:[String.raw`const ticket = new Promise((resolve, reject) => {
  setTimeout(() => resolve("Xe của bạn"), 500);
});
console.log(ticket);            // Promise đang pending
const car = await ticket;       // chờ 500 ms
console.log(car);`,
String.raw`const checkQty = (qty) => new Promise((resolve, reject) => {
  if (qty > 0) resolve(qty);
  else reject(new Error("qty must be > 0"));
});

checkQty(100).then(q => console.log("OK:", q));
checkQty(0).catch(err => console.log("Lỗi:", err.message));`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>setTimeout(resolve, ms)</code>: truyền thẳng <code>resolve</code> làm callback, hết giờ thì Promise thành công. Không cần giá trị trả về.</li>
<li>Trong <code>fetchPrice</code>, việc kiểm tra mã phải nằm <strong>bên trong</strong> callback của <code>setTimeout</code> để có độ trễ cho cả trường hợp lỗi, giống API thật.</li>
<li><code>code in PRICES</code> kiểm tra key có tồn tại. Không dùng <code>if (PRICES[code])</code> vì giá có thể là 0.</li>
</ul>
<h3>Lỗi hay gặp</h3>
<p>Viết <code>setTimeout(resolve(price), 50)</code>: <code>resolve</code> bị gọi ngay lập tức thay vì sau 50 ms, vì có dấu ngoặc là gọi hàm. Phải bọc trong arrow function: <code>setTimeout(() =&gt; resolve(price), 50)</code>.</p>`,
examples:[String.raw`const PRICES = { "7203": 2850, "6758": 13200, "9984": 8900 };

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchPrice = (code) => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (code in PRICES) resolve(PRICES[code]);
    else reject(new Error("Unknown code: " + code));
  }, 50);
});

await wait(200);
console.log(await fetchPrice("7203"));
fetchPrice("0000").catch(err => console.log(err.message));`]},
});
