defineExercise({
  id: '1.2',
  title: 'Dự đoán kết quả so sánh',
  desc: `<p>Đọc từng dòng, ghi dự đoán vào sau chữ <code>Dự đoán:</code>, <strong>sau đó</strong> mới bấm Chạy để so sánh.</p>
<p>Ghi đúng giá trị sẽ được in ra, ví dụ <code>// Dự đoán: true</code> hoặc <code>// Dự đoán: object</code>. Câu nào đoán sai, hãy tìm hiểu lý do rồi sửa lại dự đoán. Xong thì bấm <em>Kiểm tra bài</em>.</p>`,
  hint: `<code>==</code> tự ép kiểu hai vế rồi mới so sánh, còn <code>===</code> so sánh cả kiểu. <code>typeof null</code> trả về <code>"object"</code> là một lỗi thiết kế từ thời đầu của JavaScript.`,
  starter: String.raw`console.log(1 == "1");           // Dự đoán:
console.log(1 === "1");          // Dự đoán:
console.log(null == undefined);  // Dự đoán:
console.log(null === undefined); // Dự đoán:
console.log(typeof null);        // Dự đoán:
console.log(typeof []);          // Dự đoán:
console.log(0 == false);         // Dự đoán:
console.log("" == 0);            // Dự đoán:
`,
  tests: String.raw`
// Đọc dự đoán ghi sau "Dự đoán:" trên dòng chứa đúng phép so sánh, bỏ dấu nháy, không phân biệt hoa thường.
const __cases = [['1 == "1"', 'true'], ['1 === "1"', 'false'], ['null == undefined', 'true'], ['null === undefined', 'false'], ['typeof null', 'object'], ['typeof []', 'object'], ['0 == false', 'true'], ['"" == 0', 'true']];
const __lineOf = expr => __source.split('\n').find(l => l.includes('console.log(' + expr + ')'));
const __guess = expr => { const m = (__lineOf(expr) || '').match(/Dự đoán:?\s*(.*)$/i); return m ? m[1].trim().replace(/^["'\x60]|["'\x60]$/g, '').trim().toLowerCase() : ''; };
test('Giữ nguyên 8 phép so sánh của đề', () => { const miss = __cases.filter(c => !__lineOf(c[0])).map(c => c[0]); expect(miss.length === 0, 'Không thấy dòng console.log(' + miss.join('), console.log(') + '). Chỉ ghi dự đoán, đừng sửa phép so sánh').toBe(true); });
for (const [expr, ans] of __cases) test(expr, () => { const g = __guess(expr); expect(g === ans, g ? 'Dự đoán "' + g + '" chưa đúng. Bấm Chạy để xem kết quả thật, rồi đọc lại bài giảng xem vì sao' : 'Chưa ghi dự đoán sau "Dự đoán:"').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Hai kiểu so sánh bằng</h3>
<p><code>===</code> (so sánh nghiêm ngặt) chỉ trả về <code>true</code> khi hai vế cùng kiểu và cùng giá trị. <code>==</code> (so sánh lỏng) tự chuyển kiểu hai vế rồi mới so sánh, nên hay cho kết quả khó đoán.</p>
{{ex0}}
<p>Đọc từng phần của một phép so sánh:</p>
${ANAT(['5', 'Vế trái: số 5, kiểu <code>number</code>.'], ' ', ['===', 'So sánh nghiêm ngặt: phải cùng kiểu <strong>và</strong> cùng giá trị.'], ' ', ['"5"', 'Vế phải: chuỗi "5", kiểu <code>string</code>. Nhìn giống số nhưng có ngoặc kép.'], '  // → ', ['false', 'Kết quả của phép so sánh luôn là <code>true</code> hoặc <code>false</code> (kiểu <code>boolean</code>). Ở đây khác kiểu nên là <code>false</code>. Nếu dùng <code>==</code> thì "5" bị đổi thành 5 trước, kết quả lại là <code>true</code>.'])}
<p>Quy tắc: luôn dùng <code>===</code> và <code>!==</code>. Nếu thấy <code>==</code> trong code của người khác, hãy đọc kỹ vì đó là chỗ dễ có bug.</p>
<h3>Hai điều lạ cần nhớ</h3>
<ul>
<li><code>typeof null</code> trả về <code>"object"</code>. Đây là lỗi từ phiên bản đầu tiên, không sửa được vì sẽ làm hỏng các trang web cũ. Muốn kiểm tra null thì dùng <code>x === null</code>.</li>
<li><code>typeof []</code> cũng là <code>"object"</code>. Muốn biết có phải mảng không thì dùng <code>Array.isArray(x)</code>.</li>
</ul>
{{ex1}}`,
examples:[String.raw`console.log(5 === 5);     // true
console.log(5 === "5");   // false: khác kiểu
console.log(5 == "5");    // true: "5" bị đổi thành 5
console.log(true == 1);   // true: true bị đổi thành 1`,
String.raw`const x = null;
console.log(typeof x);           // "object"
console.log(x === null);         // true: cách kiểm tra đúng
console.log(Array.isArray([]));  // true`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Đáp án</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>==</code> ép kiểu hai vế về cùng kiểu rồi mới so sánh: <code>"1"</code> thành <code>1</code>, <code>false</code> thành <code>0</code>, <code>""</code> thành <code>0</code>. Vì vậy các dòng dùng <code>==</code> đều ra <code>true</code>.</li>
<li><code>===</code> so sánh cả kiểu, khác kiểu là <code>false</code> ngay.</li>
<li><code>null == undefined</code> là trường hợp đặc biệt được quy định sẵn: hai giá trị này chỉ bằng nhau (theo <code>==</code>) với nhau.</li>
<li><code>typeof null</code> là <code>"object"</code> do lỗi thiết kế từ phiên bản đầu, giữ lại để không làm hỏng code cũ. <code>typeof []</code> cũng là <code>"object"</code>; muốn kiểm tra mảng thì dùng <code>Array.isArray(x)</code>.</li>
</ul>
<h3>Rút ra</h3>
<p>Luôn dùng <code>===</code> và <code>!==</code>. Trong test, so sánh lỏng có thể khiến API trả <code>"0"</code> thay vì <code>0</code> mà test vẫn pass.</p>`,
examples:[String.raw`console.log(1 == "1");           // Dự đoán: true
console.log(1 === "1");          // Dự đoán: false
console.log(null == undefined);  // Dự đoán: true
console.log(null === undefined); // Dự đoán: false
console.log(typeof null);        // Dự đoán: object
console.log(typeof []);          // Dự đoán: object
console.log(0 == false);         // Dự đoán: true
console.log("" == 0);            // Dự đoán: true`]},
});
