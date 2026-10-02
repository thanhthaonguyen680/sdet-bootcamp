defineExercise({
  id: 'w3.1',
  title: 'Arrow function',
  desc: `<p>Viết lại 4 function sau bằng arrow function, <strong>không</strong> dùng từ khóa <code>function</code>:</p>
<pre>double(n)          → n * 2
isEven(n)          → true nếu n chẵn
fullName(user)     → user.first + " " + user.last
makeMultiplier(k)  → trả về một function nhân với k</pre>
<pre>makeMultiplier(3)(5) → 15</pre>`,
  hints: [
    'Cú pháp đầy đủ: <code>const double = (n) =&gt; { return n * 2; };</code>',
    'Thân hàm chỉ có một biểu thức thì bỏ <code>{ }</code> và <code>return</code>: <code>const double = n =&gt; n * 2;</code>',
    'Arrow trả về arrow: <code>const makeMultiplier = k =&gt; n =&gt; n * k;</code>'],
  starter: String.raw`// Viết lại bằng arrow function:
// function double(n) { return n * 2; }
// function isEven(n) { return n % 2 === 0; }
// function fullName(user) { return user.first + " " + user.last; }
// function makeMultiplier(k) { return function (n) { return n * k; }; }



// console.log(double(4), isEven(3), fullName({ first: "Thao", last: "Nguyen" }));
// console.log(makeMultiplier(3)(5));
`,
  tests: STRIP + String.raw`
test('double(4) → 8', () => expect(double(4)).toBe(8));
test('isEven(4) → true, isEven(3) → false', () => { expect(isEven(4)).toBe(true); expect(isEven(3)).toBe(false); });
test('fullName', () => expect(fullName({ first: "An", last: "Tran" })).toBe("An Tran"));
test('makeMultiplier(3)(5) → 15', () => expect(makeMultiplier(3)(5)).toBe(15));
test('Không dùng từ khóa function', () => expect(/\bfunction\b/.test(__code), 'Vẫn còn từ khóa function ngoài phần comment').toBe(false));
test('Có dùng =>', () => expect(__code.includes("=>")).toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Tuần 3 học gì</h3>
<p>ES6 (năm 2015) và các phiên bản sau bổ sung nhiều cú pháp làm code ngắn và rõ hơn. Code Playwright, Jest và hầu hết project hiện đại dùng chúng ở mọi dòng. Đoạn test Playwright dưới đây có đủ những thứ bạn sẽ học tuần này:</p>
{{ex0}}
<p>Tuần này có <strong>7 bài bắt buộc</strong>, chỉ gồm những gì bạn sẽ gặp hằng ngày khi viết test Playwright:</p>
<ul>
<li>Arrow function và destructuring (bài 1–2): cú pháp của mọi test, như <code>async ({ page }) =&gt; { ... }</code>.</li>
<li><code>map</code>, <code>filter</code>, <code>find</code>, <code>some</code>, <code>every</code> (bài 3–5): xử lý danh sách lấy từ trang, ví dụ text của các dòng trong bảng giá.</li>
<li><code>async/await</code> và <code>Promise.all</code> (bài 6–7): mọi thao tác với trình duyệt đều phải <code>await</code>.</li>
</ul>
<p>11 bài còn lại (từ bài 8) là <strong>nâng cao, không bắt buộc</strong> và không tính vào tiến độ. Playwright đã lo sẵn phần lớn những việc đó, như tự chờ và tự thử lại. Bạn có thể học xong tuần 4 rồi quay lại làm sau.</p>
<p class="note">Cuối một số bài giảng có mục <strong>Gặp trong Playwright</strong>. Đoạn code ở đó chỉ để minh họa, chưa chạy được ở tuần này. Từ tuần 4, bạn sẽ viết code thật trên trang Sàn Demo.</p>
<h3>Cú pháp arrow function</h3>
{{ex1}}
<p>Quy tắc rút gọn: chỉ một tham số thì bỏ được ngoặc tròn; thân chỉ có một biểu thức thì bỏ <code>{ }</code> và <code>return</code>, giá trị biểu thức tự được trả về.</p>
<h3>Bẫy khi trả về object</h3>
{{ex2}}
<p>Arrow function còn khác function thường ở cách xử lý <code>this</code>. Bạn sẽ gặp điều này khi học class; tạm thời chỉ cần biết trong callback, arrow function là lựa chọn mặc định.</p>`,
examples:[{ run:false, code:String.raw`test("hiển thị đúng mã cổ phiếu", async ({ page }) => {
  await page.goto("/stocks");
  const names = await page.locator(".stock-code").allTextContents();
  const toyota = names.filter(n => n.includes("7203"));
  expect(toyota).toHaveLength(1);
});` },
String.raw`const add1 = function (a, b) { return a + b; };
const add2 = (a, b) => { return a + b; };
const add3 = (a, b) => a + b;     // một biểu thức: bỏ {} và return
const square = x => x * x;        // một tham số: bỏ luôn ()
const hello = () => "Xin chào";   // không tham số: bắt buộc có ()
console.log(add1(1, 2), add2(1, 2), add3(1, 2), square(4), hello());`,
String.raw`const makeOrder1 = code => { code: code };    // sai: {} bị hiểu là thân hàm
const makeOrder2 = code => ({ code: code });  // đúng: bọc trong ngoặc tròn
console.log(makeOrder1("7203"));  // undefined
console.log(makeOrder2("7203"));  // { code: "7203" }`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Cả bốn hàm đều chỉ có một biểu thức nên bỏ được <code>{ }</code> và <code>return</code>.</li>
<li><code>isEven</code> trả thẳng kết quả phép so sánh, không cần <code>if</code> hay toán tử ba ngôi.</li>
<li><code>makeMultiplier</code> đọc từ trái sang: nhận <code>k</code>, trả về một hàm nhận <code>n</code> và trả về <code>n * k</code>. Hàm bên trong nhớ <code>k</code> nhờ closure (bài 4.5 tuần 1).</li>
</ul>
<h3>Lỗi hay gặp</h3>
<p>Viết <code>const double = n =&gt; { n * 2 }</code>: có <code>{ }</code> mà không có <code>return</code> nên trả về <code>undefined</code>.</p>`,
examples:[String.raw`const double = n => n * 2;
const isEven = n => n % 2 === 0;
const fullName = user => user.first + " " + user.last;
const makeMultiplier = k => n => n * k;

console.log(double(4), isEven(3), fullName({ first: "Thao", last: "Nguyen" }));
const triple = makeMultiplier(3);
console.log(triple(5), triple(10));`]},
});
