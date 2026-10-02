defineExercise({
  id: 'w2.8',
  title: 'Số nguyên tố',
  desc: `<p>Số nguyên tố là số lớn hơn 1, chỉ chia hết cho 1 và chính nó. Viết <code>isPrime(n)</code>.</p>
<pre>2, 3, 17, 97   → true
0, 1, 4, 15    → false</pre>
<p>Function phải chạy nhanh với số lớn như <code>1000000007</code>.</p>`,
  hints: [
    'Số nhỏ hơn 2 không phải số nguyên tố. Với số còn lại, thử chia cho 2, 3, 4...; gặp số chia hết (<code>n % i === 0</code>) thì không phải.',
    'Không cần thử tới <code>n</code>. Nếu <code>n = a × b</code> thì chắc chắn một trong hai số nhỏ hơn hoặc bằng √n. Chỉ cần thử khi <code>i * i &lt;= n</code>.',
    '<code>for (let i = 2; i * i &lt;= n; i++) { if (n % i === 0) return false; } return true;</code> (nhớ xử lý <code>n &lt; 2</code> trước).'],
  starter: String.raw`function isPrime(n) {

}

console.log(isPrime(17)); // true
console.log(isPrime(15)); // false
`,
  tests: String.raw`
test('2, 3, 17, 97 → true', () => { for (const n of [2, 3, 17, 97]) expect(isPrime(n), 'Sai với ' + n).toBe(true); });
test('0, 1 → false', () => { expect(isPrime(0)).toBe(false); expect(isPrime(1)).toBe(false); });
test('4, 15, 100 → false', () => { for (const n of [4, 15, 100]) expect(isPrime(n), 'Sai với ' + n).toBe(false); });
test('25 và 49 → false (bình phương của số nguyên tố)', () => { expect(isPrime(25)).toBe(false); expect(isPrime(49)).toBe(false); });
test('Số âm -7 → false', () => expect(isPrime(-7)).toBe(false));
test('Chạy nhanh với 1000000007', () => expect(isPrime(1000000007)).toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Vì sao chỉ cần thử đến căn bậc hai</h3>
<p>Các ước số luôn đi theo cặp. Với 36:</p>
{{ex0}}
<p>Sau √36 = 6, các cặp chỉ lặp lại theo chiều ngược. Nên nếu không tìm được ước nào từ 2 tới √n thì cũng không có ước nào lớn hơn. Điều kiện <code>i * i &lt;= n</code> tương đương <code>i &lt;= √n</code> nhưng không cần tính căn.</p>
<h3>Chênh lệch lớn cỡ nào</h3>
{{ex1}}`,
examples:[String.raw`const n = 36;
for (let i = 1; i * i <= n; i++) {
  if (n % i === 0) console.log(i, "×", n / i);
}`,
String.raw`const n = 1000000007;
console.log("Thử tới n:", n, "lần");
console.log("Thử tới √n:", Math.floor(Math.sqrt(n)), "lần");`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Loại các số nhỏ hơn 2. Sau đó thử chia cho mọi i từ 2 tới √n. Có số chia hết thì không phải số nguyên tố.</p>
{{ex0}}
<h3>Chạy tay với 29</h3>
<p>√29 ≈ 5.38, nên chỉ thử i = 2, 3, 4, 5.</p>
${TRACE(['i', 'i * i', '29 % i'], [['2', '4', '1'], ['3', '9', '2'], ['4', '16', '1'], ['5', '25', '4'], ['6', '36 &gt; 29', 'dừng → <code>true</code>']])}
<h3>Độ phức tạp</h3>
<p>O(√n). Với n = 1.000.000.007, cách thử tới n cần khoảng 1 tỷ phép chia, cách này chỉ cần khoảng 31.623.</p>
<h3>Lỗi hay gặp (một bài học về giá trị biên)</h3>
<ul>
<li>Viết <code>i &lt; Math.sqrt(n)</code> thay vì <code>&lt;=</code>: với 25, vòng dừng trước i = 5 và kết luận 25 là số nguyên tố. Bộ chấm có test riêng cho trường hợp này.</li>
<li>Quên xử lý 0, 1 và số âm.</li>
</ul>
<h3>Tối ưu thêm</h3>
<p>Sau khi kiểm tra 2, chỉ cần thử các số lẻ (<code>i += 2</code>), giảm được một nửa số bước.</p>`,
examples:[String.raw`function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

console.log(isPrime(29), isPrime(25), isPrime(1000000007));`]},
});
