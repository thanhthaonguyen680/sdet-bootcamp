/* Hàm kiểm tra dùng chung cho các bài tuần 6. Chạy trước các bài của tuần (xem "shared" trong content/curriculum.js). */

const AWAIT_LINT = String.raw`
const __noAwait = () => __code.split('\n').filter(l => (/\.(click|fill|check|uncheck|goto|selectOption|press|setChecked)\(/.test(l) || /expect\(.*\)\.(not\.)?to(HaveText|ContainText|BeVisible|BeHidden|HaveValue|HaveURL|HaveCount|BeChecked|BeEnabled|BeDisabled)\(/.test(l)) && !/\bawait\b/.test(l)).map(l => l.trim());
`;

/* Đọc câu giao việc cho AI ở các bài Playwright MCP (p là câu đã bỏ dấu, chữ thường; xem mcpNorm trong js/mcp/pane.js). */
// Cổ phiếu được nhắc tới: theo mã hoặc chữ đầu của tên công ty.
const W6_STOCK = (p, fallback) => STOCKS.find(s => p.includes(s.code) || new RegExp('\\b' + mcpNorm(s.name).split(' ')[0] + '\\b').test(p)) || STOCKS.find(s => s.code === fallback);
// Khối lượng: số đầu tiên không phải mã cổ phiếu (bỏ qua email, mật khẩu chứa @).
const W6_QTY = p => {
  const n = (p.replace(/\S*@\S*/g, ' ').match(/\d+(?:[.,]\d{3})*/g) || []).map(x => +x.replace(/[.,]/g, '')).find(x => !STOCKS.some(s => +s.code === x));
  return n === undefined ? { qty: 100, note: '' } : n > 0 && n % 100 === 0 ? { qty: n, note: '' } : { qty: 100, note: ' Sàn Demo chỉ nhận khối lượng là bội số của 100, nên mình dùng 100.' };
};
