window.REGISTER_PROBLEM({
  id: "reduce-array-min",
  title: "1. Reduce Array (Min Cost) — Connect Ropes",
  category: "Heap",
  tag: "Classic (Min-Heap)",
  difficulty: "Medium",
  badgeColor: "green",
  summary: "Pick two smallest elements, sum them, add to total cost, and repeat until 1 element remains.",
  description: `
    <h3>Problem Statement</h3>
    <p>Given an array of integers representing the lengths of ropes (or array elements), reduce the array to a single element. In each step, you must:</p>
    <ol>
      <li>Pick the two <strong>smallest</strong> elements in the array.</li>
      <li>Combine them into one by calculating their sum.</li>
      <li>Add this sum to your total accumulated cost.</li>
      <li>Insert the combined sum back into the array.</li>
    </ol>
    <p>Repeat this process until only one element is left. Return the <strong>minimum total cost</strong> needed to reduce the array.</p>

    <h3>Example</h3>
    <div class="code-block">
Input: arr = [25, 10, 20]
Step 1: Pick smallest (10, 20) -> Sum = 30, Cost = 30. Remaining: [25, 30]
Step 2: Pick (25, 30) -> Sum = 55, Cost = 30 + 55 = 85. Remaining: [55]
Output: 85
    </div>

    <h3>Constraints</h3>
    <ul>
      <li>2 &le; arr.length &le; 100,000</li>
      <li>1 &le; arr[i] &le; 10,000</li>
    </ul>
  `,
  starterCode: `import heapq

def reduceArray(arr):
    # Your code here
    # 1. Heapify the array
    # 2. Repeatedly pop the 2 smallest numbers
    # 3. Add to total cost and push sum back
    cost = 0
    
    return cost
`,
  optimalSolution: `import heapq

def reduceArray(arr):
    # Step 1: Turn list into a min-heap in O(N) time
    heapq.heapify(arr)
    total_cost = 0

    # Step 2: Loop until only 1 rope/element remains
    while len(arr) > 1:
        smallest = heapq.heappop(arr)
        second = heapq.heappop(arr)
        
        merge_sum = smallest + second
        total_cost += merge_sum
        
        # Put the new combined rope back into the heap
        heapq.heappush(arr, merge_sum)

    return total_cost
`,
  intuition: `
    <h3>Why Greedy with a Min-Heap works</h3>
    <p>Think about this like a snowball effect. Every time you combine two numbers, that new combined number has to be combined again in the next round, and the round after that, until the very end.</p>
    <p>That means the numbers you combine <strong>first</strong> will be added to the total cost multiple times! The numbers you combine <strong>last</strong> will only be added once.</p>
    <p>To keep the total cost as small as possible, you always want the smallest numbers to suffer the most repeat additions. That's why picking the two smallest numbers at every step (Greedy) gives the mathematically optimal answer.</p>

    <h3>Time & Space Complexity</h3>
    <ul>
      <li><strong>Time Complexity:</strong> O(N log N). heapify takes O(N), and we do N-1 iterations. Each heappop and heappush takes O(log N).</li>
      <li><strong>Space Complexity:</strong> O(1) extra space if modifying input in-place, or O(N) if duplicating.</li>
    </ul>

    <h3>Interview Talking Point</h3>
    <p><em>"This problem is conceptually identical to building a Huffman Tree. Elements merged deeper in the tree contribute more weight to the total cost, so prioritizing smaller items first minimizes the weighted path length."</em></p>
  `,
  testCases: [
    { input: "[25, 10, 20]", expected: 85, note: "HackerRank Sample #00" },
    { input: "[10, 20]", expected: 30, note: "Base case of 2 items" },
    { input: "[4, 3, 2, 6]", expected: 29, note: "Standard LeetCode 1167 case" },
    { input: "[1, 2, 5, 10, 35, 89]", expected: 224, note: "Steeply increasing values" },
    { input: "[8, 4, 6, 12]", expected: 58, note: "Even number of items" },
    { input: "[100, 100, 100, 100]", expected: 800, note: "Identical elements" }
  ],
  functionName: "reduceArray"
});
