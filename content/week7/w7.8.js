defineExercise({
  id: 'w7.8',
  title: 'LEFT JOIN: tìm dữ liệu "mồ côi"',
  sql: { data: () => W7_DATA, alt: () => W7_DATA_B, ordered: true,
    answer: 'SELECT o.id, o.user_id FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE u.id IS NULL ORDER BY o.id;' },
  desc: `<p>Mỗi lệnh phải thuộc về một người dùng có thật. Do bug cũ, một vài lệnh đang <strong>không gắn với người dùng hợp lệ</strong>: <code>user_id</code> trỏ tới người dùng không tồn tại, hoặc để trống.</p>
<p>Viết câu SQL tìm các lệnh đó: 2 cột <code>id</code>, <code>user_id</code>, sắp theo <code>id</code>.</p>`,
  hints: [
    '<code>JOIN</code> thường bỏ mất các lệnh không ghép được. <code>LEFT JOIN</code> giữ lại <strong>mọi</strong> lệnh; lệnh không ghép được thì các cột của <code>users</code> là NULL.',
    'Lọc những dòng không ghép được: <code>WHERE u.id IS NULL</code>. Kiểm tra NULL phải dùng <code>IS NULL</code>, không dùng <code>= NULL</code>.',
    '<code>SELECT o.id, o.user_id FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE u.id IS NULL ORDER BY o.id;</code>'],
  starter: String.raw`-- Lệnh không gắn với người dùng hợp lệ: id, user_id; sắp theo id.
SELECT o.id, o.user_id
FROM orders o
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>INNER JOIN và LEFT JOIN</h3>
${TRACE(['', 'JOIN (INNER)', 'LEFT JOIN'], [['Dòng của bảng bên trái (orders)', 'chỉ giữ dòng ghép được', '<strong>giữ hết</strong>'], ['Dòng không ghép được', 'bị bỏ', 'giữ lại, các cột của bảng bên phải là NULL'], ['Dùng khi', 'cần dữ liệu đầy đủ của cả hai bảng', 'cần tìm cái gì <strong>thiếu</strong>']])}
{{ex0}}
<h3>NULL nghĩa là "không có giá trị"</h3>
<p>NULL không bằng bất cứ thứ gì, kể cả NULL. Vì vậy <code>WHERE u.id = NULL</code> luôn ra 0 dòng. Kiểm tra NULL phải dùng <code>IS NULL</code> hoặc <code>IS NOT NULL</code>.</p>
{{ex1}}
<p class="note">Góc QA: "dữ liệu mồ côi" (orphan) là lỗi kinh điển khi xóa dữ liệu không đúng cách: xóa người dùng nhưng còn để lại lệnh của họ. Giao diện thường không hiện các lệnh này, nên chỉ SQL mới tìm ra. Mẫu <code>LEFT JOIN ... WHERE bảng_phải.khóa IS NULL</code> dùng được cho mọi cặp bảng.</p>`,
examples:[{ lang:'sql', code:String.raw`-- So sánh: JOIN bỏ mất lệnh không ghép được, LEFT JOIN thì giữ lại
SELECT COUNT(*) AS inner_join FROM orders o JOIN users u ON u.id = o.user_id;
SELECT COUNT(*) AS left_join FROM orders o LEFT JOIN users u ON u.id = o.user_id;` },
  { lang:'sql', code:String.raw`-- Sai: = NULL luôn ra 0 dòng
SELECT id FROM orders WHERE price = NULL;
-- Đúng
SELECT id FROM orders WHERE price IS NULL;` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<p>Kết quả gồm cả lệnh có <code>user_id</code> trỏ tới người dùng không tồn tại, và lệnh có <code>user_id</code> để trống: cả hai đều không ghép được với <code>users</code>.</p>`,
examples:[{ lang:'sql', code:String.raw`SELECT o.id, o.user_id
FROM orders o
LEFT JOIN users u ON u.id = o.user_id
WHERE u.id IS NULL
ORDER BY o.id;` }]},
});
