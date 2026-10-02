/* =============================================================================
   DANH MỤC KHÓA HỌC: NGUỒN DUY NHẤT cho thứ tự, tuần, nhóm và số thứ tự bài.

   Thêm một bài:
     1. Tạo content/<thư mục tuần>/<id>.js, gọi defineExercise({ id, title, desc, starter, tests, lesson, solution }).
     2. Ghi id của bài vào đúng nhóm bên dưới. Vị trí trong danh sách quyết định thứ tự hiển thị.

   Không khai báo week, group, num hay optional trong tệp bài: chúng được suy ra từ đây.
     - num:      theo thứ tự trong tuần (tuần có numbering 'group' thì là <số nhóm>.<số bài trong nhóm>).
     - optional: đặt optional: true cho cả nhóm; bài trong nhóm không tính vào tiến độ.
     - tip:      mô tả ngắn của tuần (tooltip và README). {n} được thay bằng số bài bắt buộc của tuần.

   Sau khi sửa danh mục, chạy npm run readme để cập nhật bảng tuần trong README.md.
   ========================================================================== */
const CURRICULUM = {
  // Bài luyện tự do, không thuộc tuần nào và không chấm điểm.
  free: { group: 'Luyện tự do', dir: 'free', exercises: ['sandbox'] },

  weeks: [
    {
      week: 1, dir: 'week1',
      title: 'nền tảng JavaScript',
      tip: 'Biến, điều kiện, vòng lặp, function, chuỗi và mảng qua {n} bài. Nền tảng để đọc và tự viết được code test.',
      numbering: 'group',   // số bài dạng <số nhóm>.<số bài>, ví dụ 2.1
      groups: [
        { name: '1. Biến và kiểu dữ liệu', exercises: ['1.1', '1.2', '1.3'] },
        { name: '2. Toán tử và điều kiện', exercises: ['2.1', '2.2', '2.3', '2.4'] },
        { name: '3. Vòng lặp', exercises: ['3.1', '3.2', '3.3', '3.4'] },
        { name: '4. Function', exercises: ['4.1', '4.2', '4.3', '4.4', '4.5'] },
        { name: '5. String', exercises: ['5.1', '5.2', '5.3', '5.4'] },
        { name: '6. Array cơ bản', exercises: ['6.1', '6.2', '6.3'] },
        { name: '7. Bài tổng hợp', exercises: ['7.1', '7.2'] },
      ],
    },
    {
      week: 2, dir: 'week2',
      title: 'ôn tập qua thuật toán cơ bản',
      tip: '{n} bài thuật toán cơ bản hay gặp khi phỏng vấn, giúp dùng thành thạo kiến thức tuần 1.',
      groups: [
        { name: 'Chuỗi', exercises: ['w2.1', 'w2.2', 'w2.3', 'w2.4', 'w2.5', 'w2.6'] },
        { name: 'Số học', exercises: ['w2.7', 'w2.8', 'w2.9', 'w2.10'] },
        { name: 'Mảng', exercises: ['w2.11', 'w2.12', 'w2.13', 'w2.14', 'w2.15'] },
        { name: 'Sắp xếp và tìm kiếm', exercises: ['w2.16', 'w2.17'] },
        { name: 'Bài toán chứng khoán', exercises: ['w2.18'] },
      ],
    },
    {
      week: 3, dir: 'week3',
      title: 'JavaScript nâng cao (ES6+)',
      tip: 'Cú pháp dùng hằng ngày trong Playwright: arrow function, destructuring, map/filter, async/await. {n} bài bắt buộc, phần còn lại là nâng cao.',
      shared: ['shared.js'],   // tệp dùng chung, chạy trước các bài của tuần
      groups: [
        { name: 'Arrow function và destructuring', exercises: ['w3.1', 'w3.2'] },
        { name: 'Method của mảng', exercises: ['w3.5', 'w3.6', 'w3.8'] },
        { name: 'Bất đồng bộ: async/await', exercises: ['w3.14', 'w3.15'] },
        { name: 'Nâng cao (không bắt buộc): cú pháp và mảng', optional: true, exercises: ['w3.3', 'w3.4', 'w3.7', 'w3.9', 'w3.10'] },
        { name: 'Nâng cao (không bắt buộc): bất đồng bộ', optional: true, exercises: ['w3.11', 'w3.12', 'w3.13', 'w3.16', 'w3.17', 'w3.18'] },
      ],
    },
    {
      week: 4, dir: 'week4',
      title: 'Automation với Playwright + TypeScript',
      tip: 'Viết test tự động trên trang Sàn Demo: locator, assertion, Page Object Model, fixture, đến một dự án POM hoàn chỉnh.',
      shared: ['shared-locator.js', 'shared-structure.js', 'shared-projects.js'],   // tệp dùng chung, chạy trước các bài của tuần
      groups: [
        { name: 'Locator theo cách của Playwright', exercises: ['w4.1', 'w4.2', 'w4.3', 'w4.4', 'w4.5', 'w4.9', 'w4.10'] },
        { name: 'Viết step với Playwright + TypeScript', exercises: ['w4.11', 'w4.12', 'w4.13', 'w4.14', 'w4.15', 'w4.16', 'w4.17', 'w4.18'] },
        { name: 'Cấu trúc project Playwright', exercises: ['w4.19', 'w4.20', 'w4.21'] },
        { name: 'Dự án POM hoàn chỉnh', exercises: ['w4.22', 'w4.23', 'w4.24'] },
        { name: 'Nâng cao (không bắt buộc): CSS và XPath', optional: true, exercises: ['w4.6', 'w4.7', 'w4.8'] },
      ],
    },
    {
      week: 5, dir: 'week5',
      title: 'CI/CD pipeline với GitHub Actions',
      tip: 'Cho bộ test tự chạy khi push code: workflow, secrets, artifact, matrix, sharding và chạy theo lịch.',
      shared: ['shared.js'],   // tệp dùng chung, chạy trước các bài của tuần
      groups: [
        { name: 'Chuẩn bị project cho CI', exercises: ['w5.1', 'w5.2'] },
        { name: 'GitHub Actions cơ bản', exercises: ['w5.3', 'w5.4', 'w5.5', 'w5.6'] },
        { name: 'Pipeline nâng cao', exercises: ['w5.7', 'w5.8', 'w5.9', 'w5.10'] },
        { name: 'Tổng hợp', exercises: ['w5.11'] },
      ],
    },
    {
      week: 6, dir: 'week6',
      title: 'AI trong automation testing',
      tip: 'Nhờ AI viết test case, viết test và debug nhanh hơn, và kỹ năng quan trọng nhất: kiểm chứng những gì AI đưa ra.',
      shared: ['shared.js'],   // tệp dùng chung, chạy trước các bài của tuần
      groups: [
        { name: 'Dùng AI an toàn và đúng cách', exercises: ['w6.1', 'w6.2', 'w6.3'] },
        { name: 'AI viết test, bạn kiểm chứng', exercises: ['w6.4', 'w6.5', 'w6.6', 'w6.7'] },
        { name: 'Đưa AI vào công việc hằng ngày', exercises: ['w6.8', 'w6.9'] },
      ],
    },
  ],
};
