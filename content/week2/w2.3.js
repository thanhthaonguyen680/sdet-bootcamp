defineExercise({
  id: 'w2.3',
  title: 'Đếm tần suất ký tự',
  desc: `<p>Viết <code>charFrequency(str)</code> trả về object đếm số lần xuất hiện của mỗi ký tự. Không phân biệt hoa thường, bỏ qua khoảng trắng.</p>
<pre>"Hello" → { h: 1, e: 1, l: 2, o: 1 }
"aA a"  → { a: 3 }
""      → {}</pre>`,
  hints: [
    'Tạo object rỗng <code>const count = {}</code>, rồi duyệt từng ký tự của chuỗi đã chuyển chữ thường.',
    'Ký tự chưa có trong object (<code>count[ch] === undefined</code>) thì gán 1, có rồi thì tăng thêm 1. Gặp khoảng trắng thì <code>continue</code>.',
    'Viết gọn trong một dòng: <code>count[ch] = (count[ch] ?? 0) + 1;</code>'],
  starter: String.raw`function charFrequency(str) {

}

console.log(charFrequency("Hello")); // { h: 1, e: 1, l: 2, o: 1 }
`,
  tests: String.raw`
test('"Hello"', () => expect(charFrequency("Hello")).toEqual({ h: 1, e: 1, l: 2, o: 1 }));
test('"aA a" → { a: 3 }', () => expect(charFrequency("aA a")).toEqual({ a: 3 }));
test('"" → {}', () => expect(charFrequency("")).toEqual({}));
test('"7203" đếm được chữ số', () => expect(charFrequency("7203")).toEqual({ "7": 1, "2": 1, "0": 1, "3": 1 }));
test('Không đếm khoảng trắng', () => expect(charFrequency("a b")).toEqual({ a: 1, b: 1 }));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Mẫu đếm tần suất (frequency counter)</h3>
<p>Dùng object như một cuốn sổ: key là thứ cần đếm, value là số lần gặp. Đây là một trong những mẫu quan trọng nhất tuần này, bạn sẽ dùng lại ở các bài 4, 5 và 14.</p>
{{ex0}}
<h3>Bỏ qua phần tử với continue</h3>
<p><code>continue</code> bỏ qua phần còn lại của vòng hiện tại và chuyển sang vòng tiếp theo.</p>
{{ex1}}
<p class="note">Góc QA: mẫu này dùng khi tổng hợp log, ví dụ đếm số lỗi theo từng mã lỗi hoặc số request theo từng endpoint khi phân tích kết quả test.</p>`,
examples:[String.raw`const votes = ["buy", "sell", "buy", "buy"];
const tally = {};
for (const v of votes) {
  if (tally[v] === undefined) {
    tally[v] = 1;
  } else {
    tally[v]++;
  }
}
console.log(tally);  // { buy: 3, sell: 1 }`,
String.raw`for (const ch of "a b") {
  if (ch === " ") continue;
  console.log("Xử lý:", ch);
}`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Duyệt từng ký tự của chuỗi chữ thường, bỏ qua khoảng trắng, dùng object để cộng dồn.</p>
{{ex0}}
<h3>Chạy tay với "Hello"</h3>
${TRACE(['ch', 'count sau bước này'], [['h', '{ h: 1 }'], ['e', '{ h: 1, e: 1 }'], ['l', '{ h: 1, e: 1, l: 1 }'], ['l', '{ h: 1, e: 1, l: 2 }'], ['o', '{ h: 1, e: 1, l: 2, o: 1 }']])}
<h3>Độ phức tạp</h3>
<p>O(n) thời gian. Bộ nhớ tỷ lệ với số ký tự khác nhau.</p>
<h3>Giải thích dòng viết gọn</h3>
<p><code>(count[ch] ?? 0) + 1</code>: lần đầu gặp, <code>count[ch]</code> là <code>undefined</code> nên lấy 0, cộng 1 thành 1. Những lần sau lấy giá trị hiện tại cộng 1.</p>
<h3>Mở rộng: ký tự xuất hiện nhiều nhất</h3>
{{ex1}}`,
examples:[String.raw`function charFrequency(str) {
  const count = {};
  for (const ch of str.toLowerCase()) {
    if (ch === " ") continue;
    count[ch] = (count[ch] ?? 0) + 1;
  }
  return count;
}

console.log(charFrequency("Hello"));`,
String.raw`const count = { h: 1, e: 1, l: 2, o: 1 };
let topChar = null;
let topCount = 0;
for (const ch in count) {
  if (count[ch] > topCount) {
    topChar = ch;
    topCount = count[ch];
  }
}
console.log(topChar, topCount);  // l 2`]},
});
