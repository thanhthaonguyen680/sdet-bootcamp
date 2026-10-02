defineExercise({
  id: 'w2.2',
  title: 'Chuỗi đối xứng (palindrome)',
  desc: `<p>Chuỗi đối xứng đọc xuôi hay ngược đều giống nhau. Viết <code>isPalindrome(str)</code>:</p>
<ul><li>Không phân biệt hoa thường.</li><li>Bỏ qua mọi ký tự không phải chữ cái <code>a–z</code> hoặc chữ số.</li></ul>
<pre>"racecar"                        → true
"A man, a plan, a canal: Panama" → true
"race a car"                     → false
""                               → true</pre>`,
  hints: [
    'Làm sạch chuỗi trước: chuyển chữ thường, chỉ giữ ký tự có trong <code>"abcdefghijklmnopqrstuvwxyz0123456789"</code>.',
    'Cách 1: đảo chuỗi đã làm sạch (dùng lại bài 1) rồi so sánh với chính nó.',
    'Cách 2 (hai con trỏ): <code>left = 0</code>, <code>right</code> ở cuối. So sánh hai đầu, khác nhau thì <code>return false</code>, giống thì cùng tiến vào giữa.'],
  starter: String.raw`function isPalindrome(str) {

}

console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car"));                     // false
`,
  tests: String.raw`
test('"racecar" → true', () => expect(isPalindrome("racecar")).toBe(true));
test('"A man, a plan, a canal: Panama" → true', () => expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true));
test('"race a car" → false', () => expect(isPalindrome("race a car")).toBe(false));
test('"" → true', () => expect(isPalindrome("")).toBe(true));
test('"ab" → false', () => expect(isPalindrome("ab")).toBe(false));
test('"12321" → true, "123" → false', () => { expect(isPalindrome("12321")).toBe(true); expect(isPalindrome("123")).toBe(false); });
test('"No \'x\' in Nixon" → true', () => expect(isPalindrome("No 'x' in Nixon")).toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Kỹ thuật hai con trỏ</h3>
<p>Đặt một con trỏ ở đầu, một con trỏ ở cuối, rồi cùng tiến vào giữa. Kỹ thuật này dùng cho rất nhiều bài: kiểm tra đối xứng, đảo mảng, tìm cặp số trong mảng đã sắp xếp.</p>
<pre>r  a  c  e  c  a  r
↑                 ↑
L                 R     so sánh r với r, rồi L tiến, R lùi</pre>
{{ex0}}
<p>Vòng lặp dừng khi <code>left &gt;= right</code>. Với chuỗi độ dài lẻ, ký tự chính giữa không cần so với ai.</p>
<h3>Làm sạch chuỗi</h3>
<p>Đề yêu cầu bỏ qua dấu câu và khoảng trắng, nên trước tiên tạo một chuỗi mới chỉ gồm chữ và số:</p>
{{ex1}}`,
examples:[String.raw`const s = "level";
let left = 0;
let right = s.length - 1;
while (left < right) {
  console.log(s[left], "vs", s[right]);
  left++;
  right--;
}`,
String.raw`const raw = "Hi, 2U!";
const allowed = "abcdefghijklmnopqrstuvwxyz0123456789";
let clean = "";
for (const ch of raw.toLowerCase()) {
  if (allowed.includes(ch)) clean += ch;
}
console.log(clean);  // "hi2u"`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Bước 1 làm sạch chuỗi (chữ thường, chỉ giữ chữ và số). Bước 2 dùng hai con trỏ so sánh từ hai đầu vào giữa.</p>
{{ex0}}
<h3>Chạy tay với "Ab,A"</h3>
<p>Làm sạch được <code>"aba"</code>.</p>
${TRACE(['left', 'right', 'so sánh', 'kết quả'], [['0', '2', 'a vs a', 'giống, tiếp tục'], ['1', '1', '', 'left không còn nhỏ hơn right, dừng'], ['', '', '', '<code>true</code>']])}
<h3>Độ phức tạp</h3>
<p>O(n) thời gian. Chuỗi làm sạch tốn O(n) bộ nhớ. Phần so sánh hai con trỏ chỉ tốn O(1).</p>
<h3>Lỗi hay gặp</h3>
<ul>
<li>Quên chuyển chữ thường trước khi lọc, nên chữ in hoa bị loại mất.</li>
<li>Chuỗi rỗng: vòng <code>while</code> không chạy lần nào và trả về <code>true</code>. Đúng theo định nghĩa.</li>
</ul>
<h3>Cách viết ngắn với regex</h3>
<p><code>/[^a-z0-9]/g</code> nghĩa là mọi ký tự không phải a–z, 0–9:</p>
{{ex1}}`,
examples:[String.raw`function isPalindrome(str) {
  const allowed = "abcdefghijklmnopqrstuvwxyz0123456789";
  let clean = "";
  for (const ch of str.toLowerCase()) {
    if (allowed.includes(ch)) clean += ch;
  }

  let left = 0;
  let right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++;
    right--;
  }
  return true;
}

console.log(isPalindrome("A man, a plan, a canal: Panama"));
console.log(isPalindrome("race a car"));`,
String.raw`function isPalindromeShort(str) {
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === clean.split("").reverse().join("");
}
console.log(isPalindromeShort("No 'x' in Nixon"));`]},
});
