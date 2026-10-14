/* Hàm kiểm tra dùng chung cho các bài tuần 6. Chạy trước các bài của tuần (xem "shared" trong content/curriculum.js). */

const AWAIT_LINT = String.raw`
const __noAwait = () => __code.split('\n').filter(l => (/\.(click|fill|check|uncheck|goto|selectOption|press|setChecked)\(/.test(l) || /expect\(.*\)\.(not\.)?to(HaveText|ContainText|BeVisible|BeHidden|HaveValue|HaveURL|HaveCount|BeChecked|BeEnabled|BeDisabled)\(/.test(l)) && !/\bawait\b/.test(l)).map(l => l.trim());
`;

/* Đọc câu giao việc cho AI ở các bài Playwright MCP (p là câu đã bỏ dấu, chữ thường; xem mcpNorm trong js/mcp/pane.js). */
// Cổ phiếu được nhắc tới: theo mã hoặc chữ đầu của tên công ty.
const W6_STOCK = (p, fallback) => STOCKS.find(s => p.includes(s.code) || new RegExp('\\b' + mcpNorm(s.name).split(' ')[0] + '\\b').test(p)) || STOCKS.find(s => s.code === fallback);
// Tệp rule người học viết cho AI: nhóm rule nào đã có. Mỗi nhóm cần một dòng rule (gạch đầu dòng) khớp cả hai điều kiện;
// bỏ qua tiêu đề và dòng còn TODO, để tiêu đề như "## Dữ liệu và bí mật" không tự tính là đã có rule.
const W6_RULE_GROUPS = [
  { key: 'wait', name: 'Chờ', need: [/waitfortimeout|cho cung|settimeout|sleep|cho co dinh|cho \d+ ?(giay|s\b)/] },
  { key: 'locator', name: 'Locator', need: [/getby|locator|role|nhan|tim (dong|phan tu)|filter|hastext/, /\bgia\b|du lieu|thay doi|on dinh|ma co phieu|ten cong ty/] },
  { key: 'assert', name: 'Assertion', need: [/assert|expect|kiem tra/, /noi dung|cu the|tohavetext|tocontaintext|chinh xac|khong chi|tobevisible|dung (ma|chu|gia tri|ket qua)/] },
  { key: 'secret', name: 'Dữ liệu và bí mật', need: [/mat khau|password|secret|bi mat|process\.env|bien moi truong|\.env/] },
];
const W6_RULES = text => {
  const lines = String(text).split('\n').map(mcpNorm).filter(l => /^\s*[-*\d]/.test(l) && !/todo/.test(l));
  return Object.fromEntries(W6_RULE_GROUPS.map(g => [g.key, lines.some(l => g.need.every(re => re.test(l)))]));
};
// Khối lượng: số đầu tiên không phải mã cổ phiếu (bỏ qua email, mật khẩu chứa @).
const W6_QTY = p => {
  const n = (p.replace(/\S*@\S*/g, ' ').match(/\d+(?:[.,]\d{3})*/g) || []).map(x => +x.replace(/[.,]/g, '')).find(x => !STOCKS.some(s => +s.code === x));
  return n === undefined ? { qty: 100, note: '' } : n > 0 && n % 100 === 0 ? { qty: n, note: '' } : { qty: 100, note: ' Sàn Demo chỉ nhận khối lượng là bội số của 100, nên mình dùng 100.' };
};
