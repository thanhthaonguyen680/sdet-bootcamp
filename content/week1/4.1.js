defineExercise({
  id: '4.1',
  title: 'Kiểm tra mã cổ phiếu hợp lệ',
  desc: `<p>Viết function <code>isValidStockCode(code)</code> trả về <code>true</code> nếu <code>code</code> là <strong>chuỗi</strong> gồm đúng 4 chữ số.</p>
<pre>"7203" → true
"720"  → false
"72A3" → false
7203   → false  (kiểu number)</pre>`,
  hint: `Kiểm tra lần lượt: <code>typeof code === "string"</code>, <code>code.length === 4</code>, rồi duyệt từng ký tự xem có nằm trong <code>"0123456789"</code> không.`,
  starter: String.raw`function isValidStockCode(code) {

}

console.log(isValidStockCode("7203")); // true
console.log(isValidStockCode("72A3")); // false
`,
  tests: String.raw`
test('"7203" → true', () => expect(isValidStockCode("7203")).toBe(true));
test('"720" → false', () => expect(isValidStockCode("720")).toBe(false));
test('"72030" → false', () => expect(isValidStockCode("72030")).toBe(false));
test('"72A3" → false', () => expect(isValidStockCode("72A3")).toBe(false));
test('7203 (kiểu number) → false', () => expect(isValidStockCode(7203)).toBe(false));
test('"" và " 720" → false', () => { expect(isValidStockCode("")).toBe(false); expect(isValidStockCode(" 720")).toBe(false); });
test('null → false, không lỗi', () => expect(isValidStockCode(null)).toBe(false));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Các cách khai báo function</h3>
{{ex0}}
<p>Khai báo function là tạo công thức, <strong>gọi</strong> function mới là nấu. Đọc từng phần của một lần gọi:</p>
${ANAT('const total = ', ['add', 'Tên function cần gọi.'], ['(', 'Ngoặc tròn nghĩa là "chạy function này". Viết <code>add</code> không có ngoặc thì chỉ nhắc tới function, không chạy.'], ['2, 3', 'Đối số: giá trị thật truyền vào, theo đúng thứ tự tham số. 2 vào <code>a</code>, 3 vào <code>b</code>.'], ')', ';')}
<p>Function chạy <code>return a + b</code> tức <code>return 2 + 3</code>, kết quả 5 thay vào chỗ <code>add(2, 3)</code> và được gán cho <code>total</code>.</p>
<p>Tên function nên là động từ hoặc câu hỏi: <code>isValid...</code>, <code>has...</code> cho function trả về true/false, <code>get...</code>, <code>create...</code> cho function trả về dữ liệu.</p>
<h3>Mẫu validate: loại trừ sớm</h3>
<p>Kiểm tra từng điều kiện sai, gặp cái nào thì <code>return false</code> ngay. Qua được hết thì <code>return true</code>. Cách viết này gọi là guard clause.</p>
{{ex1}}
<h3>Duyệt từng ký tự trong chuỗi</h3>
{{ex2}}
<p class="note">Góc QA: một function validate tốt phải chịu được input "xấu" như <code>null</code>, chuỗi rỗng, sai kiểu. Đây chính là negative test case, và bộ chấm của bài này có kiểm tra những trường hợp đó.</p>`,
examples:[String.raw`function add(a, b) {
  return a + b;
}

const multiply = function (a, b) {
  return a * b;
};

console.log(add(2, 3), multiply(2, 3));`,
String.raw`function isValidQuantity(q) {
  if (typeof q !== "number") return false;
  if (q <= 0) return false;
  if (!Number.isInteger(q)) return false;
  return true;
}
console.log(isValidQuantity(100));    // true
console.log(isValidQuantity("100"));  // false
console.log(isValidQuantity(1.5));    // false`,
String.raw`const s = "A1B2";
console.log("Độ dài:", s.length, "| Ký tự đầu:", s[0]);
for (const ch of s) {
  const isDigit = "0123456789".includes(ch);
  console.log(ch, isDigit ? "là chữ số" : "không phải chữ số");
}`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Kiểm tra kiểu trước tiên. Nhờ vậy <code>null</code> hay số <code>7203</code> trả về <code>false</code> ngay, không bị lỗi khi đọc <code>.length</code>.</li>
<li>Gặp ký tự không phải chữ số là <code>return false</code> ngay, không cần duyệt tiếp.</li>
<li>Duyệt hết mà không bị loại thì hợp lệ.</li>
</ul>
<h3>Cách dùng regex</h3>
{{ex1}}
<p>Vẫn phải giữ <code>typeof</code>: <code>regex.test(7203)</code> tự đổi số thành chuỗi <code>"7203"</code> và trả về <code>true</code>.</p>`,
examples:[String.raw`function isValidStockCode(code) {
  if (typeof code !== "string" || code.length !== 4) return false;
  for (const ch of code) {
    if (!"0123456789".includes(ch)) return false;
  }
  return true;
}

console.log(isValidStockCode("7203")); // true
console.log(isValidStockCode("72A3")); // false
console.log(isValidStockCode(7203));   // false
console.log(isValidStockCode(null));   // false`,
String.raw`const isValidStockCodeRegex = code => typeof code === "string" && /^\d{4}$/.test(code);
console.log(isValidStockCodeRegex("7203"), isValidStockCodeRegex(7203));`]},
});
