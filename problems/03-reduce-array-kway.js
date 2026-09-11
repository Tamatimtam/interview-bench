window.REGISTER_PROBLEM({
  id: "reduce-array-kway",
  title: "3. K-Way Merge (Combine K Ropes at Once)",
  category: "Heap",
  tag: "Variation: K-ary Heap",
  difficulty: "Hard",
  badgeColor: "amber",
  summary: "Merge K items at a time instead of 2. Beware the tricky padding edge case!",
  description: `
    <h3>Problem Statement</h3>
    <p>Suppose your rope-tying machine is upgraded: it can tie <strong>K</strong> ropes together at the same time into a single rope, with cost equal to the sum of all K ropes.</p>
    <p>You must reduce the array to a single element by picking the <strong>K smallest</strong> elements at each step until only 1 rope remains.</p>

    <h3>The Gotcha / Edge Case</h3>
    <p>When K = 2, every merge removes 2 ropes and adds 1 rope, reducing the total count by <code>2 - 1 = 1</code>. That always ends cleanly with 1 rope.</p>
    <p>When K > 2, each merge removes K ropes and adds 1, reducing the count by <code>K - 1</code>. If <code>(len(arr) - 1) % (K - 1) != 0</code>, your last merge won't have K ropes! To minimize cost, you must pad the array with dummy <code>0</code>s at the start so all merges are full.</p>

    <h3>Example</h3>
    <div class="code-block">
Input: arr = [3, 2, 4, 1], k = 3
Count = 4. (4 - 1) % (3 - 1) = 3 % 2 = 1 != 0.
Pad with (2 - 1) = one 0 -> arr = [0, 1, 2, 3, 4]
Step 1: Pick 3 smallest (0, 1, 2) -> Sum = 3, Cost = 3. Remaining: [3, 3, 4]
Step 2: Pick 3 smallest (3, 3, 4) -> Sum = 10, Cost = 3 + 10 = 13. Remaining: [10]
Output: 13
    </div>
  `,
  starterCode: `import heapq

def reduceArrayK(arr, k):
    # Your code here
    # 1. Check if padding with 0s is needed
    # 2. Heapify
    # 3. Repeatedly pop k smallest elements
    total_cost = 0
    
    return total_cost
`,
  optimalSolution: `import heapq

def reduceArrayK(arr, k):
    n = len(arr)
    if n <= 1:
        return 0
    if k <= 1:
        return 0

    # Step 1: Calculate if we need dummy zero ropes
    # Each merge reduces array size by (k - 1)
    # We want (n - 1) to be a multiple of (k - 1)
    remainder = (n - 1) % (k - 1)
    if remainder != 0:
        padding_needed = (k - 1) - remainder
        arr = arr + [0] * padding_needed

    heapq.heapify(arr)
    total_cost = 0

    # Step 2: Merge k smallest items at a time
    while len(arr) > 1:
        current_sum = 0
        for _ in range(k):
            if arr:
                current_sum += heapq.heappop(arr)
        
        total_cost += current_sum
        heapq.heappush(arr, current_sum)

    return total_cost
`,
  intuition: `
    <h3>Why do we pad with zeros?</h3>
    <p>Imagine you have 4 ropes and K = 3. If you merge 3 ropes first, you get 1 rope. Now you have 1 new rope + 1 old rope = 2 ropes. But your machine needs 3 ropes! You're stuck.</p>
    <p>Or if you allow a partial merge at the end, that means you merged big numbers with only 2 items instead of 3, missing out on efficiency.</p>
    <p>By adding dummy ropes of length 0 right at the start, the 0s get consumed in the very first merge without adding any cost, perfectly aligning the math so the rest of the merges are 100% full K-way merges.</p>

    <h3>Complexity</h3>
    <ul>
      <li><strong>Time Complexity:</strong> O(N log N)</li>
      <li><strong>Space Complexity:</strong> O(N)</li>
    </ul>
  `,
  testCases: [
    { input: "[3, 2, 4, 1], 3", expected: 13, note: "Requires 1 zero padding" },
    { input: "[1, 2, 3, 4, 5], 3", expected: 21, note: "5 items with k=3 (perfect fit)" },
    { input: "[2, 4, 1, 3, 5], 4", expected: 18, note: "k=4 with padding" },
    { input: "[5, 5, 5, 5, 5, 5, 5], 3", expected: 65, note: "7 items with k=3" }
  ],
  functionName: "reduceArrayK"
});
