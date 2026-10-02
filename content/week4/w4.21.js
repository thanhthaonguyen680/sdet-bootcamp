defineExercise({
  id: 'w4.21',
  pw: true,
  title: 'Fixture: tự động tạo Page Object',
  desc: `<p>Các page object đã được viết sẵn. Nhiệm vụ của bạn:</p>
<ul>
<li><code>fixtures/test.fixture.ts</code>: dùng <code>base.extend</code> tạo hàm <code>test</code> mới có hai fixture <code>loginPage</code> và <code>orderPage</code>.</li>
<li><code>tests/order.spec.ts</code>: viết test <code>'đặt lệnh sau khi đăng nhập'</code> nhận <code>{ loginPage, orderPage }</code> trực tiếp từ tham số, đăng nhập rồi đặt một lệnh và kiểm tra thông báo.</li>
</ul>
<p>Trong tệp test <strong>không</strong> được có <code>new LoginPage</code> hay <code>new OrderPage</code>: việc tạo object thuộc về fixture.</p>`,
  hints: [
    'Mỗi fixture là một hàm <code>async ({ page }, use) =&gt; { await use(giaTri); }</code>. Giá trị truyền cho <code>use</code> chính là thứ test nhận được.',
    '<code>export const test = base.extend&lt;MyFixtures&gt;({ loginPage: async ({ page }, use) =&gt; { await use(new LoginPage(page)); }, orderPage: ... });</code>',
    'Trong tệp test: <code>test(\'...\', async ({ loginPage, orderPage }) =&gt; { await loginPage.goto(); ... })</code>. Hàm <code>test</code> ở đây là hàm vừa tạo trong tệp fixture.'],
  starter: String.raw`// @file: pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Mật khẩu').fill(password);
    await this.page.getByRole('button', { name: 'Đăng nhập' }).click();
    await this.page.waitForURL(/dashboard/);
  }
}

// @file: pages/OrderPage.ts
import { Page, Locator } from '@playwright/test';

export class OrderPage {
  readonly toast: Locator;

  constructor(private page: Page) {
    this.toast = page.getByRole('status');
  }

  async goto() {
    await this.page.getByRole('link', { name: 'Đặt lệnh' }).click();
  }

  async placeOrder(code: string, qty: number) {
    await this.page.getByLabel('Mã cổ phiếu').selectOption(code);
    await this.page.getByLabel('Khối lượng').fill(String(qty));
    await this.page.getByLabel('Tôi đồng ý').check();
    await this.page.getByRole('button', { name: 'Đặt lệnh' }).click();
  }
}

// @file: fixtures/test.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { OrderPage } from '../pages/OrderPage';

type MyFixtures = {
  loginPage: LoginPage;
  orderPage: OrderPage;
};

export const test = base.extend<MyFixtures>({
  // loginPage: ...
  // orderPage: ...
});
export { expect } from '@playwright/test';

// @file: tests/order.spec.ts
import { test, expect } from '../fixtures/test.fixture';

`,
  tests: PWG + SECG + String.raw`
check('Có tệp fixture dùng base.extend', () => { expect(__hasFile('fixtures/'), 'Thiếu tệp fixtures/...').toBe(true); expect(/\.extend\s*(<[\s\S]*?>)?\s*\(/.test(__sec('fixtures/')), 'Chưa dùng base.extend(...)').toBe(true); });
check('Test nhận loginPage và orderPage từ tham số', () => expect(/async\s*\(\s*\{[^}]*\bloginPage\b[^}]*\}/.test(__sec('.spec.ts')) && /async\s*\(\s*\{[^}]*\borderPage\b[^}]*\}/.test(__sec('.spec.ts')), 'Cần async ({ loginPage, orderPage }) => ...').toBe(true));
check('Tệp test không tự tạo page object', () => expect(/new\s+(LoginPage|OrderPage)/.test(__sec('.spec.ts')), 'Việc new LoginPage/OrderPage phải nằm trong fixture').toBe(false));
check('Test pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Lệnh mới đã được tạo', () => expect(((__pw.tests[0] || {}).state || { orders: [] }).orders.length).toBe(4));
check('Có kiểm tra thông báo đặt lệnh', () => expect(__okAssert(/^(toHaveText|toContainText|toBeVisible)$/)).toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Fixture là gì</h3>
<p>Bạn đã dùng fixture ngay từ bài 8: <code>{ page }</code> trong <code>async ({ page }) =&gt;</code> chính là một fixture do Playwright chuẩn bị sẵn cho mỗi test (mở tab mới, đóng sau khi xong). Playwright cho phép tự định nghĩa thêm fixture của riêng mình.</p>
<h3>Tự tạo fixture với extend</h3>
{{ex0}}
<ul>
<li>Phần trước <code>await use(...)</code> chạy <strong>trước</strong> test (chuẩn bị).</li>
<li>Giá trị truyền vào <code>use</code> là thứ test nhận được.</li>
<li>Phần sau <code>await use(...)</code> chạy <strong>sau</strong> test (dọn dẹp), kể cả khi test fail.</li>
<li>Fixture chỉ được tạo khi test thực sự dùng tới nó.</li>
</ul>
<h3>So với beforeEach</h3>
<p><code>beforeEach</code> chạy cho mọi test trong tệp dù có cần hay không, và phải dùng biến chung bên ngoài. Fixture gọn hơn, dùng lại được ở mọi tệp test, và mỗi test tự chọn fixture mình cần qua tham số.</p>
<p class="note">Góc QA: fixture hay gặp trong project thật: <code>loggedInPage</code> (đã đăng nhập sẵn), <code>apiClient</code> (gọi API chuẩn bị dữ liệu), <code>testUser</code> (tạo tài khoản mới rồi xóa sau khi test xong).</p>`,
examples:[L(
'import { test as base } from \'@playwright/test\';',
'',
'const test = base.extend<{ dashboard: Page }>({',
'  dashboard: async ({ page }, use) => {',
'    console.log(\'Chuẩn bị: mở bảng giá\');',
'    await page.goto(\'/dashboard\');',
'    await use(page);',
'    console.log(\'Dọn dẹp sau test\');',
'  },',
'});',
'',
'test(\'bảng giá đã mở sẵn\', async ({ dashboard }) => {',
'  console.log(\'Test bắt đầu\');',
'  await expect(dashboard.getByRole(\'heading\', { name: \'Bảng giá\' })).toBeVisible();',
'});')]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Tệp fixture tạo một hàm <code>test</code> mới "biết" thêm <code>loginPage</code> và <code>orderPage</code>. Mọi tệp test import <code>test</code> từ đây thay vì từ <code>@playwright/test</code>.</li>
<li><code>export { expect } from '@playwright/test'</code> để tệp test chỉ cần import từ một chỗ.</li>
<li>Test không còn dòng setup nào, chỉ còn các bước nghiệp vụ.</li>
<li>Cả hai fixture dùng chung một <code>page</code>, vì trong một test Playwright chỉ tạo một <code>page</code>.</li>
</ul>`,
examples:[String.raw`// @file: pages/LoginPage.ts
import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}
  async goto() { await this.page.goto('/login'); }
  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Mật khẩu').fill(password);
    await this.page.getByRole('button', { name: 'Đăng nhập' }).click();
    await this.page.waitForURL(/dashboard/);
  }
}

// @file: pages/OrderPage.ts
import { Page, Locator } from '@playwright/test';

export class OrderPage {
  readonly toast: Locator;
  constructor(private page: Page) { this.toast = page.getByRole('status'); }
  async goto() { await this.page.getByRole('link', { name: 'Đặt lệnh' }).click(); }
  async placeOrder(code: string, qty: number) {
    await this.page.getByLabel('Mã cổ phiếu').selectOption(code);
    await this.page.getByLabel('Khối lượng').fill(String(qty));
    await this.page.getByLabel('Tôi đồng ý').check();
    await this.page.getByRole('button', { name: 'Đặt lệnh' }).click();
  }
}

// @file: fixtures/test.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { OrderPage } from '../pages/OrderPage';

type MyFixtures = {
  loginPage: LoginPage;
  orderPage: OrderPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  orderPage: async ({ page }, use) => {
    await use(new OrderPage(page));
  },
});
export { expect } from '@playwright/test';

// @file: tests/order.spec.ts
import { test, expect } from '../fixtures/test.fixture';

test('đặt lệnh sau khi đăng nhập', async ({ loginPage, orderPage }) => {
  await loginPage.goto();
  await loginPage.login('thao@sandemo.test', 'Demo@123');
  await orderPage.goto();
  await orderPage.placeOrder('7203', 100);
  await expect(orderPage.toast).toContainText('Đặt lệnh thành công: MUA 7203 x100');
});`]},
});
