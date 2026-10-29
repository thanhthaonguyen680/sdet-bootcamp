defineExercise({
  id: 'w7.10',
  app: true,
  route: '/order',
  title: 'Tổng hợp: đặt lệnh trên giao diện, kiểm tra bằng SQL',
  // Dữ liệu là database "sống" của Sàn Demo: lệnh người học vừa đặt ở tab Trang web cũng có trong bảng orders.
  // alt: cùng dữ liệu nhưng bỏ các lệnh vừa đặt (như ứng dụng có bug "không lưu lệnh"): câu SQL đúng phải trả về 0 dòng.
  sql: { data: () => W7_APP_DATA(), alt: () => W7_APP_DATA({ dropNew: true }),
    answer: "SELECT id, code, side, qty, status FROM orders WHERE code = '6861' AND side = 'buy' AND qty = 300;" },
  desc: `<p>Giao diện báo "Đặt lệnh thành công" chưa chắc lệnh đã được lưu: Sàn Demo từng có bug hiện thông báo thành công nhưng không ghi vào database. QA xác nhận bằng cách hỏi thẳng database.</p>
<ol>
<li>Mở tab <strong>Trang web</strong> (đang ở trang Đặt lệnh). Đặt lệnh <strong>mua 300 cổ phiếu 6861 - Keyence</strong>: chọn mã, nhập khối lượng, tích đồng ý, bấm Đặt lệnh.</li>
<li>Mở tab <strong>Dữ liệu</strong>: bảng <code>orders</code> đã có thêm lệnh vừa đặt.</li>
<li>Viết câu SQL tìm đúng lệnh đó: 5 cột <code>id</code>, <code>code</code>, <code>side</code>, <code>qty</code>, <code>status</code>.</li>
</ol>
<p class="note">Dữ liệu trên trang web được làm mới khi chuyển bài hoặc tải lại trang. Nếu đã chuyển bài, hãy đặt lại lệnh trước khi Kiểm tra bài.</p>`,
  hints: [
    'Lọc theo đúng những gì bạn vừa đặt: mã <code>\'6861\'</code>, loại lệnh <code>\'buy\'</code>, khối lượng <code>300</code>.',
    'Không lọc theo <code>id</code>: số hiệu do hệ thống sinh ra, lần đặt sau sẽ khác. Lọc theo dữ liệu bạn nhập thì câu SQL dùng lại được.',
    '<code>SELECT id, code, side, qty, status FROM orders WHERE code = \'6861\' AND side = \'buy\' AND qty = 300;</code>'],
  starter: String.raw`-- 1. Đặt lệnh mua 300 cổ phiếu 6861 ở tab Trang web.
-- 2. Tìm đúng lệnh đó: id, code, side, qty, status.
SELECT id, code, side, qty, status
FROM orders
`,
  tests: String.raw`
check('Đã đặt lệnh mua 300 cổ phiếu 6861 trên Sàn Demo', () => expect(App.state.orders.some(o => o.code === '6861' && o.side === 'buy' && o.qty === 300), 'Chưa thấy lệnh mua 300 cổ phiếu 6861. Hãy đặt lệnh ở tab Trang web trước').toBe(true));
check('Câu SQL tìm thấy lệnh vừa đặt, trạng thái Chờ khớp', () => { expect(!!R && R.rows.length > 0, 'Câu SQL chưa trả về dòng nào').toBe(true); expect(R.rows.every(r => r.includes('Chờ khớp')), 'Lệnh mới đặt phải ở trạng thái Chờ khớp').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Kiểm tra từ giao diện xuống database</h3>
<p>Test giao diện chỉ thấy những gì trang hiện ra. Nhiều bug nằm ở tầng dưới: lưu thiếu, lưu sai cột, lưu nhầm người dùng. QA kiểm tra trọn vẹn bằng cách đi qua cả hai tầng:</p>
${TRACE(['Bước', 'Ở đâu', 'Kiểm tra gì'], [['1. Thao tác', 'Giao diện (tay hoặc Playwright)', 'Đặt lệnh, thấy thông báo thành công'], ['2. Truy vấn', 'Database (SQL)', 'Có đúng một lệnh mới, đúng mã, đúng khối lượng, đúng loại lệnh'], ['3. Đối chiếu', 'So hai bên', 'Giao diện "Lệnh của tôi" khớp với database']])}
<h3>Viết câu SQL dùng lại được</h3>
${ANAT("SELECT id, code, side, qty, status FROM orders\nWHERE ", ["code = '6861' AND side = 'buy' AND qty = 300", 'Lọc theo dữ liệu bạn nhập trên giao diện, không theo id: id do hệ thống sinh ra, mỗi lần chạy một khác.'], ';')}
<p>Trên dự án thật, câu SQL kiểm tra thường còn lọc theo người đặt và thời gian tạo (ví dụ <code>created_at</code> trong vài phút gần nhất) để không nhầm với lệnh cũ.</p>
<h3>Trong test Playwright</h3>
<p>Ở project thật, bước 2 được viết ngay trong test: sau khi bấm Đặt lệnh, test kết nối database test (qua thư viện như <code>pg</code> hoặc <code>mysql2</code>) và chạy đúng câu SQL này. Cách này bắt được bug "báo thành công nhưng không lưu", điều mà kiểm tra giao diện đơn thuần bỏ sót.</p>
<p class="note">Góc QA: bộ chấm của bài chạy lại câu SQL của bạn trên database giống hệt nhưng <strong>không có</strong> lệnh vừa đặt (như ứng dụng có bug không lưu). Câu SQL đúng phải trả về 0 dòng. Câu <code>SELECT * FROM orders</code> thì lúc nào cũng có dòng, nên không phát hiện được bug.</p>`,
examples:[]},

  // ===== Lời giải =====
  // setup: dùng cho tools/verify.mjs, thay cho việc người học tự đặt lệnh trên giao diện.
  solution: { setup: () => { const s = App.state; s.orders.push({ id: 'DH-' + s.nextId++, code: '6861', side: 'buy', qty: 300, price: 62300, status: 'Chờ khớp', time: '11:05' }); },
    html:`<h3>Lời giải</h3>{{ex0}}<p>Kết quả có đúng một dòng, trạng thái <strong>Chờ khớp</strong>. Nếu ứng dụng có bug không lưu lệnh, câu này trả về 0 dòng, và đó là bằng chứng của bug.</p>`,
examples:[{ lang:'sql', code:String.raw`SELECT id, code, side, qty, status
FROM orders
WHERE code = '6861'
  AND side = 'buy'
  AND qty = 300;` }]},
});
