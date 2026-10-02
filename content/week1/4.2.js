defineExercise({
  id: '4.2',
  title: 'Định dạng giá có dấu phẩy',
  desc: `<p>Làm 2 cách:</p>
<ul>
<li><code>formatPrice(price)</code>: tự viết bằng vòng lặp.</li>
<li><code>formatPriceLocale(price)</code>: dùng <code>toLocaleString("en-US")</code>.</li>
</ul>
<pre>1234567 → "1,234,567"
2850.5  → "2,850.5"</pre>
<p class="note">Phải truyền <code>"en-US"</code> vì máy cài tiếng Việt mặc định dùng dấu chấm ngăn cách hàng nghìn. Đây là lỗi hay gặp khi test trên nhiều môi trường khác nhau.</p>`,
  hint: `Tách phần nguyên và thập phân bằng <code>String(price).split(".")</code>. Duyệt phần nguyên từ phải sang trái, cứ đủ 3 chữ số thì chèn dấu phẩy.`,
  starter: String.raw`function formatPrice(price) {
  // Cách 1: tự viết bằng vòng lặp
}

function formatPriceLocale(price) {
  // Cách 2: dùng toLocaleString("en-US")
}

console.log(formatPrice(1234567));
console.log(formatPriceLocale(1234567));
`,
  tests: String.raw`
test('formatPrice(1234567) → "1,234,567"', () => expect(formatPrice(1234567)).toBe("1,234,567"));
test('formatPrice(2850.5) → "2,850.5"', () => expect(formatPrice(2850.5)).toBe("2,850.5"));
test('formatPrice(999) → "999"', () => expect(formatPrice(999)).toBe("999"));
test('formatPrice(1000) → "1,000"', () => expect(formatPrice(1000)).toBe("1,000"));
test('formatPrice(100000) → "100,000"', () => expect(formatPrice(100000)).toBe("100,000"));
test('formatPriceLocale(1234567) → "1,234,567"', () => expect(formatPriceLocale(1234567)).toBe("1,234,567"));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Chuyển số thành chuỗi và tách phần</h3>
<p>Bài này dùng nhiều <strong>method</strong>: function đi kèm một giá trị, gọi bằng dấu chấm.</p>
${ANAT('const parts = ', ['text', 'Giá trị cần xử lý, ở đây là chuỗi <code>"2850.5"</code>.'], ['.', 'Dấu chấm: gọi method của giá trị này.'], ['split', 'Tên method: tách chuỗi.'], ['(".")', 'Tham số của method: tách tại dấu chấm.'], ';  // → ', ['["2850", "5"]', 'Kết quả là một mảng. Method không sửa <code>text</code>, mà trả về giá trị mới nên cần gán vào biến.'])}

{{ex0}}
<h3>Duyệt ngược và ghép chuỗi</h3>
<p>Vòng <code>for</code> có thể chạy lùi từ cuối về đầu. Ghép ký tự vào <strong>đầu</strong> chuỗi kết quả sẽ giữ nguyên thứ tự ban đầu.</p>
{{ex1}}
<p>Để chèn dấu phẩy, cần biết mình đang ở chữ số thứ mấy tính từ bên phải. Thử thêm một biến đếm trong vòng lặp trên.</p>
<h3>toLocaleString và locale</h3>
<p>Cách định dạng số phụ thuộc ngôn ngữ và vùng (locale):</p>
{{ex2}}
<p class="note">Góc QA: lỗi định dạng số theo locale rất hay gặp. Cùng một code chạy ở máy dev Nhật và máy test Việt Nam có thể hiển thị khác nhau. Luôn chỉ định locale rõ ràng trong code.</p>`,
examples:[String.raw`const price = 2850.5;
const text = String(price);
console.log(text, typeof text);   // "2850.5" string

const parts = text.split(".");
console.log(parts);               // ["2850", "5"]
console.log(parts[0], parts[1]);

console.log(String(1000).split("."));  // không có phần thập phân`,
String.raw`const digits = "12345";
let result = "";
for (let i = digits.length - 1; i >= 0; i--) {
  result = digits[i] + result;
  console.log("i =", i, "| result =", result);
}`,
String.raw`const n = 1234567.8;
console.log(n.toLocaleString("en-US"));  // 1,234,567.8
console.log(n.toLocaleString("vi-VN"));  // 1.234.567,8
console.log(n.toLocaleString("ja-JP"));  // 1,234,567.8`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Tách phần nguyên và phần thập phân, chỉ chèn dấu phẩy vào phần nguyên.</li>
<li>Duyệt từ phải sang trái, đếm số chữ số đã lấy. Cứ đủ 3 chữ số và bên trái vẫn còn chữ số (<code>i &gt; 0</code>) thì chèn dấu phẩy.</li>
<li>Không có phần thập phân thì <code>parts[1]</code> là <code>undefined</code>, chỉ trả về phần nguyên.</li>
</ul>
<h3>Chạy tay với 1234567</h3>
${TRACE(['i', 'Chữ số', 'count', 'result'], [['6', '7', '1', '"7"'], ['5', '6', '2', '"67"'], ['4', '5', '3', '",567"'], ['3', '4', '4', '"4,567"'], ['2', '3', '5', '"34,567"'], ['1', '2', '6', '",234,567"'], ['0', '1', '7', '"1,234,567"']])}
<h3>Lỗi hay gặp</h3>
<p>Thiếu điều kiện <code>i &gt; 0</code>: số có 3, 6, 9 chữ số bị thừa dấu phẩy ở đầu, ví dụ <code>",100,000"</code>.</p>`,
examples:[String.raw`function formatPrice(price) {
  const parts = String(price).split(".");
  const intPart = parts[0];
  let result = "";
  let count = 0;
  for (let i = intPart.length - 1; i >= 0; i--) {
    result = intPart[i] + result;
    count++;
    if (count % 3 === 0 && i > 0) result = "," + result;
  }
  return parts[1] === undefined ? result : result + "." + parts[1];
}

function formatPriceLocale(price) {
  return price.toLocaleString("en-US");
}

console.log(formatPrice(1234567));   // 1,234,567
console.log(formatPrice(2850.5));    // 2,850.5
console.log(formatPrice(100000));    // 100,000
console.log(formatPriceLocale(1234567));`]},
});
