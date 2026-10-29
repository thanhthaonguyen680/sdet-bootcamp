defineExercise({
  id: 'w7.9',
  title: 'Tìm dữ liệu sai: NULL, giá trị không hợp lệ, trùng lặp',
  sql: { data: () => W7_DATA, alt: () => W7_DATA_B, ordered: true,
    answer: 'SELECT id, qty, price FROM orders WHERE qty <= 0 OR qty % 100 <> 0 OR price IS NULL ORDER BY id;' },
  desc: `<p>Quy tắc của form Đặt lệnh: khối lượng phải <strong>lớn hơn 0</strong> và là <strong>bội số của 100</strong>; mỗi lệnh phải có <strong>giá</strong>. Form đã kiểm tra các quy tắc này, nhưng database vẫn có thể chứa dữ liệu sai (từ API, từ bản cũ, từ script nhập liệu).</p>
<p>Viết câu SQL tìm mọi lệnh vi phạm <strong>ít nhất một</strong> quy tắc: 3 cột <code>id</code>, <code>qty</code>, <code>price</code>, sắp theo <code>id</code>.</p>`,
  hints: [
    'Ba điều kiện vi phạm, nối bằng <code>OR</code>: khối lượng nhỏ hơn hoặc bằng 0; khối lượng không chia hết cho 100; giá để trống.',
    '<code>%</code> là phép chia lấy dư: <code>qty % 100 &lt;&gt; 0</code> nghĩa là không chia hết cho 100. Giá để trống: <code>price IS NULL</code>.',
    '<code>WHERE qty &lt;= 0 OR qty % 100 &lt;&gt; 0 OR price IS NULL ORDER BY id</code>'],
  starter: String.raw`-- Lệnh vi phạm quy tắc: khối lượng <= 0, khối lượng không chia hết 100, hoặc thiếu giá.
SELECT id, qty, price
FROM orders
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Kiểm tra dữ liệu: biến quy tắc nghiệp vụ thành câu SQL</h3>
<p>Mỗi quy tắc trong tài liệu yêu cầu đều có thể viết thành một câu SQL tìm <strong>dòng vi phạm</strong>. Kết quả rỗng nghĩa là dữ liệu sạch; có dòng nào là có bug.</p>
${TRACE(['Loại lỗi', 'Câu SQL tìm lỗi'], [['Thiếu giá trị bắt buộc', '<code>WHERE price IS NULL</code>'], ['Giá trị ngoài miền cho phép', '<code>WHERE qty &lt;= 0 OR qty % 100 &lt;&gt; 0</code>'], ['Trạng thái không có trong danh sách', "<code>WHERE status NOT IN ('Đã khớp', 'Chờ khớp', 'Đã hủy')</code>"], ['Trùng lặp', '<code>GROUP BY LOWER(email) HAVING COUNT(*) &gt; 1</code>'], ['Dữ liệu mồ côi', '<code>LEFT JOIN ... WHERE ... IS NULL</code> (bài 8)']])}
<h3>Trùng lặp khác hoa thường</h3>
<p>Email <code>minh@sandemo.test</code> và <code>MINH@sandemo.test</code> là cùng một người, nhưng so sánh chuỗi thì khác nhau. <code>LOWER()</code> đưa về chữ thường trước khi gom nhóm:</p>
{{ex0}}
<p>Một người dùng có <code>full_name</code> NULL. Chạy ví dụ thứ hai để tìm.</p>
{{ex1}}
<p class="note">Góc QA: các câu kiểm tra dữ liệu nên được lưu lại thành bộ "data check" và chạy định kỳ sau mỗi lần deploy, giống bộ test tự động. Trong project Playwright, có thể chạy chúng ngay trong test sau khi thao tác trên giao diện.</p>`,
examples:[{ lang:'sql', code:String.raw`SELECT LOWER(email) AS email, COUNT(*) AS so_tai_khoan
FROM users
GROUP BY LOWER(email)
HAVING COUNT(*) > 1;` },
  { lang:'sql', code:String.raw`SELECT id, email FROM users WHERE full_name IS NULL;` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<p>Ba điều kiện nối bằng <code>OR</code>: chỉ cần vi phạm một quy tắc là lệnh có trong kết quả. Lệnh vừa sai khối lượng vừa thiếu giá chỉ xuất hiện một lần.</p>`,
examples:[{ lang:'sql', code:String.raw`SELECT id, qty, price
FROM orders
WHERE qty <= 0
   OR qty % 100 <> 0
   OR price IS NULL
ORDER BY id;` }]},
});
