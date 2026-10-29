defineExercise({
  id: 'w7.5',
  title: 'COUNT, SUM, AVG: đếm và tính tổng',
  sql: { data: () => W7_DATA, alt: () => W7_DATA_B, answer: "SELECT COUNT(*), SUM(qty) FROM orders WHERE status = 'Đã khớp';" },
  desc: `<p>Báo cáo cuối ngày cần hai con số về các lệnh <strong>Đã khớp</strong>. Viết câu SQL trả về <strong>một dòng, hai cột</strong> theo thứ tự:</p>
<ol>
<li>số lệnh đã khớp,</li>
<li>tổng khối lượng của các lệnh đó.</li>
</ol>`,
  hints: [
    'Hàm tổng hợp gom nhiều dòng thành một giá trị: <code>COUNT(*)</code> đếm số dòng, <code>SUM(cột)</code> cộng các giá trị.',
    'Lọc bằng <code>WHERE</code> trước, hàm tổng hợp tính trên các dòng còn lại.',
    '<code>SELECT COUNT(*), SUM(qty) FROM orders WHERE status = \'Đã khớp\';</code>'],
  starter: String.raw`-- Một dòng: số lệnh Đã khớp, tổng khối lượng các lệnh đó.
SELECT
FROM orders
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Hàm tổng hợp</h3>
${TRACE(['Hàm', 'Trả về', 'Bỏ qua NULL?'], [['<code>COUNT(*)</code>', 'số dòng', 'không (đếm mọi dòng)'], ['<code>COUNT(cột)</code>', 'số dòng mà cột đó có giá trị', 'có'], ['<code>SUM(cột)</code>', 'tổng', 'có'], ['<code>AVG(cột)</code>', 'trung bình', 'có'], ['<code>MIN(cột)</code>, <code>MAX(cột)</code>', 'nhỏ nhất, lớn nhất', 'có']])}
${ANAT('SELECT ', ['COUNT(*)', 'Đếm số dòng còn lại sau WHERE.'], ' ', ['AS so_lenh', 'Đặt tên cho cột kết quả, đọc dễ hơn "COUNT(*)".'], ', ', ['ROUND(AVG(price), 0)', 'Giá trung bình, làm tròn 0 chữ số thập phân.'], " FROM orders WHERE code = '7203';")}
{{ex0}}
<h3>COUNT(*) khác COUNT(cột)</h3>
<p>Một lệnh trong bảng có <code>price</code> là <code>NULL</code> (thiếu dữ liệu). <code>COUNT(*)</code> vẫn đếm dòng đó, còn <code>COUNT(price)</code> thì không. Chạy ví dụ dưới đây để thấy hai con số khác nhau.</p>
{{ex1}}
<p class="note">Góc QA: so <code>COUNT(*)</code> với <code>COUNT(cột_bắt_buộc)</code> là cách nhanh để phát hiện cột bắt buộc nhưng lại bị để trống.</p>`,
examples:[{ lang:'sql', code:String.raw`SELECT COUNT(*) AS so_lenh, ROUND(AVG(price), 0) AS gia_tb FROM orders WHERE code = '7203';` },
  { lang:'sql', code:String.raw`SELECT COUNT(*) AS moi_dong, COUNT(price) AS co_gia FROM orders;` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}`,
examples:[{ lang:'sql', code:String.raw`SELECT COUNT(*) AS so_lenh, SUM(qty) AS tong_khoi_luong
FROM orders
WHERE status = 'Đã khớp';` }]},
});
