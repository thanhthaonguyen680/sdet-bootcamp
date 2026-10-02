defineExercise({
  id: '5.2',
  title: 'Chuẩn hóa chuỗi nhập vào',
  desc: `<p>Viết function <code>normalizeInput(str)</code>: bỏ khoảng trắng đầu cuối, chuyển về chữ thường, thay nhiều khoảng trắng liên tiếp thành một.</p>
<pre>"  Hello    World  " → "hello world"</pre>`,
  hint: `<code>trim()</code> và <code>toLowerCase()</code> xử lý hai yêu cầu đầu. Với khoảng trắng liên tiếp, thử <code>split(" ")</code> rồi lọc bỏ phần tử rỗng bằng vòng lặp, hoặc dùng <code>replace(/\\s+/g, " ")</code>.`,
  starter: String.raw`function normalizeInput(str) {

}

console.log(normalizeInput("  Hello    World  ")); // "hello world"
`,
  tests: String.raw`
test('"  Hello    World  " → "hello world"', () => expect(normalizeInput("  Hello    World  ")).toBe("hello world"));
test('"ABC" → "abc"', () => expect(normalizeInput("ABC")).toBe("abc"));
test('"   " → ""', () => expect(normalizeInput("   ")).toBe(""));
test('"Mã  7203   Toyota" → "mã 7203 toyota"', () => expect(normalizeInput("Mã  7203   Toyota")).toBe("mã 7203 toyota"));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Làm sạch chuỗi</h3>
${ANAT(['str', 'Chuỗi ban đầu, ví dụ <code>"  Hello  "</code>.'], ['.trim()', 'Bỏ khoảng trắng ở hai đầu, trả về chuỗi mới <code>"Hello"</code>.'], ['.toLowerCase()', 'Chạy trên <strong>kết quả</strong> của <code>trim()</code>, trả về <code>"hello"</code>.'])}
<p>Đọc từ trái sang phải: mỗi method nhận kết quả của method đứng trước. Chuỗi gốc <code>str</code> không bị thay đổi.</p>
{{ex0}}
<h3>replace và regex</h3>
<p><code>replace</code> chỉ thay chỗ xuất hiện đầu tiên, <code>replaceAll</code> thay tất cả. Muốn thay theo mẫu (ví dụ "một hoặc nhiều khoảng trắng") thì dùng regex: <code>/\\s+/g</code> nghĩa là một hoặc nhiều ký tự khoảng trắng (<code>\\s+</code>), áp dụng cho toàn chuỗi (<code>g</code>).</p>
${ANAT(['/', 'Dấu mở đầu regex (mẫu tìm kiếm).'], ['\\s', 'Một ký tự khoảng trắng bất kỳ: dấu cách, tab, xuống dòng.'], ['+', '"Một hoặc nhiều" ký tự đứng ngay trước. <code>\\s+</code> là một cụm khoảng trắng liền nhau.'], ['/', 'Dấu kết thúc regex.'], ['g', 'Cờ global: thay <strong>tất cả</strong> chỗ khớp, không chỉ chỗ đầu tiên.'])}
{{ex1}}
<p>Các method trả về chuỗi mới nên có thể nối tiếp nhau: <code>str.trim().toLowerCase()</code>.</p>
<p class="note">Góc QA: khi so sánh text trên UI, nên chuẩn hóa trước để test không fail vì khoảng trắng thừa. Với trang tiếng Nhật, <code>\\s</code> cũng bắt được khoảng trắng toàn góc.</p>
{{ex2}}`,
examples:[String.raw`const raw = "   Tokyo  ";
console.log("[" + raw + "]");
console.log("[" + raw.trim() + "]");
console.log("ABC".toLowerCase(), "abc".toUpperCase());`,
String.raw`console.log("a-b-c".replace("-", "+"));     // chỉ thay chỗ đầu
console.log("a-b-c".replaceAll("-", "+"));  // thay tất cả
console.log("a   b    c".replace(/\s+/g, " "));`,
String.raw`const uiText = "株価　　2,850 円";
console.log(uiText.replace(/\s+/g, " "));`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Method của chuỗi trả về chuỗi mới nên nối liền được: <code>trim</code> rồi <code>toLowerCase</code> rồi <code>replace</code>.</li>
<li>Trong regex, <code>&#92;s+</code> là "một hoặc nhiều khoảng trắng", cờ <code>g</code> để thay mọi chỗ chứ không chỉ chỗ đầu tiên.</li>
</ul>
<h3>Cách không dùng regex</h3>
{{ex1}}
<p><code>split(" ")</code> trên nhiều dấu cách liên tiếp tạo ra các phần tử rỗng <code>""</code>, bỏ chúng đi rồi ghép lại bằng một dấu cách.</p>`,
examples:[String.raw`function normalizeInput(str) {
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

console.log(normalizeInput("  Hello    World  ")); // "hello world"
console.log(normalizeInput("Mã  7203   Toyota"));  // "mã 7203 toyota"`,
String.raw`function normalizeInputLoop(str) {
  const words = [];
  for (const w of str.trim().toLowerCase().split(" ")) {
    if (w !== "") words.push(w);
  }
  return words.join(" ");
}

console.log(normalizeInputLoop("  Hello    World  "));`]},
});
