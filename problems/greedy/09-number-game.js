window.REGISTER_PROBLEM({
  id: "number-game",
  title: "9. Number Game (Maximize Distinct Elements)",
  category: "Greedy",
  tag: "Greedy & Parity",
  difficulty: "Medium",
  badgeColor: "amber",
  summary: "Maximize remaining distinct elements by choosing triplets and eliminating min and max until all elements are distinct.",
  description: `
    <h3>Problem Statement</h3>
    <p>Sam and Alex are engaged in a game involving numbers. The objective of the game is to maximize the number of distinct elements in an array after performing a series of operations.</p>
    <p>In each operation, Sam can select any 3 elements from the array and remove the maximum and minimum values among the three, leaving the middle value in the array. Your task is to determine the maximum number of distinct elements that can remain in the array.</p>

    <h3>Example</h3>
    <div class="code-block">
n = 7
number = [1, 2, 4, 3, 2, 4, 3]

Step 1: Start by ignoring the already distinct 1.
Select the triplet (2, 2, 3).
Remove min (2) and max (3), keeping 2.
The array becomes: [1, 4, 3, 2, 4]

Step 2: Choose the triplet (3, 4, 4).
Remove min (3) and max (4), keeping 4.
The array becomes: [1, 2, 4]

All elements [1, 2, 4] are now distinct!
Output: 3
    </div>

    <h3>Function Description</h3>
    <p>Complete the function <code>numberGame</code> with the following parameter:</p>
    <ul>
      <li><code>int number[n]</code>: an integer array</li>
    </ul>

    <h3>Returns</h3>
    <p><code>int</code>: the maximum number of distinct elements remaining in the array.</p>

    <h3>Constraints</h3>
    <ul>
      <li>3 &le; n &le; 10<sup>5</sup>, and n is odd</li>
      <li>1 &le; number[i] &le; 10<sup>5</sup></li>
    </ul>
  `,
  starterCode: `def numberGame(number):
    # Write your code here
    # Return the maximum number of distinct elements remaining
    pass
`,
  optimalSolution: `def numberGame(number):
    n = len(number)
    distinct = len(set(number))
    duplicates = n - distinct

    # Each operation eliminates exactly 2 elements (min and max).
    # Since operations remove elements in pairs (2 at a time):
    # - If the number of duplicate elements is EVEN, we can eliminate
    #   all duplicates in pairs without losing any distinct element.
    # - If the number of duplicate elements is ODD, we are forced to
    #   remove 1 extra element to finish an operation, sacrificing 1 distinct value.
    if duplicates % 2 == 0:
        return distinct
    else:
        return distinct - 1
`,
  intuition: `
    <h3>The "Aha!" Parity Insight</h3>
    <p>At first glance, this problem sounds like you need to simulate choosing triplets or run complex combinations. But think about what each operation actually does:</p>
    
    <ol>
      <li>You pick 3 numbers.</li>
      <li>You delete the min and max.</li>
      <li><strong>Net result: exactly 2 numbers are removed from the array.</strong></li>
    </ol>

    <p>Because every single move removes <strong>2 elements</strong>, any sequence of moves will always remove an <strong>EVEN</strong> number of total items (2, 4, 6, 8...).</p>

    <h3>Why Count Duplicates?</h3>
    <p>To end up with an array of distinct elements, our goal is to eliminate all the extra duplicate copies:</p>
    <div class="code-block">
duplicates = total_elements - distinct_elements
    </div>

    <ul>
      <li><strong>If duplicates is EVEN (e.g. 2, 4, 6):</strong><br>
      We can pair up the duplicates and eliminate all of them cleanly. None of our unique distinct numbers need to be sacrificed! So the answer is simply <code>distinct</code>.</li>
      
      <li><strong>If duplicates is ODD (e.g. 1, 3, 5):</strong><br>
      Because each move must remove 2 elements, we cannot remove an odd number of duplicates on their own. We have to include 1 extra number in the final move, which permanently sacrifices 1 distinct value. So the answer is <code>distinct - 1</code>.</li>
    </ul>

    <h3>Time & Space Complexity</h3>
    <ul>
      <li><strong>Time Complexity:</strong> O(N) — creating a Python <code>set(number)</code> takes a single pass over the array.</li>
      <li><strong>Space Complexity:</strong> O(N) — to store the unique elements in the hash set.</li>
    </ul>
  `,
  testCases: [
    {
      input: "[1, 2, 4, 3, 2, 4, 3]",
      expected: 3,
      note: "HackerRank Sample Case (n = 7, 4 distinct, 3 duplicates -> 4 - 1 = 3)"
    },
    {
      input: "[1, 2, 3, 4, 5]",
      expected: 5,
      note: "Already all distinct (0 duplicates -> 5 distinct)"
    },
    {
      input: "[2, 2, 2]",
      expected: 1,
      note: "All identical (Base case n = 3, 1 distinct)"
    },
    {
      input: "[1, 2, 3, 4, 4, 4]",
      expected: 4,
      note: "Even duplicates (n = 6, 4 distinct, 2 duplicates -> 4)"
    },
    {
      input: "[5, 5, 5, 5, 5]",
      expected: 1,
      note: "Five identical elements (4 duplicates -> 1 distinct)"
    },
    {
      input: "[10, 20, 30, 40, 50, 60, 70]",
      expected: 7,
      note: "All unique elements (n = 7, 0 duplicates -> 7)"
    }
  ],
  functionName: "numberGame"
});
