defineExercise({
  id: '1.3',
  title: 'Truthy và falsy',
  desc: `<p>Viết function <code>checkTruthy(x)</code> trả về <code>"chạy"</code> nếu <code>if (x)</code> được thực thi, ngược lại trả về <code>"không chạy"</code>.</p>
<p>Trước khi bấm Chạy, hãy tự đoán kết quả cho các giá trị: <code>0</code>, <code>"0"</code>, <code>""</code>, <code>" "</code>, <code>[]</code>, <code>{}</code>, <code>null</code>, <code>NaN</code>, <code>-1</code>.</p>
<p class="note">Vì sao quan trọng: khi test API, <code>0</code> hoặc <code>""</code> có thể là dữ liệu hợp lệ nhưng bị <code>if</code> coi là "không có", dẫn tới bỏ sót bug.</p>`,
  hint: `Chỉ có đúng 6 giá trị falsy: <code>false</code>, <code>0</code>, <code>""</code>, <code>null</code>, <code>undefined</code>, <code>NaN</code>. Mọi thứ khác đều truthy, kể cả mảng rỗng.`,
  starter: String.raw`function checkTruthy(x) {
  // viết code ở đây
}

const values = [0, "0", "", " ", [], {}, null, NaN, -1];
for (const v of values) {
  console.log(v, "→", checkTruthy(v));
}
`,
  tests: String.raw`
test('0, "", null, NaN → "không chạy"', () => { for (const v of [0, "", null, NaN]) expect(checkTruthy(v), 'Sai với giá trị ' + JSON.stringify(v)).toBe("không chạy"); });
test('"0" và " " → "chạy"', () => { expect(checkTruthy("0")).toBe("chạy"); expect(checkTruthy(" ")).toBe("chạy"); });
test('[] và {} → "chạy"', () => { expect(checkTruthy([])).toBe("chạy"); expect(checkTruthy({})).toBe("chạy"); });
test('-1 → "chạy"', () => expect(checkTruthy(-1)).toBe("chạy"));
test('undefined → "không chạy"', () => expect(checkTruthy(undefined)).toBe("không chạy"));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Truthy và falsy</h3>
<p>Khi đặt một giá trị vào <code>if</code>, JavaScript tự đổi nó thành true hoặc false. Giá trị bị đổi thành false gọi là <em>falsy</em>, còn lại là <em>truthy</em>.</p>
<p>Chỉ có đúng 6 giá trị falsy: <code>false</code>, <code>0</code>, <code>""</code>, <code>null</code>, <code>undefined</code>, <code>NaN</code>. Mọi thứ khác đều truthy, kể cả <code>"0"</code>, <code>" "</code>, <code>[]</code> và <code>{}</code>.</p>
<p>Cấu trúc của câu lệnh <code>if</code>:</p>
${ANAT(['if', 'Từ khóa "nếu".'], ' ', ['(x)', 'Điều kiện, luôn nằm trong ngoặc tròn. Có thể là phép so sánh như <code>(n &gt; 0)</code>, hoặc chỉ một giá trị như <code>(x)</code>: khi đó JavaScript tự đổi <code>x</code> sang true/false theo luật truthy/falsy.'], ' ', ['{\n  console.log("chạy");\n}', 'Khối lệnh trong ngoặc nhọn, chỉ chạy khi điều kiện là true. Có thể viết nhiều dòng bên trong.'])}
{{ex0}}
<h3>Bẫy hay gặp khi test</h3>
<p>Số lượng bằng 0 là dữ liệu hợp lệ, nhưng <code>if</code> lại coi là "không có":</p>
{{ex1}}
<h3>Viết một function nhỏ</h3>
<p>Bài tập cần viết function trả về giá trị. Từ khóa <code>return</code> trả kết quả và kết thúc function ngay lập tức:</p>
${ANAT(['function', 'Từ khóa khai báo function: một đoạn code có tên, gọi lại được nhiều lần.'], ' ', ['checkSign', 'Tên function, đặt giống tên biến. Nên là động từ hoặc câu hỏi.'], ['(n)', 'Tham số: tên tạm cho giá trị được truyền vào khi gọi. Gọi <code>checkSign(5)</code> thì bên trong <code>n</code> là 5.'], ' {\n  ', ['return "dương";', '<code>return</code> trả kết quả ra ngoài và <strong>kết thúc function ngay</strong>, các dòng sau không chạy nữa.'], '\n}')}
{{ex2}}`,
examples:[String.raw`if ("") console.log("dòng này không in");
if ("0") console.log("chuỗi \"0\" là truthy");
if ([]) console.log("mảng rỗng là truthy");
console.log(Boolean(0), Boolean("abc"));  // false true`,
String.raw`const response = { quantity: 0 };

if (response.quantity) {
  console.log("Có quantity");
} else {
  console.log("Báo thiếu quantity");  // sai! 0 là giá trị hợp lệ
}

// Cách đúng: kiểm tra có tồn tại hay không
if (response.quantity !== undefined) {
  console.log("Có quantity:", response.quantity);
}`,
String.raw`function checkSign(n) {
  if (n > 0) return "dương";
  return "không dương";
}
console.log(checkSign(5));
console.log(checkSign(-2));`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Kết quả</h3>
${TRACE(['Giá trị', 'Kết quả', 'Lý do'], [['<code>0</code>', 'không chạy', 'falsy'], ['<code>"0"</code>', 'chạy', 'chuỗi khác rỗng'], ['<code>""</code>', 'không chạy', 'chuỗi rỗng là falsy'], ['<code>" "</code>', 'chạy', 'có một dấu cách, không rỗng'], ['<code>[]</code>', 'chạy', 'mọi object/mảng đều truthy'], ['<code>{}</code>', 'chạy', 'như trên'], ['<code>null</code>', 'không chạy', 'falsy'], ['<code>NaN</code>', 'không chạy', 'falsy'], ['<code>-1</code>', 'chạy', 'mọi số khác 0 đều truthy']])}
<h3>Lỗi hay gặp</h3>
<p>Kiểm tra mảng rỗng bằng <code>if (arr)</code>: luôn đúng. Phải viết <code>if (arr.length &gt; 0)</code>.</p>`,
examples:[String.raw`function checkTruthy(x) {
  if (x) {
    return "chạy";
  }
  return "không chạy";
}

const values = [0, "0", "", " ", [], {}, null, NaN, -1];
for (const v of values) {
  console.log(v, "→", checkTruthy(v));
}`]},
});
