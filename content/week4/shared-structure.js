/* Dữ liệu minh họa cho phần cấu trúc project Playwright. Chạy trước các bài của tuần (xem "shared" trong content/curriculum.js). */

const SECG = String.raw`
const __sections = (() => { const out = {}; let cur = null; for (const l of __source.split('\n')) { const m = l.match(/^\s*\/\/\s*@file:\s*(\S+)/); if (m) { cur = m[1]; out[cur] = ''; continue; } if (cur) out[cur] += l + '\n'; } return out; })();
const __hasFile = part => Object.keys(__sections).some(k => k.includes(part));
const __sec = part => Object.entries(__sections).filter(([k]) => k.includes(part)).map(([, v]) => v.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')).join('\n');
`;
const FILE_SAMPLES = {
  'config': { title: 'playwright.config.ts', desc: 'Cấu hình chung cho cả project: địa chỉ trang (baseURL), thời gian chờ, số lần chạy lại khi fail, trình duyệt, reporter. Mọi test đều dùng chung cấu hình này.', code: String.raw`import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://sandemo.test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});` },
  'env': { title: '.env', desc: 'Biến môi trường: URL từng môi trường (dev, staging), tài khoản, mật khẩu. File này KHÔNG đưa lên Git; thay vào đó commit một file .env.example ghi tên các biến cần có.', code: String.raw`BASE_URL=https://staging.sandemo.test
TEST_USER_EMAIL=thao@sandemo.test
TEST_USER_PASSWORD=Demo@123` },
  'spec': { title: 'tests/order/place-order.spec.ts', desc: 'File test chỉ chứa kịch bản và assertion, đọc như một test case nghiệp vụ. Không chứa selector, không chứa URL hay câu thông báo viết cứng.', code: String.raw`import { test, expect } from '../../fixtures/test.fixture';
import orders from '../../test-data/orders.json';
import { MESSAGES } from '../../constants/messages';

for (const order of orders) {
  test('đặt lệnh ' + order.side + ' ' + order.code, async ({ loginPage, orderPage }) => {
    await loginPage.goto();
    await loginPage.loginAsDefaultUser();
    await orderPage.goto();
    await orderPage.placeOrder(order);
    await expect(orderPage.toast).toContainText(MESSAGES.orderSuccess);
  });
}` },
  'base': { title: 'pages/BasePage.ts', desc: 'Class cha của mọi page object. Chứa những thứ trang nào cũng có: đối tượng page, hàm mở trang, menu, thông báo (toast). Các trang con kế thừa (extends) để không phải viết lại.', code: String.raw`import { Page, Locator } from '@playwright/test';

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
}` },
  'login': { title: 'pages/LoginPage.ts', desc: 'Page object của một trang cụ thể: locator của trang đó và các thao tác nghiệp vụ (đăng nhập). Không chứa assertion.', code: String.raw`import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../constants/routes';
import { LOGIN } from '../locators/login.locators';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(LOGIN.emailLabel);
    this.passwordInput = page.getByLabel(LOGIN.passwordLabel);
    this.submitButton = page.getByRole('button', { name: LOGIN.submitText });
  }

  async goto() {
    await this.open(ROUTES.login);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}` },
  'locators': { title: 'locators/login.locators.ts', desc: 'TÙY CHỌN. Một số team (nhất là team chuyển từ Selenium/Java) tách riêng chữ hoặc selector dùng để tìm phần tử ra file này. Playwright khuyên để locator ngay trong page object; chỉ tách khi team đã quen quy ước này hoặc trang có nhiều ngôn ngữ.', code: String.raw`export const LOGIN = {
  emailLabel: 'Email',
  passwordLabel: 'Mật khẩu',
  submitText: 'Đăng nhập',
  errorTestId: 'login-error',
} as const;` },
  'routes': { title: 'constants/routes.ts', desc: 'Các đường dẫn của ứng dụng. Dev đổi /orders thành /my-orders thì chỉ sửa một dòng ở đây.', code: String.raw`export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  order: '/order',
  orders: '/orders',
} as const;` },
  'messages': { title: 'constants/messages.ts', desc: 'Các câu thông báo mà test cần so sánh. Với trang nhiều ngôn ngữ (Nhật, Anh, Việt), có thể tổ chức theo từng ngôn ngữ.', code: String.raw`export const MESSAGES = {
  emptyEmail: 'Vui lòng nhập email',
  wrongPassword: 'Email hoặc mật khẩu không đúng',
  orderSuccess: 'Đặt lệnh thành công',
} as const;` },
  'users': { title: 'test-data/users.json', desc: 'Dữ liệu test dạng JSON: người không biết code (BA, QA manual) cũng đọc và sửa được. Mật khẩu thật nên lấy từ .env, không ghi vào đây.', code: String.raw`{
  "valid": { "email": "thao@sandemo.test", "password": "Demo@123" },
  "wrongPassword": { "email": "thao@sandemo.test", "password": "sai-mat-khau" }
}` },
  'orders': { title: 'test-data/orders.json', desc: 'Mỗi phần tử là một test case. Thêm một dòng dữ liệu là có thêm một test, không phải sửa code.', code: String.raw`[
  { "code": "7203", "side": "buy", "qty": 100 },
  { "code": "6758", "side": "sell", "qty": 200 }
]` },
  'types': { title: 'types/order.ts', desc: 'Định nghĩa kiểu dữ liệu dùng chung (interface, type) để page object và test cùng hiểu một cấu trúc.', code: String.raw`export interface OrderData {
  code: string;
  side: 'buy' | 'sell';
  qty: number;
}` },
  'fixture': { title: 'fixtures/test.fixture.ts', desc: 'Mở rộng hàm test của Playwright: tự tạo sẵn page object và truyền vào test, giống cách Playwright truyền { page }. Test không cần tự viết new LoginPage(page) nữa.', code: String.raw`import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { OrderPage } from '../pages/OrderPage';

type Pages = { loginPage: LoginPage; orderPage: OrderPage };

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  orderPage: async ({ page }, use) => {
    await use(new OrderPage(page));
  },
});
export { expect } from '@playwright/test';` },
  'utils': { title: 'utils/helpers.ts', desc: 'Hàm tiện ích không gắn với trang nào: định dạng số, sinh email ngẫu nhiên, đọc ngày giờ. Có thể dùng ở bất kỳ đâu.', code: String.raw`export const formatPrice = (n: number) => n.toLocaleString('en-US');

export const randomEmail = () => 'user' + Date.now() + '@sandemo.test';` },
};
const TREE_HTML = `<div class="ftree"><ul>
<li><span class="fdir">playwright-project/</span><ul>
  <li><button type="button" data-file="config">playwright.config.ts</button><span class="fnote">cấu hình chung</span></li>
  <li><button type="button" data-file="env">.env</button><span class="fnote">biến môi trường, không commit</span></li>
  <li><span class="fdir">tests/</span><span class="fnote">kịch bản test (*.spec.ts)</span><ul>
    <li><span class="fdir">auth/</span> login.spec.ts</li>
    <li><span class="fdir">order/</span> <button type="button" data-file="spec">place-order.spec.ts</button></li></ul></li>
  <li><span class="fdir">pages/</span><span class="fnote">Page Object</span><ul>
    <li><button type="button" data-file="base">BasePage.ts</button></li>
    <li><button type="button" data-file="login">LoginPage.ts</button></li>
    <li>DashboardPage.ts, OrderPage.ts</li></ul></li>
  <li><span class="fdir">locators/</span><span class="fnote">tùy chọn</span><ul><li><button type="button" data-file="locators">login.locators.ts</button></li></ul></li>
  <li><span class="fdir">constants/</span><ul><li><button type="button" data-file="routes">routes.ts</button></li><li><button type="button" data-file="messages">messages.ts</button></li></ul></li>
  <li><span class="fdir">test-data/</span><ul><li><button type="button" data-file="users">users.json</button></li><li><button type="button" data-file="orders">orders.json</button></li></ul></li>
  <li><span class="fdir">types/</span><ul><li><button type="button" data-file="types">order.ts</button></li></ul></li>
  <li><span class="fdir">fixtures/</span><ul><li><button type="button" data-file="fixture">test.fixture.ts</button></li></ul></li>
  <li><span class="fdir">utils/</span><ul><li><button type="button" data-file="utils">helpers.ts</button></li></ul></li>
</ul></li></ul></div>
<div class="fview" id="fview"><p class="muted-s">Bấm vào tên một tệp ở trên để xem nó dùng để làm gì và nội dung mẫu.</p></div>`;
