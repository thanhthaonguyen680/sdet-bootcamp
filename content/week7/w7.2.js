defineExercise({
  id: 'w7.2',
  title: 'WHERE: lọc dòng theo điều kiện',
  sql: { data: () => W7_DATA, alt: () => W7_DATA_B, answer: "SELECT id, code, qty FROM orders WHERE status = 'Chờ khớp';" },
  desc: `<p>Bảng <code>orders</code> lưu mọi lệnh đã đặt. Viết câu SQL lấy các cột <code>id</code>, <code>code</code>, <code>qty</code> của các lệnh đang <strong>Chờ khớp</strong>.</p>`,
  hints: [
    'Lọc dòng bằng <code>WHERE</code>, đặt sau <code>FROM</code>: <code>SELECT ... FROM orders WHERE điều_kiện;</code>',
    'Chuỗi trong SQL đặt trong <strong>nháy đơn</strong> và phải giống hệt dữ liệu, kể cả dấu tiếng Việt: <code>\'Chờ khớp\'</code>.',
    '<code>SELECT id, code, qty FROM orders WHERE status = \'Chờ khớp\';</code>'],
  starter: String.raw`-- Lấy id, code, qty của các lệnh đang Chờ khớp.
SELECT id, code, qty
FROM orders
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>WHERE giữ lại những dòng thỏa điều kiện</h3>
${ANAT('SELECT id, code FROM orders ', ['WHERE', 'Chỉ giữ các dòng mà điều kiện phía sau là đúng.'], ' ', ['status', 'Cột cần so sánh.'], ' ', ['=', 'Toán tử so sánh.'], ' ', ["'Đã khớp'", 'Giá trị. Chuỗi đặt trong nháy đơn, số thì không cần nháy.'], ';')}
${TRACE(['Toán tử', 'Nghĩa', 'Ví dụ'], [['<code>=</code>', 'bằng', "<code>status = 'Đã hủy'</code>"], ['<code>&lt;&gt;</code> hoặc <code>!=</code>', 'khác', "<code>side &lt;&gt; 'buy'</code>"], ['<code>&gt;</code>, <code>&gt;=</code>', 'lớn hơn, lớn hơn hoặc bằng', '<code>qty &gt;= 500</code>'], ['<code>&lt;</code>, <code>&lt;=</code>', 'nhỏ hơn, nhỏ hơn hoặc bằng', '<code>price &lt; 3000</code>']])}
{{ex0}}
<h3>Lỗi hay gặp</h3>
<ul>
<li><strong>Dùng nháy kép cho chuỗi</strong>: <code>status = "Chờ khớp"</code>. Trong SQL chuẩn, nháy kép dành cho tên cột. SQLite (dùng trong bài) tạm hiểu đó là chuỗi, nhưng MySQL, PostgreSQL sẽ báo lỗi không có cột tên "Chờ khớp". Luôn dùng nháy đơn cho chuỗi.</li>
<li><strong>Sai một chữ</strong>: <code>'Cho khop'</code>, <code>'chờ khớp'</code> đều khác <code>'Chờ khớp'</code>. So sánh chuỗi phải giống hệt.</li>
<li><strong>Đặt WHERE sai chỗ</strong>: thứ tự luôn là <code>SELECT ... FROM ... WHERE ...</code>.</li>
</ul>
<p class="note">Góc QA: khi giao diện hiện "3 lệnh chờ khớp", câu SQL có cùng điều kiện lọc là cách đối chiếu nhanh nhất: hai con số phải bằng nhau.</p>`,
examples:[{ lang:'sql', code:String.raw`-- Các lệnh có khối lượng từ 500 trở lên
SELECT id, code, qty FROM orders WHERE qty >= 500;` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}`,
examples:[{ lang:'sql', code:String.raw`SELECT id, code, qty
FROM orders
WHERE status = 'Chờ khớp';` }]},
});
