defineExercise({
  id: 'w7.4',
  title: 'ORDER BY, LIMIT: sắp xếp và lấy vài dòng đầu',
  sql: { data: () => W7_DATA, alt: () => W7_DATA_B, ordered: true, answer: 'SELECT id, code, created_at FROM orders ORDER BY created_at DESC LIMIT 5;' },
  desc: `<p>Trang "Lệnh của tôi" cần hiện <strong>5 lệnh mới nhất</strong>. Viết câu SQL lấy <code>id</code>, <code>code</code>, <code>created_at</code> của 5 lệnh mới nhất, lệnh mới nhất ở trên cùng.</p>`,
  hints: [
    'Sắp xếp bằng <code>ORDER BY cột</code>. Mặc định là tăng dần (ASC); muốn giảm dần thêm <code>DESC</code>.',
    'Mới nhất là thời gian lớn nhất: <code>ORDER BY created_at DESC</code>. Lấy vài dòng đầu bằng <code>LIMIT 5</code>, đặt cuối cùng.',
    '<code>SELECT id, code, created_at FROM orders ORDER BY created_at DESC LIMIT 5;</code>'],
  starter: String.raw`-- 5 lệnh mới nhất, mới nhất ở trên cùng.
SELECT id, code, created_at
FROM orders
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>ORDER BY sắp xếp kết quả</h3>
<p>Nếu không có <code>ORDER BY</code>, database <strong>không hứa</strong> trả các dòng theo thứ tự nào cả. Muốn có thứ tự thì phải viết ra.</p>
${ANAT('SELECT id, qty FROM orders ', ['ORDER BY qty DESC', 'Sắp theo qty giảm dần. Bỏ DESC (hoặc ghi ASC) là tăng dần.'], ', ', ['id', 'Cột phụ: các dòng cùng qty thì sắp tiếp theo id.'], ' ', ['LIMIT 3', 'Chỉ lấy 3 dòng đầu, sau khi đã sắp xếp.'], ';')}
${TRACE(['Mệnh đề', 'Thứ tự viết'], [['SELECT ... FROM ...', '1'], ['WHERE', '2'], ['ORDER BY', '3'], ['LIMIT', '4 (cuối cùng)']])}
<p><code>LIMIT 5 OFFSET 5</code> bỏ qua 5 dòng đầu rồi lấy 5 dòng: đúng cách phân trang "trang 2, mỗi trang 5 dòng".</p>
{{ex0}}
<p>Cột <code>created_at</code> là chuỗi dạng <code>2026-10-01 09:02</code> (năm-tháng-ngày giờ:phút). Định dạng này sắp xếp theo chữ cũng đúng theo thời gian, nên <code>ORDER BY created_at</code> dùng được.</p>
<p class="note">Góc QA: lỗi "danh sách hiện sai thứ tự" rất hay gặp. Viết câu SQL có <code>ORDER BY</code> giống yêu cầu rồi so từng dòng với giao diện.</p>`,
examples:[{ lang:'sql', code:String.raw`-- 3 lệnh khối lượng lớn nhất; cùng khối lượng thì theo id
SELECT id, qty FROM orders ORDER BY qty DESC, id LIMIT 3;` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<p>Bộ chấm so cả thứ tự dòng: thiếu <code>DESC</code> thì được 5 lệnh <strong>cũ</strong> nhất.</p>`,
examples:[{ lang:'sql', code:String.raw`SELECT id, code, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;` }]},
});
