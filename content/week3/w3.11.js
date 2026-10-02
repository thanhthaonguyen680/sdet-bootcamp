defineExercise({
  id: 'w3.11',
  title: 'Event loop: thứ tự chạy',
  desc: `<p>Đọc đoạn code trong editor. <strong>Trước khi chạy</strong>, hãy điền vào mảng <code>prediction</code> thứ tự bạn nghĩ các chữ cái sẽ được in ra. Sau đó bấm Chạy để đối chiếu, rồi Kiểm tra bài.</p>
<p>Đọc bài giảng trước khi làm bài này.</p>`,
  hints: [
    'Code đồng bộ (không nằm trong callback) luôn chạy xong hết trước.',
    'Callback của Promise (<code>.then</code>) được xếp vào hàng đợi ưu tiên (microtask), chạy ngay sau khi code đồng bộ xong.',
    '<code>setTimeout</code> dù là 0 ms vẫn phải xếp vào hàng đợi thường (macrotask), chạy sau cùng.'],
  starter: String.raw`console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");

// Điền dự đoán của bạn, ví dụ ["A", "B", "C", "D"]
const prediction = ["?", "?", "?", "?"];
`,
  tests: String.raw`
test('Đã điền dự đoán', () => expect(prediction.includes("?"), 'Mảng prediction vẫn còn dấu ?').toBe(false));
test('Thứ tự đúng', () => expect(prediction, 'Chưa đúng. Bấm Chạy để xem thứ tự thật, rồi đọc lại bài giảng').toEqual(["A", "D", "C", "B"]));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>JavaScript chỉ có một luồng</h3>
<p>JavaScript làm từng việc một. Những việc phải chờ (hẹn giờ, gọi mạng, đọc file) không bắt cả chương trình đứng đợi, mà được giao cho trình duyệt xử lý; khi xong, callback của nó được xếp vào hàng đợi, chờ tới lượt.</p>
<p>Hình dung một nhân viên quán cà phê: nhận order của khách này, giao cho máy pha, rồi quay sang nhận order khách khác ngay, không đứng nhìn máy pha. Đồ uống xong thì được gọi tên theo thứ tự.</p>
<h3>Ba nhóm việc, ba mức ưu tiên</h3>
<ul>
<li><strong>Code đồng bộ:</strong> chạy ngay, từ trên xuống dưới, tới hết.</li>
<li><strong>Microtask</strong> (callback của Promise: <code>.then</code>, phần sau <code>await</code>): chạy ngay khi code đồng bộ xong.</li>
<li><strong>Macrotask</strong> (<code>setTimeout</code>, sự kiện...): chạy sau khi hết microtask.</li>
</ul>
{{ex0}}
<p><code>setTimeout(fn, 0)</code> không có nghĩa là "chạy ngay", mà là "chạy sớm nhất có thể, sau khi mọi việc đang có đã xong".</p>
<h3>Code không đứng chờ</h3>
{{ex1}}
<p class="note">Góc QA: đây là gốc rễ của phần lớn test "flaky". Code test đọc giá trị trước khi trang kịp cập nhật. Cách sửa là chờ đúng sự kiện (<code>await</code>), không phải chèn thời gian chờ cố định. Playwright tự chờ phần tử sẵn sàng (auto-wait) chính là vì lý do này.</p>`,
examples:[String.raw`console.log("1. đồng bộ");
setTimeout(() => console.log("4. setTimeout (macrotask)"), 0);
Promise.resolve().then(() => console.log("3. Promise (microtask)"));
console.log("2. đồng bộ");`,
String.raw`let price = null;
setTimeout(() => { price = 2850; console.log("Đã có giá:", price); }, 300);
console.log("Đọc giá ngay:", price);   // null: giá chưa về`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Đáp án: A, D, C, B</h3>
${TRACE(['Thứ tự', 'In ra', 'Vì sao'], [['1', 'A', 'code đồng bộ, chạy ngay'], ['2', 'D', 'code đồng bộ, chạy ngay'], ['3', 'C', 'microtask của Promise, chạy ngay khi hết code đồng bộ'], ['4', 'B', 'macrotask của setTimeout, chạy sau cùng dù hẹn 0 ms']])}
{{ex0}}
<h3>Diễn biến chi tiết</h3>
<ul>
<li>Dòng 1 in A.</li>
<li>Dòng 2 giao hẹn giờ cho trình duyệt; 0 ms sau callback in B được xếp vào hàng đợi macrotask.</li>
<li>Dòng 3: Promise đã resolve sẵn, callback in C được xếp vào hàng đợi microtask.</li>
<li>Dòng 4 in D. Code đồng bộ hết.</li>
<li>Vòng lặp sự kiện xử lý hết microtask trước: in C. Sau đó mới tới macrotask: in B.</li>
</ul>
<h3>Thử thêm</h3>
{{ex1}}`,
examples:[String.raw`const prediction = ["A", "D", "C", "B"];`,
String.raw`setTimeout(() => console.log("timeout 1"), 0);
Promise.resolve().then(() => {
  console.log("promise 1");
  setTimeout(() => console.log("timeout 2 (tạo trong promise)"), 0);
});
Promise.resolve().then(() => console.log("promise 2"));
console.log("sync");`]},
});
