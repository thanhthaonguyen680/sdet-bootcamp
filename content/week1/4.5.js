defineExercise({
  id: '4.5',
  title: 'Closure: bộ đếm',
  desc: `<p>Viết function <code>createCounter()</code> trả về một function. Mỗi lần gọi function đó, biến đếm tăng thêm 1 và trả về giá trị mới.</p>
<pre>const countFail = createCounter();
countFail(); // 1
countFail(); // 2</pre>
<p>Hai bộ đếm tạo ra riêng phải độc lập với nhau.</p>`,
  hint: `Khai báo <code>let count = 0</code> bên trong <code>createCounter</code>, rồi <code>return</code> một function tăng <code>count</code>.`,
  starter: String.raw`function createCounter() {

}

const countFail = createCounter();
console.log(countFail()); // 1
console.log(countFail()); // 2
`,
  tests: String.raw`
test('createCounter trả về một function', () => expect(typeof createCounter()).toBe("function"));
test('Gọi lần lượt trả về 1, 2, 3', () => { const c = createCounter(); expect(c()).toBe(1); expect(c()).toBe(2); expect(c()).toBe(3); });
test('Hai bộ đếm độc lập', () => { const a = createCounter(); const b = createCounter(); a(); a(); expect(b()).toBe(1); expect(a()).toBe(3); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Phạm vi biến (scope)</h3>
<p>Biến khai báo bên trong function chỉ tồn tại bên trong function đó. Bên trong thì nhìn thấy được biến bên ngoài, nhưng ngược lại thì không.</p>
{{ex0}}
<h3>Function trả về function</h3>
{{ex1}}
${ANAT('function makeGreeter(', ['prefix', 'Tham số của function <strong>ngoài</strong>.'], ') {\n  ', ['return function (name) {', 'Trả về một function <strong>mới</strong>, chưa chạy. Function này không có tên, nhận tham số <code>name</code>.'], '\n    return ', ['prefix', 'Function trong dùng <code>prefix</code> của function ngoài. Đây là chỗ closure xảy ra.'], ' + " " + name;\n  };\n}\n', ['const hello = makeGreeter("Hello");', '<code>hello</code> giờ là một function, và nó nhớ <code>prefix = "Hello"</code>.'], '\n', ['hello("An")', 'Gọi function đã nhận về. Kết quả <code>"Hello An"</code>.'])}
<h3>Closure</h3>
<p>Function bên trong <strong>nhớ</strong> các biến của function bên ngoài, kể cả khi function bên ngoài đã chạy xong. Mỗi lần gọi function bên ngoài lại tạo ra một bộ biến mới, độc lập với lần gọi trước.</p>
{{ex2}}
<p class="note">Góc QA: closure xuất hiện khắp nơi trong code test, ví dụ các hàm <code>beforeEach</code> dùng chung biến với các test bên trong. Hiểu closure giúp tránh lỗi test này ảnh hưởng dữ liệu của test khác.</p>`,
examples:[String.raw`const outside = "ngoài";
function demo() {
  const inside = "trong";
  console.log(outside, inside);  // thấy được cả hai
}
demo();
// console.log(inside); // lỗi: inside chỉ tồn tại trong function`,
String.raw`function makeGreeter(prefix) {
  return function (name) {
    return prefix + " " + name;
  };
}
const hello = makeGreeter("Hello");
const chao = makeGreeter("Chào");
console.log(hello("An"));
console.log(chao("Bình"));`,
String.raw`function makeHistory() {
  const items = [];
  return function (x) {
    items.push(x);
    return items;
  };
}
const logA = makeHistory();
const logB = makeHistory();
logA("login");
console.log(logA("order"));   // ["login", "order"]
console.log(logB("logout"));  // ["logout"], độc lập với logA`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Biến <code>count</code> nằm trong <code>createCounter</code>. Function được trả về vẫn "nhớ" và dùng được biến này sau khi <code>createCounter</code> đã chạy xong. Đó là closure.</li>
<li>Mỗi lần gọi <code>createCounter()</code> tạo ra một biến <code>count</code> mới, nên hai bộ đếm độc lập.</li>
<li>Bên ngoài không truy cập trực tiếp <code>count</code> được, chỉ tăng được qua function. Đây là cách giữ dữ liệu "riêng tư".</li>
</ul>
<h3>Lỗi hay gặp</h3>
<p>Khai báo <code>let count = 0</code> bên ngoài <code>createCounter</code>: mọi bộ đếm dùng chung một biến, test "hai bộ đếm độc lập" fail.</p>`,
examples:[String.raw`function createCounter() {
  let count = 0;
  return function () {
    count++;
    return count;
  };
}

const countFail = createCounter();
const countPass = createCounter();
console.log(countFail()); // 1
console.log(countFail()); // 2
console.log(countPass()); // 1`]},
});
