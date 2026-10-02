defineExercise({
  id: 'w2.14',
  title: 'Two Sum',
  desc: `<p>Cho mảng <code>nums</code> và số <code>target</code>. Tìm hai vị trí <code>i &lt; j</code> sao cho <code>nums[i] + nums[j] === target</code>, trả về <code>[i, j]</code>. Không có thì trả về <code>null</code>. Mỗi đề có tối đa một đáp án.</p>
<pre>([2, 7, 11, 15], 9) → [0, 1]
([3, 2, 4], 6)      → [1, 2]
([3, 3], 6)         → [0, 1]
([1, 2, 3], 100)    → null</pre>
<p>Đây là bài phỏng vấn nổi tiếng nhất. Hãy làm được cách thô trước, sau đó thử cách nhanh.</p>`,
  hints: [
    'Cách thô: hai vòng lặp lồng nhau thử mọi cặp <code>(i, j)</code> với <code>j &gt; i</code>. Đúng nhưng O(n²).',
    'Cách nhanh: duyệt một lần. Với mỗi số <code>x</code>, số cần tìm là <code>target - x</code>. Dùng object <code>seen</code> để nhớ "giá trị → vị trí" của các số đã đi qua.',
    'Mỗi vòng: nếu <code>seen[target - x] !== undefined</code> thì trả về <code>[seen[target - x], i]</code>; nếu không thì lưu <code>seen[x] = i</code>. Chú ý vị trí có thể là 0 (falsy), nên phải so sánh với <code>undefined</code>.'],
  starter: String.raw`function twoSum(nums, target) {

}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
`,
  tests: String.raw`
test('([2, 7, 11, 15], 9) → [0, 1]', () => expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]));
test('([3, 2, 4], 6) → [1, 2]', () => expect(twoSum([3, 2, 4], 6)).toEqual([1, 2]));
test('([3, 3], 6) → [0, 1]', () => expect(twoSum([3, 3], 6)).toEqual([0, 1]));
test('([1, 5, 9, 12], 21) → [2, 3]', () => expect(twoSum([1, 5, 9, 12], 21)).toEqual([2, 3]));
test('Không dùng một phần tử hai lần: ([3, 5], 6) → null', () => expect(twoSum([3, 5], 6)).toBe(null));
test('([1, 2, 3], 100) → null', () => expect(twoSum([1, 2, 3], 100)).toBe(null));
test('Có số âm: ([-3, 4, 3, 90], 0) → [0, 2]', () => expect(twoSum([-3, 4, 3, 90], 0)).toEqual([0, 2]));
`,

  // ===== Bài giảng =====
  lesson: { html:`
<h3>Đánh đổi bộ nhớ lấy tốc độ</h3>
<p>Cách thô thử mọi cặp, số cặp tăng rất nhanh:</p>
{{ex0}}
<p>Cách nhanh đặt câu hỏi ngược lại: đang đứng ở số <code>x</code>, số "bạn đời" cần tìm là <code>target - x</code>. Nếu đã từng gặp nó thì có đáp án ngay. Để trả lời "đã gặp chưa" trong một bước, dùng object làm sổ tra cứu.</p>
<h3>Object làm sổ tra cứu</h3>
<p>Tra <code>obj[key]</code> gần như tức thì bất kể object có bao nhiêu key, trong khi <code>indexOf</code> trên mảng phải duyệt từng phần tử.</p>
{{ex1}}
<p class="note">Nhớ bài truthy/falsy tuần 1: vị trí 0 là falsy. Viết <code>if (seen[need])</code> sẽ bỏ sót đáp án khi số cần tìm nằm ở index 0.</p>`,
examples:[String.raw`function countPairs(n) {
  let pairs = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) pairs++;
  }
  return pairs;
}
console.log(countPairs(10), countPairs(1000), countPairs(10000));`,
String.raw`const codes = ["7203", "6758", "9984"];
const indexOf = {};
for (let i = 0; i < codes.length; i++) {
  indexOf[codes[i]] = i;
}
console.log(indexOf);            // { "7203": 0, "6758": 1, "9984": 2 }
console.log(indexOf["9984"]);    // 2
console.log(indexOf["7203"]);    // 0 (falsy!)
console.log(indexOf["1111"]);    // undefined: chưa gặp`]},

  // ===== Lời giải =====
  solution: { html:`
<h3>Cách 1: thử mọi cặp</h3>
{{ex0}}
<p>Đúng, dễ hiểu, nhưng O(n²). Với 100.000 phần tử là khoảng 5 tỷ cặp.</p>
<h3>Cách 2: một lượt duyệt với object</h3>
{{ex1}}
<h3>Chạy tay với ([3, 2, 4], 6)</h3>
${TRACE(['i', 'x', 'need = 6 − x', 'seen[need]', 'seen sau bước'], [['0', '3', '3', 'undefined', '{ 3: 0 }'], ['1', '2', '4', 'undefined', '{ 3: 0, 2: 1 }'], ['2', '4', '2', '1', 'trả về <code>[1, 2]</code>']])}
<h3>Vì sao kiểm tra trước rồi mới lưu</h3>
<p>Với <code>([3, 5], 6)</code>: ở i = 0, need = 3. Nếu lưu <code>seen[3] = 0</code> trước rồi mới kiểm tra, sẽ tìm thấy chính nó và trả về <code>[0, 0]</code>, dùng một phần tử hai lần. Kiểm tra trước thì không bị lỗi này. Với <code>([3, 3], 6)</code> vẫn đúng vì số 3 thứ hai tìm thấy số 3 thứ nhất.</p>
<h3>Độ phức tạp</h3>
${TRACE(['Cách', 'Thời gian', 'Bộ nhớ thêm'], [['Hai vòng lặp', 'O(n²)', 'O(1)'], ['Object tra cứu', 'O(n)', 'O(n)']])}
<p>Đây là ví dụ kinh điển của đánh đổi bộ nhớ lấy tốc độ, câu hỏi tiếp theo gần như chắc chắn trong phỏng vấn sau khi bạn đưa ra cách 1.</p>`,
examples:[String.raw`function twoSumSlow(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return null;
}
console.log(twoSumSlow([2, 7, 11, 15], 9));`,
String.raw`function twoSum(nums, target) {
  const seen = {};
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen[need] !== undefined) return [seen[need], i];
    seen[nums[i]] = i;
  }
  return null;
}

console.log(twoSum([3, 2, 4], 6));
console.log(twoSum([3, 5], 6));`]},
});
