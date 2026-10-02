defineExercise({
  id: '2.1',
  title: 'Phân loại HTTP status code',
  desc: `<p>Viết function <code>classifyStatus(code)</code> trả về:</p>
<pre>200–299 → "Success"
300–399 → "Redirect"
400–499 → "Client Error"
500–599 → "Server Error"
Khác    → "Unknown"</pre>`,
  hint: `Dùng chuỗi <code>if / else if</code> với điều kiện dạng <code>code &gt;= 200 &amp;&amp; code &lt;= 299</code>.`,
  starter: String.raw`function classifyStatus(code) {
  // Trả về "Success", "Redirect", "Client Error", "Server Error" hoặc "Unknown"
}

console.log(classifyStatus(200)); // Success
console.log(classifyStatus(404)); // Client Error
`,
  tests: String.raw`
test('200 và 299 → "Success"', () => { expect(classifyStatus(200)).toBe("Success"); expect(classifyStatus(299)).toBe("Success"); });
test('301 → "Redirect"', () => expect(classifyStatus(301)).toBe("Redirect"));
test('404 → "Client Error"', () => expect(classifyStatus(404)).toBe("Client Error"));
test('503 → "Server Error"', () => expect(classifyStatus(503)).toBe("Server Error"));
test('199 và 600 → "Unknown"', () => { expect(classifyStatus(199)).toBe("Unknown"); expect(classifyStatus(600)).toBe("Unknown"); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>if, else if, else</h3>
<p>Toán tử so sánh: <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code> <code>===</code> <code>!==</code>. Kết hợp nhiều điều kiện bằng <code>&amp;&amp;</code> (và), <code>||</code> (hoặc), <code>!</code> (phủ định).</p>
${ANAT(['if', 'Nếu...'], ' (', ['price >= 2000', 'Điều kiện thứ nhất: price lớn hơn hoặc bằng 2000.'], ' ', ['&&', '"Và": cả hai vế đều đúng thì cả biểu thức mới đúng. Chỉ cần một vế đúng thì dùng <code>||</code> ("hoặc").'], ' ', ['price <= 3000', 'Điều kiện thứ hai: price nhỏ hơn hoặc bằng 3000.'], ') { ... }\n', ['else if', '"Còn nếu...": chỉ được xét khi các điều kiện phía trên đều sai.'], ' (price > 3000) { ... }\n', ['else', '"Còn lại": chạy khi mọi điều kiện phía trên đều sai. Không có ngoặc tròn.'], ' { ... }')}
{{ex0}}
<p>Các điều kiện được xét từ trên xuống, gặp nhánh đúng đầu tiên thì dừng.</p>
<h3>Return sớm</h3>
<p>Trong function, có thể <code>return</code> ngay khi khớp điều kiện thay vì viết <code>else</code>. Code phẳng hơn và dễ đọc hơn:</p>
{{ex1}}
<p class="note">Góc QA: hãy test đúng các giá trị biên 199, 200, 299, 300. Đây chính là kỹ thuật phân tích giá trị biên bạn đã quen khi viết test case thủ công, giờ áp dụng khi viết code.</p>`,
examples:[String.raw`const price = 2850;
if (price >= 2000 && price <= 3000) {
  console.log("Trong khoảng 2000–3000");
} else if (price > 3000) {
  console.log("Trên 3000");
} else {
  console.log("Dưới 2000");
}`,
String.raw`function grade(score) {
  if (score >= 90) return "A";
  if (score >= 70) return "B";
  return "C";
}
console.log(grade(95), grade(75), grade(10));`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Mỗi nhánh <code>return</code> luôn nên không cần <code>else</code>, code phẳng và dễ đọc hơn.</li>
<li>Kiểm tra đủ cả cận dưới và cận trên, nhờ vậy 199 và 600 rơi xuống <code>"Unknown"</code>.</li>
</ul>
<h3>Lỗi hay gặp</h3>
<p>Chỉ kiểm tra cận dưới, ví dụ <code>if (code &gt;= 500) return "Server Error"</code>: 600 hay 999 cũng thành Server Error. Khi test, luôn thử giá trị ở biên (199, 200, 299, 300, 599, 600).</p>`,
examples:[String.raw`function classifyStatus(code) {
  if (code >= 200 && code <= 299) return "Success";
  if (code >= 300 && code <= 399) return "Redirect";
  if (code >= 400 && code <= 499) return "Client Error";
  if (code >= 500 && code <= 599) return "Server Error";
  return "Unknown";
}

console.log(classifyStatus(200)); // Success
console.log(classifyStatus(404)); // Client Error
console.log(classifyStatus(600)); // Unknown`]},
});
