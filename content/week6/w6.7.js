defineExercise({
  id: 'w6.7',
  pw: true,
  route: '/login',
  exports: ['LoginPage'],
  title: 'Refactor sang Page Object cùng AI',
  desc: `<p>Bạn nhờ AI: <em>"Chuyển test đăng nhập sai mật khẩu sang Page Object Model"</em>. AI trả về class <code>LoginPage</code> và test nằm sẵn trong editor. Code trông gọn gàng, nhưng chạy thử sẽ lỗi; và kể cả khi hết lỗi, test vẫn quá yếu.</p>
<p>Hãy sửa để:</p>
<ul>
<li>Mỗi locator trong class trỏ đúng 1 phần tử, chỉ dùng <code>getBy...</code>.</li>
<li><code>login()</code> chờ thao tác bấm xong (có <code>await</code>).</li>
<li>Test kiểm tra đúng <strong>nội dung</strong> thông báo lỗi, không chỉ kiểm tra có hiện hay không.</li>
</ul>
<p class="note">Bộ chấm dùng class của bạn để đăng nhập thật, và chạy lại test trên phiên bản có bug: thông báo lỗi bị đổi thành một câu chung chung.</p>`,
  hints: [
    'Bấm Chạy và đọc lỗi đầu tiên. Nhãn ô mật khẩu trên trang là tiếng Việt. <code>getByText(\'Đăng nhập\')</code> khớp cả tiêu đề, nút và chữ "Ghi nhớ đăng nhập".',
    'Khung lỗi có role "alert": <code>page.getByRole(\'alert\')</code>. Nút: <code>page.getByRole(\'button\', { name: \'Đăng nhập\' })</code>.',
    'Câu lỗi khi sai mật khẩu: <code>Email hoặc mật khẩu không đúng</code>. Dùng <code>toHaveText</code> để bắt được bug đổi câu thông báo.'],
  starter: String.raw`import { test, expect, Page, Locator } from '@playwright/test';

// Page Object do AI viết. Chạy thử sẽ thấy lỗi.
class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByText('Đăng nhập');
    this.errorMessage = page.locator('.error-message');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    this.submitButton.click();
  }
}

test('đăng nhập sai mật khẩu', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('thao@sandemo.test', 'sai-mat-khau');
  await expect(loginPage.errorMessage).toBeVisible();
});
`,
  tests: PWG + AWAIT_LINT + String.raw`
const LP = () => __pw.exports.LoginPage;
check('Có class LoginPage', () => expect(typeof LP() === 'function', 'Chưa có class LoginPage').toBe(true));
check('passwordInput trỏ đúng ô mật khẩu', async () => { const lp = new (LP())(H.page()); await lp.goto(); const e = H.resolve(lp.passwordInput); expect(e.length === 1 && e[0] === H.doc().getElementById('password'), 'passwordInput đang khớp ' + e.length + ' phần tử').toBe(true); });
check('submitButton khớp đúng 1 nút Đăng nhập', async () => { const lp = new (LP())(H.page()); await lp.goto(); const e = H.resolve(lp.submitButton); expect(e.length === 1 && e[0].matches('button[type=submit]'), 'submitButton đang khớp ' + e.length + ' phần tử').toBe(true); });
check('errorMessage trỏ đúng khung thông báo lỗi', async () => { const lp = new (LP())(H.page()); await lp.goto(); await lp.login('thao@sandemo.test', 'sai'); const e = H.resolve(lp.errorMessage); expect(e.length === 1 && e[0] === H.doc().querySelector('.error'), 'errorMessage đang khớp ' + e.length + ' phần tử').toBe(true); });
check('login() đăng nhập được bằng tài khoản đúng', async () => { const lp = new (LP())(H.page()); await lp.goto(); await lp.login('thao@sandemo.test', 'Demo@123'); expect(await H.waitUrl('/dashboard'), 'login() chưa đăng nhập được, URL: ' + H.url()).toBe(true); });
check('Không dùng CSS, mọi thao tác đều có await', () => { expect(/\.locator\(/.test(__code), 'Vẫn còn page.locator(...)').toBe(false); const bad = __noAwait(); expect(bad.length === 0, 'Thiếu await: ' + bad.join(' | ')).toBe(true); });
check('Test pass', () => expect(__passed(), __failMsg()).toBe(true));
check('Phát hiện bug "sai câu thông báo"', async () => { const r = await H.rerun('login-error-text'); expect(r.some(t => t.status === 'failed'), 'Thông báo lỗi bị đổi mà test vẫn pass. toBeVisible() chỉ kiểm tra có hiện, hãy kiểm tra đúng câu chữ').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Nhờ AI refactor</h3>
<p>Refactor là đổi cấu trúc code mà <strong>không đổi hành vi</strong>. AI làm việc này nhanh: gom locator vào class, tách hàm, đặt tên lại. Prompt nên có:</p>
<ul>
<li>Code hiện tại <strong>đang chạy đúng</strong> (để AI có điểm xuất phát chính xác).</li>
<li>Cấu trúc mong muốn: tên class, tên method, dùng <code>getBy...</code>.</li>
<li>Ràng buộc: "Giữ nguyên các assertion", "Không đổi locator nếu không cần".</li>
</ul>
<h3>Review kết quả refactor</h3>
<ol>
<li><strong>Chạy test trước và sau</strong>: cùng kết quả mới là refactor đúng.</li>
<li><strong>Kiểm tra từng locator</strong> AI viết lại: AI hay "tiện tay" đổi nhãn sang tiếng Anh hoặc đổi sang CSS.</li>
<li><strong>Kiểm tra mọi <code>await</code></strong> trong method: thiếu một <code>await</code> trong Page Object thì mọi test dùng nó đều chập chờn.</li>
<li><strong>So assertion</strong>: AI hay làm yếu assertion khi viết lại (<code>toHaveText</code> thành <code>toBeVisible</code>).</li>
</ol>
${ANAT("async login(email: string, password: string) {\n  await this.emailInput.fill(email);\n  await this.passwordInput.fill(password);\n  ", ["this.submitButton.click();", "Thiếu <code>await</code>: method kết thúc trước khi bấm xong. Test gọi <code>login()</code> rồi kiểm tra ngay có thể thấy trang cũ."], "\n}")}
<p class="note">Góc QA: lỗi trong Page Object nguy hiểm hơn lỗi trong một test, vì hàng chục test cùng dùng nó.</p>`,
examples:[]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Đối chiếu với bản của AI</h3>
<ul>
<li><code>getByLabel('Password')</code>: nhãn trên trang là tiếng Việt, đổi thành <code>getByLabel('Mật khẩu')</code>.</li>
<li><code>getByText('Đăng nhập')</code> khớp cả tiêu đề, nút và chữ "Ghi nhớ đăng nhập": đổi sang <code>getByRole('button', ...)</code>.</li>
<li><code>locator('.error-message')</code>: class AI đoán không tồn tại. Khung lỗi có role <code>alert</code>.</li>
<li><code>login()</code> thiếu <code>await</code> ở bước bấm.</li>
<li><code>toBeVisible()</code> đổi thành <code>toHaveText(...)</code> để bắt được bug đổi câu thông báo.</li>
</ul>`,
examples:[{ run:false, code:String.raw`import { test, expect, Page, Locator } from '@playwright/test';

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

test('đăng nhập sai mật khẩu', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('thao@sandemo.test', 'sai-mat-khau');
  await expect(loginPage.errorMessage).toHaveText('Email hoặc mật khẩu không đúng');
});` }]},
});
