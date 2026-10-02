defineExercise({
  id: 'w2.1',
  title: 'Đảo ngược chuỗi',
  desc: `<p>Viết <code>reverseString(str)</code> trả về chuỗi đảo ngược. Không dùng <code>.reverse()</code>.</p>
<pre>"abc"    → "cba"
"Toyota" → "atoyoT"
""       → ""</pre>`,
  hints: [
    'Duyệt chuỗi từ ký tự cuối về ký tự đầu. Ký tự cuối có index là <code>str.length - 1</code>.',
    'Tạo <code>let result = ""</code> rồi cộng dồn từng ký tự vào.',
    '<code>for (let i = str.length - 1; i &gt;= 0; i--) { result += str[i]; }</code>'],
  starter: String.raw`function reverseString(str) {

}

console.log(reverseString("Toyota")); // "atoyoT"
`,
  tests: String.raw`
test('"abc" → "cba"', () => expect(reverseString("abc")).toBe("cba"));
test('"Toyota" → "atoyoT"', () => expect(reverseString("Toyota")).toBe("atoyoT"));
test('"" → ""', () => expect(reverseString("")).toBe(""));
test('"a" → "a"', () => expect(reverseString("a")).toBe("a"));
test('"ab cd" → "dc ba" (giữ khoảng trắng)', () => expect(reverseString("ab cd")).toBe("dc ba"));
test('Không dùng .reverse()', () => expect(/\.reverse\s*\(/.test(__source), 'Bài này hãy tự viết vòng lặp').toBe(false));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Tuần 2 học gì</h3>
<p>Tuần này không có cú pháp mới. Bạn chỉ dùng vòng lặp, chuỗi, mảng, object của tuần 1 để giải 18 bài thuật toán cơ bản. Mục tiêu là luyện tư duy chia bài toán thành từng bước, kỹ năng cần cho cả viết test automation lẫn vòng phỏng vấn coding của vị trí SDET (thường ra đúng các bài ở mức này).</p>
<h3>Giải một bài thuật toán theo 4 bước</h3>
<ul>
<li><strong>Hiểu đề:</strong> input là gì, output là gì, có trường hợp đặc biệt nào (rỗng, một phần tử, trùng lặp, số âm).</li>
<li><strong>Giải tay:</strong> lấy một ví dụ nhỏ, làm trên giấy từng bước.</li>
<li><strong>Viết code:</strong> chuyển đúng các bước đã làm tay thành code.</li>
<li><strong>Test biên:</strong> chạy thử với các trường hợp đặc biệt. Đây là thế mạnh sẵn có của QA.</li>
</ul>
<h3>Độ phức tạp (Big-O) nhập môn</h3>
<p>Big-O mô tả số bước tăng thế nào khi dữ liệu lớn lên. Mỗi lời giải tuần này đều ghi rõ độ phức tạp.</p>
<div class="tbl"><table><tr><th>Ký hiệu</th><th>Ý nghĩa</th><th>n = 1.000.000</th></tr>
<tr><td>O(1)</td><td>Không phụ thuộc n</td><td>1 bước</td></tr>
<tr><td>O(log n)</td><td>Mỗi bước loại một nửa</td><td>khoảng 20 bước</td></tr>
<tr><td>O(n)</td><td>Duyệt một lượt</td><td>1 triệu bước</td></tr>
<tr><td>O(n²)</td><td>Hai vòng lặp lồng nhau</td><td>1 nghìn tỷ bước</td></tr></table></div>
<h3>Ý tưởng bài này</h3>
<p>Chuỗi có index giống mảng, nên có thể duyệt ngược từ cuối về đầu.</p>
{{ex0}}
<p>Chuỗi trong JavaScript là bất biến: không sửa được từng ký tự, chỉ có thể tạo chuỗi mới.</p>
{{ex1}}`,
examples:[String.raw`const s = "JS!";
console.log(s.length, s[0], s[s.length - 1]);
for (let i = s.length - 1; i >= 0; i--) {
  console.log("index", i, "→", s[i]);
}`,
String.raw`const s = "abc";
s[0] = "X";      // không có tác dụng
console.log(s);  // vẫn là "abc"`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Ý tưởng</h3>
<p>Duyệt từ ký tự cuối về đầu, cộng dồn vào một chuỗi kết quả.</p>
{{ex0}}
<h3>Chạy tay với "abc"</h3>
${TRACE(['i', 'str[i]', 'result'], [['2', '"c"', '"c"'], ['1', '"b"', '"cb"'], ['0', '"a"', '"cba"']])}
<h3>Độ phức tạp</h3>
<p>O(n): mỗi ký tự được xử lý đúng một lần.</p>
<h3>Lỗi hay gặp</h3>
<ul>
<li>Bắt đầu từ <code>i = str.length</code>: vòng đầu đọc ra <code>undefined</code>, kết quả thành <code>"undefinedcba"</code>.</li>
<li>Viết điều kiện <code>i &gt; 0</code>: bỏ sót ký tự đầu tiên.</li>
</ul>
<h3>Cách viết một dòng</h3>
<p>Trong code thực tế người ta thường viết như sau, nhưng phỏng vấn hay yêu cầu tự viết vòng lặp:</p>
{{ex1}}`,
examples:[String.raw`function reverseString(str) {
  let result = "";
  for (let i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }
  return result;
}

console.log(reverseString("Toyota"));`,
String.raw`console.log("Toyota".split("").reverse().join(""));`]},
});
