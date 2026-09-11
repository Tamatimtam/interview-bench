window.REGISTER_PROBLEM({
  id: "reduce-array-sorted",
  title: "4. Pre-Sorted Input: O(N) Two-Queue Technique",
  category: "Two-Queue",
  tag: "Optimization: O(N) Linear",
  difficulty: "Hard",
  badgeColor: "blue",
  summary: "If the input is already sorted, can you beat O(N log N) and solve it in pure O(N) time?",
  description: `
    <h3>Problem Statement</h3>
    <p>The interviewer smiles and asks: <em>"What if the input array is guaranteed to be ALREADY sorted in ascending order? Can you do better than O(N log N) time?"</em></p>
    <p>Using a heap takes <code>O(log N)</code> per push/pop. But with the <strong>Two-Queue technique</strong>, we can achieve optimal <strong>O(N) linear time</strong>!</p>

    <h3>The Two-Queue Algorithm</h3>
    <ol>
      <li><strong>Queue 1:</strong> Put all the original sorted elements into this queue.</li>
      <li><strong>Queue 2:</strong> An initially empty queue that will store new combined sums.</li>
      <li>In each step, look at the front of both queues. Pop the two smallest values among them.</li>
      <li>Sum them, add to total cost, and append the sum to the back of Queue 2.</li>
    </ol>
    <p>Because the numbers popped are always in non-decreasing order, the sums pushed to Queue 2 are also naturally in non-decreasing order! No heap sorting needed!</p>
  `,
  starterCode: `from collections import deque

def reduceArraySorted(arr):
    # arr is already sorted! e.g. [1, 2, 4, 6]
    # Use two deques to achieve O(N) time:
    q1 = deque(arr)
    q2 = deque()
    
    total_cost = 0
    # Your logic here
    
    return total_cost
`,
  optimalSolution: `from collections import deque

def reduceArraySorted(arr):
    # Queue 1 holds the pre-sorted original items
    q1 = deque(arr)
    # Queue 2 holds the newly created sums
    q2 = deque()
    
    total_cost = 0

    # Helper function to pop the smallest from either q1 or q2 in O(1)
    def get_min():
        if not q1:
            return q2.popleft()
        if not q2:
            return q1.popleft()
        if q1[0] <= q2[0]:
            return q1.popleft()
        else:
            return q2.popleft()

    # Repeat until only 1 element remains across both queues
    while (len(q1) + len(q2)) > 1:
        first = get_min()
        second = get_min()
        
        combined = first + second
        total_cost += combined
        
        # New sum is guaranteed to be >= previous sum in q2!
        q2.append(combined)

    return total_cost
`,
  intuition: `
    <h3>Why are the sums in Queue 2 already sorted?</h3>
    <p>Think about it: if you always pick the two smallest available numbers, then at time T1 you pick <code>a + b</code>, and at time T2 you pick <code>c + d</code> where <code>c >= a</code> and <code>d >= b</code>.</p>
    <p>Therefore, <code>(c + d)</code> is always greater than or equal to <code>(a + b)</code>. That means every new sum you produce is guaranteed to be at least as big as the previous sum!</p>
    <p>Since both Queue 1 and Queue 2 are always sorted, finding the smallest number just means comparing the two elements at the front of the queues. That's an <code>O(1)</code> operation!</p>

    <h3>Complexity</h3>
    <ul>
      <li><strong>Time Complexity:</strong> O(N) linear time. 2*(N-1) pops, each taking O(1) time.</li>
      <li><strong>Space Complexity:</strong> O(N) for the deques.</li>
    </ul>
  `,
  testCases: [
    { input: "[10, 20, 25]", expected: 85, note: "Pre-sorted version of [25, 10, 20]" },
    { input: "[2, 3, 4, 6]", expected: 29, note: "Pre-sorted version of [4, 3, 2, 6]" },
    { input: "[1, 2, 3, 4, 5]", expected: 33, note: "Clean sequence 1 to 5" },
    { input: "[5, 10, 15, 20, 25]", expected: 175, note: "Multiples of 5" }
  ],
  functionName: "reduceArraySorted"
});
