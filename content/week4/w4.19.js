defineExercise({
  id: 'w4.19',
  pw: true,
  exports: ['BasePage', 'LoginPage', 'ROUTES', 'MESSAGES'],
  title: 'Nhiều tệp: BasePage và constants',
  desc: `<p>Đọc bài giảng trước để hiểu vai trò từng thư mục. Trong sân tập chỉ có một editor, nên mỗi tệp được đánh dấu bằng dòng <code>// @file: đường/dẫn</code>. Thanh <strong>Tệp</strong> phía trên editor giúp nhảy nhanh giữa các tệp.</p>
<ul>
<li><code>constants/routes.ts</code>: <code>ROUTES</code> gồm <code>login</code>, <code>dashboard</code>, <code>order</code>, <code>orders</code>.</li>
<li><code>constants/messages.ts</code>: <code>MESSAGES</code> gồm <code>emptyEmail</code>, <code>wrongPassword</code>.</li>
<li><code>pages/BasePage.ts</code>: class <code>BasePage</code> có thuộc tính <code>toast</code> (vai trò <code>status</code>), method <code>open(path)</code> và <code>menu(name)</code> trả về liên kết trên menu.</li>
<li><code>pages/LoginPage.ts</code>: <code>LoginPage extends BasePage</code>, có <code>goto()</code> dùng <code>ROUTES.login</code> và <code>login(email, password)</code>.</li>
<li><code>tests/login.spec.ts</code>: 2 test (đăng nhập đúng, sai mật khẩu). <strong>Không</strong> viết cứng đường dẫn hay câu thông báo trong tệp test, hãy dùng <code>ROUTES</code>, <code>MESSAGES</code>.</li>
</ul>
<p class="note">Khác với project thật, ở đây các tệp nằm chung một chỗ nên tệp được dùng phải đứng <strong>trước</strong> tệp dùng nó (ví dụ BasePage trước LoginPage).</p>`,
  hints: [
    'Constants chỉ là object: <code>export const ROUTES = { login: \'/login\', ... } as const;</code> <code>as const</code> khiến giá trị không bị sửa nhầm.',
    'Kế thừa: <code>class LoginPage extends BasePage</code>, trong constructor gọi <code>super(page)</code> trước khi dùng <code>this</code>. Thuộc tính <code>protected page</code> của BasePage dùng được trong LoginPage.',
    '<code>menu(name: string) { return this.page.getByRole(\'navigation\').getByRole(\'link\', { name }); }</code>'],
  starter: String.raw`// @file: constants/routes.ts
export const ROUTES = {
  login: '/login',
  // thêm dashboard, order, orders
} as const;

// @file: constants/messages.ts
export const MESSAGES = {
  // emptyEmail, wrongPassword
} as const;

// @file: pages/BasePage.ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly toast: Locator;

  constructor(protected page: Page) {
    this.toast = page.getByRole('status');
  }

  async open(path: string) {

  }

  menu(name: string): Locator {

  }
}

// @file: pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../constants/routes';

export class LoginPage extends BasePage {
  // khai báo locator

  constructor(page: Page) {
    super(page);
  }

  async goto() {

  }

  async login(email: string, password: string) {

  }
}

// @file: tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ROUTES } from '../constants/routes';
import { MESSAGES } from '../constants/messages';

test('đăng nhập thành công', async ({ page }) => {

});

test('sai mật khẩu', async ({ page }) => {

});
`,
  tests: PWG + SECG + String.raw`
check('Có đủ các tệp', () => { for (const f of ['constants/routes', 'constants/messages', 'pages/BasePage', 'pages/LoginPage', '.spec.ts']) expect(__hasFile(f), 'Thiếu tệp ' + f + ' (dòng // @file: ...)').toBe(true); });
check('ROUTES và MESSAGES đúng giá trị', () => {
  const R = __pw.exports.ROUTES || {}, M = __pw.exports.MESSAGES || {};
  expect(R).toEqual({ login: '/login', dashboard: '/dashboard', order: '/order', orders: '/orders' });
  expect(M.emptyEmail, 'MESSAGES.emptyEmail').toBe('Vui lòng nhập email');
  expect(M.wrongPassword, 'MESSAGES.wrongPassword').toBe('Email hoặc mật khẩu không đúng');
});
check('LoginPage kế thừa BasePage', () => { const B = __pw.exports.BasePage, L = __pw.exports.LoginPage; expect(typeof B === 'function' && typeof L === 'function' && L.prototype instanceof B, 'Cần class LoginPage extends BasePage').toBe(true); });
check('open(), menu() và toast của BasePage hoạt động', async () => {
  const lp = new __pw.exports.LoginPage(H.page());
  await lp.open('/orders');
  expect(H.url(), 'open() chưa mở đúng trang').toBe('https://sandemo.test/orders');
  const m = lp.menu('Bảng giá');
  expect(H.isLocator(m) && H.resolve(m).length === 1 && H.resolve(m)[0].getAttribute('href') === '/dashboard', 'menu(\'Bảng giá\') chưa trỏ đúng liên kết trên menu').toBe(true);
  expect(H.isLocator(lp.toast), 'toast chưa phải locator').toBe(true);
});
check('goto() và login() của LoginPage hoạt động', async () => { const lp = new __pw.exports.LoginPage(H.page()); await lp.goto(); expect(H.url()).toBe('https://sandemo.test/login'); await lp.login('thao@sandemo.test', 'Demo@123'); expect(await H.waitUrl('/dashboard'), 'login() chưa đăng nhập được').toBe(true); });
check('Tệp test không viết cứng URL và câu thông báo', () => { const t = __sec('.spec.ts'); expect(/['"]\/(login|dashboard|orders?)['"]/.test(t), 'Tệp test vẫn còn đường dẫn viết cứng, hãy dùng ROUTES').toBe(false); expect(/Email hoặc mật khẩu|Vui lòng nhập/.test(t), 'Tệp test vẫn còn câu thông báo viết cứng, hãy dùng MESSAGES').toBe(false); expect(/new\s+LoginPage/.test(t)).toBe(true); });
check('2 test đều pass', () => { expect(__pw.tests.length >= 2).toBe(true); expect(__passed(), __failMsg()).toBe(true); });
check('Test phát hiện được bug "sai nội dung thông báo"', async () => { const r = await H.rerun('login-error-text'); expect(r.some(t => t.status === 'failed')).toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Vì sao phải chia thành nhiều tệp</h3>
<p>Bài 14 gom mọi thứ của trang đăng nhập vào một class. Khi project có hàng trăm test, cần thêm quy ước: tệp nào chứa gì, thư mục nào được dùng thư mục nào. Mục tiêu chung: <strong>khi ứng dụng thay đổi, chỉ phải sửa ở một chỗ</strong>.</p>
<h3>Cấu trúc thường gặp</h3>
<p>Bấm vào từng tệp để xem vai trò và nội dung mẫu:</p>
${TREE_HTML}
<h3>Ai được dùng ai</h3>
<pre>tests/*.spec.ts ──▶ fixtures/ ──▶ pages/ ──▶ BasePage
      │                              │
      ├──▶ test-data/*.json          ├──▶ locators/   (tùy chọn)
      └──▶ constants/ ◀──────────────┘
                 utils/ : dùng được ở mọi nơi</pre>
<p>Mũi tên chỉ đi một chiều. <code>pages</code> không bao giờ import <code>tests</code>; <code>constants</code>, <code>locators</code>, <code>test-data</code> không import gì. Giữ được quy tắc này thì project lớn đến đâu cũng không bị rối.</p>
<h3>Mỗi thứ để ở đâu</h3>
${TRACE(['Loại nội dung', 'Để ở', 'Lý do'], [['Kịch bản và assertion', 'tests/', 'đọc như test case nghiệp vụ'], ['Locator và thao tác của trang', 'pages/', 'dev đổi giao diện chỉ sửa một class'], ['Phần chung của mọi trang', 'pages/BasePage.ts', 'không lặp lại menu, toast, open()'], ['URL, câu thông báo, timeout', 'constants/', 'đổi một giá trị, mọi test cùng cập nhật'], ['Dữ liệu vào/ra của test case', 'test-data/*.json', 'thêm case không cần sửa code'], ['Tài khoản, URL môi trường', '.env', 'bảo mật, đổi môi trường dễ dàng'], ['Tạo sẵn page object, đăng nhập sẵn', 'fixtures/', 'test ngắn, không lặp setup']])}
<h3>Kế thừa với extends</h3>
{{ex0}}
<p class="note">Góc QA: với project cho khách hàng Nhật, <code>constants/messages.ts</code> thường tổ chức theo ngôn ngữ (<code>MESSAGES.ja.wrongPassword</code>) để cùng một bộ test chạy được trên cả giao diện tiếng Nhật và tiếng Anh.</p>`,
examples:[L(
'// @file: pages/BasePage.ts',
'class BasePage {',
'  constructor(protected page: Page) {}',
'  async open(path: string) {',
'    await this.page.goto(path);',
'  }',
'}',
'',
'// @file: pages/OrdersPage.ts',
'class OrdersPage extends BasePage {',
'  readonly count: Locator;',
'  constructor(page: Page) {',
'    super(page);                      // gọi constructor của BasePage trước',
'    this.count = page.getByTestId(\'order-count\');',
'  }',
'  async goto() {',
'    await this.open(\'/orders\');      // dùng lại method của class cha',
'  }',
'}',
'',
'// @file: tests/orders.spec.ts',
'test(\'có 3 lệnh ban đầu\', async ({ page }) => {',
'  const orders = new OrdersPage(page);',
'  await orders.goto();',
'  await expect(orders.count).toHaveText(\'3\');',
'});')]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>BasePage</code> giữ <code>page</code> ở dạng <code>protected</code>: class con dùng được, còn tệp test thì không đụng vào trực tiếp.</li>
<li><code>LoginPage</code> gọi <code>super(page)</code> trước tiên, sau đó mới tạo locator bằng <code>this</code>.</li>
<li><code>goto()</code> dùng lại <code>open()</code> của class cha với <code>ROUTES.login</code>, nên đường dẫn chỉ xuất hiện ở một chỗ.</li>
<li>Tệp test đọc như test case: không có selector, không có chuỗi viết cứng. Dev đổi câu thông báo thì chỉ sửa <code>messages.ts</code>.</li>
</ul>`,
examples:[String.raw`// @file: constants/routes.ts
export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  order: '/order',
  orders: '/orders',
} as const;

// @file: constants/messages.ts
export const MESSAGES = {
  emptyEmail: 'Vui lòng nhập email',
  wrongPassword: 'Email hoặc mật khẩu không đúng',
} as const;

// @file: pages/BasePage.ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly toast: Locator;

  constructor(protected page: Page) {
    this.toast = page.getByRole('status');
  }

  async open(path: string) {
    await this.page.goto(path);
  }

  menu(name: string): Locator {
    return this.page.getByRole('navigation').getByRole('link', { name });
  }
}

// @file: pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../constants/routes';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Mật khẩu');
    this.submitButton = page.getByRole('button', { name: 'Đăng nhập' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.open(ROUTES.login);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// @file: tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ROUTES } from '../constants/routes';
import { MESSAGES } from '../constants/messages';

test('đăng nhập thành công', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('thao@sandemo.test', 'Demo@123');
  await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
});

test('sai mật khẩu', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('thao@sandemo.test', 'sai-mat-khau');
  await expect(loginPage.errorMessage).toHaveText(MESSAGES.wrongPassword);
  await expect(page).toHaveURL(new RegExp(ROUTES.login));
});`]},
});
