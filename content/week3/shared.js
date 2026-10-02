/* Hằng số dùng chung của các bài tuần 3. Chạy trước các bài của tuần (xem "shared" trong content/curriculum.js). */

const STRIP = String.raw`const __code = __source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const __noLoop = () => expect(/\b(for|while)\s*\(/.test(__code), 'Tuần này hãy dùng method của mảng thay cho vòng lặp for/while').toBe(false);
const __mk = (table, ms = 30) => code => new Promise((res, rej) => setTimeout(() => (code in table ? res(table[code]) : rej(new Error("Unknown code: " + code))), ms));
const __rejects = async p => { try { await p; return null; } catch (e) { return e; } };
`;
