// Application State & Controller

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const problemSelect = document.getElementById("problemSelect");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabViews = document.querySelectorAll(".tab-view");

  const problemTitle = document.getElementById("problemTitle");
  const problemCategory = document.getElementById("problemCategory");
  const problemTag = document.getElementById("problemTag");
  const problemDifficulty = document.getElementById("problemDifficulty");
  const problemDescription = document.getElementById("problemDescription");
  const problemIntuition = document.getElementById("problemIntuition");
  const solutionCode = document.getElementById("solutionCode");

  const runCodeBtn = document.getElementById("runCodeBtn");
  const resetCodeBtn = document.getElementById("resetCodeBtn");
  const copyCodeBtn = document.getElementById("copyCodeBtn");
  const loadSolutionToEditorBtn = document.getElementById("loadSolutionToEditorBtn");

  const engineStatus = document.getElementById("engineStatus");
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");

  const consoleTabs = document.getElementById("consoleTabs");
  const consoleBody = document.getElementById("consoleBody");

  // Problem Catalog Modal Elements
  const openProblemCatalogBtn = document.getElementById("openProblemCatalogBtn");
  const problemCatalogModal = document.getElementById("problemCatalogModal");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const problemSearchInput = document.getElementById("problemSearchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const categoryChips = document.getElementById("categoryChips");
  const difficultyChips = document.getElementById("difficultyChips");
  const modalCardList = document.getElementById("modalCardList");
  const modalProblemCountText = document.getElementById("modalProblemCountText");
  const headerProblemCountBadge = document.getElementById("headerProblemCountBadge");

  // Home & View Switcher Elements
  const homeView = document.getElementById("homeView");
  const workspaceView = document.getElementById("workspaceView");
  const navViewHomeBtn = document.getElementById("navViewHomeBtn");
  const navViewWorkspaceBtn = document.getElementById("navViewWorkspaceBtn");
  const homeLaunchWorkspaceBtn = document.getElementById("homeLaunchWorkspaceBtn");
  const homeProblemLedgerList = document.getElementById("homeProblemLedgerList");
  const ledgerCountBadge = document.getElementById("ledgerCountBadge");

  // State
  let currentProblem = window.PROBLEMS[0];
  let currentTestResults = null;
  let selectedCaseIndex = 0;
  let activeCategory = "All";
  let activeDifficulty = "All";
  let searchQuery = "";
  let currentActiveView = "home";

  function switchView(viewName) {
    if (currentActiveView === viewName) return;
    currentActiveView = viewName;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (viewName === "workspace") {
      if (navViewHomeBtn) navViewHomeBtn.classList.remove("active");
      if (navViewWorkspaceBtn) navViewWorkspaceBtn.classList.add("active");

      if (window.gsap && !prefersReducedMotion) {
        // Smooth Out from Home
        gsap.to(homeView, {
          opacity: 0,
          y: -12,
          duration: 0.22,
          ease: "power2.in",
          onComplete: () => {
            if (homeView) homeView.style.display = "none";
            if (workspaceView) {
              workspaceView.style.display = "flex";
              workspaceView.style.opacity = 0;
            }

            if (editor) editor.refresh();

            // Staggered In to Workspace: Left Pane & Right Pane
            const leftPane = workspaceView.querySelector(".left-pane");
            const rightPane = workspaceView.querySelector(".right-pane");

            gsap.fromTo(
              workspaceView,
              { opacity: 0 },
              { opacity: 1, duration: 0.15 }
            );

            gsap.fromTo(
              [leftPane, rightPane],
              { opacity: 0, y: 16 },
              {
                opacity: 1,
                y: 0,
                duration: 0.38,
                stagger: 0.08,
                ease: "power3.out",
                clearProps: "transform,opacity"
              }
            );
          }
        });
      } else {
        if (homeView) homeView.style.display = "none";
        if (workspaceView) workspaceView.style.display = "flex";
        if (editor) editor.refresh();
      }
    } else {
      if (navViewHomeBtn) navViewHomeBtn.classList.add("active");
      if (navViewWorkspaceBtn) navViewWorkspaceBtn.classList.remove("active");

      if (window.gsap && !prefersReducedMotion) {
        gsap.to(workspaceView, {
          opacity: 0,
          y: 12,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            if (workspaceView) workspaceView.style.display = "none";
            if (homeView) {
              homeView.style.display = "block";
              homeView.style.opacity = 0;
            }

            const homeIntro = homeView.querySelector(".home-intro-card");
            const problemLedger = homeView.querySelector(".problem-ledger");

            gsap.fromTo(
              homeView,
              { opacity: 0 },
              { opacity: 1, duration: 0.15 }
            );

            gsap.fromTo(
              [homeIntro, problemLedger],
              { opacity: 0, y: 18 },
              {
                opacity: 1,
                y: 0,
                duration: 0.38,
                stagger: 0.1,
                ease: "power3.out",
                clearProps: "transform,opacity"
              }
            );
          }
        });
      } else {
        if (homeView) homeView.style.display = "block";
        if (workspaceView) workspaceView.style.display = "none";
      }
    }
  }

  if (navViewHomeBtn) navViewHomeBtn.addEventListener("click", () => switchView("home"));
  if (navViewWorkspaceBtn) navViewWorkspaceBtn.addEventListener("click", () => switchView("workspace"));
  if (homeLaunchWorkspaceBtn) {
    homeLaunchWorkspaceBtn.addEventListener("click", () => switchView("workspace"));
  }

  function renderHomeProblemLedger() {
    if (!homeProblemLedgerList) return;
    homeProblemLedgerList.innerHTML = "";
    if (ledgerCountBadge) {
      ledgerCountBadge.textContent = `${window.PROBLEMS.length} challenges`;
    }

    window.PROBLEMS.forEach((prob, idx) => {
      const row = document.createElement("div");
      row.className = "ledger-row";
      const numStr = String(idx + 1).padStart(2, "0");
      const isSql = prob.language === "sql";
      const langBadge = isSql ? "SQL" : "Python";

      row.innerHTML = `
        <div class="ledger-row-left">
          <span class="ledger-row-id">${numStr}</span>
          <div class="ledger-row-info">
            <span class="ledger-row-title">${escapeHtml(prob.title)}</span>
            <div class="ledger-row-sub">
              <span class="ledger-badge">${escapeHtml(prob.tag || "Core Pattern")}</span>
              <span>${escapeHtml(prob.summary)}</span>
            </div>
          </div>
        </div>
        <div class="ledger-row-right">
          <span class="ledger-badge" style="color: var(--brand); border-color: var(--brand-border);">${langBadge}</span>
          <span class="ledger-badge">${escapeHtml(prob.difficulty)}</span>
          <span class="ledger-solve-link">
            <span>Solve</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </span>
        </div>
      `;

      row.addEventListener("click", () => {
        loadProblem(prob.id);
        switchView("workspace");
      });

      homeProblemLedgerList.appendChild(row);
    });
  }

  // 1. Initialize CodeMirror Editor
  const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
    mode: "python",
    theme: "material-darker",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    smartIndent: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    lineWrapping: false,
    extraKeys: {
      "Tab": function (cm) {
        if (cm.somethingSelected()) {
          cm.indentSelection("add");
        } else {
          cm.replaceSelection("    ", "end");
        }
      },
      "Shift-Tab": function (cm) {
        cm.indentSelection("subtract");
      },
      "Ctrl-Space": "autocomplete",
      "Ctrl-Enter": function () { runCode(); },
      "Cmd-Enter": function () { runCode(); }
    }
  });

  // Autocomplete dictionaries
  const PYTHON_KEYWORDS = [
    "heapq", "heappop", "heappush", "heapify", "heappushpop", "heapreplace",
    "collections", "deque", "append", "pop", "popleft", "extend",
    "def", "return", "if", "else", "elif", "for", "while", "in", "not", "and", "or",
    "range", "len", "sum", "min", "max", "abs", "enumerate", "zip", "sorted",
    "float('inf')", "float('-inf')", "int", "str", "list", "dict", "set",
    "True", "False", "None", "print", "import", "from", "as", "pass", "continue", "break"
  ];

  const SQL_KEYWORDS = [
    "SELECT", "FROM", "WHERE", "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
    "GROUP BY", "HAVING", "ORDER BY", "ASC", "DESC", "LIMIT",
    "DISTINCT", "COUNT", "SUM", "AVG", "MIN", "MAX",
    "AND", "OR", "NOT", "IN", "EXISTS", "BETWEEN", "LIKE", "IS NULL", "IS NOT NULL",
    "AS", "ON", "CASE", "WHEN", "THEN", "ELSE", "END", "UNION", "ALL"
  ];

  // Register CodeMirror Autocomplete Helper (handles both Python and SQL)
  function getHintList(cm) {
    const cur = cm.getCursor();
    const token = cm.getTokenAt(cur);
    const start = token.start;
    const end = cur.ch;
    const word = token.string.slice(0, end - start).trim();

    const isSql = currentProblem && currentProblem.language === "sql";
    const dictionary = isSql ? SQL_KEYWORDS : PYTHON_KEYWORDS;

    if (!word) {
      return {
        list: dictionary.slice(0, 15),
        from: CodeMirror.Pos(cur.line, start),
        to: CodeMirror.Pos(cur.line, end)
      };
    }

    const matches = dictionary.filter(k => k.toLowerCase().startsWith(word.toLowerCase()));
    return {
      list: matches.length ? matches : [],
      from: CodeMirror.Pos(cur.line, start),
      to: CodeMirror.Pos(cur.line, end)
    };
  }

  CodeMirror.registerHelper("hint", "python", getHintList);
  CodeMirror.registerHelper("hint", "sql", getHintList);

  // Auto-show autocomplete popup as you type words
  editor.on("inputRead", function (cm, change) {
    if (change.origin !== "+input") return;
    const text = change.text[0];
    if (/[a-zA-Z_\.]/.test(text)) {
      cm.showHint({ completeSingle: false });
    }
  });

  // Auto-save code to localStorage on change
  editor.on("change", () => {
    if (currentProblem) {
      localStorage.setItem(`code_${currentProblem.id}`, editor.getValue());
    }
  });

  // 2. Initialize Pyodide Status
  window.pythonRunner.onStatusChange((status, isReady) => {
    statusText.textContent = status;
    if (isReady) {
      statusDot.classList.add("ready");
    } else {
      statusDot.classList.remove("ready");
    }
  });

  // 3. Problem Dropdown & Counter
  function refreshProblemDropdown() {
    problemSelect.innerHTML = "";
    window.PROBLEMS.forEach((prob) => {
      const opt = document.createElement("option");
      opt.value = prob.id;
      opt.textContent = prob.title;
      problemSelect.appendChild(opt);
    });
    headerProblemCountBadge.textContent = window.PROBLEMS.length;
    modalProblemCountText.textContent = `${window.PROBLEMS.length} problems available`;
  }

  // 4. Load Problem
  function loadProblem(problemId) {
    currentProblem = window.PROBLEMS.find(p => p.id === problemId) || window.PROBLEMS[0];
    selectedCaseIndex = 0;
    currentTestResults = null;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Update Dropdown value
    problemSelect.value = currentProblem.id;

    // Update Language & Editor Mode
    const isSql = (currentProblem.language === "sql");
    editor.setOption("mode", isSql ? "text/x-sql" : "python");

    const editorTagLabel = document.querySelector(".editor-lang-tag span");
    if (editorTagLabel) {
      editorTagLabel.textContent = isSql ? "SQL (SQLite Engine)" : "Python 3 (Auto-Indent + Autocomplete)";
    }

    // Left Pane Content Update with Subtle GSAP Crossfade
    const paneContent = document.querySelector(".pane-content");

    const applyContentUpdate = () => {
      problemTitle.textContent = currentProblem.title;
      problemCategory.textContent = currentProblem.category || "Algorithm";
      problemTag.textContent = currentProblem.tag;
      problemTag.className = `badge ${currentProblem.badgeColor || "green"}`;
      problemDifficulty.textContent = currentProblem.difficulty;

      problemDescription.innerHTML = currentProblem.description;
      problemIntuition.innerHTML = currentProblem.intuition;
      solutionCode.textContent = currentProblem.optimalSolution;

      // Load Code into Editor
      const savedCode = localStorage.getItem(`code_${currentProblem.id}`);
      editor.setValue(savedCode ? savedCode : currentProblem.starterCode);
      editor.clearHistory();

      // Render test case chips
      renderConsoleChips();
      renderInitialConsole();

      // Refresh Modal highlight if open
      renderModalCardList();
    };

    if (window.gsap && !prefersReducedMotion && paneContent && paneContent.offsetParent !== null) {
      gsap.to(paneContent, {
        opacity: 0,
        y: -6,
        duration: 0.12,
        ease: "power2.in",
        onComplete: () => {
          applyContentUpdate();
          gsap.fromTo(
            paneContent,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.25, ease: "power3.out", clearProps: "transform,opacity" }
          );
        }
      });
    } else {
      applyContentUpdate();
    }
  }

  // 5. Tab Switching (Problem, Intuition, Solution) with GSAP
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetViewId = btn.dataset.target;
      const targetView = document.getElementById(targetViewId);
      if (!targetView || btn.classList.contains("active")) return;

      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (window.gsap && !prefersReducedMotion) {
        tabViews.forEach(v => {
          if (v.classList.contains("active") && v !== targetView) {
            gsap.to(v, {
              opacity: 0,
              duration: 0.1,
              ease: "power1.in",
              onComplete: () => {
                v.classList.remove("active");
                targetView.classList.add("active");
                gsap.fromTo(
                  targetView,
                  { opacity: 0, y: 6 },
                  { opacity: 1, y: 0, duration: 0.22, ease: "power2.out", clearProps: "transform,opacity" }
                );
              }
            });
          }
        });
      } else {
        tabViews.forEach(v => v.classList.remove("active"));
        targetView.classList.add("active");
      }
    });
  });

  // 6. Editor Actions
  resetCodeBtn.addEventListener("click", () => {
    if (confirm("Reset editor to original starter code for this problem?")) {
      editor.setValue(currentProblem.starterCode);
      localStorage.removeItem(`code_${currentProblem.id}`);
    }
  });

  copyCodeBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(editor.getValue()).then(() => {
      const originalText = copyCodeBtn.innerHTML;
      copyCodeBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg> Copied!
      `;
      setTimeout(() => {
        copyCodeBtn.innerHTML = originalText;
      }, 1500);
    });
  });

  loadSolutionToEditorBtn.addEventListener("click", () => {
    if (confirm("Load the optimal reference solution into the editor?")) {
      editor.setValue(currentProblem.optimalSolution);
      localStorage.setItem(`code_${currentProblem.id}`, editor.getValue());
    }
  });

  // 7. Test Console Rendering
  function renderConsoleChips() {
    consoleTabs.innerHTML = "";
    currentProblem.testCases.forEach((tc, idx) => {
      const chip = document.createElement("button");
      chip.className = `case-chip ${idx === selectedCaseIndex ? "active" : ""}`;

      let statusIcon = "";
      if (currentTestResults && currentTestResults.results[idx]) {
        const passed = currentTestResults.results[idx].passed;
        chip.classList.add(passed ? "pass" : "fail");
        statusIcon = passed ? "✓ " : "✕ ";
      }

      chip.textContent = `${statusIcon}Case ${idx + 1}`;
      chip.addEventListener("click", () => {
        selectedCaseIndex = idx;
        renderConsoleChips();
        renderActiveCaseDetail();
      });

      consoleTabs.appendChild(chip);
    });
  }

  function renderInitialConsole() {
    consoleBody.innerHTML = `
      <div class="empty-console">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Press "Run Code" or hit Ctrl+Enter to test your solution against ${currentProblem.testCases.length} test cases.</span>
      </div>
    `;
  }

  function renderActiveCaseDetail() {
    if (!currentTestResults || !currentTestResults.results.length) {
      const tc = currentProblem.testCases[selectedCaseIndex];
      if (!tc) return;
      consoleBody.innerHTML = `
        <div class="case-detail-card">
          <div class="case-row">
            <span class="case-label">Case ${selectedCaseIndex + 1} Note</span>
            <div class="case-val">${escapeHtml(tc.note || "Standard test case")}</div>
          </div>
          <div class="case-row">
            <span class="case-label">Input</span>
            <div class="case-val">${escapeHtml(tc.input)}</div>
          </div>
          <div class="case-row">
            <span class="case-label">Expected Output</span>
            <div class="case-val">${escapeHtml(String(tc.expected))}</div>
          </div>
        </div>
      `;
      return;
    }

    const res = currentTestResults.results[selectedCaseIndex];
    if (!res) return;

    const passStatus = res.passed ? "PASSED" : "FAILED";
    const passColor = res.passed ? "var(--accent-green)" : "var(--accent-red)";

    let logsHtml = "";
    if (res.logs && res.logs.trim()) {
      logsHtml = `
        <div class="case-row">
          <span class="case-label">Console Output (stdout)</span>
          <div class="case-val">${escapeHtml(res.logs)}</div>
        </div>
      `;
    }

    let errorHtml = "";
    if (res.error) {
      errorHtml = `
        <div class="case-row">
          <span class="case-label">Error Details</span>
          <div class="case-val error">${escapeHtml(res.error)}</div>
        </div>
      `;
    }

    consoleBody.innerHTML = `
      <div class="summary-banner ${currentTestResults.allPassed ? "all-pass" : "has-fail"}">
        <span>${currentTestResults.allPassed ? "All Test Cases Passed!" : "Some Test Cases Failed"}</span>
        <span>Runtime: ${currentTestResults.executionMs}ms</span>
      </div>

      <div class="case-detail-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-weight: 600; color: ${passColor};">${passStatus} (Case ${selectedCaseIndex + 1})</span>
          <span style="color: var(--text-muted); font-size: 11px;">${escapeHtml(currentProblem.testCases[selectedCaseIndex].note || "")}</span>
        </div>

        <div class="case-row">
          <span class="case-label">Input</span>
          <div class="case-val">${escapeHtml(res.input)}</div>
        </div>

        <div class="case-row">
          <span class="case-label">Expected Output</span>
          <div class="case-val">${escapeHtml(String(res.expected))}</div>
        </div>

        <div class="case-row">
          <span class="case-label">Your Output</span>
          <div class="case-val ${!res.passed ? "error" : ""}">${escapeHtml(String(res.actual))}</div>
        </div>

        ${logsHtml}
        ${errorHtml}
      </div>
    `;
  }

  function escapeHtml(str) {
    if (typeof str !== "string") str = String(str);
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // 8. Run Code Action
  async function runCode() {
    const userCode = editor.getValue();

    runCodeBtn.disabled = true;
    const originalBtnContent = runCodeBtn.innerHTML;
    runCodeBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
      <span>Testing...</span>
    `;

    consoleBody.innerHTML = `
      <div class="empty-console">
        <span>Running solution against test suite in Pyodide...</span>
      </div>
    `;

    try {
      const outcome = await window.pythonRunner.runTests(userCode, currentProblem);

      if (!outcome.success && outcome.error) {
        currentTestResults = null;
        consoleBody.innerHTML = `
          <div class="summary-banner has-fail">
            <span>Execution Error</span>
          </div>
          <div class="case-detail-card">
            <div class="case-row">
              <span class="case-label">Error Details</span>
              <div class="case-val error">${escapeHtml(outcome.error)}</div>
            </div>
          </div>
        `;
        renderConsoleChips();
      } else {
        currentTestResults = outcome;
        renderConsoleChips();
        renderActiveCaseDetail();
      }
    } catch (err) {
      consoleBody.innerHTML = `
        <div class="case-detail-card">
          <div class="case-val error">Unexpected failure: ${escapeHtml(err.message || String(err))}</div>
        </div>
      `;
    } finally {
      runCodeBtn.disabled = false;
      runCodeBtn.innerHTML = originalBtnContent;
    }
  }

  runCodeBtn.addEventListener("click", runCode);

  problemSelect.addEventListener("change", (e) => {
    loadProblem(e.target.value);
    switchView("workspace");
  });

  // 9. Problem Catalog Drawer Implementation with GSAP
  function openModal() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    problemCatalogModal.classList.remove("hidden");
    problemCatalogModal.setAttribute("aria-hidden", "false");
    problemSearchInput.focus();
    renderModalCardList();

    if (window.gsap && !prefersReducedMotion) {
      const drawer = problemCatalogModal.querySelector(".modal-drawer");
      const backdrop = problemCatalogModal.querySelector(".modal-backdrop");
      const cards = modalCardList.querySelectorAll(".problem-card");

      gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" });
      gsap.fromTo(drawer, { x: "-100%" }, { x: "0%", duration: 0.32, ease: "power3.out" });

      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, delay: 0.1, ease: "power2.out", clearProps: "transform,opacity" }
        );
      }
    }
  }

  function closeModal() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const drawer = problemCatalogModal.querySelector(".modal-drawer");
    const backdrop = problemCatalogModal.querySelector(".modal-backdrop");

    if (window.gsap && !prefersReducedMotion && drawer && backdrop) {
      gsap.to(backdrop, { opacity: 0, duration: 0.18, ease: "power2.in" });
      gsap.to(drawer, {
        x: "-100%",
        duration: 0.24,
        ease: "power3.in",
        onComplete: () => {
          problemCatalogModal.classList.add("hidden");
          problemCatalogModal.setAttribute("aria-hidden", "true");
        }
      });
    } else {
      problemCatalogModal.classList.add("hidden");
      problemCatalogModal.setAttribute("aria-hidden", "true");
    }
  }

  openProblemCatalogBtn.addEventListener("click", openModal);
  closeModalBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);

  // Esc key closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !problemCatalogModal.classList.contains("hidden")) {
      closeModal();
    }
  });

  // Category Filters Setup
  function setupFilterChips() {
    const categories = window.GET_CATEGORIES();
    categoryChips.innerHTML = "";
    categories.forEach(cat => {
      const chip = document.createElement("button");
      chip.className = `filter-chip ${cat === activeCategory ? "active" : ""}`;
      chip.textContent = cat;
      chip.addEventListener("click", () => {
        activeCategory = cat;
        setupFilterChips();
        renderModalCardList();
      });
      categoryChips.appendChild(chip);
    });

    // Difficulty Chips setup
    const diffButtons = difficultyChips.querySelectorAll(".filter-chip");
    diffButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        diffButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeDifficulty = btn.dataset.diff;
        renderModalCardList();
      });
    });
  }

  // Search input listeners
  problemSearchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    clearSearchBtn.style.display = searchQuery ? "block" : "none";
    renderModalCardList();
  });

  clearSearchBtn.addEventListener("click", () => {
    problemSearchInput.value = "";
    searchQuery = "";
    clearSearchBtn.style.display = "none";
    problemSearchInput.focus();
    renderModalCardList();
  });

  // Filter & Render Modal Cards
  function renderModalCardList() {
    modalCardList.innerHTML = "";

    const filtered = window.PROBLEMS.filter(prob => {
      // Category filter
      if (activeCategory !== "All" && prob.category !== activeCategory) {
        return false;
      }
      // Difficulty filter
      if (activeDifficulty !== "All" && prob.difficulty !== activeDifficulty) {
        return false;
      }
      // Search filter (searches title, tag, summary, description)
      if (searchQuery) {
        const hay = `${prob.title} ${prob.tag} ${prob.summary} ${prob.category}`.toLowerCase();
        if (!hay.includes(searchQuery)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      modalCardList.innerHTML = `
        <div class="no-results">
          <p>No problems match your search or filter.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(prob => {
      const card = document.createElement("div");
      card.className = `problem-card ${prob.id === currentProblem.id ? "active-problem" : ""}`;

      card.innerHTML = `
        <div class="card-top">
          <div class="card-title">${escapeHtml(prob.title)}</div>
          <div class="card-badges">
            <span class="badge blue">${escapeHtml(prob.category || "Algorithm")}</span>
            <span class="badge ${prob.badgeColor || "green"}">${escapeHtml(prob.difficulty)}</span>
          </div>
        </div>
        <div class="card-summary">${escapeHtml(prob.summary)}</div>
        <div class="card-footer">
          <span>Tag: ${escapeHtml(prob.tag)}</span>
          <span>${prob.testCases.length} Test Cases</span>
        </div>
      `;

      card.addEventListener("click", () => {
        loadProblem(prob.id);
        closeModal();
      });

      modalCardList.appendChild(card);
    });
  }

  // Initial Boot
  refreshProblemDropdown();
  setupFilterChips();
  renderHomeProblemLedger();
  loadProblem(window.PROBLEMS[0].id);
  switchView("home");

  // Initialize Pyodide
  window.pythonRunner.init();
});
