defineExercise({
  id: 'w7.1',
  title: 'SELECT, FROM: xem dữ liệu một bảng',
  sql: { data: () => W7_DATA, alt: () => W7_DATA_B, answer: 'SELECT code, name, price FROM stocks;' },
  desc: `<p>Bảng <code>stocks</code> lưu các mã cổ phiếu hiện trên Bảng giá của Sàn Demo. Mở tab <strong>Dữ liệu</strong> để xem các bảng.</p>
<p>Viết câu SQL lấy <strong>3 cột theo đúng thứ tự</strong>: <code>code</code>, <code>name</code>, <code>price</code> của mọi cổ phiếu.</p>
<p class="note">Bấm <strong>Chạy</strong> (Ctrl + Enter) để xem kết quả dạng bảng ở tab Console. Chạy bao nhiêu lần cũng được, dữ liệu không bị thay đổi.</p>`,
  hints: [
    'Câu SQL đọc dữ liệu có dạng <code>SELECT các_cột FROM tên_bảng;</code>',
    'Các cột cách nhau bằng dấu phẩy, theo đúng thứ tự muốn hiện: <code>SELECT code, name, price</code>.',
    '<code>SELECT code, name, price FROM stocks;</code>'],
  starter: String.raw`-- Xem các bảng và cột ở tab Dữ liệu bên phải.
-- Lấy cột code, name, price của mọi cổ phiếu trong bảng stocks.
SELECT
`,
  tests: String.raw`
check('Chọn đúng 3 cột, không dùng SELECT *', () => expect(/select\s+\*/i.test(__sql), 'Đề bài cần đúng 3 cột code, name, price. SELECT * lấy mọi cột').toBe(false));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Tuần 7: SQL cho QA</h3>
<p>Mọi thứ bạn thấy trên Sàn Demo (người dùng, bảng giá, lệnh đã đặt) đều được lưu trong <strong>database</strong>. Giao diện chỉ là lớp hiển thị. QA dùng <strong>SQL</strong> để hỏi database trực tiếp: đặt lệnh xong thì lệnh có thật sự được lưu không, lưu có đúng không, có dữ liệu nào sai không.</p>
${TRACE(['Khái niệm', 'Nghĩa', 'Ví dụ ở Sàn Demo'], [['Bảng (table)', 'một loại dữ liệu, giống một sheet Excel', '<code>users</code>, <code>stocks</code>, <code>orders</code>'], ['Cột (column)', 'một thuộc tính, có kiểu dữ liệu', '<code>qty</code> (INTEGER), <code>status</code> (TEXT)'], ['Dòng (row)', 'một bản ghi', 'một lệnh đặt mua']])}
<p>Database của tuần này chạy ngay trong trình duyệt (SQLite). Xem toàn bộ các bảng ở tab <strong>Dữ liệu</strong>.</p>
<h3>SELECT và FROM</h3>
${ANAT(['SELECT', 'Lấy dữ liệu ra (chỉ đọc, không thay đổi gì).'], ' ', ['code, name', 'Các cột cần lấy, theo thứ tự muốn hiện. <code>*</code> nghĩa là mọi cột.'], ' ', ['FROM stocks', 'Lấy từ bảng nào.'], [';', 'Kết thúc câu lệnh. Viết nhiều câu thì mỗi câu một dấu chấm phẩy.'])}
{{ex0}}
<ul>
<li>Từ khóa SQL không phân biệt hoa thường (<code>select</code> hay <code>SELECT</code> đều được); quy ước viết hoa cho dễ đọc.</li>
<li><code>AS</code> đặt tên khác cho cột trong kết quả: <code>full_name AS ten</code>.</li>
<li>Dòng bắt đầu bằng <code>--</code> là comment.</li>
</ul>
<p class="note">Góc QA: <code>SELECT</code> chỉ đọc nên an toàn. Trên database thật của công ty, QA thường chỉ được quyền đọc. Các câu thay đổi dữ liệu (<code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code>) để dành cho database test (bài nâng cao).</p>`,
examples:[{ lang:'sql', code:String.raw`SELECT * FROM users;

SELECT email, full_name AS ten FROM users;` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<p>Thứ tự cột trong kết quả theo đúng thứ tự viết sau <code>SELECT</code>, không phụ thuộc thứ tự cột trong bảng.</p>`,
examples:[{ lang:'sql', code:String.raw`SELECT code, name, price FROM stocks;` }]},
});
