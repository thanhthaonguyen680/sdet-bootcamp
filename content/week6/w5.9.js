defineExercise({
  id: 'w5.9',
  ci: true,
  needEnv: ['BASE_URL', 'TEST_USER_PASSWORD'],
  defaultEvent: 'dispatch',
  title: 'Chạy theo lịch và chạy tay',
  files: { [WFP]: WF_ENV, 'package.json': PKG_BASE, 'playwright.config.ts': CFG_ENV },
  open: WFP,
  projectName: 'sandemo-e2e',
  desc: `<p>Ngoài push và pull request, team muốn:</p>
<ul>
<li><strong>Chạy tự động lúc 7:00 sáng giờ Việt Nam, từ thứ 2 đến thứ 6</strong>, để đầu giờ làm việc đã có kết quả.</li>
<li><strong>Chạy tay</strong> từ giao diện GitHub, chọn được hai tham số:
  <ul><li><code>environment</code>: <code>staging</code> hoặc <code>production</code>, mặc định staging.</li>
  <li><code>suite</code>: <code>smoke</code> hoặc <code>full</code>, mặc định full.</li></ul></li>
</ul>
<p><code>BASE_URL</code> lấy theo environment (<code>vars.BASE_URL_STAGING</code> hoặc <code>vars.BASE_URL_PROD</code>). Chọn smoke thì chỉ chạy test <code>@smoke</code>. Lịch chạy và push/PR luôn là staging, full.</p>
<p>Tab Pipeline sẽ hiện các ô chọn tham số khi chọn sự kiện "chạy tay", và hiện 3 lần chạy tiếp theo của lịch theo cả giờ UTC lẫn giờ Việt Nam.</p>`,
  hints: [
    'Lịch của GitHub Actions tính theo giờ <strong>UTC</strong>. Việt Nam là UTC+7, nên 7:00 sáng Việt Nam là 0:00 UTC. Cron 5 phần: <code>phút giờ ngày tháng thứ</code>, thứ 2 đến thứ 6 là <code>1-5</code>.',
    '<pre>workflow_dispatch:\n  inputs:\n    environment:\n      type: choice\n      options: [staging, production]\n      default: staging</pre> Khi chạy bằng push hay lịch, <code>inputs</code> rỗng.',
    'Biểu thức chọn giá trị: <code>${{ inputs.environment == \'production\' &amp;&amp; vars.BASE_URL_PROD || vars.BASE_URL_STAGING }}</code>. Chọn tham số lệnh tương tự: <code>${{ inputs.suite == \'smoke\' &amp;&amp; \'--grep @smoke\' || \'\' }}</code>.'],
  tests: CIG + String.raw`
let wf, on;
check('Có schedule và workflow_dispatch, vẫn giữ push/pull_request', async () => { wf = await H.yaml('` + WFP + String.raw`'); on = H.on(wf); for (const k of ['push', 'pull_request', 'schedule', 'workflow_dispatch']) expect(k in on, 'Thiếu sự kiện ' + k).toBe(true); });
check('Lịch chạy đúng 7:00 giờ Việt Nam, thứ 2 đến thứ 6', () => {
  const cron = [].concat(on.schedule)[0].cron; const next = H.cronNext(cron, 10);
  for (const d of next) { const h = (d.getUTCHours() + 7) % 24; const day = new Date(d.getTime() + 7 * 3600000).getUTCDay(); expect(h === 7 && d.getUTCMinutes() === 0, 'Cron "' + cron + '" chạy lúc ' + h + ':' + String(d.getUTCMinutes()).padStart(2, '0') + ' giờ Việt Nam. Nhớ: cron tính theo UTC, Việt Nam là UTC+7').toBe(true); expect(day >= 1 && day <= 5, 'Có lần chạy vào cuối tuần').toBe(true); }
});
check('Inputs environment và suite dạng lựa chọn', () => { const inp = (on.workflow_dispatch && on.workflow_dispatch.inputs) || {}; for (const k of ['environment', 'suite']) { expect(!!inp[k], 'Thiếu input ' + k).toBe(true); expect(inp[k].type, k + ' cần type: choice').toBe('choice'); } expect([].concat(inp.environment.options).sort()).toEqual(['production', 'staging']); expect(inp.environment.default).toBe('staging'); expect(inp.suite.default).toBe('full'); });
check('Chạy tay production + smoke', async () => { const run = __ok(await H.run('dispatch', { inputs: { environment: 'production', suite: 'smoke' } })); __green(run); const s = __sum(run)[0]; expect(s.baseURL, 'BASE_URL').toBe('https://sandemo.test'); expect(s.total, 'Chỉ chạy test @smoke').toBe(3); });
check('Chạy tay với giá trị mặc định: staging + full', async () => { const run = __ok(await H.run('dispatch', { inputs: {} })); const s = __sum(run)[0]; expect(s.baseURL).toBe('https://staging.sandemo.test'); expect(s.total).toBe(14); });
check('Lịch chạy: staging + full', async () => { const run = __ok(await H.run('schedule')); __green(run); const s = __sum(run)[0]; expect(s.baseURL).toBe('https://staging.sandemo.test'); expect(s.total).toBe(14); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Cron: lịch chạy định kỳ</h3>
<pre>┌───────────── phút (0-59)
│ ┌─────────── giờ (0-23)
│ │ ┌───────── ngày trong tháng (1-31)
│ │ │ ┌─────── tháng (1-12)
│ │ │ │ ┌───── thứ trong tuần (0-6, 0 là Chủ nhật)
│ │ │ │ │
0 0 * * 1-5</pre>
${TRACE(['Cron', 'Nghĩa (giờ UTC)'], [['<code>0 0 * * *</code>', '0:00 mỗi ngày'], ['<code>30 1 * * 1</code>', '1:30 mỗi thứ 2'], ['<code>0 */6 * * *</code>', 'mỗi 6 tiếng'], ['<code>0 0 * * 1-5</code>', '0:00 thứ 2 đến thứ 6']])}
<p><strong>Quan trọng:</strong> GitHub Actions tính lịch theo giờ <strong>UTC</strong>. Việt Nam là UTC+7, Nhật Bản là UTC+9. Muốn chạy 7:00 sáng giờ Việt Nam thì phải trừ 7 tiếng. Lịch cũng có thể bị trễ vài phút khi GitHub đông.</p>
<h3>Chạy tay có tham số</h3>
{{ex0}}
<p>Khi workflow chạy bằng sự kiện khác (push, schedule), <code>inputs</code> rỗng, nên cần viết biểu thức có giá trị mặc định.</p>
<h3>Mẹo chọn giá trị: a &amp;&amp; b || c</h3>
<p>GitHub Actions không có toán tử ba ngôi. Cách viết thay thế: <code>điều_kiện &amp;&amp; giá_trị_đúng || giá_trị_sai</code>, dựa trên truthy/falsy như ở tuần 1.</p>`,
examples:[{ run:false, lang:'yaml', code:String.raw`on:
  workflow_dispatch:
    inputs:
      environment:
        description: Môi trường cần test
        type: choice
        options: [staging, production]
        default: staging

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Test trên ${'${{'} inputs.environment == 'production' && vars.BASE_URL_PROD || vars.BASE_URL_STAGING }}"` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<h3>Giải thích</h3><ul><li><code>0 0 * * 1-5</code>: 0:00 UTC tức 7:00 giờ Việt Nam, thứ 2 đến thứ 6.</li><li>Khi chạy bằng push hay lịch, <code>inputs.environment</code> rỗng nên biểu thức rơi về giá trị sau <code>||</code> là staging; <code>inputs.suite</code> rỗng nên không thêm <code>--grep</code>.</li></ul>`,
examples:[{ lang:'yaml', code:'// @file: ' + WFP + '\n' + String.raw`name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1-5'   # 7:00 sáng giờ Việt Nam, thứ 2 đến thứ 6
  workflow_dispatch:
    inputs:
      environment:
        description: Môi trường cần test
        type: choice
        options: [staging, production]
        default: staging
      suite:
        description: Bộ test
        type: choice
        options: [smoke, full]
        default: full

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
` + WF_SETUP + String.raw`
      - name: Cài trình duyệt
        run: npx playwright install --with-deps chromium

      - name: Chạy test
        run: npx playwright test ${'${{'} inputs.suite == 'smoke' && '--grep @smoke' || '' }}
        env:
          BASE_URL: ${'${{'} inputs.environment == 'production' && vars.BASE_URL_PROD || vars.BASE_URL_STAGING }}
          TEST_USER_PASSWORD: ${'${{'} secrets.TEST_USER_PASSWORD }}
` }]},
});
