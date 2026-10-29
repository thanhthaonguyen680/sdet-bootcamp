defineExercise({
  id: 'w7.3',
  title: 'AND, OR, IN, BETWEEN, LIKE: nhiều điều kiện',
  sql: { data: () => W7_DATA, alt: () => W7_DATA_B, answer: "SELECT id, code, qty FROM orders WHERE side = 'buy' AND code IN ('7203', '9984') AND qty BETWEEN 100 AND 500;" },
  desc: `<p>Lấy <code>id</code>, <code>code</code>, <code>qty</code> của các lệnh thỏa <strong>cả ba</strong> điều kiện:</p>
<ul>
<li>là lệnh mua (<code>side</code> là <code>'buy'</code>),</li>
<li>mã cổ phiếu là <code>7203</code> hoặc <code>9984</code>,</li>
<li>khối lượng từ 100 đến 500 (tính cả 100 và 500).</li>
</ul>`,
  hints: [
    'Nối các điều kiện bằng <code>AND</code>: dòng phải thỏa tất cả.',
    '"Mã là 7203 hoặc 9984": <code>code IN (\'7203\', \'9984\')</code>. Nếu dùng <code>OR</code> thì nhớ đặt trong ngoặc: <code>(code = \'7203\' OR code = \'9984\')</code>.',
    '"Từ 100 đến 500, tính cả hai đầu": <code>qty BETWEEN 100 AND 500</code>.'],
  starter: String.raw`-- Lệnh mua, mã 7203 hoặc 9984, khối lượng từ 100 đến 500.
SELECT id, code, qty
FROM orders
WHERE
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Kết hợp điều kiện</h3>
${TRACE(['Cách viết', 'Nghĩa'], [['<code>A AND B</code>', 'cả A và B đều đúng'], ['<code>A OR B</code>', 'ít nhất một trong hai đúng'], ['<code>NOT A</code>', 'A sai'], ["<code>code IN ('7203', '9984')</code>", 'bằng một trong các giá trị (gọn hơn nhiều <code>OR</code>)'], ['<code>qty BETWEEN 100 AND 500</code>', 'từ 100 đến 500, <strong>tính cả hai đầu</strong>'], ["<code>email LIKE '%@sandemo.test'</code>", 'khớp mẫu: <code>%</code> là chuỗi bất kỳ, <code>_</code> là đúng một ký tự']])}
<h3>Bẫy AND và OR</h3>
<p><code>AND</code> được tính trước <code>OR</code>, giống nhân trước cộng. Câu sau <strong>không</strong> có nghĩa "lệnh mua của 7203 hoặc 9984":</p>
${ANAT("WHERE side = 'buy' AND code = '7203' ", ['OR code = \'9984\'', 'Được hiểu là: (mua VÀ 7203) HOẶC (9984, kể cả lệnh bán). Lệnh bán 9984 lọt vào kết quả.'])}
<p>Muốn đúng ý thì đặt ngoặc: <code>side = 'buy' AND (code = '7203' OR code = '9984')</code>, hoặc dùng <code>IN</code>. Chạy ví dụ để so sánh hai kết quả.</p>
{{ex0}}
<p class="note">Góc QA: <code>BETWEEN</code> tính cả hai đầu, đúng tinh thần test giá trị biên. Khi kiểm tra quy tắc "từ 100 đến 500", luôn nhìn kỹ dữ liệu ở đúng 100 và 500.</p>`,
examples:[{ lang:'sql', code:String.raw`-- Sai: lệnh BÁN 9984 cũng lọt vào
SELECT id, side, code FROM orders WHERE side = 'buy' AND code = '7203' OR code = '9984';

-- Đúng
SELECT id, side, code FROM orders WHERE side = 'buy' AND code IN ('7203', '9984');

-- LIKE: người dùng có email kết thúc bằng @sandemo.test
SELECT email FROM users WHERE email LIKE '%@sandemo.test';` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<p>Cách khác cho điều kiện thứ hai: <code>(code = '7203' OR code = '9984')</code>, nhớ có ngoặc.</p>`,
examples:[{ lang:'sql', code:String.raw`SELECT id, code, qty
FROM orders
WHERE side = 'buy'
  AND code IN ('7203', '9984')
  AND qty BETWEEN 100 AND 500;` }]},
});
