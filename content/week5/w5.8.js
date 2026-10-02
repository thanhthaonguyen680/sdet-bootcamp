defineExercise({
  id: 'w5.8',
  ci: true,
  needEnv: ['BASE_URL', 'TEST_USER_PASSWORD'],
  durScale: 18,
  title: 'Sharding: chia nhỏ để chạy nhanh',
  files: { [WFP]: WF_HEAD + String.raw`
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15   # quy định của team: không job nào được chạy quá 15 phút
    steps:
` + WF_SETUP + String.raw`
      - name: Cài trình duyệt
        run: npx playwright install --with-deps chromium

      - name: Chạy test
        run: npx playwright test
        env:
          BASE_URL: ${'${{'} vars.BASE_URL_STAGING }}
          TEST_USER_PASSWORD: ${'${{'} secrets.TEST_USER_PASSWORD }}
`, 'package.json': PKG_BASE, 'playwright.config.ts': CFG_BLOB },
  open: WFP,
  projectName: 'sandemo-e2e',
  desc: `<p>Bộ test của repo này chạy lâu hơn nhiều so với các bài trước: một job chạy hết mất khoảng 20 phút, vượt quy định 15 phút của team (thử chạy pipeline để thấy job bị hủy vì timeout).</p>
<p>Hãy chia bộ test thành <strong>ít nhất 3 shard</strong> chạy song song, rồi gộp kết quả thành một báo cáo:</p>
<ul>
<li>Job <code>test</code>: matrix theo shard, chạy <code>--shard=i/n</code>, lưu thư mục <code>blob-report/</code> thành artifact tên <code>blob-report-&lt;i&gt;</code>. Config đã dùng reporter <code>blob</code> trên CI.</li>
<li>Job <code>merge-reports</code>: chạy sau job test (kể cả khi có shard thất bại), tải tất cả blob report về một thư mục, chạy <code>npx playwright merge-reports --reporter html</code>, rồi lưu <code>playwright-report/</code> thành artifact <code>playwright-report</code>.</li>
</ul>`,
  hints: [
    '<pre>strategy:\n  fail-fast: false\n  matrix:\n    shardIndex: [1, 2, 3, 4]\n    shardTotal: [4]</pre> Lệnh: <code>npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}</code>.',
    'Job gộp: <code>needs: [test]</code>, <code>if: ${{ !cancelled() }}</code>. Tải về: <code>actions/download-artifact@v4</code> với <code>pattern: blob-report-*</code>, <code>path: all-blob-reports</code>, <code>merge-multiple: true</code>.',
    'Job gộp là máy mới nên phải checkout, cài Node và <code>npm ci</code> lại (không cần cài trình duyệt). Rồi <code>npx playwright merge-reports --reporter html ./all-blob-reports</code>.'],
  tests: CIG + String.raw`
let wf;
check('Dùng ít nhất 3 shard', async () => { wf = await H.yaml('` + WFP + String.raw`'); const m = (wf.jobs.test && wf.jobs.test.strategy && wf.jobs.test.strategy.matrix) || {}; const idx = [].concat(m.shardIndex || []); expect(idx.length >= 3, 'matrix.shardIndex cần ít nhất 3 giá trị').toBe(true); });
check('Mọi shard chạy xong trong 15 phút, tổng đủ 14 test không trùng', async () => { const run = __ok(await H.run('push-main')); const shards = run.jobs.filter(j => j.id === 'test'); for (const j of shards) expect(j.status, j.key + (j.timedOut ? ' bị hủy do quá 15 phút' : '') + '\n' + __why(run)).toBe('success'); const titles = shards.flatMap(j => (j.summaries[0] || { tests: [] }).tests); expect(titles.length, 'Tổng số test qua các shard').toBe(14); expect(new Set(titles).size, 'Có test bị chạy trùng giữa các shard').toBe(14); });
check('Job merge-reports gộp đủ blob và tạo báo cáo HTML', async () => { const run = (await H.run('push-main')).triggered[0]; const m = run.jobs.find(j => j.id === 'merge-reports'); expect(!!m, 'Chưa có job merge-reports').toBe(true); expect(m.status, __why(run)).toBe('success'); expect(m.merged, 'Số blob report đã gộp').toBe(run.jobs.filter(j => j.id === 'test').length); expect(run.artifacts.some(a => a.name === 'playwright-report' && a.kind === 'html')).toBe(true); expect(run.artifacts.filter(a => a.kind === 'blob').length).toBe(run.jobs.filter(j => j.id === 'test').length); });
check('Có shard đỏ thì vẫn gộp báo cáo', async () => { const run = __ok(await H.run('push-main', { scenario: 'bug' })); const m = run.jobs.find(j => j.id === 'merge-reports'); expect(m && m.status, 'Job merge-reports phải chạy cả khi test thất bại').toBe('success'); expect(run.artifacts.some(a => a.name === 'playwright-report')).toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Sharding</h3>
<p>Matrix ở bài 7 chia theo trình duyệt. Sharding chia <strong>bộ test</strong> thành nhiều phần, mỗi phần chạy trên một máy: <code>--shard=1/4</code> chạy phần thứ nhất trong 4 phần. 4 máy chạy song song thì thời gian giảm gần 4 lần.</p>
<pre>              ┌── shard 1/4 ──┐
push → test ──┼── shard 2/4 ──┼──→ merge-reports → 1 báo cáo HTML
              ├── shard 3/4 ──┤
              └── shard 4/4 ──┘</pre>
<h3>Vì sao cần gộp báo cáo</h3>
<p>Mỗi shard chỉ biết kết quả phần của mình. Reporter <code>blob</code> ghi kết quả thô; job cuối tải tất cả blob về và <code>merge-reports</code> gộp thành một báo cáo HTML đầy đủ, như thể chạy trên một máy.</p>
{{ex0}}
<h3>Truyền dữ liệu giữa các job</h3>
<p>Các job chạy trên máy khác nhau, không dùng chung ổ đĩa. Cách chuyển tệp giữa các job là <code>upload-artifact</code> ở job trước và <code>download-artifact</code> ở job sau (job sau phải <code>needs</code> job trước).</p>
<p class="note">Góc QA: thời gian pipeline ảnh hưởng trực tiếp tới tốc độ làm việc của cả team. Pipeline 30 phút nghĩa là mỗi lần sửa lỗi phải chờ 30 phút mới biết đúng hay chưa. Sharding là cách nhanh nhất để rút ngắn khi bộ test đã lớn.</p>`,
examples:[{ run:false, lang:'yaml', code:String.raw`  merge-reports:
    needs: [test]
    if: ${'${{'} !cancelled() }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true
      - run: npx playwright merge-reports --reporter html ./all-blob-reports` }]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<h3>Giải thích</h3><ul><li>4 shard chạy song song, mỗi shard khoảng 5–7 phút thay vì 20 phút cho một job.</li><li>Blob report chỉ là dữ liệu trung gian nên giữ 1 ngày; báo cáo HTML gộp mới là thứ cần giữ lâu.</li><li><code>if: ${'${{'} !cancelled() }}</code> ở job gộp: có shard đỏ vẫn gộp, để báo cáo có đầy đủ cả test pass lẫn test lỗi.</li></ul>`,
examples:[{ lang:'yaml', code:'// @file: ' + WFP + '\n' + WF_HEAD + String.raw`
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3, 4]
        shardTotal: [4]
    steps:
` + WF_SETUP + String.raw`
      - name: Cài trình duyệt
        run: npx playwright install --with-deps chromium

      - name: Chạy shard ${'${{'} matrix.shardIndex }}/${'${{'} matrix.shardTotal }}
        run: npx playwright test --shard=${'${{'} matrix.shardIndex }}/${'${{'} matrix.shardTotal }}
        env:
          BASE_URL: ${'${{'} vars.BASE_URL_STAGING }}
          TEST_USER_PASSWORD: ${'${{'} secrets.TEST_USER_PASSWORD }}

      - name: Lưu blob report
        if: ${'${{'} !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: blob-report-${'${{'} matrix.shardIndex }}
          path: blob-report/
          retention-days: 1

  merge-reports:
    needs: [test]
    if: ${'${{'} !cancelled() }}
    runs-on: ubuntu-latest
    steps:
` + WF_SETUP + String.raw`
      - name: Tải các blob report
        uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true

      - name: Gộp thành báo cáo HTML
        run: npx playwright merge-reports --reporter html ./all-blob-reports

      - name: Lưu báo cáo HTML
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
` }]},
});
