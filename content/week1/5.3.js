defineExercise({
  id: '5.3',
  title: 'Sinh mã test case',
  desc: `<p>Viết function <code>generateTestId(module, number)</code> dùng template literal, trả về ID có số đệm đủ 3 chữ số.</p>
<pre>generateTestId("login", 5)   → "TC_LOGIN_005"
generateTestId("order", 123) → "TC_ORDER_123"</pre>`,
  hint: `Template literal dùng dấu backtick: <code>&#96;TC_&#36;{...}&#96;</code>. Đệm số: <code>String(number).padStart(3, "0")</code>.`,
  starter: String.raw`function generateTestId(module, number) {

}

console.log(generateTestId("login", 5)); // TC_LOGIN_005
`,
  tests: String.raw`
test('("login", 5) → "TC_LOGIN_005"', () => expect(generateTestId("login", 5)).toBe("TC_LOGIN_005"));
test('("order", 123) → "TC_ORDER_123"', () => expect(generateTestId("order", 123)).toBe("TC_ORDER_123"));
test('("search", 42) → "TC_SEARCH_042"', () => expect(generateTestId("search", 42)).toBe("TC_SEARCH_042"));
test('Có dùng template literal', () => expect(__source.includes(String.fromCharCode(96)), 'Chưa thấy dấu backtick trong code').toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Template literal</h3>
<p>Dùng dấu backtick <code>&#96;</code> (phím nằm dưới Esc) thay cho dấu nháy. Đặt biến hoặc biểu thức bất kỳ vào trong <code>&#36;{ }</code>. Dễ đọc hơn nhiều so với nối chuỗi bằng dấu cộng.</p>
${ANAT(['`', 'Dấu backtick mở đầu template literal.'], ['Mã ', 'Chữ thường, giữ nguyên.'], ['${code}', 'Chèn giá trị: <code>$</code> + ngoặc nhọn, bên trong là biến hoặc phép tính. Ở đây thay bằng <code>7203</code>.'], ' giá ${price}', ['`', 'Backtick đóng.'], '  // → "Mã 7203 giá 2850"')}
{{ex0}}
<p>Template literal còn viết được chuỗi nhiều dòng:</p>
{{ex1}}
<h3>Đệm ký tự với padStart</h3>
<p><code>padStart(độ_dài, ký_tự)</code> thêm ký tự vào đầu chuỗi cho tới khi đủ độ dài. Chỉ dùng được với chuỗi, nên số phải đổi sang chuỗi trước.</p>
${ANAT(['String(7)', 'Đổi số 7 thành chuỗi <code>"7"</code>.'], ['.padStart(', 'Thêm ký tự vào <strong>đầu</strong> chuỗi.'], ['3', 'Độ dài muốn có.'], ', ', ['"0"', 'Ký tự dùng để đệm.'], ')  // → "007"')}
{{ex2}}`,
examples:[L(
'const code = "7203";',
'const price = 2850;',
'console.log("Mã " + code + " giá " + price);  // nối chuỗi kiểu cũ',
'console.log(`Mã ${code} giá ${price}`);       // template literal',
'console.log(`Tổng: ${price * 100} yên`);      // biểu thức bên trong'),
L(
'const report = `Kết quả test:',
'- Pass: 10',
'- Fail: 2`;',
'console.log(report);'),
String.raw`console.log("7".padStart(3, "0"));         // "007"
console.log(String(42).padStart(5, "*"));  // "***42"
console.log("abc".padEnd(6, "."));         // "abc..."
console.log("TC".toUpperCase());`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Template literal dùng dấu backtick, chèn biểu thức bằng <code>&#36;{...}</code>. Gọn hơn nối chuỗi bằng <code>+</code> khi có nhiều phần.</li>
<li><code>padStart(3, "0")</code> thêm số 0 vào bên trái cho đủ 3 ký tự. Số đã đủ hoặc dài hơn thì giữ nguyên. Phải đổi <code>number</code> sang chuỗi trước vì <code>padStart</code> là method của chuỗi.</li>
</ul>`,
examples:[`function generateTestId(module, number) {
  return \`TC_\${module.toUpperCase()}_\${String(number).padStart(3, "0")}\`;
}

console.log(generateTestId("login", 5));   // TC_LOGIN_005
console.log(generateTestId("order", 123)); // TC_ORDER_123
console.log(generateTestId("search", 42)); // TC_SEARCH_042`]},
});
