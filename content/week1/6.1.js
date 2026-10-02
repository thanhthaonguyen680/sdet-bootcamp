defineExercise({
  id: '6.1',
  title: 'Hàng đợi test case',
  desc: `<p>Mô phỏng hàng đợi chạy test:</p>
<ul>
<li>Dùng <code>push</code> thêm 5 test case vào mảng <code>queue</code>.</li>
<li>Dùng <code>shift</code> lấy ra lần lượt và in <code>Đang chạy: TC_LOGIN_001</code>.</li>
<li>Cuối cùng <code>queue</code> phải rỗng.</li>
</ul>
<p>Tự tìm hiểu thêm: nếu thay <code>shift</code> bằng <code>pop</code> thì thứ tự chạy thay đổi thế nào?</p>`,
  hint: `<code>while (queue.length &gt; 0) { const tc = queue.shift(); ... }</code>`,
  starter: String.raw`const queue = [];

// 1. push 5 test case vào queue


// 2. Lấy ra lần lượt bằng shift() và in "Đang chạy: <tên>"

`,
  tests: String.raw`
test('In đúng 5 dòng "Đang chạy: ..."', () => { const n = __out.filter(l => l.startsWith("Đang chạy: ")).length; expect(n, 'Có ' + n + ' dòng bắt đầu bằng "Đang chạy: "').toBe(5); });
test('queue rỗng sau khi chạy xong', () => expect(queue.length).toBe(0));
test('Có dùng push và shift', () => { expect(__source.includes("push"), 'Chưa dùng push').toBe(true); expect(__source.includes("shift"), 'Chưa dùng shift').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Thêm và lấy phần tử</h3>
<ul>
<li><code>push</code> thêm vào cuối, <code>pop</code> lấy ra từ cuối.</li>
<li><code>unshift</code> thêm vào đầu, <code>shift</code> lấy ra từ đầu.</li>
</ul>
${ANAT(['list', 'Mảng đang có <code>["A", "B"]</code>.'], ['.push("C")', 'Thêm "C" vào <strong>cuối</strong>. Mảng gốc bị thay đổi thành <code>["A", "B", "C"]</code>.'], ';\nconst first = ', ['list.shift()', 'Lấy phần tử <strong>đầu tiên</strong> ra khỏi mảng. Không cần tham số.'], ';  // first → ', ['"A"', 'Kết quả là phần tử vừa lấy ra, mảng còn <code>["B", "C"]</code>.'])}
{{ex0}}
<h3>Hàng đợi và ngăn xếp</h3>
<p><code>push</code> + <code>shift</code> tạo thành hàng đợi (queue): vào trước ra trước. <code>push</code> + <code>pop</code> tạo thành ngăn xếp (stack): vào sau ra trước.</p>
{{ex1}}
<p class="note">Mảng khai báo bằng <code>const</code> vẫn thêm, xóa phần tử được. <code>const</code> chỉ cấm gán biến sang một mảng khác, không cấm sửa nội dung bên trong.</p>`,
examples:[String.raw`const list = ["A", "B"];
list.push("C");     // A, B, C
list.unshift("Z");  // Z, A, B, C
console.log(list);

console.log(list.pop());    // lấy cuối: C
console.log(list.shift());  // lấy đầu: Z
console.log(list, "| còn", list.length, "phần tử");`,
String.raw`const tasks = ["login", "order", "logout"];
while (tasks.length > 0) {
  const t = tasks.shift();
  console.log("Xử lý:", t, "| còn lại:", tasks.length);
}`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>push</code> thêm vào cuối, <code>shift</code> lấy ra ở đầu: vào trước ra trước (FIFO), giống hàng đợi thật.</li>
<li><code>while (queue.length &gt; 0)</code> chạy tới khi hàng đợi rỗng. Không dùng <code>for</code> với <code>i &lt; queue.length</code> vì độ dài thay đổi trong lúc lặp.</li>
</ul>
<h3>Nếu thay shift bằng pop</h3>
<p><code>pop</code> lấy ở cuối: vào sau ra trước (LIFO), giống chồng đĩa (stack). Thứ tự chạy bị đảo ngược, test case thêm cuối cùng chạy đầu tiên.</p>`,
examples:[String.raw`const queue = [];

queue.push("TC_LOGIN_001");
queue.push("TC_LOGIN_002");
queue.push("TC_ORDER_001");
queue.push("TC_ORDER_002");
queue.push("TC_SEARCH_001");

while (queue.length > 0) {
  const tc = queue.shift();
  console.log("Đang chạy: " + tc);
}

console.log("Còn lại:", queue);`]},
});
