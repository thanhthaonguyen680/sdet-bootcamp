# Lộ trình tự học SDET cho team QC/QA: JavaScript, Playwright, CI/CD và AI

Mình xây dựng lộ trình này dành cho các thành viên trong team QC/QA có nhu cầu học và từng bước thực hành theo hướng SDET. Nội dung được chia thành <!--weeks-->6<!--/weeks--> tuần, từ JavaScript nền tảng đến Playwright, CI/CD và dùng AI trong automation testing. Bạn có thể học và làm bài trực tiếp trên trình duyệt, không cần cài đặt gì.

**Dùng thử:** https://TEN-CUA-BAN.github.io/sdet-bootcamp/

## Nội dung

<!-- Bảng này được sinh từ content/curriculum.js bằng `npm run readme`, đừng sửa tay. -->
<!-- curriculum:start -->
| Tuần | Chủ đề | Số bài |
|------|--------|--------|
| 1 | **Nền tảng JavaScript.** Biến, điều kiện, vòng lặp, function, chuỗi và mảng qua 25 bài. Nền tảng để đọc và tự viết được code test. | 25 |
| 2 | **Ôn tập qua thuật toán cơ bản.** 18 bài thuật toán cơ bản hay gặp khi phỏng vấn, giúp dùng thành thạo kiến thức tuần 1. | 18 |
| 3 | **JavaScript nâng cao (ES6+).** Cú pháp dùng hằng ngày trong Playwright: arrow function, destructuring, map/filter, async/await. 7 bài bắt buộc, phần còn lại là nâng cao. | 7 + 11 nâng cao |
| 4 | **Automation với Playwright + TypeScript.** Viết test tự động trên trang Sàn Demo: locator, assertion, Page Object Model, fixture, đến một dự án POM hoàn chỉnh. | 21 + 3 nâng cao |
| 5 | **CI/CD pipeline với GitHub Actions.** Cho bộ test tự chạy khi push code: workflow, secrets, artifact, matrix, sharding và chạy theo lịch. | 11 |
| 6 | **AI trong automation testing.** Nhờ AI viết test case, viết test và debug nhanh hơn, và kỹ năng quan trọng nhất: kiểm chứng những gì AI đưa ra. | 9 |
<!-- curriculum:end -->

## Tính năng

- Editor có tô màu cú pháp, chấm bài tự động, bài giảng, gợi ý và lời giải cho từng bài
- Trang web mẫu (sàn giao dịch giả lập) để luyện locator và viết test Playwright
- Bộ chấm "cài bug" vào trang để kiểm tra test có thực sự bắt được lỗi không
- Mô phỏng GitHub Actions: chạy workflow YAML, xem từng job, từng bước và log
- Tiến độ lưu tự động trong trình duyệt

## Cấu trúc dự án

Trang là web tĩnh, **không cần build**: mở `index.html` hoặc chạy bằng bất kỳ máy chủ tĩnh nào (GitHub Pages dùng trực tiếp). Mã nguồn chia theo thư mục, mỗi tệp một việc:

```
index.html              Khung trang, chỉ có markup và danh sách tệp cần nạp
css/                    Giao diện, mỗi tệp một phần (tokens, header, lesson, editor, responsive...)
content/
  curriculum.js         Danh mục khóa học: NGUỒN DUY NHẤT cho tuần, nhóm, thứ tự và số bài
  helpers.js            Hàm hỗ trợ viết bài giảng (L, ANAT, TRACE)
  free/ week1/ ... week6/   Mỗi bài một tệp: đề bài + bài giảng + lời giải + bộ chấm
js/
  boot.js               Khởi động: nạp nội dung, dựng danh mục, dựng giao diện
  catalog.js, loader.js Ghép các tệp bài thành danh mục; nạp tệp theo curriculum.js
  core/                 Trạng thái người học, truy vấn trên danh mục
  editor/               Ô soạn code và tô màu cú pháp
  runner/               Chạy và chấm bài JavaScript
  playwright/           Mô phỏng Playwright: locator, expect, chạy test TypeScript
  sandbox/              Sàn Demo, trang web mẫu để luyện viết test (kèm bug cài sẵn)
  project/              Bài làm theo project nhiều tệp
  ci/                   Mô phỏng GitHub Actions
  ui/                   Danh sách bài, đề bài, tooltip, hướng dẫn nhanh, thanh kéo
tools/                  verify.mjs (kiểm tra cả khóa), sync-readme.mjs
```

Nguyên tắc: mỗi thông tin chỉ nằm ở **một chỗ**. Tuần, nhóm, thứ tự, số thứ tự bài, cờ "không bắt buộc", nút chọn tuần, phụ đề và tooltip của tuần đều được suy ra từ `content/curriculum.js`, không viết lại ở nơi khác.

## Thêm nội dung

**Thêm một bài**

1. Tạo `content/weekN/<id>.js` rồi gọi `defineExercise({ ... })` với `id`, `title`, `desc`, `starter`, `tests`, `lesson`, `solution` (xem một bài có sẵn làm mẫu, ví dụ `content/week1/1.1.js`).
2. Ghi `id` đó vào đúng nhóm trong `content/curriculum.js`. Vị trí trong danh sách là thứ tự hiển thị.

Không khai báo `week`, `group`, `num`, `optional` trong tệp bài. Chúng được suy ra từ vị trí trong danh mục, nên đổi chỗ hay chèn bài mới không phải đánh số lại.

**Thêm một tuần**: thêm một mục vào `weeks` trong `content/curriculum.js` (kèm thư mục `content/weekN/`). Nút chọn tuần, phụ đề và tooltip tự có. Dữ liệu dùng chung của các bài trong tuần đặt trong tệp `shared*.js` và khai báo ở khóa `shared`.

**Cập nhật README**: `npm run readme` sinh lại bảng tuần ở trên từ danh mục.

## Kiểm tra

```bash
npm install
npx playwright install chromium
npm run verify                    # nạp trang không lỗi + nộp lời giải của mọi bài vào bộ chấm
npm run verify -- --week=4        # chỉ một tuần
npm run verify -- --only=1.1,w4.3 # chỉ vài bài
```

Chạy sau mỗi lần sửa nội dung hoặc bộ chấm: bài nào lời giải không còn đạt sẽ hiện ra ngay.

Lưu ý: các tệp `.js` được nạp bằng thẻ `<script>` thường (không dùng ES module) nên mở trực tiếp từ ổ đĩa vẫn chạy. Thứ tự thẻ `<script>` trong `index.html` là thứ tự phụ thuộc; tệp nào dùng một tên ngay lúc nạp thì phải đứng sau tệp định nghĩa tên đó. Tệp `.nojekyll` bảo GitHub Pages phục vụ nguyên trạng các tệp, đừng xóa.

## Về dự án

Mục tiêu của dự án là giúp các thành viên QC/QA trong team có một lộ trình rõ ràng để tự học, thực hành và follow từng tuần. Nội dung và công cụ do mình thiết kế với sự hỗ trợ của AI (Claude).

## Tác giả

TÊN CỦA BẠN · QA Engineer · LinkedIn / email
