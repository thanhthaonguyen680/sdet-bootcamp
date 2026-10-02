defineExercise({
  id: 'w3.7',
  title: 'reduce: gom về một giá trị',
  desc: `<p>Dùng <code>reduce</code>, không dùng vòng lặp:</p>
<ul>
<li><code>totalValue(positions)</code>: tổng <code>qty × price</code> của danh mục.</li>
<li><code>countBySide(orders)</code>: trả về <code>{ buy: số lệnh mua, sell: số lệnh bán }</code>, luôn có đủ hai key.</li>
<li><code>sumAll(...nums)</code>: làm lại bài 4.4 tuần 1 trong một dòng.</li>
</ul>
<pre>totalValue([{ qty: 100, price: 2850 }, { qty: 200, price: 1000 }]) → 485000
countBySide([{ side: "buy" }, { side: "sell" }, { side: "buy" }]) → { buy: 2, sell: 1 }</pre>`,
  hints: [
    '<code>arr.reduce((acc, x) =&gt; ..., giá_trị_đầu)</code>. Callback trả về giá trị mới của <code>acc</code> sau mỗi phần tử.',
    'Tổng: <code>positions.reduce((sum, p) =&gt; sum + p.qty * p.price, 0)</code>. Luôn truyền giá trị đầu để mảng rỗng không bị lỗi.',
    'Đếm vào object: giá trị đầu là <code>{ buy: 0, sell: 0 }</code>, mỗi vòng tăng <code>acc[o.side]</code> rồi <code>return acc</code>.'],
  starter: String.raw`const totalValue = (positions) => 0;
const countBySide = (orders) => ({ buy: 0, sell: 0 });
const sumAll = (...nums) => 0;

console.log(totalValue([{ qty: 100, price: 2850 }, { qty: 200, price: 1000 }]));
console.log(countBySide([{ side: "buy" }, { side: "sell" }, { side: "buy" }]));
console.log(sumAll(1, 2, 3));
`,
  tests: STRIP + String.raw`
test('totalValue', () => expect(totalValue([{ qty: 100, price: 2850 }, { qty: 200, price: 1000 }])).toBe(485000));
test('totalValue([]) → 0', () => expect(totalValue([])).toBe(0));
test('countBySide', () => expect(countBySide([{ side: "buy" }, { side: "sell" }, { side: "buy" }])).toEqual({ buy: 2, sell: 1 }));
test('countBySide chỉ có lệnh mua', () => expect(countBySide([{ side: "buy" }])).toEqual({ buy: 1, sell: 0 }));
test('sumAll(1, 2, 3) → 6, sumAll() → 0', () => { expect(sumAll(1, 2, 3)).toBe(6); expect(sumAll()).toBe(0); });
test('Có dùng reduce', () => expect(__code.includes(".reduce(")).toBe(true));
test('Không dùng vòng lặp', __noLoop);
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>reduce: gom cả mảng về một giá trị</h3>
<p><code>reduce</code> đi qua từng phần tử, mang theo một biến tích lũy (accumulator). Giá trị callback trả về trở thành accumulator cho phần tử tiếp theo.</p>
{{ex0}}
${TRACE(['Vòng', 'acc (trước)', 'x', 'acc + x'], [['1', '0 (giá trị đầu)', '10', '10'], ['2', '10', '20', '30'], ['3', '30', '30', '60']])}
<h3>Luôn truyền giá trị đầu</h3>
<p>Không truyền giá trị đầu thì <code>reduce</code> lấy phần tử đầu làm acc, và <strong>báo lỗi</strong> khi mảng rỗng.</p>
{{ex1}}
<h3>Tích lũy vào object</h3>
<p>Accumulator có thể là object, rất hợp để đếm hoặc nhóm dữ liệu (giống mẫu đếm tần suất tuần 2):</p>
{{ex2}}`,
examples:[String.raw`const nums = [10, 20, 30];
const total = nums.reduce((acc, x) => acc + x, 0);
console.log(total);`,
String.raw`console.log([].reduce((a, b) => a + b, 0));   // 0
console.log([].reduce((a, b) => a + b));      // lỗi: mảng rỗng, không có giá trị đầu`,
String.raw`const words = ["buy", "sell", "buy"];
const tally = words.reduce((acc, w) => {
  acc[w] = (acc[w] ?? 0) + 1;
  return acc;                     // bắt buộc return acc
}, {});
console.log(tally);`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Chạy tay countBySide</h3>
${TRACE(['o.side', 'acc sau bước'], [['(đầu)', '{ buy: 0, sell: 0 }'], ['buy', '{ buy: 1, sell: 0 }'], ['sell', '{ buy: 1, sell: 1 }'], ['buy', '{ buy: 2, sell: 1 }']])}
<h3>Giải thích</h3>
<ul>
<li>Giá trị đầu <code>{ buy: 0, sell: 0 }</code> bảo đảm luôn có đủ hai key, kể cả khi không có lệnh bán nào.</li>
<li>Callback có <code>{ }</code> nên phải <code>return acc</code>. Quên dòng này thì từ vòng hai acc là <code>undefined</code> và báo lỗi.</li>
<li>Giá trị đầu <code>0</code> trong <code>totalValue</code> và <code>sumAll</code> làm mảng rỗng trả về 0 thay vì lỗi.</li>
</ul>`,
examples:[String.raw`const totalValue = (positions) => positions.reduce((sum, p) => sum + p.qty * p.price, 0);

const countBySide = (orders) => orders.reduce((acc, o) => {
  acc[o.side]++;
  return acc;
}, { buy: 0, sell: 0 });

const sumAll = (...nums) => nums.reduce((a, b) => a + b, 0);

console.log(totalValue([{ qty: 100, price: 2850 }, { qty: 200, price: 1000 }]));
console.log(countBySide([{ side: "buy" }, { side: "sell" }, { side: "buy" }]));
console.log(sumAll(1, 2, 3), sumAll());`]},
});
