/* Mô phỏng GitHub Actions: repo giả, bộ test giả, sự kiện, kịch bản. */

const CI_REPO = {
  name: 'thao/sandemo-e2e', cores: 4,
  secrets: { TEST_USER_PASSWORD: 'Demo@123', SLACK_WEBHOOK_URL: 'https://hooks.slack.test/services/T01/B02/xyz' },
  vars: { BASE_URL_STAGING: 'https://staging.sandemo.test', BASE_URL_PROD: 'https://sandemo.test' },
};
const CI_SUITE = [
  { file: 'auth/login.spec.ts', title: 'đăng nhập thành công', tags: ['@smoke', '@auth'], d: 6 },
  { file: 'auth/login.spec.ts', title: 'đăng nhập lỗi: bỏ trống email', tags: ['@auth'], d: 4 },
  { file: 'auth/login.spec.ts', title: 'đăng nhập lỗi: bỏ trống mật khẩu', tags: ['@auth'], d: 4 },
  { file: 'auth/login.spec.ts', title: 'đăng nhập lỗi: sai mật khẩu', tags: ['@auth'], d: 5 },
  { file: 'auth/register.spec.ts', title: 'đăng ký rồi đăng nhập bằng tài khoản mới', tags: ['@auth'], d: 12 },
  { file: 'auth/register.spec.ts', title: 'đăng ký lỗi: email đã tồn tại', tags: ['@auth'], d: 5 },
  { file: 'auth/register.spec.ts', title: 'đăng ký lỗi: mật khẩu nhập lại không khớp', tags: ['@auth'], d: 5 },
  { file: 'dashboard/search.spec.ts', title: 'bảng giá hiển thị đủ 6 mã', tags: ['@smoke'], d: 5 },
  { file: 'dashboard/search.spec.ts', title: 'tìm kiếm mã cổ phiếu', tags: [], d: 6, flaky: true },
  { file: 'dashboard/search.spec.ts', title: 'theo dõi cổ phiếu', tags: [], d: 4, webkitBug: true },
  { file: 'order/place-order.spec.ts', title: 'đặt lệnh mua', tags: ['@smoke'], d: 8, bug: true },
  { file: 'order/place-order.spec.ts', title: 'đặt lệnh bán', tags: [], d: 8, bug: true },
  { file: 'order/place-order.spec.ts', title: 'báo lỗi khối lượng không hợp lệ', tags: [], d: 5 },
  { file: 'order/place-order.spec.ts', title: 'mua cổ phiếu Toyota từ đầu đến cuối', tags: [], d: 20 },
];
const CI_SCENARIOS = { stable: 'Code ổn định', flaky: 'Có test flaky', bug: 'Có bug thật (đặt lệnh)', webkit: 'Bug chỉ trên WebKit', 'type-error': 'Có lỗi TypeScript' };
const CI_EVENTS = {
  'push-main': { label: 'push lên main', event_name: 'push', ref: 'refs/heads/main', ref_name: 'main' },
  'push-feature': { label: 'push lên feature/login', event_name: 'push', ref: 'refs/heads/feature/login', ref_name: 'feature/login' },
  'pr-main': { label: 'pull request feature/login → main', event_name: 'pull_request', ref: 'refs/pull/42/merge', ref_name: '42/merge', head_ref: 'feature/login', base_ref: 'main' },
  'schedule': { label: 'lịch chạy (schedule)', event_name: 'schedule', ref: 'refs/heads/main', ref_name: 'main' },
  'dispatch': { label: 'chạy tay (workflow_dispatch)', event_name: 'workflow_dispatch', ref: 'refs/heads/main', ref_name: 'main' },
};
const ciErr = (m) => { const e = new Error(m); e.__pw = true; return e; };
const fmtDur = s => { s = Math.round(s); return s >= 60 ? Math.floor(s / 60) + 'm ' + (s % 60) + 's' : s + 's'; };
