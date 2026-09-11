// ============================================================================
// TEMPLATE: HOW TO ADD A NEW PROBLEM
// 1. Duplicate this file and rename it (e.g. 06-my-new-problem.js)
// 2. Fill in the fields below
// 3. Add `<script src="problems/06-my-new-problem.js"></script>` to index.html
// That's it! It will automatically appear in the app and search menu!
// ============================================================================

window.REGISTER_PROBLEM({
  id: "my-problem-id",                  // Unique URL-friendly ID
  title: "6. Your Problem Title",       // Title displayed in navbar & list
  category: "Heap",                     // Category: Heap, Greedy, Dynamic Programming, Array, etc.
  tag: "Tag Label",                     // Badge tag displayed next to title
  difficulty: "Medium",                 // Easy | Medium | Hard
  badgeColor: "green",                  // green | purple | amber | blue | red
  summary: "One sentence summary of the problem for the browser list.",

  description: `
    <h3>Problem Statement</h3>
    <p>Describe what the function should do here.</p>

    <h3>Example</h3>
    <div class="code-block">
Input: arr = [1, 2, 3]
Output: 6
    </div>

    <h3>Constraints</h3>
    <ul>
      <li>1 &le; arr.length &le; 100,000</li>
    </ul>
  `,

  starterCode: `def solve(arr):
    # Write your solution here
    return 0
`,

  optimalSolution: `def solve(arr):
    # Optimal reference solution with comments
    return sum(arr)
`,

  intuition: `
    <h3>Core Intuition</h3>
    <p>Explain why this solution works in plain English without confusing notation.</p>

    <h3>Time & Space Complexity</h3>
    <ul>
      <li><strong>Time Complexity:</strong> O(N)</li>
      <li><strong>Space Complexity:</strong> O(1)</li>
    </ul>
  `,

  testCases: [
    { input: "[1, 2, 3]", expected: 6, note: "Sample test case" },
    { input: "[10, 20]", expected: 30, note: "Two elements case" }
  ],

  functionName: "solve"                 // The Python function name to execute
});
