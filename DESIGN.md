# Design

<!-- impeccable:design-schema 1 -->

## Visual World

A distraction-free, high-precision technical workspace crafted for developers studying algorithmic problems. It borrows the calm restraint of modern developer tools (such as Linear and GitHub Dark) while avoiding visual fatigue during long coding sessions.

## Mode
**Operate:** The visitor's success is solving coding problems, reading test outputs, and understanding variations. Scannability, editor comfort, and clear state indicators outrank decorative flair.

## Typography
- **Interface Font:** `Inter`, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif. Clean, neutral, high x-height for readability.
- **Code & Numeric Font:** `"JetBrains Mono"`, "Fira Code", monospace. Used for code editor, test case inputs/outputs, complexity chips, and line numbers. Tabular figures enabled.

## Color System
- **Background Primary:** `#0d1117` (Deep slate obsidian)
- **Background Secondary / Panels:** `#161b22` (Subtle lifted dark surface)
- **Background Elevated:** `#21262d` (Hover states, active tabs, modal overlays)
- **Borders & Dividers:** `#30363d` (Crisp 1px border lines)
- **Text Primary:** `#f0f6fc` (Clean off-white, high contrast ≥ 7:1)
- **Text Muted / Secondary:** `#8b949e` (Readable slate gray ≥ 4.5:1)
- **Accent - Pass / Run:** `#238636` / `#2ea043` (Vibrant emerald green for passing tests and primary run action)
- **Accent - Active / Focus:** `#388bfd` / `#58a6ff` (Electric blue for focus rings, active tabs, and links)
- **Accent - Warning / Hint:** `#d29922` / `#e3b341` (Warm amber for hints and gotcha callouts)
- **Accent - Fail / Error:** `#da3633` / `#f85149` (Coral red for failed test cases and execution errors)

## Layout & Structure
- **App Bar (56px):** Problem switcher, category filter, Pyodide status indicator, primary "Run Code" button.
- **Split Workspace:**
  - Left pane (45%): Problem statement, constraints, example boxes, "Intuition & Interview Tips" tab, and "Optimal Solution" tab.
  - Right pane (55%):
    - Code Editor: Top section with editor controls (Reset, Copy, Font Size), line numbers, tab-handling code area.
    - Test Console: Bottom section with Test Cases tabs, output log, execution time badge, and pass/fail indicators for all test cases.

## Micro-Interactions & States
- Test execution gives immediate feedback: spinner/pulsing pill while executing in Pyodide, snappy green checkmarks or red X's on completion.
- Smooth tab transitions between Description, Intuition, and Solution.
- Keyboard shortcuts (`Ctrl+Enter` / `Cmd+Enter` to run code).
