defineExercise({
  id: 'w7.11',
  title: 'Subquery: câu SQL lồng trong câu SQL',
  sql: { data: () => W7_DATA, alt: () => W7_DATA_B, ordered: true,
    answer: 'SELECT id, email FROM users WHERE id NOT IN (SELECT user_id FROM orders WHERE user_id IS NOT NULL) ORDER BY id;' },
  desc: `<p>Bộ phận chăm sóc khách hàng cần danh sách <strong>người dùng chưa từng đặt lệnh nào</strong>. Viết câu SQL lấy <code>id</code>, <code>email</code>, sắp theo <code>id</code>, dùng <strong>subquery</strong>.</p>
<p class="note">Thử viết <code>WHERE id NOT IN (SELECT user_id FROM orders)</code> trước, chạy và xem kết quả. Có điều bất ngờ: bài giảng giải thích vì sao.</p>`,
  hints: [
    'Subquery lấy danh sách người đã đặt lệnh: <code>(SELECT user_id FROM orders)</code>. Người chưa đặt lệnh là người có id <strong>không nằm trong</strong> danh sách đó.',
    'Bảng orders có một lệnh <code>user_id</code> là NULL. Khi danh sách của <code>NOT IN</code> chứa NULL, kết quả luôn rỗng. Loại NULL khỏi subquery: <code>WHERE user_id IS NOT NULL</code>.',
    '<code>SELECT id, email FROM users WHERE id NOT IN (SELECT user_id FROM orders WHERE user_id IS NOT NULL) ORDER BY id;</code>'],
  starter: String.raw`-- Người dùng chưa từng đặt lệnh: id, email; sắp theo id. Dùng subquery.
SELECT id, email
FROM users
`,
  tests: String.raw`
check('Dùng subquery', () => expect(/\(\s*select/i.test(__sql), 'Hãy dùng một câu SELECT lồng trong ngoặc, ví dụ id NOT IN (SELECT ...)').toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Subquery</h3>
<p>Subquery là một câu <code>SELECT</code> đặt trong ngoặc, dùng kết quả của nó cho câu bên ngoài.</p>
${ANAT('SELECT code, name FROM stocks\nWHERE code ', ['IN', 'Giá trị nằm trong danh sách...'], ' ', ["(SELECT code FROM orders WHERE status = 'Chờ khớp')", '...mà danh sách này do subquery trả về: các mã đang có lệnh chờ khớp.'], ';')}
{{ex0}}
<h3>Bẫy NOT IN và NULL</h3>
<p><code>x NOT IN (1, 2, NULL)</code> nghĩa là "x khác 1 và khác 2 và khác NULL". So sánh với NULL không bao giờ đúng, nên cả biểu thức <strong>không bao giờ đúng</strong>, và câu SQL trả về 0 dòng mà không báo lỗi gì. Bảng <code>orders</code> có một lệnh với <code>user_id</code> NULL, nên câu NOT IN đơn giản cho kết quả rỗng.</p>
${TRACE(['Cách viết', 'Có bị bẫy NULL?'], [['<code>id NOT IN (SELECT user_id FROM orders)</code>', 'có: rỗng khi subquery có NULL'], ['<code>id NOT IN (SELECT user_id FROM orders WHERE user_id IS NOT NULL)</code>', 'không'], ['<code>NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = users.id)</code>', 'không'], ['<code>LEFT JOIN ... WHERE o.id IS NULL</code> (bài 8)', 'không']])}
<p class="note">Góc QA: câu SQL trả về 0 dòng chưa chắc là "không có lỗi". Khi một câu kiểm tra dữ liệu luôn rỗng, hãy thử cố ý thêm một dòng sai xem câu đó có bắt được không, giống cách thử cài bug cho test tự động.</p>`,
examples:[{ lang:'sql', code:String.raw`SELECT code, name FROM stocks
WHERE code IN (SELECT code FROM orders WHERE status = 'Chờ khớp');` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<p>Cách khác không bị bẫy NULL: <code>WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = users.id)</code>.</p>`,
examples:[{ lang:'sql', code:String.raw`SELECT id, email
FROM users
WHERE id NOT IN (SELECT user_id FROM orders WHERE user_id IS NOT NULL)
ORDER BY id;` }]},
});
