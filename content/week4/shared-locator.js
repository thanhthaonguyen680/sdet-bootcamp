/* Khung code và hàm chấm dùng chung cho các bài locator và viết step. Chạy trước các bài của tuần (xem "shared" trong content/curriculum.js). */

const LOC_HEAD = String.raw`import { Page } from '@playwright/test';

`;
const PWG = String.raw`
const __passed = () => __pw.tests.length > 0 && __pw.tests.every(t => t.status === 'passed');
const __failMsg = () => { const f = __pw.tests.find(t => t.status !== 'passed'); return f ? 'Test "' + f.name + '" chưa pass:\n' + (f.error ? f.error.message : '') : 'Chưa có test nào'; };
const __acts = () => __pw.tests.flatMap(t => t.actions);
const __asserts = () => __pw.tests.flatMap(t => t.asserts);
const __okAssert = (re) => __asserts().some(a => a.pass && re.test(a.matcher));
`;
