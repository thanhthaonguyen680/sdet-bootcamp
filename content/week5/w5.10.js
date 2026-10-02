defineExercise({
  id: 'w5.10',
  ci: true,
  needEnv: ['BASE_URL', 'TEST_USER_PASSWORD'],
  defaultScenario: 'bug',
  title: 'Nhiều job nối tiếp: kiểm tra nhanh trước',
  files: { [WFP]: WF_ENV, 'package.json': PKG_BASE, 'playwright.config.ts': CFG_ENV },
  open: WFP,
  projectName: 'sandemo-e2e',
  desc: `<p>Chạy đủ bộ test mất nhiều thời gian. Nếu code đang lỗi cơ bản thì nên biết ngay sau 1–2 phút. Tách workflow thành 3 job nối tiếp:</p>
<pre>typecheck  →  smoke  →  full</pre>
<ul>
<li><code>typecheck</code>: <code>npx tsc --noEmit</code>, bắt lỗi TypeScript mà không cần mở trình duyệt.</li>
<li><code>smoke</code>: chạy sau typecheck, chỉ chạy test <code>@smoke</code> (có sẵn script <code>test:smoke</code>).</li>
<li><code>full</code>: chạy sau smoke, chạy toàn bộ test.</li>
</ul>
<p>Thêm <code>concurrency</code> để khi push liên tục lên cùng một nhánh, lần chạy cũ bị hủy, chỉ giữ lần mới nhất.</p>`,
  hints: [
    'Job chờ job khác bằng <code>needs: typecheck</code> (hoặc <code>needs: [typecheck]</code>). Nếu job trước thất bại, job sau tự động bị bỏ qua.',
    'Mỗi job chạy trên một máy riêng, nên job nào cũng phải có các bước checkout, setup-node, npm ci. Job typecheck không cần cài trình duyệt.',
    '<pre>concurrency:\n  group: ${{ github.workflow }}-${{ github.ref }}\n  cancel-in-progress: true</pre> đặt ở cấp cao nhất, cùng cấp với <code>on</code>.'],
  tests: CIG + String.raw`
let wf;
check('Có 3 job nối tiếp typecheck → smoke → full', async () => { wf = await H.yaml('` + WFP + String.raw`'); for (const k of ['typecheck', 'smoke', 'full']) expect(!!wf.jobs[k], 'Thiếu job ' + k).toBe(true); expect([].concat(wf.jobs.smoke.needs || [])).toContain('typecheck'); expect([].concat(wf.jobs.full.needs || [])).toContain('smoke'); });
check('Code ổn định: cả 3 job xanh, smoke 3 test, full 14 test', async () => { const run = __ok(await H.run('push-main')); __green(run); const by = Object.fromEntries(run.jobs.map(j => [j.id, j])); expect((by.smoke.summaries[0] || {}).total, 'smoke').toBe(3); expect((by.full.summaries[0] || {}).total, 'full').toBe(14); expect(by.smoke.start >= by.typecheck.end && by.full.start >= by.smoke.end, 'Thứ tự chạy chưa đúng').toBe(true); });
check('Smoke đỏ: full bị bỏ qua', async () => { const run = __ok(await H.run('push-main', { scenario: 'bug' })); const by = Object.fromEntries(run.jobs.map(j => [j.id, j.status])); expect(by.smoke).toBe('failure'); expect(by.full, 'Job full nên bị bỏ qua khi smoke thất bại').toBe('skipped'); });
check('Lỗi TypeScript: dừng ngay ở typecheck', async () => { const run = __ok(await H.run('push-main', { scenario: 'type-error' })); const by = Object.fromEntries(run.jobs.map(j => [j.id, j.status])); expect(by.typecheck, 'typecheck phải bắt được lỗi TypeScript (npx tsc --noEmit)').toBe('failure'); expect(by.smoke).toBe('skipped'); expect(by.full).toBe('skipped'); });
check('Có concurrency với cancel-in-progress', () => { const c = wf.concurrency; expect(!!c && typeof c === 'object' && !!c.group && c['cancel-in-progress'] === true, 'Cần concurrency: group ... cancel-in-progress: true').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>needs: xếp thứ tự các job</h3>
<p>Mặc định mọi job chạy song song. <code>needs</code> bắt một job chờ job khác xong và thành công mới chạy. Nếu job cần chờ thất bại, job này bị <strong>bỏ qua</strong>.</p>
<pre>typecheck (30s) → smoke (2 phút) → full (8 phút)</pre>
<p>Lỗi đánh máy trong TypeScript bị bắt sau 30 giây, lỗi chức năng chính bị bắt sau khoảng 2 phút, thay vì phải chờ hết bộ test mới biết.</p>
<h3>Chia sẻ kết quả giữa các job</h3>
<p>Mỗi job là một máy mới: phải checkout, cài Node và <code>npm ci</code> lại. Trông lặp lại, nhưng đổi lại các job độc lập, chạy lại riêng từng job được. Khi phần lặp lại quá dài, có thể gom thành <em>composite action</em> riêng (chủ đề nâng cao).</p>
<h3>concurrency</h3>
{{ex0}}
<p>Push 5 lần liên tục trong 1 phút thì chỉ lần cuối là quan trọng. <code>cancel-in-progress: true</code> hủy các lần chạy cũ đang dở trên cùng nhánh, tiết kiệm phút chạy CI và cho kết quả nhanh hơn.</p>`,
examples:[{ run:false, lang:'yaml', code:String.raw`concurrency:
  group: ${'${{'} github.workflow }}-${'${{'} github.ref }}
  cancel-in-progress: true

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps: ...
  smoke:
    needs: typecheck
    runs-on: ubuntu-latest
    steps: ...` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<h3>Giải thích</h3><ul><li>Job typecheck không cài trình duyệt nên xong trong khoảng một phút.</li><li>Kịch bản có bug làm đỏ smoke, job full bị bỏ qua: không tốn thêm 8 phút cho một bản code đã biết là lỗi.</li></ul>`,
examples:[{ lang:'yaml', code:'// @file: ' + WFP + '\n' + WF_HEAD + String.raw`
concurrency:
  group: ${'${{'} github.workflow }}-${'${{'} github.ref }}
  cancel-in-progress: true

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
` + WF_SETUP + String.raw`
      - name: Kiểm tra TypeScript
        run: npx tsc --noEmit

  smoke:
    needs: typecheck
    runs-on: ubuntu-latest
    steps:
` + WF_SETUP + String.raw`
      - name: Cài trình duyệt
        run: npx playwright install --with-deps chromium
      - name: Smoke test
        run: npm run test:smoke
        env:
          BASE_URL: ${'${{'} vars.BASE_URL_STAGING }}
          TEST_USER_PASSWORD: ${'${{'} secrets.TEST_USER_PASSWORD }}

  full:
    needs: smoke
    runs-on: ubuntu-latest
    steps:
` + WF_SETUP + String.raw`
      - name: Cài trình duyệt
        run: npx playwright install --with-deps chromium
      - name: Toàn bộ test
        run: npx playwright test
        env:
          BASE_URL: ${'${{'} vars.BASE_URL_STAGING }}
          TEST_USER_PASSWORD: ${'${{'} secrets.TEST_USER_PASSWORD }}
` }]},
});
