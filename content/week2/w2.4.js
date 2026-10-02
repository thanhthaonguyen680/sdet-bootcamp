defineExercise({
  id: 'w2.4',
  title: 'Kiểm tra anagram',
  desc: `<p>Hai chuỗi là anagram nếu dùng đúng những chữ cái giống nhau, cùng số lượng, chỉ khác thứ tự. Viết <code>isAnagram(a, b)</code>, không phân biệt hoa thường, bỏ qua khoảng trắng.</p>
<pre>("listen", "silent")        → true
("Dormitory", "dirty room") → true
("hello", "world")          → false
("aab", "abb")              → false</pre>`,
  hints: [
    'Dùng lại ý tưởng bài 3: đếm tần suất ký tự của từng chuỗi. Bạn cần viết lại function đếm trong bài này.',
    'Hai chuỗi là anagram khi hai object đếm có cùng số key, và mỗi key có cùng giá trị. Số key: <code>Object.keys(obj).length</code>.',
    'Duyệt <code>for (const ch in countA)</code>, gặp <code>countA[ch] !== countB[ch]</code> thì <code>return false</code>.'],
  starter: String.raw`function isAnagram(a, b) {

}

console.log(isAnagram("listen", "silent")); // true
`,
  tests: String.raw`
test('("listen", "silent") → true', () => expect(isAnagram("listen", "silent")).toBe(true));
test('("Dormitory", "dirty room") → true', () => expect(isAnagram("Dormitory", "dirty room")).toBe(true));
test('("hello", "world") → false', () => expect(isAnagram("hello", "world")).toBe(false));
test('("aab", "abb") → false (cùng chữ, khác số lượng)', () => expect(isAnagram("aab", "abb")).toBe(false));
test('("abc", "abcd") → false', () => expect(isAnagram("abc", "abcd")).toBe(false));
test('("", "") → true', () => expect(isAnagram("", "")).toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Tái sử dụng function</h3>
<p>Bài này có thể giải gọn bằng cách dùng lại function đếm của bài 3. Hãy viết một function phụ để đếm, rồi gọi nó hai lần trong <code>isAnagram</code>. Chia nhỏ thành function phụ giúp code dễ đọc và dễ test từng phần.</p>
<h3>So sánh hai object</h3>
<p><code>===</code> so sánh object theo tham chiếu nên luôn ra <code>false</code> với hai object khác nhau. Phải tự so sánh từng key:</p>
{{ex0}}
<h3>Một hướng khác: sắp xếp</h3>
<p>Hai chuỗi là anagram khi sắp xếp các ký tự xong thì giống hệt nhau. Cách này ngắn nhưng chậm hơn một chút, O(n log n) so với O(n).</p>
{{ex1}}`,
examples:[String.raw`const a = { x: 1, y: 2 };
const b = { y: 2, x: 1 };
console.log(a === b);  // false

let same = Object.keys(a).length === Object.keys(b).length;
for (const k in a) {
  if (a[k] !== b[k]) same = false;
}
console.log(same);     // true`,
String.raw`const word = "silent";
console.log(word.split(""));
console.log(word.split("").sort().join(""));  // "eilnst"`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Đếm tần suất ký tự của cả hai chuỗi bằng một function phụ, sau đó so sánh hai object đếm.</p>
{{ex0}}
<h3>Vì sao phải so sánh số key</h3>
<p>Vòng <code>for...in</code> chỉ duyệt key của <code>ca</code>. Với <code>("abc", "abcd")</code>, mọi key của <code>ca</code> đều khớp với <code>cb</code>, nhưng <code>cb</code> còn thừa <code>d</code>. Kiểm tra số key trước sẽ bắt được trường hợp này.</p>
<h3>Chạy tay với ("aab", "abb")</h3>
${TRACE(['bước', 'giá trị'], [['ca', '{ a: 2, b: 1 }'], ['cb', '{ a: 1, b: 2 }'], ['số key', '2 = 2, tiếp tục'], ['key a', '2 ≠ 1 → <code>false</code>']])}
<h3>Độ phức tạp</h3>
<p>O(n + m) với n, m là độ dài hai chuỗi. Cách sắp xếp là O(n log n), chậm hơn một chút nhưng code ngắn:</p>
{{ex1}}`,
examples:[String.raw`function countChars(str) {
  const count = {};
  for (const ch of str.toLowerCase()) {
    if (ch === " ") continue;
    count[ch] = (count[ch] ?? 0) + 1;
  }
  return count;
}

function isAnagram(a, b) {
  const ca = countChars(a);
  const cb = countChars(b);
  if (Object.keys(ca).length !== Object.keys(cb).length) return false;
  for (const ch in ca) {
    if (ca[ch] !== cb[ch]) return false;
  }
  return true;
}

console.log(isAnagram("Dormitory", "dirty room"));
console.log(isAnagram("aab", "abb"));`,
String.raw`function isAnagramSort(a, b) {
  const norm = s => s.toLowerCase().replaceAll(" ", "").split("").sort().join("");
  return norm(a) === norm(b);
}
console.log(isAnagramSort("listen", "silent"));`]},
});
