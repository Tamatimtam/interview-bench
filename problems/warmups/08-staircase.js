window.REGISTER_PROBLEM({
  id: "staircase",
  title: "8. Staircase Problem",
  category: "Warmup",
  tag: "Loops & Strings",
  difficulty: "Easy",
  badgeColor: "green",
  summary: "Print a right-aligned staircase of size n using spaces and hash (#) symbols.",
  description: `
    <h3>Problem Statement</h3>
    <p>This is a classic HackerRank interview warmup challenge. Given an integer <code>n</code>, print a staircase of size <code>n</code> using <code>#</code> symbols and spaces.</p>
    <p>The staircase must be <strong>right-aligned</strong> with base and height both equal to <code>n</code>.</p>
    <ul>
      <li>The first line has 1 <code>#</code> preceded by <code>n - 1</code> spaces.</li>
      <li>The last line has <code>n</code> <code>#</code> symbols with <strong>no</strong> preceding spaces.</li>
    </ul>

    <h3>Example (n = 4)</h3>
    <div class="code-block">
   #
  ##
 ###
####
    </div>

    <h3>Input Format</h3>
    <p>A single integer, <code>n</code>, denoting the size of the staircase.</p>

    <h3>Constraints</h3>
    <ul>
      <li>1 &le; n &le; 100</li>
    </ul>
  `,
  starterCode: `def staircase(n):
    # Write your code here
    # Print a right-aligned staircase of size n using '#' and spaces
    pass
`,
  optimalSolution: `def staircase(n):
    # In row i (1 to n):
    # (n - i) spaces followed by i hashes
    for i in range(1, n + 1):
        print(' ' * (n - i) + '#' * i)
`,
  intuition: `
    <h3>The Visual Pattern</h3>
    <p>Look closely at how each row is built for <code>n = 4</code>:</p>
    <div class="code-block">
Row 1 (i = 1):  3 spaces (' ' * 3)  +  1 hash ('#' * 1)  -> "   #"
Row 2 (i = 2):  2 spaces (' ' * 2)  +  2 hashes ('#' * 2) -> "  ##"
Row 3 (i = 3):  1 space  (' ' * 1)  +  3 hashes ('#' * 3) -> " ###"
Row 4 (i = 4):  0 spaces (' ' * 0)  +  4 hashes ('#' * 4) -> "####"
    </div>

    <p>Notice the rule for any row <code>i</code> (counting from 1 to <code>n</code>):</p>
    <ul>
      <li>Number of spaces = <code>n - i</code></li>
      <li>Number of hashes = <code>i</code></li>
    </ul>

    <h3>Why Python String Multiplication Rocks</h3>
    <p>In languages like C++ or Java, you might need two nested <code>for</code> loops—one loop to print the spaces and another loop to print the hashes. But in Python, you can multiply strings directly: <code>' ' * (n - i)</code> repeats the space character, making your code clean, readable, and lightning fast!</p>

    <h3>Time & Space Complexity</h3>
    <ul>
      <li><strong>Time Complexity:</strong> O(n<sup>2</sup>) total character operations, because we generate and print 1 + 2 + ... + n = n(n+1)/2 characters. For n &le; 100, this runs in less than a millisecond.</li>
      <li><strong>Space Complexity:</strong> O(n) auxiliary space to construct each string before printing.</li>
    </ul>
  `,
  testCases: [
    {
      input: "4",
      expected: "   #\n  ##\n ###\n####",
      note: "Sample n = 4"
    },
    {
      input: "6",
      expected: "     #\n    ##\n   ###\n  ####\n #####\n######",
      note: "Classic HackerRank Sample n = 6"
    },
    {
      input: "1",
      expected: "#",
      note: "Base Case n = 1"
    },
    {
      input: "2",
      expected: " #\n##",
      note: "Small Case n = 2"
    }
  ],
  functionName: "staircase"
});
