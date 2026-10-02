defineExercise({
  id: 'w3.9',
  title: 'sort và nối chuỗi method',
  desc: `<p>Viết <code>topGainers(stocks, n)</code> trả về mảng <strong>mã</strong> của <code>n</code> cổ phiếu có <code>change</code> cao nhất, xếp giảm dần. Không được làm thay đổi mảng gốc.</p>
<pre>const stocks = [
  { code: "7203", change: 15 },
  { code: "6758", change: -20 },
  { code: "9984", change: 42 },
  { code: "8306", change: 3 },
];
topGainers(stocks, 2) → ["9984", "7203"]</pre>`,
  hints: [
    '<code>sort</code> sửa trực tiếp mảng gốc. Sao chép trước: <code>[...stocks]</code>.',
    'Sắp xếp giảm dần theo số: <code>.sort((a, b) =&gt; b.change - a.change)</code>.',
    'Nối tiếp: sao chép → sort → <code>slice(0, n)</code> → <code>map</code> lấy mã.'],
  starter: String.raw`const topGainers = (stocks, n) => [];

const stocks = [
  { code: "7203", change: 15 },
  { code: "6758", change: -20 },
  { code: "9984", change: 42 },
  { code: "8306", change: 3 },
];
console.log(topGainers(stocks, 2)); // ["9984", "7203"]
`,
  tests: STRIP + String.raw`
const __s = () => [{ code: "7203", change: 15 }, { code: "6758", change: -20 }, { code: "9984", change: 42 }, { code: "8306", change: 3 }];
test('Top 2', () => expect(topGainers(__s(), 2)).toEqual(["9984", "7203"]));
test('Top 4 đủ thứ tự', () => expect(topGainers(__s(), 4)).toEqual(["9984", "7203", "8306", "6758"]));
test('n lớn hơn số phần tử', () => expect(topGainers(__s(), 10).length).toBe(4));
test('So sánh theo số, không theo chữ', () => expect(topGainers([{ code: "a", change: 9 }, { code: "b", change: 100 }, { code: "c", change: 10 }], 3)).toEqual(["b", "c", "a"]));
test('Không sửa mảng gốc', () => { const s = __s(); topGainers(s, 2); expect(s.map(x => x.code), 'Mảng gốc đã bị sort').toEqual(["7203", "6758", "9984", "8306"]); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>sort cần hàm so sánh</h3>
<p>Hàm so sánh nhận hai phần tử <code>a</code>, <code>b</code> và trả về số: âm thì <code>a</code> đứng trước, dương thì <code>b</code> đứng trước.</p>
{{ex0}}
<h3>sort sửa trực tiếp mảng gốc</h3>
<p>Khác với <code>map</code> và <code>filter</code>, <code>sort</code> thay đổi mảng gốc. Muốn giữ nguyên thì sao chép trước bằng <code>[...arr]</code>.</p>
{{ex1}}
<h3>Nối chuỗi dài cho dễ đọc</h3>
{{ex2}}`,
examples:[String.raw`const nums = [10, 9, 100, 1];
console.log([...nums].sort());                  // theo chữ: [1, 10, 100, 9]
console.log([...nums].sort((a, b) => a - b));   // tăng dần
console.log([...nums].sort((a, b) => b - a));   // giảm dần

const names = ["Sony", "Toyota", "Honda"];
console.log([...names].sort((a, b) => a.localeCompare(b)));`,
String.raw`const original = [3, 1, 2];
const sorted = original.sort((a, b) => a - b);
console.log(original, sorted === original);   // [1, 2, 3] true: gốc đã bị đổi`,
String.raw`const stocks = [{ code: "A", vol: 5 }, { code: "B", vol: 9 }, { code: "C", vol: 7 }];
const top2 = [...stocks]
  .sort((a, b) => b.vol - a.vol)
  .slice(0, 2)
  .map(s => s.code);
console.log(top2);`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Từng bước với n = 2</h3>
${TRACE(['Bước', 'Kết quả'], [['<code>[...stocks]</code>', 'bản sao 4 phần tử'], ['<code>.sort((a, b) =&gt; b.change - a.change)</code>', '9984 (42), 7203 (15), 8306 (3), 6758 (−20)'], ['<code>.slice(0, 2)</code>', '9984, 7203'], ['<code>.map(s =&gt; s.code)</code>', '["9984", "7203"]']])}
<h3>Giải thích</h3>
<ul>
<li><code>b.change - a.change</code> dương khi <code>b</code> lớn hơn, nên <code>b</code> đứng trước: sắp giảm dần.</li>
<li><code>slice(0, n)</code> không lỗi khi <code>n</code> lớn hơn độ dài mảng, chỉ trả về toàn bộ.</li>
<li>Thiếu <code>[...stocks]</code> thì mảng của người gọi bị đảo thứ tự, một lỗi rất khó phát hiện vì kết quả trả về vẫn đúng.</li>
</ul>`,
examples:[String.raw`const topGainers = (stocks, n) => [...stocks]
  .sort((a, b) => b.change - a.change)
  .slice(0, n)
  .map(s => s.code);

const stocks = [
  { code: "7203", change: 15 },
  { code: "6758", change: -20 },
  { code: "9984", change: 42 },
  { code: "8306", change: 3 },
];
console.log(topGainers(stocks, 2), stocks.map(s => s.code));`]},
});
