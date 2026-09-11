window.REGISTER_PROBLEM({
  id: "reduce-array-max",
  title: "2. Maximize Cost to Reduce Array",
  category: "Heap",
  tag: "Variation: Max-Heap",
  difficulty: "Medium",
  badgeColor: "purple",
  summary: "Combine the two largest numbers at each step so they compound as much as possible.",
  description: `
    <h3>Problem Statement</h3>
    <p>What if the interviewer flips the goal? Now, you want to <strong>maximize</strong> the total cost needed to reduce the array into a single element.</p>
    <p>In each step, you must:</p>
    <ol>
      <li>Pick the two <strong>largest</strong> elements in the array.</li>
      <li>Combine them into one sum.</li>
      <li>Add the sum to your total accumulated cost.</li>
      <li>Put the sum back into the array.</li>
    </ol>
    <p>Return the <strong>maximum total cost</strong> possible.</p>

    <h3>Example</h3>
    <div class="code-block">
Input: arr = [25, 10, 20]
Step 1: Pick two largest (25, 20) -> Sum = 45, Cost = 45. Remaining: [10, 45]
Step 2: Pick (45, 10) -> Sum = 55, Cost = 45 + 55 = 100. Remaining: [55]
Output: 100 (Notice 100 is higher than 85!)
    </div>

    <h3>Constraints</h3>
    <ul>
      <li>2 &le; arr.length &le; 100,000</li>
      <li>1 &le; arr[i] &le; 10,000</li>
    </ul>
  `,
  starterCode: `import heapq

def reduceArrayMax(arr):
    # Your code here
    # Hint: Python only has min-heap built-in.
    # How do we turn it into a max-heap?
    # Multiply numbers by -1!
    cost = 0
    
    return cost
`,
  optimalSolution: `import heapq

def reduceArrayMax(arr):
    # Step 1: Invert all values so the largest numbers become smallest negatives
    max_heap = [-x for x in arr]
    heapq.heapify(max_heap)
    
    total_cost = 0

    # Step 2: Loop until 1 element left
    while len(max_heap) > 1:
        # Step 3: Remember to flip the sign back with a minus sign (-)
        first = -heapq.heappop(max_heap)
        second = -heapq.heappop(max_heap)
        
        combined = first + second
        total_cost += combined
        
        # Push the negative combined sum back
        heapq.heappush(max_heap, -combined)

    return total_cost
`,
  intuition: `
    <h3>The Flip: Why Big Numbers First?</h3>
    <p>In the min-cost version, whatever you merge early gets added into future merges over and over again. When your goal is to <strong>maximize</strong> the total score, you want your biggest champions to enter the ring immediately so their value multiplies the most.</p>

    <h3>How to write a Max-Heap in Python</h3>
    <p>Python's <code>heapq</code> library only provides a Min-Heap. Python does not have a <code>max_heap</code> flag. So we use the standard negative sign trick:</p>
    <ul>
      <li>Convert <code>[5, 20, 1]</code> to <code>[-5, -20, -1]</code>.</li>
      <li>Min-heap pops <code>-20</code> first because -20 is the smallest number.</li>
      <li>We flip the sign back: <code>-(-20) = 20</code>. Clean and effective!</li>
    </ul>

    <h3>Time & Space Complexity</h3>
    <ul>
      <li><strong>Time Complexity:</strong> O(N log N)</li>
      <li><strong>Space Complexity:</strong> O(N) to store the inverted values in the heap.</li>
    </ul>
  `,
  testCases: [
    { input: "[25, 10, 20]", expected: 100, note: "Contrast with 85 from min-cost" },
    { input: "[10, 20]", expected: 30, note: "Base 2 items (same for min/max)" },
    { input: "[4, 3, 2, 6]", expected: 38, note: "Notice how much higher than min (29)" },
    { input: "[5, 1, 20, 8, 3]", expected: 87, note: "Bigger spread" },
    { input: "[100, 200, 300]", expected: 800, note: "Triple round: (300+200) + (500+100)" }
  ],
  functionName: "reduceArrayMax"
});
