defineExercise({
  id: '1.1',
  title: 'Khai báo biến cho một mã cổ phiếu',
  desc: `<p>Khai báo 4 biến mô tả một mã cổ phiếu, dùng đúng tên biến sau:</p>
<pre>code      = "7203"
name      = "Toyota"
price     = 2850.5
isTrading = true</pre>
<p>Sau đó in kiểu dữ liệu của từng biến bằng <code>typeof</code>.</p>`,
  hint: `Dùng <code>const</code> vì các giá trị này không cần gán lại. Chú ý <code>"7203"</code> có dấu ngoặc kép nên là chuỗi, không phải số.`,
  starter: String.raw`// Khai báo 4 biến bằng const


// In kiểu dữ liệu của từng biến
// console.log(typeof code);
`,
  tests: String.raw`
test('code là chuỗi "7203"', () => expect(code).toBe("7203"));
test('name là "Toyota"', () => expect(name).toBe("Toyota"));
test('price là số 2850.5', () => expect(price).toBe(2850.5));
test('isTrading là true', () => expect(isTrading).toBe(true));
test('Có dùng typeof', () => expect(__source.includes("typeof"), 'Chưa thấy typeof trong code').toBe(true));
test('Không dùng var', () => expect(/\bvar\b/.test(__source), 'Hãy dùng const hoặc let thay cho var').toBe(false));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Biến là gì</h3>
<p>Biến là một cái tên gắn với một giá trị để dùng lại nhiều lần. Hình dung như một chiếc hộp có dán nhãn: nhãn là tên biến, đồ trong hộp là giá trị. Cần dùng giá trị thì chỉ việc gọi tên nhãn.</p>
<p>Ví dụ dòng <code>const price = 2850;</code> đọc là "tạo biến tên <code>price</code> và gán cho nó giá trị <code>2850</code>". Tách từng phần:</p>
${ANAT(['const', 'Từ khóa khai báo: báo cho JavaScript biết "tạo một biến mới". Biến tạo bằng <code>const</code> không gán lại giá trị khác được.'], ' ', ['price', 'Tên biến, do bạn tự đặt. Tên không có dấu cách, không bắt đầu bằng số, phân biệt hoa thường. Tên nhiều từ thì viết kiểu camelCase: <code>stockCode</code>, <code>isTrading</code>.'], ' ', ['=', 'Dấu <strong>gán</strong>, không phải dấu "bằng" trong toán. Đọc là "lấy giá trị bên phải cất vào tên bên trái". Muốn so sánh bằng thì dùng <code>===</code> (bài 1.2).'], ' ', ['2850', 'Giá trị được cất vào biến. Đây là số (<code>number</code>). Nếu viết <code>"2850"</code> có ngoặc kép thì lại là chuỗi (<code>string</code>).'], [';', 'Dấu kết thúc câu lệnh, giống dấu chấm cuối câu.'])}
<p>Sau dòng này, ở đâu viết <code>price</code> thì JavaScript hiểu là <code>2850</code>. JavaScript hiện đại có hai từ khóa để khai báo biến:</p>
<ul>
<li><code>const</code>: không gán lại được. Đây là lựa chọn mặc định.</li>
<li><code>let</code>: gán lại được, dùng khi giá trị thay đổi như biến đếm, biến cộng dồn.</li>
<li><code>var</code>: cách cũ, có nhiều hành vi khó lường. Không dùng nữa.</li>
</ul>
{{ex0}}
<p>Dòng <code>console.log(count);</code> xuất hiện ở hầu hết ví dụ, nên hãy hiểu nó ngay từ bây giờ:</p>
${ANAT(['console', 'Công cụ để in thông tin ra màn hình. Trong trang này, kết quả hiện ở tab <strong>Console</strong> bên phải.'], ['.log', 'Dấu chấm nghĩa là "lấy ra từ": lấy lệnh <code>log</code> (in ra) của <code>console</code>.'], ['(count)', 'Thứ cần in, đặt trong ngoặc tròn. Truyền tên biến thì in ra giá trị của biến. Muốn in nhiều thứ thì cách nhau bằng dấu phẩy: <code>console.log("Số lượng:", count)</code>.'], ';')}
<h3>Các kiểu dữ liệu</h3>
<p>Kiểu nguyên thủy gồm <code>string</code> (chuỗi), <code>number</code> (số, JS không tách số nguyên và số thực), <code>boolean</code> (true/false), <code>null</code> (cố ý để trống) và <code>undefined</code> (chưa có giá trị). Kiểu tham chiếu gồm <code>object</code> và mảng.</p>
<p>Toán tử <code>typeof</code> cho biết kiểu của một giá trị:</p>
${ANAT(['typeof', 'Toán tử hỏi "giá trị này thuộc kiểu gì?". Không cần ngoặc tròn.'], ' ', ['price', 'Giá trị cần hỏi, ở đây là biến <code>price</code> đang giữ <code>2850</code>.'], '  // → ', ['"number"', 'Kết quả luôn là một <strong>chuỗi</strong> ghi tên kiểu: <code>"string"</code>, <code>"number"</code>, <code>"boolean"</code>...'])}
{{ex1}}
<p class="note">Góc QA: API trả về <code>"7203"</code> (chuỗi) khác với <code>7203</code> (số). Kiểm tra đúng kiểu dữ liệu là một phần quan trọng khi verify response.</p>`,
examples:[String.raw`const stockCode = "7203";
let count = 0;
count = count + 1;   // được, vì là let
console.log(count);

// stockCode = "6758"; // bỏ comment dòng này sẽ báo lỗi vì là const`,
String.raw`console.log(typeof "Toyota");   // string
console.log(typeof 2850.5);     // number
console.log(typeof true);       // boolean
console.log(typeof undefined);  // undefined
console.log(typeof { a: 1 });   // object
console.log(typeof [1, 2]);     // object (mảng cũng là object)`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Cả 4 giá trị không cần gán lại nên dùng <code>const</code>.</li>
<li><code>"7203"</code> nằm trong dấu ngoặc kép nên là <code>string</code>. Mã cổ phiếu, số điện thoại, mã bưu điện nên lưu dạng chuỗi vì không dùng để tính toán và có thể bắt đầu bằng số 0.</li>
<li><code>2850.5</code> là <code>number</code>: JavaScript không tách số nguyên và số thực.</li>
</ul>
<h3>Lỗi hay gặp</h3>
<p>Viết <code>const code = 7203</code> (thiếu ngoặc kép): <code>typeof</code> in ra <code>number</code> và test <code>code là chuỗi</code> sẽ fail.</p>`,
examples:[String.raw`const code = "7203";
const name = "Toyota";
const price = 2850.5;
const isTrading = true;

console.log(typeof code);      // string
console.log(typeof name);      // string
console.log(typeof price);     // number
console.log(typeof isTrading); // boolean`]},
});
