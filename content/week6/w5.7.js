defineExercise({
  id: 'w5.7',
  ci: true,
  needEnv: ['BASE_URL', 'TEST_USER_PASSWORD'],
  defaultScenario: 'webkit',
  title: 'Matrix: chạy trên nhiều trình duyệt',
  files: { [WFP]: WF_ART, 'package.json': PKG_BASE, 'playwright.config.ts': CFG_ENV3 },
  open: WFP,
  projectName: 'sandemo-e2e',
  desc: `<p>Config giờ có 3 project: <code>chromium</code>, <code>firefox</code>, <code>webkit</code>. Thay vì một job chạy lần lượt cả ba, dùng <strong>matrix</strong> để tạo 3 job chạy song song, mỗi job một trình duyệt:</p>
<ul>
<li>Mỗi job chỉ cài và chạy đúng trình duyệt của nó.</li>
<li>Một trình duyệt lỗi không được làm hủy các job còn lại.</li>
<li>Mỗi job lưu báo cáo thành artifact có tên riêng, ví dụ <code>playwright-report-webkit</code>.</li>
</ul>
<p>Kịch bản mặc định là <strong>Bug chỉ trên WebKit</strong>.</p>`,
  hints: [
    '<pre>strategy:\n  fail-fast: false\n  matrix:\n    project: [chromium, firefox, webkit]</pre> đặt trong job, cùng cấp với <code>runs-on</code>.',
    'Dùng giá trị của matrix: <code>npx playwright install --with-deps ${{ matrix.project }}</code> và <code>npx playwright test --project=${{ matrix.project }}</code>.',
    'Tên artifact trong cùng một lần chạy không được trùng: <code>name: playwright-report-${{ matrix.project }}</code>.'],
  tests: CIG + String.raw`
check('Tạo 3 job, mỗi job một trình duyệt, đều xanh', async () => { const run = __ok(await H.run('push-main')); __green(run); const jobs = run.jobs.filter(j => (j.summaries || []).length); expect(jobs.length, 'Số job có chạy test').toBe(3); const projs = jobs.map(j => j.summaries[0].projects.join(',')).sort(); expect(projs).toEqual(['chromium', 'firefox', 'webkit']); for (const j of jobs) expect(j.summaries[0].total, j.key + ' phải chạy 14 test').toBe(14); });
check('Mỗi job chỉ cài một trình duyệt', async () => { const run = (await H.run('push-main')).triggered[0]; for (const j of run.jobs) expect(j.installed.length, j.key + ' đang cài ' + j.installed.join(', ')).toBe(1); });
check('WebKit lỗi không làm hủy chromium và firefox', async () => { const run = __ok(await H.run('push-main', { scenario: 'webkit' })); const st = Object.fromEntries(run.jobs.map(j => [j.summaries[0] ? j.summaries[0].projects[0] : j.key, j.status])); expect(st.webkit, 'Job webkit').toBe('failure'); expect(st.chromium, 'Job chromium phải chạy xong (cần fail-fast: false)').toBe('success'); expect(st.firefox, 'Job firefox phải chạy xong (cần fail-fast: false)').toBe('success'); });
check('Mỗi job có artifact báo cáo riêng', async () => { const run = (await H.run('push-main', { scenario: 'webkit' })).triggered[0]; const reps = run.artifacts.filter(a => a.kind === 'html'); expect(reps.length, 'Số artifact báo cáo').toBe(3); expect(new Set(reps.map(a => a.name)).size).toBe(3); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Matrix: một khai báo, nhiều job</h3>
<p><code>strategy.matrix</code> tạo ra một job cho mỗi tổ hợp giá trị. Các job chạy <strong>song song</strong> trên các máy khác nhau, nên 3 trình duyệt chạy mất thời gian gần bằng 1.</p>
{{ex0}}
<p>Matrix nhiều chiều nhân với nhau: <code>os: [ubuntu-latest, windows-latest]</code> và <code>project: [chromium, webkit]</code> tạo 4 job.</p>
<h3>fail-fast</h3>
<p>Mặc định <code>fail-fast: true</code>: một job trong matrix lỗi thì GitHub hủy luôn các job còn lại để tiết kiệm. Với test đa trình duyệt thường nên tắt (<code>false</code>), để biết lỗi xảy ra trên một hay trên mọi trình duyệt.</p>
<h3>Tên artifact phải khác nhau</h3>
<p>Từ <code>upload-artifact@v4</code>, hai artifact trùng tên trong cùng một lần chạy sẽ báo lỗi 409 Conflict. Thêm giá trị matrix vào tên để phân biệt.</p>
<p class="note">Góc QA: <code>--with-deps</code> cài thêm thư viện hệ thống mà Firefox và WebKit cần trên Linux. Thiếu nó, chromium thường vẫn chạy nhưng hai trình duyệt kia sẽ báo "Host system is missing dependencies".</p>`,
examples:[yml(String.raw`name: Đa trình duyệt (ví dụ)
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        project: [chromium, firefox]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps ${'${{'} matrix.project }}
      - run: echo "Job này chạy trình duyệt ${'${{'} matrix.project }}"`)]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<h3>Giải thích</h3><ul><li>Mỗi job chỉ cài một trình duyệt: nhanh hơn và mỗi máy chỉ làm đúng việc của mình.</li><li><code>fail-fast: false</code>: webkit lỗi, chromium và firefox vẫn chạy xong, nhìn vào là biết lỗi chỉ xảy ra trên Safari.</li></ul>`,
examples:[{ lang:'yaml', code:'// @file: ' + WFP + '\n' + WF_HEAD + String.raw`
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        project: [chromium, firefox, webkit]
    steps:
` + WF_SETUP + String.raw`
      - name: Cài ${'${{'} matrix.project }}
        run: npx playwright install --with-deps ${'${{'} matrix.project }}

      - name: Chạy test trên ${'${{'} matrix.project }}
        run: npx playwright test --project=${'${{'} matrix.project }}
        env:
          BASE_URL: ${'${{'} vars.BASE_URL_STAGING }}
          TEST_USER_PASSWORD: ${'${{'} secrets.TEST_USER_PASSWORD }}

      - name: Lưu báo cáo
        if: ${'${{'} !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${'${{'} matrix.project }}
          path: playwright-report/
          retention-days: 14
` }]},
});
