defineExercise({
  id: 'w7.12',
  title: 'INSERT, UPDATE, DELETE: chuẩn bị dữ liệu test',
  sql: { data: () => W7_DATA, alt: () => W7_DATA_B,
    after: ['SELECT * FROM users ORDER BY id', 'SELECT * FROM orders ORDER BY id'],
    answer: String.raw`INSERT INTO users (id, email, full_name, created_at, is_active) VALUES (20, 'qa.auto@sandemo.test', 'QA Auto', '2026-10-29', 1);
INSERT INTO orders (id, user_id, code, side, qty, price, status, created_at) VALUES ('DH-9001', 20, '7203', 'buy', 100, 2850, 'Chờ khớp', '2026-10-29 09:00');
DELETE FROM orders WHERE qty = 0;` },
  desc: `<p>Trước khi test kịch bản "hủy lệnh", cần chuẩn bị dữ liệu trên <strong>database test</strong>. Viết các câu lệnh làm lần lượt:</p>
<ol>
<li>Thêm người dùng: <code>id</code> 20, email <code>qa.auto@sandemo.test</code>, tên <code>QA Auto</code>, ngày tạo <code>2026-10-29</code>, đang hoạt động (<code>is_active</code> là 1).</li>
<li>Thêm lệnh <code>DH-9001</code> của người dùng đó: mua (<code>buy</code>) 100 cổ phiếu <code>7203</code>, giá 2850, trạng thái <code>Chờ khớp</code>, thời gian <code>2026-10-29 09:00</code>.</li>
<li>Dọn dữ liệu rác: xóa các lệnh có khối lượng bằng 0.</li>
</ol>
<p class="note">Bộ chấm so toàn bộ bảng <code>users</code> và <code>orders</code> sau khi chạy. Có thể thêm câu <code>SELECT</code> ở cuối để tự xem kết quả.</p>`,
  hints: [
    'Thêm dòng: <code>INSERT INTO users (id, email, full_name, created_at, is_active) VALUES (20, \'qa.auto@sandemo.test\', \'QA Auto\', \'2026-10-29\', 1);</code>',
    'Lệnh mới tương tự với bảng <code>orders</code>, liệt kê đủ 8 cột theo thứ tự ở tab Dữ liệu. Chuỗi trong nháy đơn, số thì không.',
    'Xóa có điều kiện: <code>DELETE FROM orders WHERE qty = 0;</code> Đừng quên <code>WHERE</code>: thiếu nó là xóa sạch cả bảng.'],
  starter: String.raw`-- 1. Thêm người dùng id 20
-- 2. Thêm lệnh DH-9001 của người dùng 20
-- 3. Xóa các lệnh có khối lượng bằng 0

`,
  tests: String.raw`
check('DELETE có điều kiện WHERE', () => expect(/delete\s+from\s+\w+\s*(;|$)/im.test(__sql), 'DELETE không có WHERE sẽ xóa sạch cả bảng').toBe(false));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Ba câu lệnh thay đổi dữ liệu</h3>
${TRACE(['Câu lệnh', 'Việc', 'Ví dụ'], [['<code>INSERT INTO</code>', 'thêm dòng', "<code>INSERT INTO stocks (code, name, price, change) VALUES ('9433', 'KDDI', 4500, 20);</code>"], ['<code>UPDATE ... SET</code>', 'sửa giá trị', "<code>UPDATE orders SET status = 'Đã hủy' WHERE id = 'DH-1002';</code>"], ['<code>DELETE FROM</code>', 'xóa dòng', "<code>DELETE FROM orders WHERE user_id = 99;</code>"]])}
${ANAT('UPDATE orders ', ["SET status = 'Đã hủy'", 'Cột cần sửa và giá trị mới. Sửa nhiều cột thì cách nhau bằng dấu phẩy.'], ' ', ["WHERE id = 'DH-1002'", 'Chỉ sửa những dòng này. Thiếu WHERE là sửa MỌI dòng trong bảng.'], ';')}
{{ex0}}
<h3>Quy tắc an toàn</h3>
<ul>
<li><strong>Chỉ chạy trên database test</strong>, không bao giờ trên production.</li>
<li><strong>SELECT trước, sửa sau</strong>: chạy <code>SELECT * FROM orders WHERE ...</code> với đúng điều kiện, xem đúng những dòng muốn sửa rồi mới đổi thành <code>UPDATE</code> hoặc <code>DELETE</code>.</li>
<li><strong>Dùng transaction</strong> khi chưa chắc: <code>BEGIN;</code> rồi chạy các câu lệnh, kiểm tra kết quả, đúng thì <code>COMMIT;</code>, sai thì <code>ROLLBACK;</code> để trả lại như cũ.</li>
</ul>
<p class="note">Góc QA: dữ liệu test nên được tạo bằng script (như bài này) thay vì bấm tay, để chạy lại được trước mỗi lần test. Trong project Playwright, các câu lệnh này thường nằm trong <code>beforeEach</code> hoặc một fixture.</p>`,
examples:[{ lang:'sql', code:String.raw`-- Thử ROLLBACK: hủy mọi lệnh rồi trả lại như cũ
BEGIN;
UPDATE orders SET status = 'Đã hủy';
SELECT status, COUNT(*) FROM orders GROUP BY status;
ROLLBACK;
SELECT status, COUNT(*) FROM orders GROUP BY status;` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<p>Câu SELECT cuối không bắt buộc, giúp tự kiểm tra kết quả ngay sau khi chạy.</p>`,
examples:[{ lang:'sql', code:String.raw`INSERT INTO users (id, email, full_name, created_at, is_active)
VALUES (20, 'qa.auto@sandemo.test', 'QA Auto', '2026-10-29', 1);

INSERT INTO orders (id, user_id, code, side, qty, price, status, created_at)
VALUES ('DH-9001', 20, '7203', 'buy', 100, 2850, 'Chờ khớp', '2026-10-29 09:00');

DELETE FROM orders WHERE qty = 0;

SELECT * FROM orders WHERE user_id = 20;` }]},
});
