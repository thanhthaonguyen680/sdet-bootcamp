defineExercise({
  id: 'w4.17',
  pw: true,
  exports: ['LoginPage'],
  title: 'Page Object Model',
  desc: `<p>Gom locator và thao tác của trang đăng nhập vào một class, để các test dùng lại. Class <code>LoginPage</code> cần có:</p>
<ul>
<li>Constructor nhận <code>page: Page</code>.</li>
<li>Các thuộc tính locator: <code>emailInput</code>, <code>passwordInput</code>, <code>submitButton</code>, <code>errorMessage</code>.</li>
<li>Method <code>goto()</code>: mở <code>/login</code>.</li>
<li>Method <code>login(email: string, password: string)</code>: điền và bấm đăng nhập.</li>
</ul>
<p>Sau đó viết một test dùng <code>LoginPage</code> để đăng nhập thành công. Bộ chấm cũng sẽ tự dùng class của bạn để kiểm tra.</p>`,
  hints: [
    'Khai báo thuộc tính có kiểu: <code>readonly emailInput: Locator;</code> rồi gán trong constructor: <code>this.emailInput = page.getByLabel(\'Email\');</code>',
    'Viết tắt TypeScript: <code>constructor(private page: Page) {}</code> vừa khai báo vừa gán <code>this.page</code>.',
    'Trong test: <code>const loginPage = new LoginPage(page); await loginPage.goto(); await loginPage.login(\'thao@sandemo.test\', \'Demo@123\');</code>'],
  starter: String.raw`import { test, expect, Page, Locator } from '@playwright/test';

class LoginPage {
  readonly emailInput: Locator;
  // khai báo thêm các locator khác

  constructor(private page: Page) {
    this.emailInput = page.getByLabel('Email');
  }

  async goto() {

  }

  async login(email: string, password: string) {

  }
}

test('đăng nhập bằng Page Object', async ({ page }) => {

});
`,
  tests: PWG + String.raw`
check('Có class LoginPage', () => expect(typeof __pw.exports.LoginPage === 'function', 'Chưa có class LoginPage').toBe(true));
check('Các thuộc tính là locator', () => { const lp = new __pw.exports.LoginPage(H.page()); for (const k of ['emailInput', 'passwordInput', 'submitButton', 'errorMessage']) expect(H.isLocator(lp[k]), 'Thuộc tính ' + k + ' chưa phải locator').toBe(true); });
check('errorMessage trỏ đúng khung thông báo lỗi', async () => { const lp = new __pw.exports.LoginPage(H.page()); await lp.goto(); await lp.login('thao@sandemo.test', 'sai-mat-khau'); const els = H.resolve(lp.errorMessage); expect(els.length === 1 && els[0] === H.doc().querySelector('.error'), 'errorMessage đang khớp ' + els.length + ' phần tử').toBe(true); });
check('goto() và login() hoạt động', async () => { const lp = new __pw.exports.LoginPage(H.page()); await lp.goto(); expect(H.url(), 'goto() chưa mở /login').toBe('https://sandemo.test/login'); await lp.login('thao@sandemo.test', 'Demo@123'); expect(await H.waitUrl('/dashboard'), 'login() chưa đăng nhập được, URL: ' + H.url()).toBe(true); });
check('Test dùng LoginPage và pass', () => { expect(/new\s+LoginPage\s*\(/.test(__code), 'Test chưa dùng new LoginPage(page)').toBe(true); expect(__passed(), __failMsg()).toBe(true); });
check('Test có assertion', () => expect(__asserts().some(a => a.pass), 'Test chưa kiểm tra gì cả').toBe(true));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Vì sao cần Page Object Model</h3>
<p>Khi có 50 test cùng đăng nhập, locator của ô email lặp lại 50 lần. Dev đổi nhãn "Email" thành "Địa chỉ email" là phải sửa 50 chỗ. Page Object gom locator và thao tác của một trang vào một class; sửa một chỗ, mọi test đều được cập nhật.</p>
<h3>Class trong TypeScript</h3>
{{ex0}}
<ul>
<li><code>readonly</code>: thuộc tính chỉ gán một lần trong constructor.</li>
<li><code>constructor(private page: Page)</code>: cách viết tắt, vừa khai báo thuộc tính <code>page</code> vừa gán giá trị.</li>
<li>Method <code>async</code> vì bên trong có <code>await</code>.</li>
</ul>
<p class="note">Góc QA: POM là câu hỏi gần như chắc chắn gặp trong phỏng vấn SDET. Nguyên tắc chung: page object chứa locator và thao tác, còn <strong>assertion để ở trong test</strong>, để page object dùng lại được cho cả test thành công lẫn thất bại.</p>
<p class="note">Bài 16–18 mở rộng Page Object thành cả một cấu trúc project: BasePage, constants, dữ liệu JSON và fixture.</p>`,
examples:[String.raw`class DashboardPage {
  readonly searchBox: Locator;
  readonly rows: Locator;

  constructor(private page: Page) {
    this.searchBox = page.getByPlaceholder('Tìm mã cổ phiếu');
    this.rows = page.getByRole('row');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async search(keyword: string) {
    await this.searchBox.fill(keyword);
  }
}

test('dùng DashboardPage', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();
  await dashboard.search('Nintendo');
  await expect(dashboard.rows.filter({ hasText: 'Nintendo' })).toBeVisible();
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li>Toàn bộ locator của trang đăng nhập nằm ở một chỗ. Nhãn "Email" đổi thì chỉ sửa một dòng trong constructor.</li>
<li>Test đọc như kịch bản nghiệp vụ: mở trang, đăng nhập, kiểm tra. Người không biết code cũng hiểu.</li>
<li><code>errorMessage</code> để public để test tự kiểm tra; page object không chứa assertion, nên dùng lại được cho test đăng nhập sai.</li>
</ul>`,
examples:[String.raw`import { test, expect, Page, Locator } from '@playwright/test';

class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Mật khẩu');
    this.submitButton = page.getByRole('button', { name: 'Đăng nhập' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

test('đăng nhập bằng Page Object', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('thao@sandemo.test', 'Demo@123');
  await expect(page).toHaveURL(/dashboard/);
});

test('sai mật khẩu, dùng lại cùng Page Object', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('thao@sandemo.test', 'sai');
  await expect(loginPage.errorMessage).toHaveText('Email hoặc mật khẩu không đúng');
});`]},
});
