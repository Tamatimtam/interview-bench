# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Vanilla HTML, CSS, JavaScript (zero-setup single-page app with Pyodide WebAssembly for in-browser Python code execution)

## Users
Developers and junior engineers preparing for technical coding interviews (HackerRank, LeetCode, offline onsite interviews) who want a distraction-free, neat environment to practice problems, experiment with code, and deeply master problem variations.

## Product Purpose
Provide a clean, minimalist, high-craft practice web app featuring a curated problem database containing the Reduce Array (Connect Ropes) problem and all its major interview variations. Offers live in-browser Python execution, automated test runs, intuition breakdowns, and solution reveals.

## Positioning
Unlike noisy platforms with ads, discussion clutter, and subscription paywalls, this app gives an elegant, instant-loading workspace focused on understanding algorithm mechanics, seeing edge cases, and preparing for offline interview pivots.

## Operating Context
Desktop browser during study and interview prep sessions. The user switches between problem variations, types Python code, clicks "Run Code" to test against multiple test cases via Pyodide, and reads approachable explanations when needing hints or answers.

## Capabilities and Constraints
- **Curated Problem Database:**
  1. Base Problem: Reduce Array / Connect Ropes (Min-Heap, O(N log N))
  2. Variation 1: Maximize Total Cost (Max-Heap with the -1 inversion trick)
  3. Variation 2: Merge K Elements at Once (K-way merge with dummy zero padding)
  4. Variation 3: Already-Sorted Input (O(N) Two-Queue linear method)
  5. Variation 4: Adjacent-Only Merge (Interval Dynamic Programming)
- **Interactive Code Editor:** Line numbers, tab indentation, syntax theme, starter code template per problem, and reset option.
- **In-Browser Python Execution:** Pyodide runs Python in a Web Worker or main thread without requiring a backend server.
- **Test Runner Interface:** Visual test suite with pass/fail badges, execution latency, input/expected/actual comparison, and error logs.
- **Study & Interview Guide:** Tabbed drawer with plain-English intuition, time/space complexity cards, and interview talking points.
- **Aesthetic:** Minimalist dark workspace, modern typography (Inter & JetBrains Mono), crisp contrast, fluid layout.

## Brand Commitments
Minimalist, clean, calm, high-legibility, conversational junior-friendly tone in explanations, no confusing LaTeX math formatting.

## Evidence on Hand
- Working solution and 16 test cases in `solution.py` and `test_runner.py`.

## Product Principles
1. **Focus First:** The code editor and problem statement remain central and distraction-free.
2. **Learn by Doing:** Immediate test feedback in the browser proves solutions work.
3. **Master the Variations:** Always show how interviewers tweak constraints so the user never gets blindsided in an interview.
