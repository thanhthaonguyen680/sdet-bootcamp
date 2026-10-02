defineExercise({
  id: 'w3.6',
  title: 'filter: lọc phần tử',
  desc: `<p>Dùng <code>filter</code> (có thể kết hợp <code>map</code>), không dùng vòng lặp:</p>
<ul>
<li><code>rising(stocks)</code>: các cổ phiếu có <code>change &gt; 0</code>.</li>
<li><code>failedNames(results)</code>: tên các test có <code>status === "fail"</code>.</li>
<li><code>unique(arr)</code>: làm lại bài 6.2 tuần 1 trong một dòng.</li>
</ul>
<pre>failedNames([{ name: "login", status: "pass" }, { name: "order", status: "fail" }])
→ ["order"]</pre>`,
  hints: [
    '<code>filter</code> giữ lại phần tử nào mà callback trả về <code>true</code>.',
    'Nối hai bước: <code>results.filter(r =&gt; r.status === "fail").map(r =&gt; r.name)</code>.',
    'Callback của <code>filter</code> nhận thêm tham số thứ hai là index. Phần tử là lần xuất hiện đầu tiên khi <code>arr.indexOf(x) === i</code>.'],
  starter: String.raw`const rising = (stocks) => [];
const failedNames = (results) => [];
const unique = (arr) => [];

console.log(rising([{ code: "7203", change: 15 }, { code: "6758", change: -20 }]));
console.log(failedNames([{ name: "login", status: "pass" }, { name: "order", status: "fail" }]));
console.log(unique(["7203", "6758", "7203"]));
`,
  tests: STRIP + String.raw`
test('rising', () => expect(rising([{ code: "7203", change: 15 }, { code: "6758", change: -20 }, { code: "9984", change: 0 }])).toEqual([{ code: "7203", change: 15 }]));
test('failedNames', () => expect(failedNames([{ name: "login", status: "pass" }, { name: "order", status: "fail" }, { name: "search", status: "fail" }, { name: "x", status: "skip" }])).toEqual(["order", "search"]));
test('failedNames khi không có lỗi → []', () => expect(failedNames([{ name: "a", status: "pass" }])).toEqual([]));
test('unique giữ thứ tự', () => expect(unique(["7203", "6758", "7203", "9984", "6758"])).toEqual(["7203", "6758", "9984"]));
test('Có dùng filter', () => expect(__code.includes(".filter(")).toBe(true));
test('Không dùng vòng lặp', __noLoop);
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>filter: giữ lại phần tử thỏa điều kiện</h3>
<p>Callback trả về <code>true</code> thì phần tử được giữ, <code>false</code> thì bị loại. Kết quả là mảng mới, có thể ngắn hơn.</p>
{{ex0}}
<h3>Nối chuỗi method</h3>
<p>Mỗi method trả về mảng mới nên có thể nối tiếp. Xuống dòng trước mỗi dấu chấm cho dễ đọc:</p>
{{ex1}}
<h3>Dùng index trong filter</h3>
{{ex2}}
<h3>Gặp trong Playwright</h3>
<p>Chỉ giữ lại những dòng cần kiểm tra, ví dụ các lệnh đang chờ khớp:</p>
{{ex3}}`,
examples:[String.raw`const nums = [5, 12, 8, 130, 44];
console.log(nums.filter(n => n > 10));

const orders = [{ side: "buy", qty: 100 }, { side: "sell", qty: 50 }, { side: "buy", qty: 300 }];
console.log(orders.filter(o => o.side === "buy"));`,
String.raw`const orders = [
  { code: "7203", side: "buy", qty: 100 },
  { code: "6758", side: "sell", qty: 50 },
  { code: "9984", side: "buy", qty: 300 },
];
const bigBuyCodes = orders
  .filter(o => o.side === "buy")
  .filter(o => o.qty >= 200)
  .map(o => o.code);
console.log(bigBuyCodes);`,
String.raw`const letters = ["a", "b", "c", "d"];
console.log(letters.filter((x, i) => i % 2 === 0));  // vị trí chẵn: a, c`,
{ run:false, code:String.raw`const statuses = await page.getByTestId("order-status").allTextContents();
const pending = statuses.filter(s => s === "Chờ khớp");
expect(pending).toHaveLength(2);` }]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>failedNames</code> nối hai bước: lọc trước để giảm số phần tử, rồi mới <code>map</code> lấy tên.</li>
<li><code>unique</code>: <code>arr.indexOf(x)</code> luôn trả về vị trí lần xuất hiện <strong>đầu tiên</strong>. Nếu nó trùng với <code>i</code> hiện tại thì đây là lần đầu gặp, giữ lại.</li>
</ul>
<h3>Độ phức tạp của unique</h3>
<p>Mỗi phần tử gọi <code>indexOf</code> duyệt lại mảng nên là O(n²), giống cách làm tuần 1. Với dữ liệu lớn, cách O(n) là dùng <code>Set</code>:</p>
{{ex1}}`,
examples:[String.raw`const rising = (stocks) => stocks.filter(s => s.change > 0);
const failedNames = (results) => results
  .filter(r => r.status === "fail")
  .map(r => r.name);
const unique = (arr) => arr.filter((x, i) => arr.indexOf(x) === i);

console.log(failedNames([{ name: "login", status: "pass" }, { name: "order", status: "fail" }]));
console.log(unique(["7203", "6758", "7203"]));`,
String.raw`const uniqueFast = (arr) => [...new Set(arr)];
console.log(uniqueFast(["7203", "6758", "7203"]));`]},
});
