/* Hàm kiểm tra dùng chung cho các bài tuần 6. Chạy trước các bài của tuần (xem "shared" trong content/curriculum.js). */

const AWAIT_LINT = String.raw`
const __noAwait = () => __code.split('\n').filter(l => (/\.(click|fill|check|uncheck|goto|selectOption|press|setChecked)\(/.test(l) || /expect\(.*\)\.(not\.)?to(HaveText|ContainText|BeVisible|BeHidden|HaveValue|HaveURL|HaveCount|BeChecked|BeEnabled|BeDisabled)\(/.test(l)) && !/\bawait\b/.test(l)).map(l => l.trim());
`;
