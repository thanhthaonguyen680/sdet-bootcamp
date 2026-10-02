defineExercise({
  id: '4.3',
  title: 'Tham số mặc định',
  desc: `<p>Viết function <code>createTestUser(name, role = "viewer", active = true)</code> trả về object <code>{ name, role, active }</code>.</p>
<p>Gọi thử với 1, 2 và 3 tham số.</p>`,
  hint: `Có thể dùng cú pháp rút gọn <code>return { name, role, active };</code> thay cho <code>{ name: name, ... }</code>.`,
  starter: String.raw`function createTestUser(name, role = "viewer", active = true) {

}

console.log(createTestUser("Thao"));
console.log(createTestUser("An", "admin"));
console.log(createTestUser("Binh", "admin", false));
`,
  tests: String.raw`
test('1 tham số dùng giá trị mặc định', () => expect(createTestUser("Thao")).toEqual({ name: "Thao", role: "viewer", active: true }));
test('2 tham số', () => expect(createTestUser("An", "admin")).toEqual({ name: "An", role: "admin", active: true }));
test('3 tham số', () => expect(createTestUser("Binh", "admin", false)).toEqual({ name: "Binh", role: "admin", active: false }));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Tham số mặc định</h3>
<p>Gán giá trị ngay trong khai báo tham số. Giá trị mặc định được dùng khi tham số không được truyền, hoặc truyền <code>undefined</code>.</p>
${ANAT('function greet(', ['name', 'Tham số bình thường: không truyền thì là <code>undefined</code>.'], ', ', ['greeting = "Xin chào"', 'Tham số có giá trị mặc định: không truyền thì tự lấy <code>"Xin chào"</code>.'], ') { ... }\n\n', ['greet("An")', 'Chỉ truyền 1 đối số: <code>name</code> = "An", <code>greeting</code> dùng mặc định.'], '\n', ['greet("An", "Hello")', 'Truyền đủ 2: giá trị truyền vào thắng giá trị mặc định.'])}
{{ex0}}
<p>Lưu ý: truyền <code>null</code> thì <strong>không</strong> dùng giá trị mặc định.</p>
<h3>Viết gọn object</h3>
<p>Khi tên key trùng tên biến, chỉ cần viết một lần:</p>
{{ex1}}
<p class="note">Góc QA: function tạo test data với giá trị mặc định là mẫu rất phổ biến (test data factory). Test nào cần khác biệt thì chỉ truyền đúng phần khác biệt.</p>`,
examples:[String.raw`function greet(name, greeting = "Xin chào") {
  return greeting + ", " + name;
}
console.log(greet("An"));
console.log(greet("An", "Hello"));
console.log(greet("An", undefined));  // dùng mặc định
console.log(greet("An", null));       // KHÔNG dùng mặc định`,
String.raw`const code = "7203";
const qty = 100;
const order1 = { code: code, qty: qty };
const order2 = { code, qty };  // viết gọn, kết quả giống hệt
console.log(order1);
console.log(order2);`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Tham số mặc định được dùng khi không truyền hoặc truyền <code>undefined</code>.</li>
<li><code>{ name, role, active }</code> là cách viết gọn của <code>{ name: name, role: role, active: active }</code>.</li>
</ul>
<h3>Lưu ý</h3>
<p>Truyền <code>null</code> thì mặc định <strong>không</strong> được dùng: <code>createTestUser("A", null)</code> cho <code>role: null</code>.</p>`,
examples:[String.raw`function createTestUser(name, role = "viewer", active = true) {
  return { name, role, active };
}

console.log(createTestUser("Thao"));
console.log(createTestUser("An", "admin"));
console.log(createTestUser("Binh", "admin", false));
console.log(createTestUser("Chi", undefined, false));`]},
});
