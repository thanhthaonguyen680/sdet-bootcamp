defineExercise({
  id: 'w2.5',
  title: 'Ký tự không lặp đầu tiên',
  desc: `<p>Viết <code>firstUniqueChar(str)</code> trả về ký tự đầu tiên chỉ xuất hiện đúng một lần trong chuỗi. Không có thì trả về <code>null</code>. Có phân biệt hoa thường.</p>
<pre>"swiss"        → "w"
"loveleetcode" → "v"
"aabb"         → null</pre>`,
  hints: [
    'Cần hai lượt duyệt chuỗi.',
    'Lượt 1: đếm tần suất (giống bài 3). Lượt 2: duyệt lại chuỗi gốc từ đầu, ký tự đầu tiên có số đếm bằng 1 chính là đáp án.',
    'Lượt 2 phải duyệt chuỗi gốc chứ không duyệt object đếm, vì cần giữ đúng thứ tự trong chuỗi. Xem bài giảng để biết vì sao.'],
  starter: String.raw`function firstUniqueChar(str) {

}

console.log(firstUniqueChar("swiss")); // "w"
`,
  tests: String.raw`
test('"swiss" → "w"', () => expect(firstUniqueChar("swiss")).toBe("w"));
test('"leetcode" → "l"', () => expect(firstUniqueChar("leetcode")).toBe("l"));
test('"loveleetcode" → "v"', () => expect(firstUniqueChar("loveleetcode")).toBe("v"));
test('"aabb" → null', () => expect(firstUniqueChar("aabb")).toBe(null));
test('"" → null', () => expect(firstUniqueChar("")).toBe(null));
test('"aA" → "a" (phân biệt hoa thường)', () => expect(firstUniqueChar("aA")).toBe("a"));
test('"b22113" → "b" (đúng thứ tự khi có ký tự số)', () => expect(firstUniqueChar("b22113")).toBe("b"));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Vì sao không dùng hai vòng lồng nhau</h3>
<p>Cách tự nhiên nhất: với mỗi ký tự, duyệt cả chuỗi để đếm nó xuất hiện mấy lần. Nhưng như vậy là n × n bước. Xem số bước tăng nhanh thế nào:</p>
{{ex0}}
<h3>Hai lượt duyệt (two-pass)</h3>
<p>Lượt 1 đếm tần suất, lượt 2 tra kết quả. Tổng cộng chỉ 2n bước. Chạy hai vòng nối tiếp nhau vẫn là O(n), chỉ hai vòng <strong>lồng</strong> nhau mới là O(n²).</p>
<h3>Bẫy: thứ tự key trong object</h3>
<p>Key dạng số nguyên luôn được xếp lên đầu theo thứ tự tăng dần, không giữ thứ tự thêm vào. Vì vậy không nên dựa vào thứ tự duyệt object để tìm "ký tự đầu tiên".</p>
{{ex1}}`,
examples:[String.raw`function nestedSteps(n) {
  let steps = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) steps++;
  }
  return steps;
}
console.log("n = 10:", nestedSteps(10));
console.log("n = 100:", nestedSteps(100));
console.log("n = 1000:", nestedSteps(1000));`,
String.raw`const o = {};
o["b"] = 1;
o["2"] = 1;
o["a"] = 1;
o["1"] = 1;
console.log(Object.keys(o));  // ["1", "2", "b", "a"]`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Lượt 1 đếm tần suất. Lượt 2 duyệt lại chuỗi gốc theo đúng thứ tự, gặp ký tự có số đếm bằng 1 thì trả về ngay.</p>
{{ex0}}
<h3>Chạy tay với "swiss"</h3>
<p>Sau lượt 1: <code>{ s: 3, w: 1, i: 1 }</code></p>
${TRACE(['ch', 'count[ch]', 'hành động'], [['s', '3', 'bỏ qua'], ['w', '1', 'trả về <code>"w"</code>']])}
<h3>Độ phức tạp</h3>
<p>O(n): hai vòng lặp chạy nối tiếp, mỗi vòng n bước, tổng 2n bước. Hằng số 2 được bỏ qua trong Big-O.</p>
<h3>Lỗi hay gặp</h3>
<ul>
<li>Duyệt object đếm ở lượt 2 thay vì chuỗi gốc: với <code>"b22113"</code> sẽ trả về <code>"3"</code> thay vì <code>"b"</code>, vì key dạng số được xếp lên đầu.</li>
<li>Quên <code>return null</code> ở cuối: function trả về <code>undefined</code> khi không có ký tự nào duy nhất.</li>
</ul>`,
examples:[String.raw`function firstUniqueChar(str) {
  const count = {};
  for (const ch of str) {
    count[ch] = (count[ch] ?? 0) + 1;
  }
  for (const ch of str) {
    if (count[ch] === 1) return ch;
  }
  return null;
}

console.log(firstUniqueChar("swiss"));
console.log(firstUniqueChar("aabb"));`]},
});
