window.REGISTER_PROBLEM({
  id: "reduce-array-adjacent",
  title: "5. Adjacent Ropes Only (The Dynamic Programming Trap)",
  category: "Dynamic Programming",
  tag: "The Trap: Interval DP",
  difficulty: "Hard",
  badgeColor: "red",
  summary: "What if you can ONLY merge neighbor items sitting next to each other? Greedy breaks completely!",
  description: `
    <h3>The Classic Interview Pivot</h3>
    <p>The interviewer introduces a small rule change: <em>"What if the ropes are lying in a row, and you are <strong>only allowed to tie adjacent (neighboring) ropes</strong> together?"</em></p>
    
    <p><strong>Warning:</strong> You cannot use a Min-Heap or Greedy here! If the two smallest numbers are at opposite ends of the array, merging them is forbidden.</p>

    <h3>Problem Statement</h3>
    <p>Given an array of rope lengths, find the minimum cost to merge all ropes into one, where you may only merge two <strong>adjacent</strong> ropes into a single rope with cost equal to their sum.</p>

    <h3>Example</h3>
    <div class="code-block">
Input: arr = [3, 2, 4, 1]
If we greedily pick smallest (1, 2), they are NOT adjacent!
Adjacent choices:
Merge (3, 2) -> [5, 4, 1], cost 5
Merge (4, 1) -> [5, 5], cost 5 + 5 = 10
Merge (5, 5) -> [10], cost 10 + 10 = 20 total.
Best combination gives minimum cost = 20.
    </div>
  `,
  starterCode: `def reduceArrayAdjacent(arr):
    # arr must be merged adjacent-only!
    # Hint: This is Interval DP (like Matrix Chain Multiplication)
    # dp[i][j] = min cost to merge sub-array from index i to j
    n = len(arr)
    if n <= 1:
        return 0
        
    # Your DP logic here
    return 0
`,
  optimalSolution: `def reduceArrayAdjacent(arr):
    n = len(arr)
    if n <= 1:
        return 0

    # Prefix sums for fast range sum query: sum(arr[i..j])
    prefix = [0] * (n + 1)
    for i in range(n):
        prefix[i + 1] = prefix[i] + arr[i]

    def range_sum(i, j):
        return prefix[j + 1] - prefix[i]

    # dp[i][j] stores the minimum cost to merge subarray from index i to j
    dp = [[0] * n for _ in range(n)]

    # Length of subarray window from 2 to n
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float('inf')
            
            # Try every split point k between i and j
            for k in range(i, j):
                cost = dp[i][k] + dp[k + 1][j] + range_sum(i, j)
                if cost < dp[i][j]:
                    dp[i][j] = cost

    return dp[0][n - 1]
`,
  intuition: `
    <h3>Why Greedy fails here</h3>
    <p>In the original problem, you had global freedom: any two ropes could be tied together. That made Greedy optimal.</p>
    <p>When ropes must be adjacent, a local choice (e.g. tying 3 and 2) locks the rest of the array into fixed boundaries. Choosing the cheapest local pair might force an extraordinarily expensive merge later.</p>
    <p>Because there is an optimal substructure with overlapping subproblems, we must check all possible split points <code>k</code> that split the range <code>[i..j]</code> into left <code>[i..k]</code> and right <code>[k+1..j]</code>.</p>

    <h3>Complexity</h3>
    <ul>
      <li><strong>Time Complexity:</strong> O(N^3) (or O(N^2) with Knuth's optimization). We check all pairs (i, j) and iterate k through the range.</li>
      <li><strong>Space Complexity:</strong> O(N^2) for the 2D DP table.</li>
    </ul>

    <h3>What to say in the interview</h3>
    <p><em>"Because we are restricted to adjacent elements, this is no longer a greedy problem. It reduces to Interval Dynamic Programming, similar to Matrix Chain Multiplication or LeetCode's Minimum Cost to Merge Stones."</em></p>
  `,
  testCases: [
    { input: "[3, 2, 4, 1]", expected: 20, note: "Classic adjacent merge example" },
    { input: "[1, 2, 3, 4]", expected: 19, note: "Adjacent 4 elements" },
    { input: "[10, 20]", expected: 30, note: "2 items adjacent" },
    { input: "[6, 4, 4, 6]", expected: 40, note: "Symmetric values" }
  ],
  functionName: "reduceArrayAdjacent"
});
