defineExercise({
  id: 'w7.7',
  title: 'JOIN: nối dữ liệu từ nhiều bảng',
  sql: { data: () => W7_DATA, alt: () => W7_DATA_B, ordered: true,
    answer: "SELECT o.id, s.name, u.email FROM orders o JOIN stocks s ON s.code = o.code JOIN users u ON u.id = o.user_id WHERE o.status = 'Đã khớp' ORDER BY o.id;" },
  desc: `<p>Bảng <code>orders</code> chỉ lưu <code>code</code> và <code>user_id</code>. Báo cáo cần tên công ty và email người đặt.</p>
<p>Viết câu SQL lấy 3 cột: <code>id</code> của lệnh, <code>name</code> (tên công ty, bảng <code>stocks</code>), <code>email</code> người đặt (bảng <code>users</code>), chỉ các lệnh <strong>Đã khớp</strong>, sắp theo <code>id</code> tăng dần.</p>`,
  hints: [
    'Nối hai bảng: <code>FROM orders o JOIN stocks s ON s.code = o.code</code>. <code>o</code>, <code>s</code> là tên tắt (alias) của bảng.',
    'Nối thêm bảng thứ ba: <code>JOIN users u ON u.id = o.user_id</code>. Khi có nhiều bảng, ghi rõ cột của bảng nào: <code>o.id</code>, <code>o.status</code>.',
    '<code>SELECT o.id, s.name, u.email FROM orders o JOIN stocks s ON s.code = o.code JOIN users u ON u.id = o.user_id WHERE o.status = \'Đã khớp\' ORDER BY o.id;</code>'],
  starter: String.raw`-- id lệnh, tên công ty, email người đặt; chỉ lệnh Đã khớp; sắp theo id.
SELECT
FROM orders o
`,
  tests: String.raw`
check('Dùng JOIN để nối bảng', () => expect(/\bjoin\b/i.test(__sql), 'Hãy nối bảng bằng JOIN ... ON ...').toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Vì sao dữ liệu nằm ở nhiều bảng</h3>
<p>Tên công ty "Toyota Motor" không được ghi lại trong từng lệnh. Lệnh chỉ lưu <code>code</code> (7203), còn tên nằm một chỗ duy nhất ở bảng <code>stocks</code>. Đổi tên công ty chỉ cần sửa một dòng. Cái giá là khi đọc phải <strong>nối</strong> các bảng lại.</p>
${ANAT('SELECT o.id, s.name\nFROM ', ['orders o', 'Bảng chính, đặt tên tắt là o.'], '\n', ['JOIN stocks s', 'Nối thêm bảng stocks, tên tắt s.'], ' ', ['ON s.code = o.code', 'Điều kiện ghép: dòng của stocks có code bằng code của lệnh.'], ';')}
{{ex0}}
<ul>
<li><code>JOIN</code> (đầy đủ là <code>INNER JOIN</code>) chỉ giữ những dòng ghép được ở <strong>cả hai</strong> bảng. Lệnh có <code>user_id</code> không tồn tại trong <code>users</code> sẽ biến mất khỏi kết quả. Bài sau dùng chính điều này để tìm dữ liệu lỗi.</li>
<li>Khi hai bảng có cột trùng tên (<code>orders.price</code> và <code>stocks.price</code>), phải ghi rõ <code>o.price</code> hay <code>s.price</code>, nếu không database báo lỗi "ambiguous column".</li>
</ul>
<p class="note">Góc QA: đặt lệnh trên giao diện xong, câu JOIN kiểm tra lệnh được gắn đúng người dùng và đúng mã. Bug "lưu nhầm user_id" chỉ lộ ra khi nối bảng.</p>`,
examples:[{ lang:'sql', code:String.raw`-- Lệnh kèm tên công ty và giá hiện tại trên Bảng giá
SELECT o.id, o.code, s.name, o.price AS gia_dat, s.price AS gia_hien_tai
FROM orders o
JOIN stocks s ON s.code = o.code
ORDER BY o.id
LIMIT 5;` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}`,
examples:[{ lang:'sql', code:String.raw`SELECT o.id, s.name, u.email
FROM orders o
JOIN stocks s ON s.code = o.code
JOIN users u ON u.id = o.user_id
WHERE o.status = 'Đã khớp'
ORDER BY o.id;` }]},
});
