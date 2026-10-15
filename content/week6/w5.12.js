// Workflow AI viết từ câu yêu cầu trong đề: chạy được về cú pháp nhưng có 4 lỗi hay gặp.
const WF_AI = String.raw`# Workflow do AI viết. Đọc kỹ trước khi dùng.
name: Playwright Tests

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
` + WF_SETUP + String.raw`
      - name: Chạy test
        run: npx playwright test
        env:
          BASE_URL: https://staging.sandemo.test
          TEST_USER_PASSWORD: Demo@123

      - name: Lưu báo cáo HTML
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
`;

defineExercise({
  id: 'w5.12',
  ci: true,
  needEnv: ['BASE_URL', 'TEST_USER_PASSWORD'],
  title: 'Nhờ AI viết workflow, bạn kiểm chứng',
  files: { [WFP]: WF_AI, 'package.json': PKG_BASE, 'playwright.config.ts': CFG_ENV },
  open: WFP,
  projectName: 'sandemo-e2e',
  desc: `<p>Một bạn trong team nhờ AI viết workflow bằng câu sau:</p>
<blockquote>"Viết workflow GitHub Actions chạy test Playwright khi push lên main và khi mở pull request vào main, nhớ lưu báo cáo HTML. Test cần các biến trong .env của mình: <code>BASE_URL=https://staging.sandemo.test</code>, <code>TEST_USER_PASSWORD=Demo@123</code>"</blockquote>
<p>Kết quả AI viết đang nằm trong <code>${WFP}</code>. Nhìn qua thì đầy đủ, nhưng <strong>có 4 lỗi</strong>. Mở tab <strong>Pipeline</strong>, chạy thử với các sự kiện và kịch bản khác nhau để tìm ra, rồi sửa workflow sao cho:</p>
<ul>
<li>Chạy khi push lên main <strong>và</strong> khi có pull request vào main, pipeline xanh.</li>
<li>Không có mật khẩu hay URL nào nằm trong tệp YAML. Repo đã có sẵn secret <code>TEST_USER_PASSWORD</code> và variable <code>BASE_URL_STAGING</code>.</li>
<li>Khi test đỏ vẫn có báo cáo HTML để xem.</li>
</ul>`,
  hints: [
    'Chạy sự kiện "push lên main" trước: bước Chạy test báo <code>Executable doesn\'t exist</code>. AI quên bước cài trình duyệt: <code>npx playwright install --with-deps chromium</code>, đặt trước bước chạy test.',
    'Thử sự kiện "pull request vào main": không có workflow nào chạy. Câu yêu cầu có nhắc pull request nhưng mục <code>on:</code> chỉ có <code>push</code>. Mật khẩu và URL thì thay bằng <code>${{ secrets.TEST_USER_PASSWORD }}</code> và <code>${{ vars.BASE_URL_STAGING }}</code> (bài 2).',
    'Chọn kịch bản "Có bug thật": test đỏ thì bước lưu báo cáo bị bỏ qua. Thêm <code>if: ${{ !cancelled() }}</code> cho bước đó (bài 3).'],
  tests: CIG + String.raw`
const __wf = () => __files['` + WFP + String.raw`'];
check('push lên main: pipeline xanh, chạy đủ 14 test', async () => { const run = __ok(await H.run('push-main')); __green(run); const s = __sum(run); expect(s.length > 0 && s[0].total === 14, 'Chưa chạy đủ 14 test').toBe(true); });
check('Pull request vào main cũng kích hoạt', async () => { const r = await H.run('pr-main'); expect(r.triggered.length, 'Pull request vào main chưa kích hoạt workflow: câu yêu cầu có nhắc pull request nhưng AI bỏ sót').toBe(1); });
check('Push lên nhánh feature không kích hoạt', async () => { const r = await H.run('push-feature'); expect(r.triggered.length, 'Workflow đang chạy cả khi push lên nhánh feature, hãy giữ branches: [main]').toBe(0); });
check('Mật khẩu và URL không nằm trong YAML', () => { const t = __wf(); expect(/Demo@123/.test(t), 'Mật khẩu đang ghi thẳng trong YAML: ai đọc được repo là đọc được mật khẩu').toBe(false); expect(/staging\.sandemo\.test/.test(t), 'URL đang ghi thẳng, hãy dùng vars.BASE_URL_STAGING').toBe(false); expect(/\$\{\{\s*secrets\.TEST_USER_PASSWORD\s*\}\}/.test(t), 'Cần dùng ${'${{'} secrets.TEST_USER_PASSWORD }}').toBe(true); });
check('Khi test đỏ vẫn có báo cáo HTML', async () => { const run = __ok(await H.run('push-main', { scenario: 'bug' })); expect(run.conclusion, 'Kịch bản có bug thì pipeline phải đỏ').toBe('failure'); expect(run.artifacts.some(a => a.name === 'playwright-report'), 'Test đỏ mà không có báo cáo: bước lưu báo cáo cần if: ${'${{'} !cancelled() }}').toBe(true); });
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>AI viết YAML rất nhanh, nhưng...</h3>
<p>Workflow là loại code AI viết khá tốt: cấu trúc lặp lại, ít logic. Vì vậy ngoài thực tế, phần lớn workflow bây giờ được viết bằng cách nhờ AI rồi sửa lại. Nhưng lỗi trong workflow có một đặc điểm khó chịu: <strong>nhiều lỗi không lộ ra ngay</strong>.</p>
${TRACE(['Lỗi AI hay mắc', 'Lộ ra khi nào'], [['Bỏ sót sự kiện kích hoạt (chỉ có <code>push</code>, thiếu <code>pull_request</code>)', 'Không bao giờ báo lỗi: PR cứ thế được merge mà không ai chạy test'], ['Quên bước cài trình duyệt', 'Lần chạy đầu tiên: pipeline đỏ'], ['Chép giá trị thật vào YAML thay vì dùng secrets', 'Không báo lỗi gì, mật khẩu nằm trong lịch sử Git mãi mãi'], ['Bước lưu báo cáo thiếu <code>if</code>', 'Chỉ khi test đỏ: đúng lúc cần báo cáo thì không có']])}
<h3>Checklist kiểm chứng workflow</h3>
<ol>
<li><strong>Kích hoạt đúng chưa?</strong> Đọc mục <code>on:</code> và so với yêu cầu. Thử các sự kiện: push lên main, push lên nhánh khác, pull request.</li>
<li><strong>Đủ bước chưa?</strong> checkout → setup-node → <code>npm ci</code> → cài trình duyệt → chạy test (bài 1).</li>
<li><strong>Có giá trị bí mật nào trong tệp không?</strong> Mật khẩu, token, URL nội bộ phải nằm trong secrets hoặc variables (bài 2).</li>
<li><strong>Test đỏ thì sao?</strong> Chạy thử với kịch bản có bug: vẫn có báo cáo và trace không (bài 3)?</li>
</ol>
<p>Câu 1, 3, 4 không thể biết bằng cách chạy một lần thấy xanh. Phải <strong>cố tình thử các trường hợp khác</strong>, giống cách bạn test ứng dụng.</p>
<h3>Đừng đưa bí mật cho AI</h3>
<p>Câu yêu cầu trong bài dán nguyên nội dung <code>.env</code> có mật khẩu cho AI. AI làm đúng điều được đưa: chép mật khẩu vào workflow. Lẽ ra chỉ cần nói tên biến: <em>"test cần biến BASE_URL và TEST_USER_PASSWORD, lấy từ variables và secrets của repo"</em>. Đã lỡ dán mật khẩu thật vào công cụ AI thì việc cần làm là <strong>đổi mật khẩu</strong> (tuần 5, bài 1).</p>
<p class="note">Góc QA: các bài nâng cao của tuần (matrix, sharding, chạy theo lịch, nhiều job) đều là những thứ có thể nhờ AI viết. Học chúng để <strong>đọc hiểu và kiểm chứng</strong> được, không cần thuộc lòng cú pháp.</p>`,
examples:[]},

  // ===== Lời giải =====
  solution: { html:`<h3>Lời giải</h3>{{ex0}}<h3>Giải thích</h3><ul>
<li>Thêm <code>pull_request</code> vào <code>on:</code>: PR vào main giờ cũng chạy test, đúng như câu yêu cầu.</li>
<li>Thêm bước <code>npx playwright install --with-deps chromium</code> trước khi chạy test.</li>
<li>Mật khẩu lấy từ secret, URL lấy từ variable: tệp YAML không còn giá trị bí mật nào, log tự che mật khẩu thành <code>***</code>.</li>
<li>Bước lưu báo cáo có <code>if: \${{ !cancelled() }}</code> nên vẫn chạy khi test đỏ. Thêm bước lưu trace khi có lỗi như bài 3 cũng là một cải tiến tốt.</li>
</ul>`,
examples:[{ lang:'yaml', code:'// @file: ' + WFP + '\n' + WF_ART }]},
});
