defineExercise({
  id: '2.3',
  title: 'Tăng, giảm hay đứng giá',
  desc: `<p>Viết function <code>trend(yesterday, today)</code> dùng toán tử ba ngôi <code>a ? b : c</code> để trả về <code>"Tăng"</code>, <code>"Giảm"</code> hoặc <code>"Đứng giá"</code>.</p>`,
  hint: `Có thể lồng hai toán tử ba ngôi: <code>today &gt; yesterday ? "Tăng" : (today &lt; yesterday ? "Giảm" : "Đứng giá")</code>.`,
  starter: String.raw`function trend(yesterday, today) {
  // Dùng toán tử ba ngôi
}

console.log(trend(2850, 2900)); // Tăng
`,
  tests: String.raw`
test('2850 → 2900 là "Tăng"', () => expect(trend(2850, 2900)).toBe("Tăng"));
test('2900 → 2850 là "Giảm"', () => expect(trend(2900, 2850)).toBe("Giảm"));
test('2850 → 2850 là "Đứng giá"', () => expect(trend(2850, 2850)).toBe("Đứng giá"));
test('Có dùng toán tử ba ngôi', () => expect(/\?[^?.]/.test(__source.replace(/\?\?|\?\./g, "")), 'Chưa thấy toán tử ? :').toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Toán tử ba ngôi</h3>
<p>Cú pháp: <code>điều_kiện ? giá_trị_nếu_đúng : giá_trị_nếu_sai</code>. Khác với <code>if</code>, đây là một biểu thức nên trả về giá trị, có thể gán vào biến hoặc đặt ngay sau <code>return</code>.</p>
${ANAT('const color = ', ['change >= 0', 'Điều kiện cần kiểm tra.'], ' ', ['?', 'Dấu hỏi: "nếu đúng thì lấy..."'], ' ', ['"Xanh"', 'Giá trị khi điều kiện đúng.'], ' ', [':', 'Dấu hai chấm: "còn không thì lấy..."'], ' ', ['"Đỏ"', 'Giá trị khi điều kiện sai. Kết quả cuối cùng được gán vào <code>color</code>.'], ';')}
{{ex0}}
<h3>Lồng nhau</h3>
<p>Khi có ba kết quả, có thể lồng hai toán tử. Chỉ nên lồng một cấp, nhiều hơn thì dùng <code>if</code> cho dễ đọc.</p>
{{ex1}}`,
examples:[String.raw`const change = -15;
const color = change >= 0 ? "Xanh" : "Đỏ";
console.log(color);`,
String.raw`function sign(n) {
  return n > 0 ? "dương" : n < 0 ? "âm" : "bằng 0";
}
console.log(sign(3), sign(-2), sign(0));`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<p>Toán tử ba ngôi đọc là "điều kiện ? giá trị khi đúng : giá trị khi sai". Có 3 kết quả nên lồng hai lần; xuống dòng như trên giúp đọc giống một chuỗi <code>if / else if / else</code>.</p>
<h3>Lưu ý</h3>
<p>Lồng quá 2 cấp thì nên quay về <code>if</code> cho dễ đọc. Toán tử ba ngôi hợp nhất khi chọn giữa hai giá trị.</p>`,
examples:[String.raw`function trend(yesterday, today) {
  return today > yesterday ? "Tăng"
       : today < yesterday ? "Giảm"
       : "Đứng giá";
}

console.log(trend(2850, 2900)); // Tăng
console.log(trend(2900, 2850)); // Giảm
console.log(trend(2850, 2850)); // Đứng giá`]},
});
