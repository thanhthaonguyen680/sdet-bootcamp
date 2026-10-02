defineExercise({
  id: 'w4.1',
  pw: true,
  kind: 'locator',
  route: '/login',
  exports: ['locators'],
  title: 'getByText và getByPlaceholder',
  desc: `<p>Mở tab <strong>Trang web</strong> để xem trang đăng nhập. Viết locator cho 4 phần tử, trả về trong hàm <code>locators(page)</code>:</p>
<ul>
<li><code>welcome</code>: dòng chữ "Chào mừng bạn quay lại Sàn Demo", dùng <code>getByText</code>.</li>
<li><code>forgotLink</code>: liên kết "Quên mật khẩu?", dùng <code>getByText</code>.</li>
<li><code>emailInput</code>: ô nhập email, dùng <code>getByPlaceholder</code>.</li>
<li><code>passwordInput</code>: ô nhập mật khẩu, dùng <code>getByPlaceholder</code>.</li>
</ul>
<p>Bấm <strong>Chạy</strong> để xem mỗi locator khớp những phần tử nào (được khoanh tím trên trang). Mỗi locator phải khớp đúng <strong>1</strong> phần tử.</p>`,
  hints: [
    '<code>page.getByText(\'chữ bạn nhìn thấy\')</code>. Mặc định chỉ cần một phần của chữ và không phân biệt hoa thường.',
    'Placeholder là chữ mờ bên trong ô nhập khi ô còn trống. Bấm Chọn phần tử rồi bấm vào ô để xem giá trị placeholder.',
    '<code>page.getByPlaceholder(\'ban@congty.com\')</code> và <code>page.getByPlaceholder(\'Nhập mật khẩu\')</code>.'],
  starter: LOC_HEAD + String.raw`const locators = (page: Page) => ({
  welcome: page.getByText('TODO'),
  forgotLink: page.getByText('TODO'),
  emailInput: page.getByPlaceholder('TODO'),
  passwordInput: page.getByPlaceholder('TODO'),
});
`,
  tests: String.raw`
check('welcome: dòng chào mừng', () => H.locator('welcome', d => [...d.querySelectorAll('p.muted')], { kinds: ['text'], kindLabel: 'getByText' }));
check('forgotLink: liên kết Quên mật khẩu?', () => H.locator('forgotLink', 'a[href="/forgot"]', { kinds: ['text'], kindLabel: 'getByText' }));
check('emailInput: ô email', () => H.locator('emailInput', '#email', { kinds: ['placeholder'], kindLabel: 'getByPlaceholder' }));
check('passwordInput: ô mật khẩu', () => H.locator('passwordInput', '#password', { kinds: ['placeholder'], kindLabel: 'getByPlaceholder' }));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Tuần 4: bắt đầu automation</h3>
<p>Từ tuần này bạn viết code điều khiển một trang web thật. Trang mẫu là <strong>Sàn Demo</strong>, một sàn giao dịch giả lập có trang đăng nhập, bảng giá, đặt lệnh và danh sách lệnh. Mở tab <strong>Trang web</strong> để xem và bấm thử như người dùng.</p>
<p>Trang này có sẵn một bộ mô phỏng Playwright chạy ngay trong trình duyệt: cú pháp giống hệt Playwright thật, code viết bằng TypeScript. Bạn có thể copy code sang một project Playwright thật mà hầu như không phải sửa.</p>
<h3>Công cụ trong tab Trang web</h3>
<ul>
<li><strong>Thử locator:</strong> gõ một locator, bấm Thử, các phần tử khớp sẽ được khoanh tím và đếm số lượng.</li>
<li><strong>Chọn phần tử:</strong> bấm rồi chọn một phần tử trên trang, công cụ sẽ gợi ý các locator có thể dùng, giống tính năng Pick locator của Playwright.</li>
<li><strong>Inspect:</strong> chuột phải vào trang mẫu → Inspect (hoặc Kiểm tra) để xem HTML như trên trang thật.</li>
</ul>
<h3>Locator là gì</h3>
<p>Locator là "cách mô tả để tìm" một phần tử. Khác với <code>driver.findElement</code> của Selenium, tạo locator <strong>chưa</strong> đi tìm ngay. Playwright chỉ tìm khi bạn thao tác (click, fill) hoặc kiểm tra, và tự chờ tới khi phần tử sẵn sàng.</p>
<h3>Đọc một dòng code Playwright</h3>
<p>Mọi thao tác tuần này đều theo cùng một khuôn: <strong>tìm phần tử</strong>, rồi <strong>làm gì đó</strong> với nó.</p>
${ANAT(["await", "Chờ thao tác làm xong rồi mới chạy dòng tiếp theo (tuần 3, bài 6). Thiếu <code>await</code> là lỗi hay gặp nhất."], " ", ["page", "Tab trình duyệt đang mở. Playwright đưa vào qua <code>async ({ page }) =&gt;</code>."], [".getByRole(", "<strong>Cách tìm</strong>: theo vai trò. Mọi cách tìm của Playwright đều bắt đầu bằng <code>getBy</code>: <code>getByLabel</code>, <code>getByText</code>..."], ["'button'", "<strong>Tìm cái gì</strong>: một nút bấm. Chữ đặt trong nháy đơn."], ", ", ["{ name: 'Đăng nhập' }", "<strong>Tùy chọn</strong>, luôn nằm trong ngoặc nhọn: tên của nút, tức chữ in trên nút."], ")", [".click()", "<strong>Làm gì</strong>: bấm vào. Thao tác khác: <code>.fill('chữ')</code> gõ chữ, <code>.check()</code> tích ô, <code>.selectOption('giá trị')</code> chọn trong danh sách."], ";")}
<p>Đọc cả dòng: “chờ bấm xong vào <strong>nút</strong> có tên <strong>Đăng nhập</strong>”. Phần <code>page.getByRole(...)</code> là <strong>locator</strong>, phần <code>.click()</code> là <strong>thao tác</strong>.</p>
<h3>Cách lấy locator cho một phần tử</h3>
<ol>
<li><strong>Nhìn xem phần tử là loại gì:</strong> nút, liên kết, ô nhập, ô tích, tiêu đề, dòng trong bảng...</li>
<li><strong>Tìm chữ đi kèm:</strong> chữ trên nút hoặc liên kết, nhãn cạnh ô nhập, chữ mờ trong ô còn trống.</li>
<li><strong>Chọn cách tìm theo bảng dưới</strong>, xét từ trên xuống, dùng dòng đầu tiên phù hợp.</li>
<li><strong>Thử ngay</strong> trong ô <em>Thử locator</em> ở tab Trang web. Phải khớp đúng <strong>1</strong> phần tử: khớp 0 là sai chữ hoặc sai loại; khớp nhiều hơn thì thêm <code>exact: true</code> hoặc tìm trong một dòng cụ thể (bài 6).</li>
</ol>
${TRACE(['Bạn nhìn thấy', 'Dùng (ví dụ trên Sàn Demo)'], [["Nút, liên kết, tiêu đề, ô tích có chữ", "<code>getByRole('button', { name: 'Đăng nhập' })</code>"], ["Ô nhập có nhãn bên cạnh", "<code>getByLabel('Giá đặt')</code>"], ["Ô nhập chỉ có chữ mờ bên trong", "<code>getByPlaceholder('ban@congty.com')</code>"], ["Đoạn chữ thường: thông báo, mô tả", "<code>getByText('Quên mật khẩu?')</code>"], ["Không có chữ ổn định, ví dụ con số thay đổi", "<code>getByTestId('order-count')</code>"]])}
<p>Không chắc thì bấm <em>Chọn phần tử</em> rồi bấm vào phần tử trên trang, công cụ sẽ gợi ý locator. Hãy đọc hiểu gợi ý theo khuôn ở trên, đừng chép máy móc.</p>
<h3>getByText: tìm theo chữ nhìn thấy</h3>
<p>Cách dễ nhất: nhìn thấy chữ gì trên màn hình thì tìm bằng chữ đó. Mặc định chỉ cần khớp một phần và không phân biệt hoa thường. Thêm <code>{ exact: true }</code> để khớp chính xác.</p>
${ANAT(["page.getByText(", "Tìm phần tử theo chữ hiển thị trên màn hình."], ["'Quên mật khẩu?'", "Chữ cần tìm, chép như trên màn hình. Mặc định chỉ cần phần tử <strong>chứa</strong> chữ này, không phân biệt hoa thường."], ", ", ["{ exact: true }", "Không bắt buộc. Thêm vào khi cần khớp <strong>đúng từng chữ</strong>, kể cả hoa thường và dấu chấm hỏi."], ")")}
{{ex0}}
<h3>getByPlaceholder: tìm ô nhập theo chữ gợi ý</h3>
<p>Chữ mờ trong ô nhập khi còn trống gọi là placeholder. Nhiều ô nhập không có chữ nào khác bên cạnh, khi đó placeholder là cách nhận biết tự nhiên nhất.</p>
${ANAT(["page.getByPlaceholder(", "Tìm ô nhập theo chữ mờ bên trong nó."], ["'ban@congty.com'", "Chữ mờ, chép đúng như trên màn hình. Ô đã có chữ thì xóa hết để thấy lại chữ mờ."], ")", [".fill('an@test.vn')", "Thao tác: xóa nội dung cũ rồi gõ chữ mới vào ô."])}
{{ex1}}
<p class="note">Bài 1–5 học các cách <code>getBy...</code> theo thứ tự từ dễ đến khó. Khi dùng thật, hãy xét theo thứ tự trong bảng ở trên, đó là khuyến nghị của Playwright; bạn sẽ hiểu vì sao sau bài 3. CSS và XPath chỉ dùng khi mọi cách trên đều không được, nằm trong phần nâng cao cuối tuần (bài 22–24), không bắt buộc.</p>`,
examples:[String.raw`test('thử getByText', async ({ page }) => {
  await page.goto('/login');
  console.log('"Quên mật khẩu":', await page.getByText('Quên mật khẩu').count());
  console.log('"Đăng nhập":', await page.getByText('Đăng nhập').count());   // 2: tiêu đề và nút!
  console.log('"đăng nhập" exact:', await page.getByText('đăng nhập', { exact: true }).count());  // 0: sai hoa thường
});`,
String.raw`test('thử getByPlaceholder', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('ban@congty.com').fill('xin-chao@test.vn');
  console.log(await page.getByPlaceholder('ban@congty.com').inputValue());
});`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Lời giải</h3>
{{ex0}}
<h3>Giải thích</h3>
<ul>
<li><code>getByText('Chào mừng bạn quay lại')</code> chỉ cần một đoạn đủ phân biệt, không cần gõ hết câu.</li>
<li><code>getByText('Quên mật khẩu?')</code> trả về thẻ <code>a</code>, vì Playwright chọn phần tử nhỏ nhất chứa đoạn chữ đó.</li>
<li>Placeholder lấy từ thuộc tính <code>placeholder</code> của ô nhập. Nhìn trên trang là thấy, không cần mở HTML.</li>
</ul>
<h3>Lỗi hay gặp</h3>
<p>Dùng <code>getByText('Đăng nhập')</code> cho bất cứ thứ gì: khớp cả tiêu đề lẫn nút, bài 3 sẽ giải quyết việc này.</p>`,
examples:[LOC_HEAD + String.raw`const locators = (page: Page) => ({
  welcome: page.getByText('Chào mừng bạn quay lại'),
  forgotLink: page.getByText('Quên mật khẩu?'),
  emailInput: page.getByPlaceholder('ban@congty.com'),
  passwordInput: page.getByPlaceholder('Nhập mật khẩu'),
});`]},
});
