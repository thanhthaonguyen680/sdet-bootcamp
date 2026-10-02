defineExercise({
  id: 'w4.22',
  pw: true,
  route: '/login',
  files: {
    '.env': String.raw`# Biến môi trường: tài khoản test không nên viết thẳng trong code.
# Viết 2 dòng theo dạng TEN_BIEN=gia_tri:
#   TEST_USER_EMAIL     email tài khoản test
#   TEST_USER_PASSWORD  mật khẩu tài khoản test
# (Tài khoản thử của Sàn Demo: thao@sandemo.test / Demo@123)
`,
    'playwright.config.ts': CONFIG_REF,
    'constants/routes.ts': String.raw`// Mục đích: tập trung mọi đường dẫn của ứng dụng.
// Cần export: ROUTES gồm login, dashboard.
// Không import tệp nào.
`,
    'constants/messages.ts': String.raw`// Mục đích: tập trung các câu thông báo mà test cần so sánh.
// Cần export: MESSAGES gồm emptyEmail, emptyPassword, wrongCredentials.
// Mẹo: thử bấm Đăng nhập với ô trống, với mật khẩu sai trong tab Trang web để biết chính xác từng câu.
`,
    'locators/login.locators.ts': String.raw`// Mục đích: chữ dùng để tìm phần tử trên trang Đăng nhập (nhãn, tên nút).
// Cần export: LOGIN_LOCATORS gồm emailLabel, passwordLabel, submitButton.
// Không import tệp nào.
`,
    'types/user.ts': String.raw`// Mục đích: kiểu dữ liệu dùng chung.
// Cần export:
//   interface User             { email, password }
//   interface InvalidLoginCase { name, email, password, expected }
//     (expected là TÊN KEY trong MESSAGES, ví dụ "emptyEmail")
`,
    'utils/helpers.ts': String.raw`// Mục đích: hàm tiện ích dùng ở nhiều nơi.
// Cần export: function requireEnv(name: string): string
//   - trả về process.env[name]
//   - nếu không có biến đó thì throw new Error(...) báo rõ tên biến bị thiếu
`,
    'test-data/users.json': String.raw`{
  "invalidLogins": []
}
`,
    'pages/BasePage.ts': String.raw`// Mục đích: class cha của mọi Page Object.
// Cần export: class BasePage
//   - constructor(protected page: Page)
//   - heading: Locator        tiêu đề cấp 1 của trang
//   - async open(path: string) mở một đường dẫn
// Import: Page, Locator từ '@playwright/test'
`,
    'pages/LoginPage.ts': String.raw`// Mục đích: Page Object của trang Đăng nhập.
// Cần export: class LoginPage extends BasePage
//   - emailInput, passwordInput, submitButton, errorMessage: Locator
//     (tạo từ LOGIN_LOCATORS, errorMessage là khung có role "alert")
//   - async goto()                mở ROUTES.login
//   - async login(user: User)     điền và bấm đăng nhập
// Import: BasePage, ROUTES, LOGIN_LOCATORS, User
`,
    'pages/DashboardPage.ts': String.raw`// Mục đích: Page Object của trang Bảng giá (trang sau khi đăng nhập).
// Cần export: class DashboardPage extends BasePage
//   - greeting: Locator     dòng "Xin chào, ..." ở góc trên
//   - async goto()          mở ROUTES.dashboard
`,
    'fixtures/test.fixture.ts': String.raw`// Mục đích: tạo sẵn Page Object và tài khoản test cho mọi test.
// Cần export:
//   - test: mở rộng từ test của '@playwright/test' với 3 fixture:
//       loginPage: LoginPage, dashboardPage: DashboardPage,
//       validUser: User  (lấy email, mật khẩu bằng requireEnv)
//   - expect (export lại từ '@playwright/test')
`,
    'tests/auth/login.spec.ts': String.raw`// Mục đích: kịch bản test đăng nhập. Chỉ có bước nghiệp vụ và assertion.
// Yêu cầu:
//   1. Test đăng nhập thành công: dùng validUser, kiểm tra URL ROUTES.dashboard và dòng chào hiển thị.
//   2. Với mỗi phần tử trong invalidLogins của users.json, sinh một test kiểm tra đúng MESSAGES[expected].
// Không viết cứng email, mật khẩu, URL hay câu thông báo trong tệp này.
// Import test, expect từ tệp fixture (không phải từ '@playwright/test').
`,
  },
  open: 'constants/routes.ts',
  projectName: 'sandemo-login',
  title: 'Dự án POM: luồng Đăng nhập',
  desc: `<p>Tự dựng một project Playwright hoàn chỉnh cho chức năng Đăng nhập. Mỗi tệp trong cây thư mục bên trái editor hiện chỉ có phần mô tả; bạn tự viết toàn bộ code, kể cả các dòng <code>import</code>/<code>export</code> để nối các tệp với nhau.</p>
<p><strong>Thứ tự nên làm</strong> (từ tệp không phụ thuộc ai tới tệp dùng mọi thứ):</p>
<pre>.env → constants/ → locators/ → types/ → utils/ → test-data/
     → pages/BasePage → LoginPage, DashboardPage
     → fixtures/test.fixture → tests/auth/login.spec</pre>
<p>Bấm <strong>Chạy</strong> bất cứ lúc nào để thử. Nếu một tệp import sai đường dẫn, hoặc import một tên chưa được <code>export</code>, sân tập sẽ báo đúng tệp bị lỗi.</p>
<p class="note">Bộ chấm kiểm tra: đủ tệp, import/export đúng, các class hoạt động khi được gọi độc lập, tệp test không viết cứng dữ liệu, mọi test pass, và test phát hiện được 2 bug cài sẵn.</p>`,
  hints: [
    'Import giữa các tệp dùng đường dẫn tương đối, không có đuôi .ts. Từ <code>pages/LoginPage.ts</code>: <code>import { ROUTES } from \'../constants/routes\';</code>, <code>import { BasePage } from \'./BasePage\';</code>. Từ <code>tests/auth/login.spec.ts</code> phải lùi 2 cấp: <code>\'../../fixtures/test.fixture\'</code>.',
    'Các câu thông báo: <code>Vui lòng nhập email</code>, <code>Vui lòng nhập mật khẩu</code>, <code>Email hoặc mật khẩu không đúng</code>. Trong users.json, <code>expected</code> ghi tên key, ví dụ <code>"emptyEmail"</code>; trong test tra câu thật bằng <code>MESSAGES[c.expected]</code>.',
    'Fixture lấy tài khoản từ .env: <code>validUser: async ({}, use) =&gt; { await use({ email: requireEnv(\'TEST_USER_EMAIL\'), password: requireEnv(\'TEST_USER_PASSWORD\') }); }</code>. Xem lời giải nếu bị kẹt ở cách nối các tệp.'],
  tests: PWG + PROJG + String.raw`
const L = ['.env', 'constants/routes.ts', 'constants/messages.ts', 'locators/login.locators.ts', 'types/user.ts', 'utils/helpers.ts', 'pages/BasePage.ts', 'pages/LoginPage.ts', 'pages/DashboardPage.ts', 'fixtures/test.fixture.ts', 'tests/auth/login.spec.ts'];
const X = __pw.exports;
check('Đã viết code trong mọi tệp', () => __need(L));
check('Mọi import trỏ tới tệp có thật và tên đã được export', () => { const pr = __importProblems(); expect(pr.length === 0, pr.join('\n')).toBe(true); });
check('.env có TEST_USER_EMAIL và TEST_USER_PASSWORD đúng', () => { const env = {}; for (const l of (F['.env'] || '').split('\n')) { const m = l.trim().match(/^(\w+)\s*=\s*(.*)$/); if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, ''); } expect(env.TEST_USER_EMAIL, 'TEST_USER_EMAIL').toBe('thao@sandemo.test'); expect(env.TEST_USER_PASSWORD, 'TEST_USER_PASSWORD').toBe('Demo@123'); });
check('Constants đúng giá trị', () => {
  expect(X.ROUTES && X.ROUTES.login, 'ROUTES.login').toBe('/login'); expect(X.ROUTES.dashboard, 'ROUTES.dashboard').toBe('/dashboard');
  expect(X.MESSAGES && X.MESSAGES.emptyEmail, 'MESSAGES.emptyEmail').toBe('Vui lòng nhập email'); expect(X.MESSAGES.emptyPassword, 'MESSAGES.emptyPassword').toBe('Vui lòng nhập mật khẩu'); expect(X.MESSAGES.wrongCredentials, 'MESSAGES.wrongCredentials').toBe('Email hoặc mật khẩu không đúng');
  expect(!!X.LOGIN_LOCATORS && typeof X.LOGIN_LOCATORS === 'object', 'Chưa có LOGIN_LOCATORS').toBe(true);
});
check('requireEnv đọc được .env và báo lỗi khi thiếu biến', () => { expect(typeof X.requireEnv, 'Chưa có hàm requireEnv').toBe('function'); expect(X.requireEnv('TEST_USER_EMAIL')).toBe('thao@sandemo.test'); let threw = false; try { X.requireEnv('BIEN_KHONG_TON_TAI'); } catch (e) { threw = true; } expect(threw, 'requireEnv phải throw khi biến không tồn tại').toBe(true); });
check('LoginPage và DashboardPage kế thừa BasePage', () => { for (const k of ['LoginPage', 'DashboardPage']) expect(typeof X[k] === 'function' && typeof X.BasePage === 'function' && X[k].prototype instanceof X.BasePage, k + ' chưa extends BasePage').toBe(true); });
check('LoginPage.login(user) và DashboardPage.greeting hoạt động', async () => {
  const page = H.page(); const lp = new X.LoginPage(page); await lp.goto();
  expect(H.url(), 'goto() chưa mở trang đăng nhập').toBe('https://sandemo.test/login');
  await lp.login({ email: 'thao@sandemo.test', password: 'Demo@123' });
  expect(await H.waitUrl('/dashboard'), 'login(user) chưa đăng nhập được, URL: ' + H.url()).toBe(true);
  const dp = new X.DashboardPage(page); const g = H.resolve(dp.greeting);
  expect(g.length === 1 && /Xin chào/.test(g[0].textContent), 'greeting chưa trỏ đúng dòng "Xin chào, Thao"').toBe(true);
});
check('LoginPage.errorMessage trỏ đúng khung lỗi', async () => { const lp = new X.LoginPage(H.page()); await lp.goto(); await lp.login({ email: 'thao@sandemo.test', password: 'sai' }); const e = H.resolve(lp.errorMessage); expect(e.length === 1 && e[0] === H.doc().querySelector('.error'), 'errorMessage đang khớp ' + e.length + ' phần tử').toBe(true); });
let cases = [];
check('users.json có ít nhất 3 trường hợp sai, expected là key của MESSAGES', () => { let d; try { d = JSON.parse(F['test-data/users.json']); } catch (e) { expect(false, 'users.json chưa hợp lệ').toBe(true); } cases = d.invalidLogins || []; expect(cases.length >= 3, 'Cần ít nhất 3 trường hợp').toBe(true); for (const c of cases) expect(!!(X.MESSAGES && X.MESSAGES[c.expected]), '"' + c.expected + '" không phải key của MESSAGES').toBe(true); });
check('Tệp test không viết cứng dữ liệu và không tự new Page Object', () => { const t = __body(F['tests/auth/login.spec.ts']); expect(/sandemo\.test|Demo@123/.test(t), 'Còn email/mật khẩu viết cứng').toBe(false); expect(/Vui lòng|không đúng/.test(t), 'Còn câu thông báo viết cứng').toBe(false); expect(/['"]\/(login|dashboard)['"]/.test(t), 'Còn URL viết cứng').toBe(false); expect(/new\s+(LoginPage|DashboardPage)/.test(t), 'Page Object phải được tạo trong fixture').toBe(false); expect(/fixtures\/test\.fixture/.test(t), 'Hãy import test từ tệp fixture').toBe(true); });
check('Số test = 1 + số trường hợp sai, tất cả pass', () => { expect(__pw.tests.length, 'Số test').toBe(1 + cases.length); expect(__passed(), __failMsg()).toBe(true); });
check('Phát hiện bug "đăng nhập xong không chuyển trang"', async () => { const r = await H.rerun('login-no-redirect'); expect(r.some(t => t.status === 'failed')).toBe(true); });
check('Phát hiện bug "sai câu thông báo"', async () => { const r = await H.rerun('login-error-text'); expect(r.some(t => t.status === 'failed')).toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Từ bài tập lẻ đến project thật</h3>
<p>Ba bài cuối mô phỏng đúng cách làm việc thật: mỗi tệp một nội dung, các tệp nối với nhau bằng <code>import</code>/<code>export</code>. Cây thư mục nằm bên trái editor; bấm vào tên tệp để mở. Tệp đã sửa có dấu chấm màu cam.</p>
<h3>export và import</h3>
<p>Mỗi tệp TypeScript là một <strong>module</strong> riêng: biến, class khai báo trong tệp chỉ dùng được bên trong tệp đó, trừ khi được <code>export</code>. Tệp khác muốn dùng thì <code>import</code> đúng tên.</p>
{{ex0}}
<h3>Đường dẫn tương đối</h3>
${TRACE(['Đang ở tệp', 'Muốn dùng', 'Viết'], [['pages/LoginPage.ts', 'pages/BasePage.ts', "<code>'./BasePage'</code> (cùng thư mục)"], ['pages/LoginPage.ts', 'constants/routes.ts', "<code>'../constants/routes'</code> (lùi 1 cấp)"], ['tests/auth/login.spec.ts', 'fixtures/test.fixture.ts', "<code>'../../fixtures/test.fixture'</code> (lùi 2 cấp)"], ['tests/auth/login.spec.ts', 'test-data/users.json', "<code>'../../test-data/users.json'</code> (tệp JSON giữ đuôi .json)"]])}
<p>Không ghi đuôi <code>.ts</code>. Thư viện cài từ npm (như <code>@playwright/test</code>) thì viết thẳng tên, không có <code>./</code>.</p>
<h3>Biến môi trường với .env</h3>
<p>Tài khoản, mật khẩu, URL từng môi trường không nên nằm trong code (dễ lộ khi đưa lên Git, khó đổi môi trường). Chúng được đặt trong tệp <code>.env</code> và đọc qua <code>process.env.TEN_BIEN</code>. Trong project thật cần cài thư viện <code>dotenv</code>; sân tập đã tự nạp sẵn.</p>
<h3>Thứ tự nên viết</h3>
<p>Viết từ tệp không phụ thuộc ai (constants, types) lên dần tới tệp dùng mọi thứ (test). Mỗi khi xong một tầng, bấm Chạy để chắc chắn chưa có lỗi import trước khi đi tiếp.</p>
<p class="note">Góc QA: tệp <code>playwright.config.ts</code> trong cây chỉ để tham khảo, sân tập không chạy nó. Khi chuyển sang máy thật, chép nguyên cấu trúc thư mục này vào project tạo bằng <code>npm init playwright@latest</code> là chạy được.</p>`,
examples:[L(
'// @file: constants/routes.ts',
'export const ROUTES = { orders: \'/orders\' } as const;',
'',
'// @file: pages/OrdersPage.ts',
'import { Page, Locator } from \'@playwright/test\';',
'import { ROUTES } from \'../constants/routes\';',
'',
'export class OrdersPage {',
'  readonly count: Locator;',
'  constructor(private page: Page) {',
'    this.count = page.getByTestId(\'order-count\');',
'  }',
'  async goto() {',
'    await this.page.goto(ROUTES.orders);',
'  }',
'}',
'',
'// @file: tests/orders.spec.ts',
'import { test, expect } from \'@playwright/test\';',
'import { OrdersPage } from \'../pages/OrdersPage\';',
'',
'test(\'có 3 lệnh ban đầu\', async ({ page }) => {',
'  const orders = new OrdersPage(page);',
'  await orders.goto();',
'  await expect(orders.count).toHaveText(\'3\');',
'});')]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
<p>Bấm <strong>Chạy lời giải</strong> để chạy toàn bộ project mẫu. Mỗi tệp bắt đầu bằng dòng <code>// @file:</code>; hãy chép từng phần vào đúng tệp trong cây thư mục nếu muốn đối chiếu.</p>
{{ex0}}
<h3>Các tệp nối với nhau thế nào</h3>
${TRACE(['Tệp', 'Dùng', 'Được dùng bởi'], [['constants/*, locators/*, types/*', '(không dùng ai)', 'pages, fixtures, tests'], ['utils/helpers.ts', '.env (qua process.env)', 'fixtures'], ['pages/BasePage.ts', '@playwright/test', 'LoginPage, DashboardPage'], ['pages/LoginPage.ts', 'BasePage, ROUTES, LOGIN_LOCATORS, User', 'fixtures'], ['fixtures/test.fixture.ts', 'pages, helpers, User', 'tests'], ['tests/auth/login.spec.ts', 'fixtures, users.json, ROUTES, MESSAGES', '(không ai)']])}
<h3>Những điểm đáng chú ý</h3>
<ul>
<li><code>validUser</code> là fixture không cần <code>page</code>: <code>async ({}, use)</code>. Tài khoản đi từ .env → requireEnv → fixture → test, không lộ trong tệp test.</li>
<li>users.json chỉ lưu tên key (<code>"emptyEmail"</code>), câu thật nằm duy nhất ở messages.ts. Đổi câu thông báo chỉ sửa một chỗ.</li>
<li><code>login(user: User)</code> nhận object: sau này thêm trường (mã OTP chẳng hạn) không phải sửa mọi nơi gọi hàm.</li>
</ul>`,
examples:[String.raw`// @file: .env
TEST_USER_EMAIL=thao@sandemo.test
TEST_USER_PASSWORD=Demo@123

// @file: constants/routes.ts
export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
} as const;

// @file: constants/messages.ts
export const MESSAGES = {
  emptyEmail: 'Vui lòng nhập email',
  emptyPassword: 'Vui lòng nhập mật khẩu',
  wrongCredentials: 'Email hoặc mật khẩu không đúng',
} as const;

// @file: locators/login.locators.ts
export const LOGIN_LOCATORS = {
  emailLabel: 'Email',
  passwordLabel: 'Mật khẩu',
  submitButton: 'Đăng nhập',
} as const;

// @file: types/user.ts
export interface User {
  email: string;
  password: string;
}

export interface InvalidLoginCase {
  name: string;
  email: string;
  password: string;
  expected: string;
}

// @file: utils/helpers.ts
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error('Thiếu biến môi trường ' + name + ' trong .env');
  return value;
}

// @file: test-data/users.json
{
  "invalidLogins": [
    { "name": "bỏ trống email", "email": "", "password": "Demo@123", "expected": "emptyEmail" },
    { "name": "bỏ trống mật khẩu", "email": "thao@sandemo.test", "password": "", "expected": "emptyPassword" },
    { "name": "sai mật khẩu", "email": "thao@sandemo.test", "password": "sai-mat-khau", "expected": "wrongCredentials" }
  ]
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
import { User } from '../types/user';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(LOGIN_LOCATORS.emailLabel);
    this.passwordInput = page.getByLabel(LOGIN_LOCATORS.passwordLabel);
    this.submitButton = page.getByRole('button', { name: LOGIN_LOCATORS.submitButton });
    this.errorMessage = page.getByRole('alert');
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

export class DashboardPage extends BasePage {
  readonly greeting: Locator;

  constructor(page: Page) {
    super(page);
    this.greeting = page.getByText('Xin chào');
  }

  async goto() {
    await this.open(ROUTES.dashboard);
  }
}

// @file: fixtures/test.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { requireEnv } from '../utils/helpers';
import { User } from '../types/user';

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  validUser: User;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  validUser: async ({}, use) => {
    await use({ email: requireEnv('TEST_USER_EMAIL'), password: requireEnv('TEST_USER_PASSWORD') });
  },
});

export { expect } from '@playwright/test';

// @file: tests/auth/login.spec.ts
import { test, expect } from '../../fixtures/test.fixture';
import { ROUTES } from '../../constants/routes';
import { MESSAGES } from '../../constants/messages';
import { InvalidLoginCase } from '../../types/user';
import users from '../../test-data/users.json';

test('đăng nhập thành công', async ({ page, loginPage, dashboardPage, validUser }) => {
  await loginPage.goto();
  await loginPage.login(validUser);
  await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
  await expect(dashboardPage.greeting).toBeVisible();
});

const invalidLogins: InvalidLoginCase[] = users.invalidLogins;

for (const c of invalidLogins) {
  test('đăng nhập lỗi: ' + c.name, async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login({ email: c.email, password: c.password });
    await expect(loginPage.errorMessage).toHaveText(MESSAGES[c.expected as keyof typeof MESSAGES]);
    await expect(page).toHaveURL(new RegExp(ROUTES.login));
  });
}`]},
});
