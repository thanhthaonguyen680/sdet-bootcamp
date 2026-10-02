defineExercise({
  id: 'w2.7',
  title: 'Tổng các chữ số',
  desc: `<p>Viết <code>sumDigits(n)</code> tính tổng các chữ số của số nguyên <code>n ≥ 0</code>. Làm bằng phép toán, <strong>không</strong> đổi số sang chuỗi.</p>
<pre>12345 → 15
9999  → 36
0     → 0</pre>`,
  hints: [
    '<code>n % 10</code> cho chữ số cuối cùng. Ví dụ <code>2850 % 10</code> là <code>0</code>.',
    '<code>Math.floor(n / 10)</code> bỏ đi chữ số cuối. Ví dụ <code>Math.floor(2850 / 10)</code> là <code>285</code>.',
    'Lặp <code>while (n &gt; 0)</code>: cộng <code>n % 10</code> vào tổng, rồi gán <code>n = Math.floor(n / 10)</code>.'],
  starter: String.raw`function sumDigits(n) {

}

console.log(sumDigits(12345)); // 15
`,
  tests: String.raw`
test('12345 → 15', () => expect(sumDigits(12345)).toBe(15));
test('9999 → 36', () => expect(sumDigits(9999)).toBe(36));
test('0 → 0', () => expect(sumDigits(0)).toBe(0));
test('7 → 7', () => expect(sumDigits(7)).toBe(7));
test('1000000 → 1', () => expect(sumDigits(1000000)).toBe(1));
test('Không đổi sang chuỗi', () => expect(/String\s*\(|\.toString\s*\(|\.split\s*\(|""\s*\+|\+\s*""/.test(__source), 'Bài này hãy dùng % và Math.floor').toBe(false));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Tách chữ số bằng phép toán</h3>
<ul>
<li><code>n % 10</code> lấy chữ số cuối (hàng đơn vị).</li>
<li><code>Math.floor(n / 10)</code> bỏ chữ số cuối.</li>
</ul>
{{ex0}}
<p>Lặp hai thao tác này cho tới khi số về 0 là lần lượt lấy được mọi chữ số, từ phải sang trái.</p>
<p class="note">Góc QA: cùng kỹ thuật này dùng để tính chữ số kiểm tra (checksum) như thuật toán Luhn của số thẻ tín dụng, hoặc mã vạch. Tự sinh được số thẻ "hợp lệ về định dạng" rất có ích khi chuẩn bị test data cho form thanh toán.</p>`,
examples:[String.raw`let n = 2850;
console.log(n % 10);             // 0
console.log(Math.floor(n / 10)); // 285

while (n > 0) {
  console.log("chữ số:", n % 10, "| còn lại:", Math.floor(n / 10));
  n = Math.floor(n / 10);
}`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Lặp lại: lấy chữ số cuối bằng <code>% 10</code>, cộng vào tổng, bỏ chữ số cuối bằng <code>Math.floor(n / 10)</code>, tới khi n bằng 0.</p>
{{ex0}}
<h3>Chạy tay với 2850</h3>
${TRACE(['n', 'n % 10', 'sum', 'n mới'], [['2850', '0', '0', '285'], ['285', '5', '5', '28'], ['28', '8', '13', '2'], ['2', '2', '15', '0']])}
<h3>Độ phức tạp</h3>
<p>Số vòng lặp bằng số chữ số của n, tức khoảng log₁₀(n). Viết là O(log n).</p>
<h3>So sánh với cách dùng chuỗi</h3>
<p>Đổi sang chuỗi rồi duyệt từng ký tự cũng đúng, nhưng tạo thêm chuỗi và phải đổi ngược từng ký tự về số. Cách dùng phép toán là nền tảng cho nhiều bài khác như đảo ngược số hoặc kiểm tra số đối xứng.</p>
{{ex1}}`,
examples:[String.raw`function sumDigits(n) {
  let sum = 0;
  while (n > 0) {
    sum += n % 10;
    n = Math.floor(n / 10);
  }
  return sum;
}

console.log(sumDigits(2850));`,
String.raw`let n = 2850;
let reversed = 0;
while (n > 0) {
  reversed = reversed * 10 + n % 10;
  n = Math.floor(n / 10);
}
console.log(reversed);  // 582`]},
});
