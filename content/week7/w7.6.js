defineExercise({
  id: 'w7.6',
  title: 'GROUP BY, HAVING: tổng hợp theo nhóm',
  sql: { data: () => W7_DATA, alt: () => W7_DATA_B, ordered: true,
    answer: "SELECT code, COUNT(*) FROM orders WHERE status = 'Chờ khớp' GROUP BY code HAVING COUNT(*) >= 2 ORDER BY COUNT(*) DESC, code;" },
  desc: `<p>Bộ phận vận hành muốn biết mã cổ phiếu nào đang có <strong>nhiều lệnh chờ khớp</strong>. Viết câu SQL trả về hai cột <code>code</code> và số lệnh <strong>Chờ khớp</strong> của mã đó:</p>
<ul>
<li>chỉ những mã có <strong>từ 2 lệnh chờ khớp trở lên</strong>,</li>
<li>sắp theo số lệnh giảm dần; cùng số lệnh thì theo <code>code</code> tăng dần.</li>
</ul>`,
  hints: [
    '<code>GROUP BY code</code> gom các dòng cùng mã thành một nhóm; <code>COUNT(*)</code> đếm số dòng trong mỗi nhóm.',
    'Lọc dòng trước khi gom thì dùng <code>WHERE</code> (chỉ lấy lệnh Chờ khớp). Lọc nhóm sau khi gom thì dùng <code>HAVING</code>: <code>HAVING COUNT(*) &gt;= 2</code>.',
    'Thứ tự mệnh đề: <code>SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY COUNT(*) DESC, code</code>.'],
  starter: String.raw`-- Mã có từ 2 lệnh Chờ khớp trở lên: code, số lệnh.
-- Sắp theo số lệnh giảm dần, cùng số lệnh thì theo code.
SELECT code, COUNT(*)
FROM orders
`,
  tests: String.raw`
check('Dùng GROUP BY và HAVING', () => { expect(/group\s+by/i.test(__sql), 'Cần GROUP BY để gom theo mã').toBe(true); expect(/having/i.test(__sql), 'Điều kiện trên số lệnh của nhóm đặt trong HAVING').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>GROUP BY gom dòng thành nhóm</h3>
<p>Bài trước, <code>COUNT(*)</code> gom <strong>cả bảng</strong> thành một dòng. <code>GROUP BY</code> gom theo từng giá trị của một cột, mỗi nhóm cho một dòng kết quả.</p>
${ANAT('SELECT ', ['status', 'Cột dùng để gom. Mỗi trạng thái thành một dòng.'], ', ', ['COUNT(*) AS so_lenh', 'Đếm trong từng nhóm.'], ' FROM orders ', ['GROUP BY status', 'Gom các dòng cùng status.'], ';')}
{{ex0}}
<h3>WHERE khác HAVING</h3>
${TRACE(['', 'WHERE', 'HAVING'], [['Lọc cái gì', 'từng dòng, <strong>trước</strong> khi gom', 'từng nhóm, <strong>sau</strong> khi gom'], ['Dùng được hàm tổng hợp?', 'không', 'có: <code>HAVING COUNT(*) &gt;= 2</code>'], ['Ví dụ', "<code>WHERE status = 'Chờ khớp'</code>", '<code>HAVING SUM(qty) &gt; 500</code>']])}
<p>Viết <code>WHERE COUNT(*) &gt;= 2</code> sẽ bị báo lỗi: lúc WHERE chạy, nhóm còn chưa được gom.</p>
<p class="note">Góc QA: GROUP BY là công cụ chính khi đối chiếu số liệu với báo cáo hoặc dashboard: "dashboard ghi 3 lệnh chờ khớp cho 7203" thì một câu GROUP BY sẽ cho biết đúng hay sai.</p>`,
examples:[{ lang:'sql', code:String.raw`SELECT status, COUNT(*) AS so_lenh, SUM(qty) AS tong_kl
FROM orders
GROUP BY status
ORDER BY so_lenh DESC;` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<ul><li><code>WHERE</code> bỏ các lệnh không phải Chờ khớp trước khi gom.</li><li><code>HAVING</code> bỏ những nhóm có ít hơn 2 lệnh.</li><li><code>ORDER BY</code> dùng được cả hàm tổng hợp hoặc tên đặt bằng <code>AS</code>.</li></ul>`,
examples:[{ lang:'sql', code:String.raw`SELECT code, COUNT(*) AS so_lenh
FROM orders
WHERE status = 'Chờ khớp'
GROUP BY code
HAVING COUNT(*) >= 2
ORDER BY so_lenh DESC, code;` }]},
});
