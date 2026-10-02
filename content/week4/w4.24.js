defineExercise({
  id: 'w4.24',
  pw: true,
  route: '/dashboard',
  files: {
    '.env': String.raw`# Giống bài 19: TEST_USER_EMAIL và TEST_USER_PASSWORD của tài khoản test.
`,
    'playwright.config.ts': CONFIG_REF,
    'constants/routes.ts': String.raw`// Cần export: ROUTES gồm login, dashboard, order, orders.
`,
    'constants/messages.ts': String.raw`// Cần export: MESSAGES gồm
//   orderSuccess  phần đầu của thông báo đặt lệnh thành công (phần trước dấu hai chấm)
//   invalidQty    thông báo khi khối lượng sai
//   pending       chữ trạng thái của lệnh mới trong trang Lệnh của tôi
// Hãy đặt thử một lệnh đúng và một lệnh sai trong tab Trang web để biết chính xác từng câu.
`,
    'locators/login.locators.ts': String.raw`// Giống bài 19: LOGIN_LOCATORS gồm emailLabel, passwordLabel, submitButton.
`,
    'locators/order.locators.ts': String.raw`// Cần export: ORDER_LOCATORS gồm
//   buyButton      tên nút mua trên mỗi dòng của Bảng giá
//   symbolLabel, qtyLabel, priceLabel, agreeLabel   nhãn các ô trên trang Đặt lệnh
//   submitButton   tên nút gửi lệnh
`,
    'types/order.ts': String.raw`// Cần export:
//   interface User     { email, password }
//   interface BuyOrder { code: string, companyName: string, qty: number, price: number }
//     price là giá đang hiện trên Bảng giá, dùng để kiểm tra giá tự điền và thông báo thành công.
`,
    'utils/helpers.ts': String.raw`// Cần export:
//   function requireEnv(name: string): string          giống bài 19
//   function formatNumber(n: number): string            13200 → "13,200" (nhớ bài 4.2 tuần 1)
//   function successText(order: BuyOrder): string       câu thông báo đầy đủ mong đợi, ví dụ
//     "Đặt lệnh thành công: MUA 6758 x200 @ 13,200"
`,
    'test-data/orders.json': String.raw`{
  "buyOrders": [],
  "invalidQty": 0
}
`,
    'pages/BasePage.ts': String.raw`// Giống bài 19: class BasePage với constructor(protected page: Page), heading, async open(path).
`,
    'pages/LoginPage.ts': String.raw`// Giống bài 19: class LoginPage extends BasePage với goto() và login(user: User).
`,
    'pages/DashboardPage.ts': String.raw`// Cần export: class DashboardPage extends BasePage
//   - async goto()
//   - rowOf(companyName: string): Locator          dòng của một cổ phiếu trong Bảng giá
//   - async buy(companyName: string)               bấm nút Mua trong đúng dòng đó
`,
    'pages/OrderPage.ts': String.raw`// Cần export: class OrderPage extends BasePage
//   - symbolSelect, qtyInput, priceInput, agreeCheckbox, submitButton: Locator
//   - successToast: Locator   thông báo đặt lệnh thành công (role "status")
//   - errorMessage: Locator   thông báo lỗi (role "alert")
//   - async placeOrder(qty: number)   nhập khối lượng, tích ô đồng ý, bấm đặt lệnh
`,
    'pages/OrdersPage.ts': String.raw`// Cần export: class OrdersPage extends BasePage
//   - async goto()
//   - rowFor(order: BuyOrder): Locator   dòng của ĐÚNG lệnh vừa đặt
//     Chú ý: trang đã có sẵn lệnh cũ trùng mã, ví dụ DH-1003 cũng là MUA 9984 x300.
`,
    'fixtures/test.fixture.ts': String.raw`// Cần export test với các fixture: loginPage, dashboardPage, orderPage, ordersPage, validUser,
// và export lại expect.
// Điểm mới: fixture dashboardPage phải ĐĂNG NHẬP bằng validUser và mở Bảng giá trước khi đưa cho test.
`,
    'tests/order/buy-stock.spec.ts': String.raw`// Yêu cầu:
//   1. Mỗi lệnh trong buyOrders của orders.json sinh một test:
//      Bảng giá: bấm Mua đúng dòng → Đặt lệnh: mã và giá tự điền đúng → đặt lệnh
//      → thấy đúng thông báo thành công → Lệnh của tôi: có dòng của lệnh vừa đặt, trạng thái chờ khớp.
//   2. Một test đặt lệnh với invalidQty → thấy đúng thông báo lỗi.
// Mọi test bắt đầu từ dashboardPage (đã đăng nhập sẵn).
// Không viết cứng mã, tên cổ phiếu, URL hay câu thông báo trong tệp này.
`,
  },
  open: 'constants/routes.ts',
  projectName: 'sandemo-buy',
  title: 'Dự án POM: luồng Mua cổ phiếu',
  desc: `<p>Project thứ ba: <strong>mua một cổ phiếu và đặt lệnh thành công</strong>. Luồng đi qua 3 trang. Mở tab Trang web và tự làm thử một lần trước khi viết code:</p>
<ol>
<li><strong>Bảng giá</strong>: bấm "Mua" ở dòng một cổ phiếu.</li>
<li><strong>Đặt lệnh</strong>: mã và giá đã được điền sẵn. Nhập khối lượng (bội số của 100), tích ô đồng ý, bấm "Đặt lệnh" và đọc thông báo.</li>
<li><strong>Lệnh của tôi</strong>: lệnh vừa đặt nằm cuối bảng, trạng thái "Chờ khớp".</li>
</ol>
<p>Điểm mới so với bài 19–20:</p>
<ul>
<li><strong>Fixture có bước chuẩn bị:</strong> <code>dashboardPage</code> tự đăng nhập rồi mới đưa cho test, nên test chỉ còn các bước mua.</li>
<li><strong>Kiểm tra tới nơi lưu dữ liệu:</strong> thông báo "thành công" chưa đủ, phải thấy lệnh trong trang Lệnh của tôi.</li>
<li><strong>Dữ liệu trùng gần giống:</strong> trang có sẵn lệnh cũ cùng mã, locator phải tìm đúng dòng của lệnh mới.</li>
</ul>
<p>Các tệp <code>.env</code>, <code>BasePage</code>, <code>LoginPage</code>, <code>login.locators</code> và hàm <code>requireEnv</code> giống bài 19, có thể chép lại.</p>
<p class="note">Bộ chấm chạy lại test trên 2 phiên bản có bug: nút Mua mở nhầm cổ phiếu, và lệnh báo thành công nhưng không được lưu. Test của bạn phải bắt được cả hai.</p>`,
  hints: [
    'Luồng một test: <code>dashboardPage.buy(order.companyName)</code> → kiểm tra <code>orderPage.symbolSelect</code> có giá trị <code>order.code</code> và <code>priceInput</code> có giá trị <code>String(order.price)</code> → <code>orderPage.placeOrder(order.qty)</code> → <code>successToast</code> có chữ <code>successText(order)</code> → <code>ordersPage.goto()</code> → <code>rowFor(order)</code> hiển thị và chứa <code>MESSAGES.pending</code>.',
    'Các câu: <code>Đặt lệnh thành công: MUA 6758 x200 @ 13,200</code>, <code>Khối lượng phải là bội số của 100</code>, trạng thái <code>Chờ khớp</code>. Nút Đặt lệnh bị khóa cho tới khi tích ô đồng ý. Trong <code>orders.json</code>, <code>price</code> phải đúng giá trên Bảng giá.',
    'Fixture: <code>dashboardPage: async ({ page, loginPage, validUser }, use) =&gt; { await loginPage.goto(); await loginPage.login(validUser); await expect(page).toHaveURL(new RegExp(ROUTES.dashboard)); await use(new DashboardPage(page)); }</code>. Dòng lệnh mới: lọc theo cả mã lẫn giá, <code>page.getByRole(\'row\').filter({ hasText: order.code }).filter({ hasText: formatNumber(order.price) })</code>.'],
  tests: PWG + PROJG + String.raw`
const L = ['.env', 'constants/routes.ts', 'constants/messages.ts', 'locators/login.locators.ts', 'locators/order.locators.ts', 'types/order.ts', 'utils/helpers.ts', 'pages/BasePage.ts', 'pages/LoginPage.ts', 'pages/DashboardPage.ts', 'pages/OrderPage.ts', 'pages/OrdersPage.ts', 'fixtures/test.fixture.ts', 'tests/order/buy-stock.spec.ts'];
const X = __pw.exports;
check('Đã viết code trong mọi tệp', () => __need(L));
check('Mọi import trỏ tới tệp có thật và tên đã được export', () => { const pr = __importProblems(); expect(pr.length === 0, pr.join('\n')).toBe(true); });
check('.env có TEST_USER_EMAIL và TEST_USER_PASSWORD đúng', () => { const env = {}; for (const l of (F['.env'] || '').split('\n')) { const m = l.trim().match(/^(\w+)\s*=\s*(.*)$/); if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, ''); } expect(env.TEST_USER_EMAIL, 'TEST_USER_EMAIL').toBe('thao@sandemo.test'); expect(env.TEST_USER_PASSWORD, 'TEST_USER_PASSWORD').toBe('Demo@123'); });
check('Constants đúng giá trị', () => {
  const R = X.ROUTES || {}; expect(R.login, 'ROUTES.login').toBe('/login'); expect(R.dashboard, 'ROUTES.dashboard').toBe('/dashboard'); expect(R.order, 'ROUTES.order').toBe('/order'); expect(R.orders, 'ROUTES.orders').toBe('/orders');
  const M = X.MESSAGES || {}; expect(M.orderSuccess, 'MESSAGES.orderSuccess').toBe('Đặt lệnh thành công'); expect(M.invalidQty, 'MESSAGES.invalidQty').toBe('Khối lượng phải là bội số của 100'); expect(M.pending, 'MESSAGES.pending').toBe('Chờ khớp');
  expect(!!X.ORDER_LOCATORS && typeof X.ORDER_LOCATORS === 'object', 'Chưa có ORDER_LOCATORS').toBe(true);
});
check('formatNumber và successText cho đúng chuỗi', () => {
  expect(typeof X.formatNumber, 'Chưa có formatNumber').toBe('function'); expect(X.formatNumber(13200)).toBe('13,200'); expect(X.formatNumber(1720)).toBe('1,720'); expect(X.formatNumber(62300)).toBe('62,300');
  expect(typeof X.successText, 'Chưa có successText').toBe('function'); expect(X.successText({ code: '6758', companyName: 'Sony Group', qty: 200, price: 13200 })).toBe('Đặt lệnh thành công: MUA 6758 x200 @ 13,200');
});
check('Các Page Object kế thừa BasePage', () => { for (const k of ['LoginPage', 'DashboardPage', 'OrderPage', 'OrdersPage']) expect(typeof X[k] === 'function' && typeof X.BasePage === 'function' && X[k].prototype instanceof X.BasePage, k + ' chưa extends BasePage').toBe(true); });
check('buy() → placeOrder() → rowFor() hoạt động khi gọi độc lập', async () => {
  for (const k of ['DashboardPage', 'OrderPage', 'OrdersPage']) expect(typeof X[k], 'Chưa export class ' + k).toBe('function');
  const page = H.page(); const dp = new X.DashboardPage(page); await dp.goto();
  expect(H.url(), 'DashboardPage.goto() chưa mở Bảng giá').toBe('https://sandemo.test/dashboard');
  await dp.buy('SoftBank Group');
  expect(await H.waitUrl(/\/order\?code=9984/), 'buy("SoftBank Group") chưa mở trang Đặt lệnh của mã 9984, URL: ' + H.url()).toBe(true);
  const op = new X.OrderPage(page); await op.placeOrder(300);
  const t = H.resolve(op.successToast);
  expect(t.length === 1 && /Đặt lệnh thành công: MUA 9984 x300/.test(t[0].textContent), 'placeOrder(300) chưa đặt được lệnh, hoặc successToast chưa trỏ đúng thông báo').toBe(true);
  const os = new X.OrdersPage(page); await os.goto();
  expect(H.url(), 'OrdersPage.goto() chưa mở Lệnh của tôi').toBe('https://sandemo.test/orders');
  const rows = H.resolve(os.rowFor({ code: '9984', companyName: 'SoftBank Group', qty: 300, price: 8900 }));
  expect(rows.length, 'rowFor() khớp ' + rows.length + ' dòng. Lệnh cũ DH-1003 cũng là MUA 9984 x300, chỉ khác giá').toBe(1);
  expect(rows[0].textContent.includes('DH-1004'), 'rowFor() đang trỏ vào lệnh cũ, chưa phải lệnh vừa đặt').toBe(true);
});
let orders = [];
check('orders.json: ít nhất 2 lệnh mua đúng dữ liệu Bảng giá và một khối lượng sai', () => {
  let d; try { d = JSON.parse(F['test-data/orders.json']); } catch (e) { expect(false, 'orders.json chưa hợp lệ').toBe(true); }
  orders = d.buyOrders || [];
  expect(orders.length >= 2, 'Cần ít nhất 2 lệnh trong buyOrders').toBe(true);
  for (const o of orders) {
    const st = STOCKS.find(x => x.code === o.code);
    expect(!!st, 'Mã "' + o.code + '" không có trên Bảng giá').toBe(true);
    expect(o.companyName, 'companyName của mã ' + o.code).toBe(st.name);
    expect(o.price, 'price của mã ' + o.code + ' phải đúng giá trên Bảng giá').toBe(st.price);
    expect(Number.isInteger(o.qty) && o.qty > 0 && o.qty % 100 === 0, 'qty của mã ' + o.code + ' phải là bội số của 100').toBe(true);
  }
  expect(new Set(orders.map(o => o.code)).size, 'Mỗi lệnh nên mua một mã khác nhau').toBe(orders.length);
  expect(typeof d.invalidQty === 'number' && (d.invalidQty <= 0 || d.invalidQty % 100 !== 0), 'invalidQty phải là một khối lượng sai, ví dụ 150').toBe(true);
});
check('Tệp test không viết cứng dữ liệu và không tự new Page Object', () => {
  const t = __body(F['tests/order/buy-stock.spec.ts']);
  expect(/sandemo\.test|Demo@123/.test(t), 'Còn email/mật khẩu viết cứng').toBe(false);
  expect(/Đặt lệnh thành công|bội số|Chờ khớp/.test(t), 'Còn câu thông báo viết cứng').toBe(false);
  expect(/['"]\/(login|dashboard|orders?)['"]/.test(t), 'Còn URL viết cứng').toBe(false);
  expect(/\b(7203|6758|9984|8306|6861|7974)\b|Toyota|Sony|SoftBank|Mitsubishi|Keyence|Nintendo/.test(t), 'Còn mã hoặc tên cổ phiếu viết cứng, hãy lấy từ orders.json').toBe(false);
  expect(/new\s+(LoginPage|DashboardPage|OrderPage|OrdersPage)/.test(t), 'Page Object phải được tạo trong fixture').toBe(false);
  expect(/fixtures\/test\.fixture/.test(t), 'Hãy import test từ tệp fixture').toBe(true);
});
check('Số test = số lệnh mua + 1, tất cả pass', () => { expect(__pw.tests.length, 'Số test').toBe(orders.length + 1); expect(__passed(), __failMsg()).toBe(true); });
check('Mọi test chạy khi đã đăng nhập (fixture dashboardPage)', () => expect(__pw.tests.every(t => t.state && t.state.user), 'Có test chưa đăng nhập. Hãy để fixture dashboardPage đăng nhập trước khi đưa cho test').toBe(true));
check('Luồng mua kiểm tra tới trang Lệnh của tôi', () => expect(__pw.tests.some(t => t.status === 'passed' && /\/orders/.test(t.url)), 'Chưa có test nào đi tới trang Lệnh của tôi').toBe(true));
check('Phát hiện bug "bấm Mua mở nhầm cổ phiếu"', async () => { const r = await H.rerun('buy-wrong-stock'); expect(r.some(t => t.status === 'failed'), 'Nút Mua mở nhầm mã mà test vẫn pass. Hãy kiểm tra mã và giá trên trang Đặt lệnh').toBe(true); });
check('Phát hiện bug "lệnh không được lưu"', async () => { const r = await H.rerun('orders-not-saved'); expect(r.some(t => t.status === 'failed'), 'Lệnh không được lưu mà test vẫn pass. Hãy tìm đúng dòng của lệnh mới trong Lệnh của tôi').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Một luồng nghiệp vụ, ba Page Object</h3>
<p>Luồng mua đi qua 3 trang. Mỗi trang một Page Object lo phần "tìm và bấm" của trang đó; tệp test chỉ còn là chuỗi bước nghiệp vụ, đọc như kịch bản test thủ công:</p>
{{ex0}}
<h3>Fixture có bước chuẩn bị</h3>
<p>Mọi test mua đều cần đăng nhập trước. Thay vì lặp lại 3 dòng đăng nhập trong từng test, đặt chúng vào fixture. Phần code <strong>trước</strong> <code>use(...)</code> chạy trước test, phần <strong>sau</strong> chạy khi test xong:</p>
${ANAT(["dashboardPage: async (", "Tên fixture. Test nào khai báo <code>{ dashboardPage }</code> thì Playwright chạy hàm này trước."], ["{ page, loginPage, validUser }", "Fixture này dùng các fixture khác. Playwright tự tạo chúng trước, đúng thứ tự phụ thuộc."], ", use) => {\n  ", ["await loginPage.goto();\n  await loginPage.login(validUser);", "<strong>Chuẩn bị</strong>: đăng nhập. Chạy trước mỗi test dùng fixture."], "\n  ", ["await use(new DashboardPage(page));", "<strong>Đưa cho test</strong>: test chạy tại đây, nhận được Bảng giá đã đăng nhập."], "\n  ", ["// dọn dẹp nếu cần", "<strong>Sau test</strong>: ví dụ xóa dữ liệu vừa tạo. Bài này không cần."], "\n}")}
<p class="note">Trong project thật còn có cách nhanh hơn: đăng nhập một lần, lưu phiên vào tệp (<code>storageState</code>) và dùng lại cho mọi test. Cách viết bằng fixture ở đây dễ hiểu hơn và đủ dùng khi bộ test còn nhỏ.</p>
<h3>Kiểm tra tới nơi dữ liệu được lưu</h3>
<p>Thông báo "Đặt lệnh thành công" chỉ cho biết giao diện <em>nói</em> là thành công. Bug hay gặp: báo thành công nhưng lệnh không được lưu. Vì vậy test phải mở trang Lệnh của tôi và tìm thấy đúng lệnh vừa đặt.</p>
<p>Trang đã có sẵn lệnh cũ <code>DH-1003</code>: MUA 9984 x300 giá 8,850. Nếu bạn mua 9984 x300 với giá 8,900, lọc theo mã thôi sẽ khớp cả lệnh cũ. Lọc thêm theo giá để chỉ còn lệnh mới:</p>
${ANAT(["page.getByRole('row')", "Mọi dòng trong bảng lệnh."], "\n  ", [".filter({ hasText: order.code })", "Giữ dòng có mã cổ phiếu, ví dụ 9984. Còn 2 dòng: lệnh cũ và lệnh mới."], "\n  ", [".filter({ hasText: formatNumber(order.price) })", "Giữ dòng có đúng giá, ví dụ “8,900”. Chỉ còn lệnh mới. Giá trên trang có dấu phẩy nên phải định dạng giống vậy."])}
<h3>Tính chuỗi mong đợi từ dữ liệu</h3>
<p>Thông báo thành công ghép từ mã, khối lượng và giá: <code>Đặt lệnh thành công: MUA 6758 x200 @ 13,200</code>. Viết một hàm <code>successText(order)</code> ghép chuỗi này từ dữ liệu, để mỗi lệnh trong <code>orders.json</code> tự có câu mong đợi riêng. Phần định dạng <code>13,200</code> chính là bài 4.2 của tuần 1.</p>
<p class="note">Góc QA: kiểm tra luôn mã và giá tự điền trên trang Đặt lệnh. Bug "bấm Mua dòng này mà mở lệnh của dòng khác" rất khó thấy bằng mắt nếu chỉ nhìn thông báo cuối cùng.</p>`,
examples:[{ run:false, code:String.raw`test('mua ' + order.companyName + ' thành công', async ({ page, dashboardPage, orderPage, ordersPage }) => {
  await dashboardPage.buy(order.companyName);                 // Bảng giá
  await expect(orderPage.symbolSelect).toHaveValue(order.code);

  await orderPage.placeOrder(order.qty);                      // Đặt lệnh
  await expect(orderPage.successToast).toHaveText(successText(order));

  await ordersPage.goto();                                    // Lệnh của tôi
  await expect(ordersPage.rowFor(order)).toContainText(MESSAGES.pending);
});` }]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
<p>Bấm <strong>Chạy lời giải</strong> để chạy toàn bộ project mẫu.</p>
{{ex0}}
<h3>Những điểm đáng chú ý</h3>
<ul>
<li>Fixture <code>dashboardPage</code> đăng nhập và chờ tới Bảng giá rồi mới <code>use(...)</code>. Mọi test nhận được trang đã đăng nhập, không test nào phải lặp lại bước này.</li>
<li>Test kiểm tra mã và giá tự điền trên trang Đặt lệnh trước khi đặt. Đây là chỗ bắt được bug "bấm Mua mở nhầm cổ phiếu".</li>
<li><code>rowFor(order)</code> lọc theo mã, giá và chữ "Mua", nên không nhầm với các lệnh cũ trùng mã. Nếu lệnh không được lưu, dòng này không tồn tại và test fail.</li>
<li>Câu thông báo mong đợi được tính từ dữ liệu bằng <code>successText(order)</code>, nên thêm một lệnh vào <code>orders.json</code> là có thêm một test, không phải sửa code.</li>
<li>Test khối lượng sai kiểm tra cả hai chiều: có thông báo lỗi, <strong>và</strong> không có thông báo thành công.</li>
</ul>`,
examples:[String.raw`// @file: .env
TEST_USER_EMAIL=thao@sandemo.test
TEST_USER_PASSWORD=Demo@123

// @file: constants/routes.ts
export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  order: '/order',
  orders: '/orders',
} as const;

// @file: constants/messages.ts
export const MESSAGES = {
  orderSuccess: 'Đặt lệnh thành công',
  invalidQty: 'Khối lượng phải là bội số của 100',
  pending: 'Chờ khớp',
} as const;

// @file: locators/login.locators.ts
export const LOGIN_LOCATORS = {
  emailLabel: 'Email',
  passwordLabel: 'Mật khẩu',
  submitButton: 'Đăng nhập',
} as const;

// @file: locators/order.locators.ts
export const ORDER_LOCATORS = {
  buyButton: 'Mua',
  buySide: 'Mua',
  symbolLabel: 'Mã cổ phiếu',
  qtyLabel: 'Khối lượng',
  priceLabel: 'Giá đặt',
  agreeLabel: 'Tôi đồng ý với điều khoản giao dịch',
  submitButton: 'Đặt lệnh',
} as const;

// @file: types/order.ts
export interface User {
  email: string;
  password: string;
}

export interface BuyOrder {
  code: string;
  companyName: string;
  qty: number;
  price: number;
}

// @file: utils/helpers.ts
import { MESSAGES } from '../constants/messages';
import { BuyOrder } from '../types/order';

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error('Thiếu biến môi trường ' + name + ' trong .env');
  return value;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function successText(order: BuyOrder): string {
  return MESSAGES.orderSuccess + ': MUA ' + order.code + ' x' + order.qty + ' @ ' + formatNumber(order.price);
}

// @file: test-data/orders.json
{
  "buyOrders": [
    { "code": "6758", "companyName": "Sony Group", "qty": 200, "price": 13200 },
    { "code": "9984", "companyName": "SoftBank Group", "qty": 300, "price": 8900 }
  ],
  "invalidQty": 150
}

// @file: pages/BasePage.ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly heading: Locator;

  constructor(protected page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
  }

  async open(path: string) {
    await this.page.goto(path);
  }
}

// @file: pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../constants/routes';
import { LOGIN_LOCATORS } from '../locators/login.locators';
import { User } from '../types/order';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(LOGIN_LOCATORS.emailLabel);
    this.passwordInput = page.getByLabel(LOGIN_LOCATORS.passwordLabel);
    this.submitButton = page.getByRole('button', { name: LOGIN_LOCATORS.submitButton });
  }

  async goto() {
    await this.open(ROUTES.login);
  }

  async login(user: User) {
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.submitButton.click();
  }
}

// @file: pages/DashboardPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../constants/routes';
import { ORDER_LOCATORS } from '../locators/order.locators';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.open(ROUTES.dashboard);
  }

  rowOf(companyName: string): Locator {
    return this.page.getByRole('row').filter({ hasText: companyName });
  }

  async buy(companyName: string) {
    await this.rowOf(companyName).getByRole('button', { name: ORDER_LOCATORS.buyButton, exact: true }).click();
  }
}

// @file: pages/OrderPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ORDER_LOCATORS as O } from '../locators/order.locators';

export class OrderPage extends BasePage {
  readonly symbolSelect: Locator;
  readonly qtyInput: Locator;
  readonly priceInput: Locator;
  readonly agreeCheckbox: Locator;
  readonly submitButton: Locator;
  readonly successToast: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.symbolSelect = page.getByLabel(O.symbolLabel);
    this.qtyInput = page.getByLabel(O.qtyLabel);
    this.priceInput = page.getByLabel(O.priceLabel);
    this.agreeCheckbox = page.getByLabel(O.agreeLabel);
    this.submitButton = page.getByRole('button', { name: O.submitButton });
    this.successToast = page.getByRole('status');
    this.errorMessage = page.getByRole('alert');
  }

  async placeOrder(qty: number) {
    await this.qtyInput.fill(String(qty));
    await this.agreeCheckbox.check();
    await this.submitButton.click();
  }
}

// @file: pages/OrdersPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../constants/routes';
import { ORDER_LOCATORS } from '../locators/order.locators';
import { BuyOrder } from '../types/order';
import { formatNumber } from '../utils/helpers';

export class OrdersPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.open(ROUTES.orders);
  }

  // Lọc theo mã, giá và loại lệnh: lệnh cũ có thể trùng mã và khối lượng, nhưng không trùng đủ cả ba.
  rowFor(order: BuyOrder): Locator {
    return this.page.getByRole('row')
      .filter({ hasText: order.code })
      .filter({ hasText: formatNumber(order.price) })
      .filter({ hasText: ORDER_LOCATORS.buySide });
  }
}

// @file: fixtures/test.fixture.ts
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { OrderPage } from '../pages/OrderPage';
import { OrdersPage } from '../pages/OrdersPage';
import { ROUTES } from '../constants/routes';
import { requireEnv } from '../utils/helpers';
import { User } from '../types/order';

type Fixtures = {
  validUser: User;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  orderPage: OrderPage;
  ordersPage: OrdersPage;
};

export const test = base.extend<Fixtures>({
  validUser: async ({}, use) => {
    await use({ email: requireEnv('TEST_USER_EMAIL'), password: requireEnv('TEST_USER_PASSWORD') });
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  // Chuẩn bị: đăng nhập rồi mới đưa Bảng giá cho test.
  dashboardPage: async ({ page, loginPage, validUser }, use) => {
    await loginPage.goto();
    await loginPage.login(validUser);
    await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
    await use(new DashboardPage(page));
  },
  orderPage: async ({ page }, use) => {
    await use(new OrderPage(page));
  },
  ordersPage: async ({ page }, use) => {
    await use(new OrdersPage(page));
  },
});

export { expect } from '@playwright/test';

// @file: tests/order/buy-stock.spec.ts
import { test, expect } from '../../fixtures/test.fixture';
import { ROUTES } from '../../constants/routes';
import { MESSAGES } from '../../constants/messages';
import { BuyOrder } from '../../types/order';
import { successText } from '../../utils/helpers';
import data from '../../test-data/orders.json';

const orders: BuyOrder[] = data.buyOrders;

for (const order of orders) {
  test('mua ' + order.companyName + ' thành công', async ({ page, dashboardPage, orderPage, ordersPage }) => {
    await dashboardPage.buy(order.companyName);
    await expect(page).toHaveURL(new RegExp(ROUTES.order));
    await expect(orderPage.symbolSelect).toHaveValue(order.code);
    await expect(orderPage.priceInput).toHaveValue(String(order.price));

    await orderPage.placeOrder(order.qty);
    await expect(orderPage.successToast).toHaveText(successText(order));

    await ordersPage.goto();
    const row = ordersPage.rowFor(order);
    await expect(row).toBeVisible();
    await expect(row).toContainText(MESSAGES.pending);
  });
}

test('khối lượng không hợp lệ thì báo lỗi', async ({ dashboardPage, orderPage }) => {
  await dashboardPage.buy(orders[0].companyName);
  await orderPage.placeOrder(data.invalidQty);
  await expect(orderPage.errorMessage).toHaveText(MESSAGES.invalidQty);
  await expect(orderPage.successToast).toBeHidden();
});`]},
});
