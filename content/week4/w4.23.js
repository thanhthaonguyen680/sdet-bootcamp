defineExercise({
  id: 'w4.23',
  pw: true,
  route: '/register',
  files: {
    'playwright.config.ts': CONFIG_REF,
    'constants/routes.ts': String.raw`// Cần export: ROUTES gồm login, register, dashboard.
`,
    'constants/messages.ts': String.raw`// Cần export: MESSAGES gồm các câu thông báo của trang Đăng ký và câu báo đăng ký thành công ở trang Đăng nhập.
// Gợi ý tên key: emptyName, invalidEmail, usedEmail, shortPassword, confirmMismatch, termsRequired, registerSuccess
// Hãy thử từng trường hợp trong tab Trang web (trang /register) để biết chính xác từng câu.
`,
    'locators/register.locators.ts': String.raw`// Cần export: REGISTER_LOCATORS gồm nhãn các ô (họ tên, email, mật khẩu, nhập lại mật khẩu),
// chữ của ô tích điều khoản và tên nút Đăng ký.
// Chú ý: "Mật khẩu" và "Nhập lại mật khẩu" có phần chữ trùng nhau.
`,
    'types/user.ts': String.raw`// Cần export:
//   interface NewUser { fullName, email, password, confirmPassword, acceptTerms: boolean }
//   interface InvalidRegisterCase { name, overrides: Partial<NewUser>, expected }
//     (overrides là những trường bị làm sai so với một người dùng hợp lệ; expected là key trong MESSAGES)
`,
    'utils/helpers.ts': String.raw`// Cần export:
//   function uniqueEmail(prefix?: string): string
//     mỗi lần gọi trả về một email khác nhau, đuôi @sandemo.test
//   function buildNewUser(overrides?: Partial<NewUser>): NewUser
//     trả về một người dùng hợp lệ (email lấy từ uniqueEmail), rồi ghi đè bằng overrides
`,
    'test-data/register.json': String.raw`{
  "invalidCases": []
}
`,
    'pages/BasePage.ts': String.raw`// Cần export: class BasePage với constructor(protected page: Page), heading, async open(path).
`,
    'pages/RegisterPage.ts': String.raw`// Cần export: class RegisterPage extends BasePage
//   - Locator cho các ô, ô tích điều khoản, nút Đăng ký, errorMessage
//   - async goto()
//   - async register(user: NewUser)  (chỉ tích điều khoản khi user.acceptTerms là true)
`,
    'pages/LoginPage.ts': String.raw`// Cần export: class LoginPage extends BasePage
//   - successNotice: Locator   thông báo "đăng ký thành công" hiện trên trang Đăng nhập
//   - async login(email: string, password: string)
`,
    'pages/DashboardPage.ts': String.raw`// Cần export: class DashboardPage extends BasePage với greeting: Locator.
`,
    'fixtures/test.fixture.ts': String.raw`// Cần export test với các fixture: registerPage, loginPage, dashboardPage,
// newUser (mỗi test một người dùng mới, tạo bằng buildNewUser), và export lại expect.
`,
    'tests/auth/register.spec.ts': String.raw`// Yêu cầu:
//   1. Đăng ký thành công bằng newUser → về trang Đăng nhập, thấy thông báo thành công
//      → đăng nhập bằng chính tài khoản vừa tạo → thấy lời chào có họ tên.
//   2. Mỗi phần tử trong invalidCases của register.json sinh một test kiểm tra đúng thông báo lỗi.
// Không viết cứng email hay câu thông báo trong tệp này.
`,
  },
  open: 'constants/routes.ts',
  projectName: 'sandemo-register',
  title: 'Dự án POM: luồng Đăng ký',
  desc: `<p>Project thứ hai: chức năng <strong>Đăng ký tài khoản</strong> ở trang <code>/register</code> (từ trang Đăng nhập bấm "Tạo tài khoản mới"). Mở tab Trang web và tự khám phá trang trước khi viết code:</p>
<ul>
<li>Thử bỏ trống, nhập sai từng ô để thấy các thông báo lỗi.</li>
<li>Đăng ký thành công sẽ chuyển về trang Đăng nhập kèm một thông báo; tài khoản vừa tạo đăng nhập được ngay.</li>
</ul>
<p>Điểm mới so với bài 19:</p>
<ul>
<li><strong>Dữ liệu không được trùng:</strong> mỗi lần chạy phải đăng ký một email mới, vì vậy cần hàm <code>uniqueEmail()</code>.</li>
<li><strong>Trường hợp sai mô tả bằng phần khác biệt:</strong> mỗi case trong <code>register.json</code> chỉ ghi các trường bị làm sai (<code>overrides</code>), phần còn lại lấy từ một người dùng hợp lệ.</li>
<li>Nhãn "Mật khẩu" và "Nhập lại mật khẩu" trùng một phần chữ, cần locator chính xác.</li>
</ul>
<p class="note">Bộ chấm yêu cầu ít nhất 4 trường hợp sai, trong đó phải có trường hợp mật khẩu nhập lại không khớp; trang sẽ bị cài bug bỏ qua kiểm tra này để xem test của bạn có bắt được không.</p>`,
  hints: [
    'Luồng thành công đi qua 3 trang: RegisterPage → LoginPage (kiểm tra <code>successNotice</code>) → DashboardPage (kiểm tra <code>greeting</code> chứa <code>newUser.fullName</code>).',
    'Các câu thông báo: <code>Vui lòng nhập họ và tên</code>, <code>Email không hợp lệ</code>, <code>Email đã được sử dụng</code>, <code>Mật khẩu phải có ít nhất 8 ký tự</code>, <code>Mật khẩu nhập lại không khớp</code>, <code>Vui lòng đồng ý với điều khoản</code>, và ở trang Đăng nhập: <code>Đăng ký thành công. Vui lòng đăng nhập.</code>',
    '<code>getByLabel(\'Mật khẩu\', { exact: true })</code> để không khớp cả ô "Nhập lại mật khẩu". <code>buildNewUser</code> dùng spread: <code>return { ...macDinh, ...overrides };</code> Email đã tồn tại sẵn: <code>thao@sandemo.test</code>.'],
  tests: PWG + PROJG + String.raw`
const L = ['constants/routes.ts', 'constants/messages.ts', 'locators/register.locators.ts', 'types/user.ts', 'utils/helpers.ts', 'pages/BasePage.ts', 'pages/RegisterPage.ts', 'pages/LoginPage.ts', 'pages/DashboardPage.ts', 'fixtures/test.fixture.ts', 'tests/auth/register.spec.ts'];
const X = __pw.exports;
check('Đã viết code trong mọi tệp', () => __need(L));
check('Mọi import trỏ tới tệp có thật và tên đã được export', () => { const pr = __importProblems(); expect(pr.length === 0, pr.join('\n')).toBe(true); });
check('ROUTES có login, register, dashboard', () => { expect(X.ROUTES && X.ROUTES.register, 'ROUTES.register').toBe('/register'); expect(X.ROUTES.login).toBe('/login'); expect(X.ROUTES.dashboard).toBe('/dashboard'); });
check('uniqueEmail sinh email mới mỗi lần gọi', () => { expect(typeof X.uniqueEmail, 'Chưa có uniqueEmail').toBe('function'); const a = X.uniqueEmail(), b = X.uniqueEmail(); expect(a !== b, 'Hai lần gọi trả về cùng một email').toBe(true); expect(/^[^\s@]+@sandemo\.test$/.test(a), 'Email chưa đúng dạng ...@sandemo.test: ' + a).toBe(true); });
check('buildNewUser trả về người dùng hợp lệ và áp dụng overrides', () => { expect(typeof X.buildNewUser, 'Chưa có buildNewUser').toBe('function'); const u = X.buildNewUser(); for (const k of ['fullName', 'email', 'password', 'confirmPassword']) expect(typeof u[k] === 'string' && u[k].length > 0, 'Thiếu ' + k).toBe(true); expect(u.password === u.confirmPassword && u.password.length >= 8 && u.acceptTerms === true, 'Người dùng mặc định phải hợp lệ').toBe(true); const v = X.buildNewUser({ fullName: '' }); expect(v.fullName, 'overrides chưa được áp dụng').toBe(''); expect(v.email !== u.email, 'Mỗi người dùng phải có email khác nhau').toBe(true); });
check('Các Page Object kế thừa BasePage', () => { for (const k of ['RegisterPage', 'LoginPage', 'DashboardPage']) expect(typeof X[k] === 'function' && typeof X.BasePage === 'function' && X[k].prototype instanceof X.BasePage, k + ' chưa extends BasePage').toBe(true); });
check('RegisterPage.register() đăng ký được và LoginPage.successNotice đúng', async () => {
  const page = H.page(); const rp = new X.RegisterPage(page); await rp.goto();
  expect(H.url(), 'goto() chưa mở trang đăng ký').toBe('https://sandemo.test/register');
  await rp.register({ fullName: 'Kiểm Thử', email: 'grader' + Date.now() + '@sandemo.test', password: 'Matkhau@123', confirmPassword: 'Matkhau@123', acceptTerms: true });
  expect(await H.waitUrl(/\/login/), 'register() chưa đăng ký được, URL: ' + H.url()).toBe(true);
  const n = H.resolve(new X.LoginPage(page).successNotice);
  expect(n.length === 1 && /thành công/.test(n[0].textContent), 'successNotice chưa trỏ đúng thông báo').toBe(true);
});
let cases = [];
check('register.json có ít nhất 4 trường hợp, có case mật khẩu nhập lại không khớp', () => { let d; try { d = JSON.parse(F['test-data/register.json']); } catch (e) { expect(false, 'register.json chưa hợp lệ').toBe(true); } cases = d.invalidCases || []; expect(cases.length >= 4, 'Cần ít nhất 4 trường hợp').toBe(true); for (const c of cases) expect(!!(X.MESSAGES && X.MESSAGES[c.expected]), '"' + c.expected + '" không phải key của MESSAGES').toBe(true); expect(cases.some(c => X.MESSAGES[c.expected] === 'Mật khẩu nhập lại không khớp'), 'Thiếu case mật khẩu nhập lại không khớp').toBe(true); });
check('Tệp test không viết cứng dữ liệu', () => { const t = __body(F['tests/auth/register.spec.ts']); expect(/@sandemo\.test/.test(t), 'Còn email viết cứng').toBe(false); expect(/Vui lòng|không hợp lệ|không khớp|thành công/.test(t), 'Còn câu thông báo viết cứng').toBe(false); expect(/new\s+(RegisterPage|LoginPage|DashboardPage)/.test(t), 'Page Object phải được tạo trong fixture').toBe(false); });
check('Số test = 1 + số trường hợp sai, tất cả pass', () => { expect(__pw.tests.length, 'Số test').toBe(1 + cases.length); expect(__passed(), __failMsg()).toBe(true); });
check('Luồng thành công đăng nhập lại được bằng tài khoản mới', () => expect(__pw.tests.some(t => t.status === 'passed' && /\/dashboard/.test(t.url)), 'Chưa có test nào đi tới trang Bảng giá sau khi đăng ký').toBe(true));
check('Phát hiện bug "không kiểm tra mật khẩu nhập lại"', async () => { const r = await H.rerun('register-confirm-ignored'); expect(r.some(t => t.status === 'failed')).toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Test đăng ký cần dữ liệu mới mỗi lần</h3>
<p>Đăng nhập dùng lại một tài khoản cố định được, còn đăng ký thì không: lần chạy thứ hai sẽ báo "Email đã được sử dụng". Trong môi trường thật (staging dùng chung), dữ liệu cũng tồn tại lâu dài. Vì vậy mỗi test phải tự sinh dữ liệu riêng.</p>
{{ex0}}
<h3>Partial và spread: mô tả trường hợp sai bằng phần khác biệt</h3>
<p>Một người dùng hợp lệ có 5 trường. Mỗi trường hợp sai chỉ khác 1 trường. Thay vì chép lại cả 5 trường cho mỗi case, chỉ ghi phần khác biệt:</p>
{{ex1}}
<p><code>Partial&lt;NewUser&gt;</code> là kiểu "giống NewUser nhưng mọi trường đều không bắt buộc", rất hợp cho <code>overrides</code>.</p>
<h3>Nhãn trùng một phần chữ</h3>
<p><code>getByLabel('Mật khẩu')</code> khớp cả ô "Mật khẩu" và "Nhập lại mật khẩu", vì mặc định chỉ cần chứa chữ. Thêm <code>{ exact: true }</code> để khớp chính xác.</p>
<p class="note">Góc QA: một luồng đăng ký hoàn chỉnh nên kiểm tra tới tận bước đăng nhập bằng tài khoản vừa tạo. Nhiều bug thật nằm ở chỗ đăng ký báo thành công nhưng dữ liệu không được lưu đúng.</p>`,
examples:[L(
'const uniqueEmail = (prefix: string = \'user\'): string =>',
'  prefix + \'.\' + Date.now() + Math.floor(Math.random() * 1000) + \'@sandemo.test\';',
'',
'console.log(uniqueEmail());',
'console.log(uniqueEmail(\'qa\'));'),
L(
'interface Person { name: string; email: string; age: number }',
'',
'const valid: Person = { name: \'An\', email: \'an@sandemo.test\', age: 30 };',
'const overrides: Partial<Person> = { email: \'khong-hop-le\' };',
'',
'const invalid: Person = { ...valid, ...overrides };',
'console.log(invalid);')]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
<p>Bấm <strong>Chạy lời giải</strong> để chạy toàn bộ project mẫu.</p>
{{ex0}}
<h3>Những điểm đáng chú ý</h3>
<ul>
<li><code>newUser</code> là fixture: mỗi test nhận một người dùng mới với email riêng, không test nào ảnh hưởng test nào.</li>
<li>Mỗi case trong register.json chỉ ghi phần sai. <code>buildNewUser(c.overrides)</code> ghép phần sai vào một người dùng hợp lệ, nên mỗi test chỉ sai đúng một chỗ và thông báo lỗi là của chỗ đó.</li>
<li><code>register()</code> tích ô điều khoản theo dữ liệu (<code>setChecked(user.acceptTerms)</code>), nên case "không đồng ý điều khoản" dùng lại được cùng một hàm.</li>
<li>Luồng thành công kiểm tra ở cả ba trang, và đăng nhập lại bằng chính tài khoản vừa tạo để chắc chắn dữ liệu được lưu.</li>
</ul>`,
examples:[String.raw`// @file: constants/routes.ts
export const ROUTES = {
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
} as const;

// @file: constants/messages.ts
export const MESSAGES = {
  emptyName: 'Vui lòng nhập họ và tên',
  invalidEmail: 'Email không hợp lệ',
  usedEmail: 'Email đã được sử dụng',
  shortPassword: 'Mật khẩu phải có ít nhất 8 ký tự',
  confirmMismatch: 'Mật khẩu nhập lại không khớp',
  termsRequired: 'Vui lòng đồng ý với điều khoản',
  registerSuccess: 'Đăng ký thành công. Vui lòng đăng nhập.',
} as const;

// @file: locators/register.locators.ts
export const REGISTER_LOCATORS = {
  fullName: 'Họ và tên',
  email: 'Email',
  password: 'Mật khẩu',
  confirmPassword: 'Nhập lại mật khẩu',
  terms: 'Tôi đồng ý với điều khoản sử dụng',
  submit: 'Đăng ký',
} as const;

// @file: types/user.ts
export interface NewUser {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface InvalidRegisterCase {
  name: string;
  overrides: Partial<NewUser>;
  expected: string;
}

// @file: utils/helpers.ts
import { NewUser } from '../types/user';

export function uniqueEmail(prefix: string = 'user'): string {
  return prefix + '.' + Date.now() + Math.floor(Math.random() * 100000) + '@sandemo.test';
}

export function buildNewUser(overrides: Partial<NewUser> = {}): NewUser {
  const password = 'Matkhau@123';
  return {
    fullName: 'Nguyễn Kiểm Thử',
    email: uniqueEmail(),
    password,
    confirmPassword: password,
    acceptTerms: true,
    ...overrides,
  };
}

// @file: test-data/register.json
{
  "invalidCases": [
    { "name": "bỏ trống họ tên", "overrides": { "fullName": "" }, "expected": "emptyName" },
    { "name": "email sai định dạng", "overrides": { "email": "khong-co-a-cong" }, "expected": "invalidEmail" },
    { "name": "email đã tồn tại", "overrides": { "email": "thao@sandemo.test" }, "expected": "usedEmail" },
    { "name": "mật khẩu quá ngắn", "overrides": { "password": "123", "confirmPassword": "123" }, "expected": "shortPassword" },
    { "name": "nhập lại mật khẩu không khớp", "overrides": { "confirmPassword": "KhacNhau@123" }, "expected": "confirmMismatch" },
    { "name": "không đồng ý điều khoản", "overrides": { "acceptTerms": false }, "expected": "termsRequired" }
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

// @file: pages/RegisterPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { ROUTES } from '../constants/routes';
import { REGISTER_LOCATORS as R } from '../locators/register.locators';
import { NewUser } from '../types/user';

export class RegisterPage extends BasePage {
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmInput: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.fullNameInput = page.getByLabel(R.fullName);
    this.emailInput = page.getByLabel(R.email);
    this.passwordInput = page.getByLabel(R.password, { exact: true });
    this.confirmInput = page.getByLabel(R.confirmPassword);
    this.termsCheckbox = page.getByLabel(R.terms);
    this.submitButton = page.getByRole('button', { name: R.submit });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.open(ROUTES.register);
  }

  async register(user: NewUser) {
    await this.fullNameInput.fill(user.fullName);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.confirmInput.fill(user.confirmPassword);
    await this.termsCheckbox.setChecked(user.acceptTerms);
    await this.submitButton.click();
  }
}

// @file: pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly successNotice: Locator;

  constructor(page: Page) {
    super(page);
    this.successNotice = page.getByRole('status');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Mật khẩu').fill(password);
    await this.page.getByRole('button', { name: 'Đăng nhập' }).click();
  }
}

// @file: pages/DashboardPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly greeting: Locator;

  constructor(page: Page) {
    super(page);
    this.greeting = page.getByText('Xin chào');
  }
}

// @file: fixtures/test.fixture.ts
import { test as base } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { buildNewUser } from '../utils/helpers';
import { NewUser } from '../types/user';

type Fixtures = {
  registerPage: RegisterPage;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  newUser: NewUser;
};

export const test = base.extend<Fixtures>({
  registerPage: async ({ page }, use) => { await use(new RegisterPage(page)); },
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  dashboardPage: async ({ page }, use) => { await use(new DashboardPage(page)); },
  newUser: async ({}, use) => { await use(buildNewUser()); },
});

export { expect } from '@playwright/test';

// @file: tests/auth/register.spec.ts
import { test, expect } from '../../fixtures/test.fixture';
import { ROUTES } from '../../constants/routes';
import { MESSAGES } from '../../constants/messages';
import { InvalidRegisterCase } from '../../types/user';
import { buildNewUser } from '../../utils/helpers';
import data from '../../test-data/register.json';

test('đăng ký rồi đăng nhập bằng tài khoản mới', async ({ page, registerPage, loginPage, dashboardPage, newUser }) => {
  await registerPage.goto();
  await registerPage.register(newUser);

  await expect(page).toHaveURL(new RegExp(ROUTES.login));
  await expect(loginPage.successNotice).toHaveText(MESSAGES.registerSuccess);

  await loginPage.login(newUser.email, newUser.password);
  await expect(page).toHaveURL(new RegExp(ROUTES.dashboard));
  await expect(dashboardPage.greeting).toContainText(newUser.fullName);
});

const cases: InvalidRegisterCase[] = data.invalidCases;

for (const c of cases) {
  test('đăng ký lỗi: ' + c.name, async ({ page, registerPage }) => {
    await registerPage.goto();
    await registerPage.register(buildNewUser(c.overrides));
    await expect(registerPage.errorMessage).toHaveText(MESSAGES[c.expected as keyof typeof MESSAGES]);
    await expect(page).toHaveURL(new RegExp(ROUTES.register));
  });
}`]},
});
