/* Dữ liệu dùng chung cho các bài SQL tuần 7: database của Sàn Demo (bảng users, stocks, orders).
   Có cố ý vài bản ghi lỗi để luyện kiểm tra dữ liệu: email trùng (khác hoa thường), tên NULL, khối lượng 150 và 0,
   giá NULL, lệnh của người dùng không tồn tại (user_id 99) và lệnh không có user_id. */

const W7_COLS = {
  users: [['id', 'INTEGER'], ['email', 'TEXT'], ['full_name', 'TEXT'], ['created_at', 'TEXT'], ['is_active', 'INTEGER']],
  stocks: [['code', 'TEXT'], ['name', 'TEXT'], ['price', 'INTEGER'], ['change', 'INTEGER']],
  orders: [['id', 'TEXT'], ['user_id', 'INTEGER'], ['code', 'TEXT'], ['side', 'TEXT'], ['qty', 'INTEGER'], ['price', 'INTEGER'], ['status', 'TEXT'], ['created_at', 'TEXT']],
};
const w7Tables = (users, stocks, orders) => ({
  users: { columns: W7_COLS.users, rows: users },
  stocks: { columns: W7_COLS.stocks, rows: stocks },
  orders: { columns: W7_COLS.orders, rows: orders },
});

const W7_DATA = w7Tables([
  [1, 'thao@sandemo.test', 'Nguyễn Thảo', '2026-01-05', 1],
  [2, 'minh@sandemo.test', 'Trần Minh', '2026-02-10', 1],
  [3, 'lan@sandemo.test', 'Lê Lan', '2026-02-18', 1],
  [4, 'huy@sandemo.test', 'Phạm Huy', '2026-03-02', 0],
  [5, 'an@sandemo.test', 'Võ An', '2026-03-15', 1],
  [6, 'MINH@sandemo.test', 'Trần Minh', '2026-04-01', 1],
  [7, 'binh@sandemo.test', null, '2026-04-20', 1],
  [8, 'tuan@sandemo.test', 'Đỗ Tuấn', '2026-05-12', 1],
], STOCKS.map(s => [s.code, s.name, s.price, s.change]), [
  ['DH-1001', 1, '7203', 'buy', 100, 2850, 'Đã khớp', '2026-10-01 09:02'],
  ['DH-1002', 1, '6758', 'sell', 200, 13250, 'Chờ khớp', '2026-10-01 09:15'],
  ['DH-1003', 2, '9984', 'buy', 300, 8850, 'Chờ khớp', '2026-10-01 10:41'],
  ['DH-1004', 3, '7203', 'buy', 500, 2840, 'Đã khớp', '2026-10-02 09:05'],
  ['DH-1005', 2, '8306', 'buy', 1000, 1715, 'Đã khớp', '2026-10-02 09:30'],
  ['DH-1006', 5, '6861', 'buy', 100, 62000, 'Đã hủy', '2026-10-02 13:20'],
  ['DH-1007', 3, '7974', 'sell', 200, 8500, 'Chờ khớp', '2026-10-03 09:01'],
  ['DH-1008', 1, '9984', 'sell', 100, 8950, 'Đã khớp', '2026-10-03 10:12'],
  ['DH-1009', 4, '6758', 'buy', 100, 13100, 'Đã hủy', '2026-10-03 14:45'],
  ['DH-1010', 5, '7203', 'buy', 150, 2860, 'Chờ khớp', '2026-10-04 09:20'],
  ['DH-1011', 2, '6861', 'sell', 100, 62500, 'Đã khớp', '2026-10-04 11:00'],
  ['DH-1012', 99, '8306', 'buy', 500, 1720, 'Chờ khớp', '2026-10-05 09:10'],
  ['DH-1013', 1, '7974', 'buy', 300, 8400, 'Đã khớp', '2026-10-05 10:30'],
  ['DH-1014', 3, '9984', 'buy', 200, 8900, 'Đã hủy', '2026-10-06 09:45'],
  ['DH-1015', 5, '6758', 'sell', 300, 13300, 'Đã khớp', '2026-10-06 13:05'],
  ['DH-1016', 2, '7203', 'sell', 200, 2870, 'Chờ khớp', '2026-10-07 09:00'],
  ['DH-1017', 6, '8306', 'buy', 0, 1725, 'Chờ khớp', '2026-10-07 10:20'],
  ['DH-1018', 1, '6861', 'buy', 100, null, 'Chờ khớp', '2026-10-08 09:15'],
  ['DH-1019', 7, '7974', 'buy', 200, 8450, 'Đã khớp', '2026-10-08 11:40'],
  ['DH-1020', 3, '7203', 'buy', 100, 2850, 'Chờ khớp', '2026-10-09 09:30'],
  ['DH-1021', null, '7203', 'buy', 100, 2850, 'Đã hủy', '2026-10-09 15:00'],
]);

// Bộ dữ liệu thứ hai: cùng cấu trúc, khác giá trị (trạng thái, khối lượng, thời gian...). Bộ chấm chạy câu SQL trên cả hai bộ,
// nên câu SQL "chép cứng" kết quả của bộ thứ nhất sẽ không qua được.
const W7_DATA_B = (() => {
  const st = ['Đã khớp', 'Chờ khớp', 'Đã hủy'];
  const users = W7_DATA.users.rows.map(u => u[0] === 2 ? [2, u[1], u[2], u[3], 0] : u.slice());
  users.push([9, 'kim@sandemo.test', 'Hồ Kim', '2026-06-01', 1]);
  const orders = W7_DATA.orders.rows.map((o, i) => {
    const r = o.slice();
    if (i % 3 === 1) r[6] = st[(st.indexOf(r[6]) + 1) % 3];
    if (r[4] > 0 && r[4] % 100 === 0) r[4] += 100 * (i % 2);
    if (i % 4 === 0) r[7] = r[7].replace(/-(\d\d) /, (m, d) => '-' + String(+d + 2).padStart(2, '0') + ' ');
    if (r[1] === 99) r[1] = 98;
    return r;
  });
  orders.push(['DH-1022', 5, '6861', 'buy', 250, 62100, 'Chờ khớp', '2026-10-10 09:00']);
  orders.push(['DH-1023', 5, '9984', 'sell', 400, 8800, 'Đã khớp', '2026-10-10 10:15']);   // người dùng 9 chưa có lệnh nào
  return w7Tables(users, STOCKS.map(s => [s.code, s.name, s.price + 50, s.change + 50]), orders);
})();

// Dữ liệu sống của Sàn Demo trong tab Trang web: lệnh người học vừa đặt cũng có trong bảng orders.
// dropNew: bỏ các lệnh đặt thêm, như thể ứng dụng có bug "không lưu lệnh" (dùng để chấm).
function W7_APP_DATA({ dropNew = false } = {}){
  const s = App.state || freshAppState(), base = new Set(freshAppState().orders.map(o => o.id));
  return w7Tables(
    [[1, 'thao@sandemo.test', 'Thao', '2026-01-05', 1], ...s.users.map((u, i) => [i + 2, u.email, u.name, '2026-10-29', 1])],
    STOCKS.map(x => [x.code, x.name, x.price, x.change]),
    s.orders.filter(o => !dropNew || base.has(o.id)).map(o => [o.id, 1, o.code, o.side, o.qty, o.price, o.status, '2026-10-29 ' + o.time]));
}
