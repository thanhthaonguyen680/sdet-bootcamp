defineExercise({
  id: 'w3.8',
  title: 'find, some, every',
  desc: `<p>Dùng đúng method phù hợp, không dùng vòng lặp:</p>
<ul>
<li><code>findOrder(orders, id)</code>: trả về lệnh có <code>id</code> tương ứng, không có thì <code>null</code>.</li>
<li><code>hasFailure(results)</code>: <code>true</code> nếu có ít nhất một test <code>"fail"</code>.</li>
<li><code>allPassed(results)</code>: <code>true</code> nếu mọi test đều <code>"pass"</code>.</li>
<li><code>indexOfCode(stocks, code)</code>: vị trí của mã trong mảng, không có thì <code>-1</code>.</li>
</ul>`,
  hints: [
    '<code>find</code> trả về phần tử đầu tiên thỏa điều kiện, <code>findIndex</code> trả về vị trí của nó.',
    '<code>some</code>: "có ít nhất một?", <code>every</code>: "tất cả đều?". Cả hai trả về true/false.',
    '<code>find</code> trả về <code>undefined</code> khi không thấy. Dùng <code>?? null</code> để đổi thành <code>null</code>.'],
  starter: String.raw`const findOrder = (orders, id) => null;
const hasFailure = (results) => false;
const allPassed = (results) => false;
const indexOfCode = (stocks, code) => -1;

const results = [{ name: "login", status: "pass" }, { name: "order", status: "fail" }];
console.log(hasFailure(results), allPassed(results));
`,
  tests: STRIP + String.raw`
const __od = [{ id: 1, code: "7203" }, { id: 2, code: "6758" }];
test('findOrder tìm thấy', () => expect(findOrder(__od, 2)).toEqual({ id: 2, code: "6758" }));
test('findOrder không thấy → null', () => expect(findOrder(__od, 9)).toBe(null));
test('hasFailure', () => { expect(hasFailure([{ status: "pass" }, { status: "fail" }])).toBe(true); expect(hasFailure([{ status: "pass" }])).toBe(false); });
test('allPassed', () => { expect(allPassed([{ status: "pass" }, { status: "pass" }])).toBe(true); expect(allPassed([{ status: "pass" }, { status: "skip" }])).toBe(false); });
test('indexOfCode', () => { expect(indexOfCode([{ code: "7203" }, { code: "6758" }], "6758")).toBe(1); expect(indexOfCode([{ code: "7203" }], "0000")).toBe(-1); });
test('Có dùng find, some, every, findIndex', () => { for (const m of ["find(", "some(", "every(", "findIndex("]) expect(__code.includes("." + m), 'Chưa dùng .' + m + ')').toBe(true); });
test('Không dùng vòng lặp', __noLoop);
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Bốn method tìm kiếm</h3>
${TRACE(['Method', 'Trả về', 'Không tìm thấy'], [['<code>find</code>', 'phần tử đầu tiên thỏa', '<code>undefined</code>'], ['<code>findIndex</code>', 'vị trí của phần tử đó', '<code>-1</code>'], ['<code>some</code>', '<code>true</code> nếu có ít nhất một', '<code>false</code>'], ['<code>every</code>', '<code>true</code> nếu tất cả thỏa', '(xem bẫy bên dưới)']])}
{{ex0}}
<p>Cả bốn đều <strong>dừng sớm</strong>: <code>find</code> và <code>some</code> dừng ngay khi gặp phần tử thỏa, <code>every</code> dừng ngay khi gặp phần tử không thỏa.</p>
<h3>Bẫy: every trên mảng rỗng</h3>
{{ex1}}
<p class="note">Góc QA: đây là lỗi có thật trong báo cáo test. Nếu vì lỗi cấu hình mà không test nào chạy, <code>results.every(r =&gt; r.status === "pass")</code> vẫn trả về <code>true</code> và pipeline báo xanh. Luôn kiểm tra thêm số test đã chạy lớn hơn 0.</p>
<h3>Gặp trong Playwright</h3>
<p>Kiểm tra cả danh sách trong một dòng: mọi giá đều dương, có ít nhất một lệnh bán, tìm đúng lệnh cần xem:</p>
{{ex2}}`,
examples:[String.raw`const orders = [{ id: 1, qty: 100 }, { id: 2, qty: 500 }, { id: 3, qty: 50 }];
console.log(orders.find(o => o.qty > 200));        // { id: 2, qty: 500 }
console.log(orders.findIndex(o => o.qty > 200));   // 1
console.log(orders.some(o => o.qty < 60));         // true
console.log(orders.every(o => o.qty > 10));        // true
console.log(orders.find(o => o.qty > 9999));       // undefined`,
String.raw`const results = [];
console.log(results.every(r => r.status === "pass"));  // true!
console.log(results.some(r => r.status === "fail"));   // false`,
{ run:false, code:String.raw`expect(prices.every(p => p > 0)).toBe(true);
expect(sides.some(s => s === "Bán")).toBe(true);

const order = orders.find(o => o.id === "DH-1001");
expect(order.status).toBe("Đã khớp");` }]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>?? null</code> đổi <code>undefined</code> (không tìm thấy) thành <code>null</code> theo yêu cầu đề. Không dùng <code>|| null</code> được vì nếu phần tử tìm thấy là giá trị falsy (như 0) cũng bị đổi mất.</li>
<li>Phân biệt: <code>hasFailure</code> hỏi "có cái nào", dùng <code>some</code>. <code>allPassed</code> hỏi "tất cả có", dùng <code>every</code>.</li>
</ul>
<h3>Viết allPassed an toàn hơn cho báo cáo thật</h3>
{{ex1}}`,
examples:[String.raw`const findOrder = (orders, id) => orders.find(o => o.id === id) ?? null;
const hasFailure = (results) => results.some(r => r.status === "fail");
const allPassed = (results) => results.every(r => r.status === "pass");
const indexOfCode = (stocks, code) => stocks.findIndex(s => s.code === code);

const results = [{ status: "pass" }, { status: "fail" }];
console.log(hasFailure(results), allPassed(results), allPassed([]));`,
String.raw`const allPassedStrict = (results) =>
  results.length > 0 && results.every(r => r.status === "pass");
console.log(allPassedStrict([]));   // false: không có test nào chạy`]},
});
