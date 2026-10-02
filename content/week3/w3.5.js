defineExercise({
  id: 'w3.5',
  title: 'map: biến đổi từng phần tử',
  desc: `<p>Dùng <code>map</code>, <strong>không</strong> dùng <code>for</code>/<code>while</code>:</p>
<ul>
<li><code>toCodes(stocks)</code>: trả về mảng mã cổ phiếu.</li>
<li><code>withTax(prices)</code>: mỗi giá nhân 1.1 rồi làm tròn bằng <code>Math.round</code>.</li>
<li><code>toLabels(stocks)</code>: trả về dạng <code>"7203: Toyota"</code>.</li>
</ul>
<pre>const stocks = [{ code: "7203", name: "Toyota" }, { code: "6758", name: "Sony" }];
toCodes(stocks)   → ["7203", "6758"]
withTax([100, 250]) → [110, 275]</pre>`,
  hints: [
    '<code>arr.map(x =&gt; ...)</code> gọi callback cho từng phần tử và gom kết quả trả về thành mảng mới cùng độ dài.',
    '<code>stocks.map(s =&gt; s.code)</code>. Có thể destructuring ngay trong tham số: <code>stocks.map(({ code }) =&gt; code)</code>.',
    'Nếu callback dùng <code>{ }</code> thì phải có <code>return</code>, nếu không mảng kết quả toàn <code>undefined</code>.'],
  starter: String.raw`const stocks = [
  { code: "7203", name: "Toyota" },
  { code: "6758", name: "Sony" },
];

const toCodes = (stocks) => ;
const withTax = (prices) => ;
const toLabels = (stocks) => ;

console.log(toCodes(stocks));
console.log(withTax([100, 250]));
console.log(toLabels(stocks));
`.replace(/ => ;/g, ' => [];'),
  tests: STRIP + String.raw`
const __st = [{ code: "7203", name: "Toyota" }, { code: "6758", name: "Sony" }, { code: "9984", name: "SoftBank" }];
test('toCodes', () => expect(toCodes(__st)).toEqual(["7203", "6758", "9984"]));
test('withTax([100, 250]) → [110, 275]', () => expect(withTax([100, 250])).toEqual([110, 275]));
test('withTax([2850]) → [3135]', () => expect(withTax([2850])).toEqual([3135]));
test('toLabels', () => expect(toLabels(__st)).toEqual(["7203: Toyota", "6758: Sony", "9984: SoftBank"]));
test('Mảng rỗng → []', () => { expect(toCodes([])).toEqual([]); expect(withTax([])).toEqual([]); });
test('Có dùng map', () => expect(__code.includes(".map(")).toBe(true));
test('Không dùng vòng lặp', __noLoop);
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>map: mỗi phần tử một kết quả</h3>
<p><code>map</code> gọi callback cho từng phần tử và gom kết quả thành mảng mới <strong>cùng độ dài</strong>. Mảng gốc không đổi.</p>
{{ex0}}
<p>Callback nhận thêm tham số thứ hai là index nếu cần.</p>
<h3>Lỗi hay gặp: quên return</h3>
{{ex1}}
<h3>map khác forEach thế nào</h3>
<p><code>forEach</code> chỉ chạy callback, không trả về gì (<code>undefined</code>). Dùng <code>forEach</code> khi chỉ muốn làm gì đó với từng phần tử (như in ra), dùng <code>map</code> khi muốn có mảng kết quả.</p>
<p class="note">Góc QA: <code>map</code> dùng liên tục khi xử lý dữ liệu lấy từ trang, ví dụ lấy danh sách text từ các phần tử rồi chuẩn hóa: <code>texts.map(t =&gt; t.trim())</code>.</p>
<h3>Gặp trong Playwright</h3>
<p>Lấy text của cả cột rồi đổi sang số để so sánh. <code>allTextContents()</code> trả về mảng chuỗi, <code>map</code> biến đổi từng phần tử:</p>
{{ex2}}`,
examples:[String.raw`const prices = [100, 250, 2850];
const doubled = prices.map(p => p * 2);
console.log(doubled, prices);

const labeled = prices.map((p, i) => "#" + (i + 1) + ": " + p);
console.log(labeled);

const stocks = [{ code: "7203", change: 15 }, { code: "6758", change: -20 }];
console.log(stocks.map(({ code }) => code));`,
String.raw`const nums = [1, 2, 3];
console.log(nums.map(n => { n * 2; }));         // [undefined, undefined, undefined]
console.log(nums.map(n => { return n * 2; }));  // [2, 4, 6]
console.log(nums.map(n => n * 2));              // [2, 4, 6]`,
{ run:false, code:String.raw`const texts = await page.getByTestId("price").allTextContents();
// ["2,850", "13,250", "8,850"]
const prices = texts.map(t => Number(t.replaceAll(",", "")));
// [2850, 13250, 8850]` }]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<p>Mỗi hàm đều là "một đầu vào, một đầu ra" cho từng phần tử, đúng việc của <code>map</code>. Destructuring trong tham số callback (<code>({ code }) =&gt; code</code>) giúp bỏ bớt <code>s.</code> lặp lại.</p>
<h3>So với vòng lặp</h3>
{{ex1}}
<p>Hai cách cho cùng kết quả. Cách dùng <code>map</code> không cần tạo mảng rỗng, không cần <code>push</code>, và đọc lên là biết ngay ý định "biến đổi từng phần tử".</p>`,
examples:[L(
'const toCodes = (stocks) => stocks.map(({ code }) => code);',
'const withTax = (prices) => prices.map(p => Math.round(p * 1.1));',
'const toLabels = (stocks) => stocks.map(({ code, name }) => `${code}: ${name}`);',
'',
'const stocks = [{ code: "7203", name: "Toyota" }, { code: "6758", name: "Sony" }];',
'console.log(toCodes(stocks), withTax([100, 250]), toLabels(stocks));'),
String.raw`const prices = [100, 250];
const result = [];
for (const p of prices) result.push(Math.round(p * 1.1));
console.log(result);`]},
});
