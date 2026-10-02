defineExercise({
  id: 'w3.2',
  title: 'Destructuring object',
  desc: `<p>Viết hai function, dùng destructuring để lấy dữ liệu từ object:</p>
<ul>
<li><code>formatOrder(order)</code>: lấy <code>code</code>, <code>side</code>, <code>qty</code>, <code>price</code>. Thiếu <code>qty</code> thì mặc định 100. Trả về chuỗi <code>"BUY 7203 x200 @ 2850"</code>.</li>
<li><code>getUserInfo(res)</code>: với <code>res = { data: { user: { name, role } } }</code>, trả về <code>"Thao (admin)"</code>.</li>
</ul>`,
  hints: [
    '<code>const { code, side, qty, price } = order;</code> tạo 4 biến cùng lúc.',
    'Giá trị mặc định viết ngay trong destructuring: <code>const { qty = 100 } = order;</code>',
    'Lấy lồng nhiều cấp: <code>const { data: { user: { name, role } } } = res;</code> Có thể destructuring luôn ở tham số: <code>const formatOrder = ({ code, side, qty = 100, price }) =&gt; ...</code>'],
  starter: String.raw`const formatOrder = (order) => {

};

const getUserInfo = (res) => {

};

console.log(formatOrder({ code: "7203", side: "buy", qty: 200, price: 2850 }));
console.log(getUserInfo({ data: { user: { name: "Thao", role: "admin" } } }));
`,
  tests: STRIP + String.raw`
test('Đủ thông tin', () => expect(formatOrder({ code: "7203", side: "buy", qty: 200, price: 2850 })).toBe("BUY 7203 x200 @ 2850"));
test('Lệnh bán', () => expect(formatOrder({ code: "6758", side: "sell", qty: 300, price: 13200 })).toBe("SELL 6758 x300 @ 13200"));
test('Thiếu qty → mặc định 100', () => expect(formatOrder({ code: "9984", side: "buy", price: 8900 })).toBe("BUY 9984 x100 @ 8900"));
test('getUserInfo', () => expect(getUserInfo({ data: { user: { name: "An", role: "viewer" } } })).toBe("An (viewer)"));
test('Có dùng destructuring object', () => expect(/(const|let)\s*\{|\(\s*\{/.test(__code), 'Chưa thấy cú pháp destructuring { ... }').toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Destructuring object</h3>
<p>Lấy nhiều thuộc tính của object ra thành biến trong một dòng. Tên biến phải trùng tên key.</p>
{{ex0}}
<h3>Giá trị mặc định và đổi tên</h3>
{{ex1}}
<h3>Lấy lồng nhiều cấp và destructuring ở tham số</h3>
{{ex2}}
<p class="note">Góc QA: <code>async ({ page }) =&gt;</code> trong Playwright chính là destructuring ở tham số. Playwright truyền vào một object chứa nhiều thứ (page, browser, request...), bạn chỉ lấy ra thứ mình cần.</p>`,
examples:[String.raw`const order = { code: "7203", side: "buy", qty: 200 };

// cách cũ
const code1 = order.code;
const side1 = order.side;

// destructuring
const { code, side } = order;
console.log(code, side);`,
String.raw`const order = { code: "7203", price: 2850 };
const { qty = 100 } = order;          // thiếu qty → dùng 100
const { price: p } = order;           // lấy price nhưng đặt tên biến là p
console.log(qty, p);`,
String.raw`const res = { status: 200, data: { user: { name: "Thao", role: "admin" } } };
const { status, data: { user: { name } } } = res;
console.log(status, name);

const describe = ({ name, role = "viewer" }) => name + " là " + role;
console.log(describe({ name: "An" }));`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Destructuring ngay ở tham số, kèm mặc định <code>qty = 100</code>. Mặc định chỉ áp dụng khi giá trị là <code>undefined</code>, giống tham số mặc định tuần 1.</li>
<li>Template literal ghép chuỗi gọn hơn nối bằng <code>+</code>.</li>
<li><code>getUserInfo</code> lấy lồng hai cấp. Chú ý <code>data</code> và <code>user</code> chỉ là "đường đi", không trở thành biến.</li>
</ul>
<h3>Lỗi hay gặp</h3>
<p>Destructuring lồng khi cấp giữa không tồn tại sẽ báo lỗi, ví dụ <code>res.data</code> là <code>undefined</code>. Với dữ liệu không chắc chắn, dùng <code>res?.data?.user</code> hoặc đặt mặc định <code>{ data: { user } = {} }</code>.</p>`,
examples:[L(
'const formatOrder = ({ code, side, qty = 100, price }) =>',
'  `${side.toUpperCase()} ${code} x${qty} @ ${price}`;',
'',
'const getUserInfo = (res) => {',
'  const { data: { user: { name, role } } } = res;',
'  return `${name} (${role})`;',
'};',
'',
'console.log(formatOrder({ code: "9984", side: "buy", price: 8900 }));',
'console.log(getUserInfo({ data: { user: { name: "Thao", role: "admin" } } }));')]},
});
