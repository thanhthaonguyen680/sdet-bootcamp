defineExercise({
  id: '7.1',
  title: 'Kiểm tra dữ liệu Order Book',
  desc: `<p>Viết function <code>validateOrderBook(data)</code> kiểm tra từng dòng theo thứ tự <strong>price → quantity → side</strong>, dừng ở lỗi đầu tiên của mỗi dòng:</p>
<ul>
<li><code>price</code> phải là kiểu number và &gt; 0, nếu sai: <code>price must be &gt; 0</code></li>
<li><code>quantity</code> phải &gt; 0, nếu sai: <code>quantity must be &gt; 0</code>. Phải là số nguyên, nếu sai: <code>quantity must be an integer</code></li>
<li><code>side</code> chỉ là <code>"buy"</code> hoặc <code>"sell"</code>, nếu sai: <code>invalid side "hold"</code></li>
</ul>
<p>Kết quả in ra:</p>
<pre>Row 1: PASS
Row 2: FAIL - quantity must be &gt; 0
Row 3: FAIL - price must be &gt; 0
Row 4: FAIL - invalid side "hold"
Row 5: PASS
---
Total: 5 | Pass: 2 | Fail: 3</pre>
<p>Function trả về <code>{ total, pass, fail }</code>.</p>`,
  hint: `Trong vòng lặp, dùng biến <code>let error = ""</code>. Kiểm tra từng điều kiện bằng <code>if / else if</code>, gán thông báo lỗi. Cuối mỗi vòng, nếu <code>error</code> rỗng thì PASS. Số nguyên: <code>Number.isInteger(x)</code>.`,
  starter: String.raw`const orderBook = [
  { price: 2850, quantity: 100, side: "buy" },
  { price: 2855, quantity: 0, side: "sell" },
  { price: -10, quantity: 200, side: "buy" },
  { price: 2860, quantity: 300, side: "hold" },
  { price: 2845, quantity: 150, side: "buy" },
];

function validateOrderBook(data) {
  let pass = 0;
  let fail = 0;

  // Duyệt từng dòng, kiểm tra lần lượt price → quantity → side
  // In "Row 1: PASS" hoặc "Row 2: FAIL - <lý do>"


  console.log("---");
  console.log("Total: " + data.length + " | Pass: " + pass + " | Fail: " + fail);
  return { total: data.length, pass, fail };
}

validateOrderBook(orderBook);
`,
  tests: String.raw`
const __ob = [
  { price: 2850, quantity: 100, side: "buy" },
  { price: 2855, quantity: 0, side: "sell" },
  { price: -10, quantity: 200, side: "buy" },
  { price: 2860, quantity: 300, side: "hold" },
  { price: 2845, quantity: 150, side: "buy" },
];
test('Tổng kết: 5 dòng, 2 pass, 3 fail', () => { let r; captureLogs(() => { r = validateOrderBook(__ob); }); expect(r).toEqual({ total: 5, pass: 2, fail: 3 }); });
test('In "Row 1: PASS"', () => expect(captureLogs(() => validateOrderBook(__ob))).toContain("Row 1: PASS"));
test('Row 2 báo lỗi quantity', () => expect(captureLogs(() => validateOrderBook(__ob))).toContain("Row 2: FAIL - quantity must be > 0"));
test('Row 3 báo lỗi price', () => expect(captureLogs(() => validateOrderBook(__ob))).toContain("Row 3: FAIL - price must be > 0"));
test('Row 4 báo lỗi side', () => expect(captureLogs(() => validateOrderBook(__ob))).toContain('Row 4: FAIL - invalid side "hold"'));
test('quantity 1.5 báo lỗi số nguyên', () => expect(captureLogs(() => validateOrderBook([{ price: 100, quantity: 1.5, side: "buy" }]))).toContain("Row 1: FAIL - quantity must be an integer"));
test('price dạng chuỗi "2850" là lỗi', () => { let r; captureLogs(() => { r = validateOrderBook([{ price: "2850", quantity: 1, side: "buy" }]); }); expect(r.fail).toBe(1); });
test('Dòng sai nhiều chỗ chỉ báo lỗi đầu tiên', () => expect(captureLogs(() => validateOrderBook([{ price: 0, quantity: 0, side: "x" }]))).toContain("Row 1: FAIL - price must be > 0"));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Chia nhỏ vấn đề</h3>
<p>Bài tổng hợp dễ bị rối nếu viết hết trong một vòng lặp. Hãy tách thành hai bước: một function kiểm tra <strong>một dòng</strong> và trả về thông báo lỗi (chuỗi rỗng nếu hợp lệ), sau đó một vòng lặp gọi function đó cho từng dòng.</p>
${ANAT('if (', ['typeof row.price !== "number"', 'Kiểu của <code>row.price</code> <strong>không phải</strong> number? (<code>!==</code> là "khác").'], ' ', ['||', '"Hoặc": chỉ cần một trong hai vế đúng.'], ' ', ['row.price <= 0', 'Giá nhỏ hơn hoặc bằng 0?'], ') ', ['return "price must be > 0";', 'Trả về thông báo lỗi và dừng function, các kiểm tra phía sau không chạy.'], '\n', ['return "";', 'Qua được hết các kiểm tra: trả về chuỗi rỗng, nghĩa là không có lỗi.'])}
{{ex0}}
<p>Ví dụ trên mới kiểm tra <code>price</code>. Bạn cần thêm <code>quantity</code>, <code>side</code> và phần đếm pass/fail.</p>
<h3>Các công cụ cần dùng</h3>
{{ex1}}
<p>Muốn có dấu nháy kép trong thông báo, bọc chuỗi bằng dấu nháy đơn: <code>'invalid side "' + side + '"'</code>.</p>
<p class="note">Góc QA: đây chính là việc bạn làm khi verify dữ liệu Order Book, chỉ khác là giờ để code kiểm tra thay cho mắt. Báo lỗi rõ dòng nào, sai ở đâu là điều làm nên một test report tốt.</p>`,
examples:[String.raw`function checkRow(row) {
  if (typeof row.price !== "number" || row.price <= 0) return "price must be > 0";
  return "";
}

const rows = [{ price: 10 }, { price: -1 }];
for (let i = 0; i < rows.length; i++) {
  const err = checkRow(rows[i]);
  console.log("Row " + (i + 1) + ": " + (err ? "FAIL - " + err : "PASS"));
}`,
String.raw`console.log(Number.isInteger(5));    // true
console.log(Number.isInteger(1.5));  // false
console.log(Number.isInteger("5"));  // false

const allowed = ["buy", "sell"];
console.log(allowed.includes("buy"), allowed.includes("hold"));`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Mỗi dòng bắt đầu với <code>error = ""</code>. Chuỗi <code>if / else if</code> đảm bảo chỉ lấy lỗi đầu tiên theo đúng thứ tự price → quantity → side.</li>
<li><code>typeof row.price !== "number"</code> loại giá trị kiểu chuỗi như <code>"2850"</code>.</li>
<li>Viết <code>!(row.price &gt; 0)</code> thay vì <code>row.price &lt;= 0</code> để bắt cả <code>NaN</code>: mọi phép so sánh với <code>NaN</code> đều <code>false</code>, nên <code>NaN &lt;= 0</code> cũng là <code>false</code> và lọt qua.</li>
<li>Số dòng in ra là <code>i + 1</code> vì index bắt đầu từ 0.</li>
</ul>
<h3>Lỗi hay gặp</h3>
<p>Dùng các <code>if</code> rời nhau: dòng sai nhiều chỗ bị ghi đè bởi lỗi cuối cùng, hoặc bị đếm fail nhiều lần.</p>`,
examples:[String.raw`const orderBook = [
  { price: 2850, quantity: 100, side: "buy" },
  { price: 2855, quantity: 0, side: "sell" },
  { price: -10, quantity: 200, side: "buy" },
  { price: 2860, quantity: 300, side: "hold" },
  { price: 2845, quantity: 150, side: "buy" },
];

function validateOrderBook(data) {
  let pass = 0;
  let fail = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    let error = "";
    if (typeof row.price !== "number" || !(row.price > 0)) error = "price must be > 0";
    else if (!(row.quantity > 0)) error = "quantity must be > 0";
    else if (!Number.isInteger(row.quantity)) error = "quantity must be an integer";
    else if (row.side !== "buy" && row.side !== "sell") error = 'invalid side "' + row.side + '"';

    if (error === "") {
      console.log("Row " + (i + 1) + ": PASS");
      pass++;
    } else {
      console.log("Row " + (i + 1) + ": FAIL - " + error);
      fail++;
    }
  }

  console.log("---");
  console.log("Total: " + data.length + " | Pass: " + pass + " | Fail: " + fail);
  return { total: data.length, pass, fail };
}

validateOrderBook(orderBook);`]},
});
