/* Sàn Demo: dữ liệu cổ phiếu, trạng thái khởi đầu, các hàm dựng HTML dùng chung. */

const STOCKS = [
  { code: '7203', name: 'Toyota Motor', price: 2850, change: 15 },
  { code: '6758', name: 'Sony Group', price: 13200, change: -120 },
  { code: '9984', name: 'SoftBank Group', price: 8900, change: 210 },
  { code: '8306', name: 'Mitsubishi UFJ', price: 1720, change: -8 },
  { code: '6861', name: 'Keyence', price: 62300, change: 500 },
  { code: '7974', name: 'Nintendo', price: 8450, change: 0 },
];
const fmtN = n => Number(n).toLocaleString('en-US');
const rid = () => Math.random().toString(16).slice(2, 7);
function freshAppState(){
  return {
    user: null,
    orders: [
      { id: 'DH-1001', code: '7203', side: 'buy', qty: 100, price: 2850, status: 'Đã khớp', time: '09:02' },
      { id: 'DH-1002', code: '6758', side: 'sell', qty: 200, price: 13250, status: 'Chờ khớp', time: '09:15' },
      { id: 'DH-1003', code: '9984', side: 'buy', qty: 300, price: 8850, status: 'Chờ khớp', time: '10:41' },
    ],
    nextId: 1004,
    users: [],
  };
}
const topbar = (s, active) => '<header class="topbar"><a class="logo" href="/dashboard">Sàn Demo</a><nav aria-label="Menu chính">' +
  [['/dashboard', 'Bảng giá'], ['/order', 'Đặt lệnh'], ['/orders', 'Lệnh của tôi']].map(([h, t]) => '<a href="' + h + '"' + (h === active ? ' aria-current="page"' : '') + '>' + t + '</a>').join('') +
  '</nav><span class="who">' + (s.user ? 'Xin chào, <b>' + s.user + '</b>' : '<a href="/login">Đăng nhập</a>') + '</span></header>';

function orderRow(o){
  const cls = o.status === 'Đã khớp' ? 'done' : o.status === 'Chờ khớp' ? 'wait' : 'cancel';
  return '<tr><td>' + o.id + '</td><td>' + o.code + '</td><td>' + (o.side === 'buy' ? 'Mua' : 'Bán') + '</td><td class="num">' + fmtN(o.qty) +
    '</td><td class="num">' + fmtN(o.price) + '</td><td><span class="badge ' + cls + '">' + o.status + '</span></td><td class="actions">' +
    '<button type="button" class="btn sm ghost" id="detail-' + rid() + '">Chi tiết</button> ' +
    '<button type="button" class="btn sm ghost danger"' + (o.status !== 'Chờ khớp' ? ' disabled' : '') + '>Hủy</button></td></tr>';
}
