defineExercise({
  id: '7.2',
  title: 'Tự viết mini test runner',
  desc: `<p>Viết function <code>expectEqual(actual, expected, testName)</code>:</p>
<ul>
<li>Nếu bằng nhau (<code>===</code>): in <code>✅ testName</code>, trả về <code>true</code>.</li>
<li>Nếu khác: in <code>❌ testName - expected X but got Y</code>, trả về <code>false</code>.</li>
</ul>
<p>Sau đó dán các function của bài 4.1, 4.2, 5.2, 5.3 vào và dùng <code>expectEqual</code> để test chúng. Cuối cùng in tổng số test pass/fail.</p>
<p class="note">Đây chính là cách Jest hay Playwright hoạt động bên trong, ở mức đơn giản nhất. Công cụ bạn đang dùng cũng chấm bài theo đúng cách này.</p>`,
  hint: `Dùng template literal cho thông báo lỗi. Để đếm tổng, khai báo <code>let passed = 0, failed = 0</code> bên ngoài và tăng theo giá trị trả về.`,
  starter: String.raw`function expectEqual(actual, expected, testName) {

}

// Dán các function của bài 4.1, 4.2, 5.2, 5.3 vào đây


// Viết test
expectEqual(1 + 1, 2, "cộng cơ bản");
expectEqual("a", "b", "so sánh chuỗi");
`,
  tests: String.raw`
test('Bằng nhau → in "✅ tên"', () => expect(captureLogs(() => expectEqual(1, 1, "a"))).toEqual(["✅ a"]));
test('Khác nhau → in "❌ tên - expected X but got Y"', () => expect(captureLogs(() => expectEqual(1, 2, "b"))).toEqual(["❌ b - expected 2 but got 1"]));
test('Chuỗi khác nhau', () => expect(captureLogs(() => expectEqual("x", "y", "c"))).toEqual(["❌ c - expected y but got x"]));
test('Trả về true / false', () => { let a, b; captureLogs(() => { a = expectEqual(3, 3, "t"); b = expectEqual(3, "3", "t"); }); expect(a).toBe(true); expect(b, 'Có phải bạn đang dùng == thay vì ===?').toBe(false); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Assertion là gì</h3>
<p>Mọi framework test đều xoay quanh một ý: so sánh giá trị thực tế (actual) với giá trị mong đợi (expected), rồi báo cáo kết quả. Đó gọi là assertion. Ở giai đoạn sau bạn sẽ viết như thế này:</p>
{{ex0}}

${ANAT(['expect(', 'Mở đầu một assertion.'], ['sumAll(1, 2)', 'Giá trị <strong>thực tế</strong> (actual): code được test chạy ra gì.'], ')', ['.toBe(', 'Cách so sánh: bằng nhau theo <code>===</code>.'], ['3', 'Giá trị <strong>mong đợi</strong> (expected).'], ');')}
<p>Đọc cả dòng: "mong đợi <code>sumAll(1, 2)</code> bằng 3". Khớp thì pass, không khớp thì fail kèm thông báo "expected 3 but got ...". Bài này bạn tự viết <code>expectEqual(actual, expected, testName)</code> theo đúng ý đó.</p>
<h3>Đếm kết quả</h3>
<p>Function trả về <code>true</code>/<code>false</code>, bên ngoài dùng biến để đếm:</p>
{{ex1}}
<h3>Hạn chế của ===</h3>
<p>Object và mảng được so sánh theo tham chiếu (có phải cùng một vùng nhớ không), không so theo nội dung. Đó là lý do Jest có riêng <code>toEqual</code> bên cạnh <code>toBe</code>.</p>
{{ex2}}`,
examples:[{ run:false, code:String.raw`// Cú pháp Jest / Playwright bạn sẽ gặp ở giai đoạn sau
test("tính tổng", () => {
  expect(sumAll(1, 2)).toBe(3);
});` },
L(
'let passed = 0;',
'let failed = 0;',
'function record(ok) {',
'  if (ok) passed++;',
'  else failed++;',
'}',
'record(1 + 1 === 2);',
'record("a" === "b");',
'console.log(`Pass: ${passed} | Fail: ${failed}`);'),
String.raw`console.log([1, 2] === [1, 2]);  // false: hai mảng khác nhau trong bộ nhớ
const a = [1, 2];
const b = a;
console.log(a === b);            // true: cùng một mảng
console.log(JSON.stringify([1, 2]) === JSON.stringify([1, 2]));  // true`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>expectEqual</code> so sánh bằng <code>===</code> nên <code>3</code> và <code>"3"</code> là khác nhau, đúng như test runner thật.</li>
<li>Giá trị trả về <code>true/false</code> cho phép bên ngoài đếm pass/fail mà <code>expectEqual</code> không cần biết đến biến đếm.</li>
<li>Hàm <code>run</code> gom việc gọi và đếm vào một chỗ, mỗi test chỉ còn một dòng.</li>
</ul>
<h3>So với Playwright</h3>
<p><code>expect(actual).toBe(expected)</code> ở tuần 4 làm đúng việc này, khác ở chỗ nó <strong>ném lỗi</strong> để dừng test thay vì trả về <code>false</code>, và in thông báo chi tiết hơn.</p>`,
examples:[`function expectEqual(actual, expected, testName) {
  if (actual === expected) {
    console.log(\`✅ \${testName}\`);
    return true;
  }
  console.log(\`❌ \${testName} - expected \${expected} but got \${actual}\`);
  return false;
}

// Bài 4.1
function isValidStockCode(code) {
  if (typeof code !== "string" || code.length !== 4) return false;
  for (const ch of code) {
    if (!"0123456789".includes(ch)) return false;
  }
  return true;
}

// Bài 4.2
function formatPrice(price) {
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

// Bài 5.2
function normalizeInput(str) {
  return str.trim().toLowerCase().replace(/\\s+/g, " ");
}

// Bài 5.3
function generateTestId(module, number) {
  return \`TC_\${module.toUpperCase()}_\${String(number).padStart(3, "0")}\`;
}

let passed = 0;
let failed = 0;
function run(actual, expected, testName) {
  if (expectEqual(actual, expected, testName)) passed++;
  else failed++;
}

run(isValidStockCode("7203"), true, "4.1: mã hợp lệ");
run(isValidStockCode("72A3"), false, "4.1: có chữ cái");
run(isValidStockCode(7203), false, "4.1: kiểu number");
run(formatPrice(1234567), "1,234,567", "4.2: số nguyên");
run(formatPrice(2850.5), "2,850.5", "4.2: số thập phân");
run(normalizeInput("  Hello    World  "), "hello world", "5.2: chuẩn hóa");
run(generateTestId("login", 5), "TC_LOGIN_005", "5.3: đệm số 0");
run(generateTestId("order", 123), "TC_ORDER_1234", "5.3: cố tình sai để thấy ❌");

console.log("---");
console.log(\`Tổng: \${passed + failed} | Pass: \${passed} | Fail: \${failed}\`);`]},
});
