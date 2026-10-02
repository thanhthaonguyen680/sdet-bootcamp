defineExercise({
  id: 'w2.10',
  title: 'Ước chung lớn nhất (Euclid)',
  desc: `<p>Viết <code>gcd(a, b)</code> tìm ước chung lớn nhất của hai số nguyên không âm, dùng thuật toán Euclid.</p>
<pre>gcd(48, 18) → 6
gcd(17, 5)  → 1
gcd(0, 5)   → 5</pre>`,
  hints: [
    'Cách thô là thử từ số nhỏ hơn giảm dần. Đúng nhưng rất chậm với số lớn, và bộ chấm có một test số lớn.',
    'Thuật toán Euclid: <code>gcd(a, b) = gcd(b, a % b)</code>. Khi <code>b</code> bằng 0 thì đáp án là <code>a</code>.',
    '<code>while (b !== 0) { const r = a % b; a = b; b = r; } return a;</code>'],
  starter: String.raw`function gcd(a, b) {

}

console.log(gcd(48, 18)); // 6
`,
  tests: String.raw`
test('gcd(48, 18) → 6', () => expect(gcd(48, 18)).toBe(6));
test('gcd(18, 48) → 6 (đổi thứ tự)', () => expect(gcd(18, 48)).toBe(6));
test('gcd(17, 5) → 1', () => expect(gcd(17, 5)).toBe(1));
test('gcd(0, 5) → 5 và gcd(5, 0) → 5', () => { expect(gcd(0, 5)).toBe(5); expect(gcd(5, 0)).toBe(5); });
test('gcd(1071, 462) → 21', () => expect(gcd(1071, 462)).toBe(21));
test('Chạy nhanh với gcd(1000000000, 999999998)', () => expect(gcd(1000000000, 999999998)).toBe(2));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Thuật toán Euclid</h3>
<p>Một trong những thuật toán cổ nhất (khoảng 300 năm trước Công nguyên). Ý tưởng: ước chung của a và b cũng là ước chung của b và phần dư <code>a % b</code>. Cứ thay cặp số lớn bằng cặp số nhỏ hơn cho tới khi số thứ hai bằng 0.</p>
<pre>gcd(48, 18) → gcd(18, 12) → gcd(12, 6) → gcd(6, 0) → 6</pre>
{{ex0}}
<h3>Hoán đổi giá trị hai biến</h3>
<p>Muốn gán <code>a = b</code> và <code>b = a % b</code> cùng lúc, phải lưu phần dư ra biến tạm trước, nếu không <code>a</code> sẽ bị ghi đè mất:</p>
{{ex1}}`,
examples:[String.raw`let a = 48;
let b = 18;
while (b !== 0) {
  console.log("gcd(" + a + ", " + b + ")");
  const r = a % b;
  a = b;
  b = r;
}
console.log("Kết quả:", a);`,
String.raw`let x = 1;
let y = 2;
const temp = x;
x = y;
y = temp;
console.log(x, y);  // 2 1`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Thay <code>(a, b)</code> bằng <code>(b, a % b)</code> cho tới khi <code>b</code> bằng 0. Lúc đó <code>a</code> là đáp án.</p>
{{ex0}}
<h3>Chạy tay với (1071, 462)</h3>
${TRACE(['a', 'b', 'a % b'], [['1071', '462', '147'], ['462', '147', '21'], ['147', '21', '0'], ['21', '0', 'dừng → 21']])}
<h3>Vì sao không cần a lớn hơn b</h3>
<p>Nếu <code>a &lt; b</code> thì <code>a % b</code> bằng chính <code>a</code>, nên vòng đầu tiên tự đổi chỗ hai số. Ví dụ (18, 48) → (48, 18).</p>
<h3>Độ phức tạp</h3>
<p>O(log(min(a, b))): phần dư giảm rất nhanh. Với hai số cỡ 1 tỷ, chỉ cần vài chục vòng. Cách thử từng số từ nhỏ đến lớn có thể cần tới 1 tỷ vòng.</p>
<h3>Mở rộng: bội chung nhỏ nhất</h3>
{{ex1}}`,
examples:[String.raw`function gcd(a, b) {
  while (b !== 0) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a;
}

console.log(gcd(1071, 462));`,
String.raw`function gcd(a, b) {
  while (b !== 0) { const r = a % b; a = b; b = r; }
  return a;
}
function lcm(a, b) {
  return (a / gcd(a, b)) * b;
}
console.log(lcm(4, 6));  // 12`]},
});
