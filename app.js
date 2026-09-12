// app.js - Main Application Orchestrator
import { escapeHtml, prefersReducedMotion } from "./js/utils.js";
import { createEditor } from "./js/editor.js";
import { initTransitions, animateProblemLoad, animateTabSwitch } from "./js/transitions.js";
import { initCatalog } from "./js/catalog.js";
import { initConsole } from "./js/console.js";

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
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

  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");

  const consoleTabs = document.getElementById("consoleTabs");
  const consoleBody = document.getElementById("consoleBody");
  const consoleSection = document.getElementById("consoleSection");
  const celebrationCanvas = document.getElementById("celebrationCanvas");

  // Home & Navigation Elements
  const homeView = document.getElementById("homeView");
  const workspaceView = document.getElementById("workspaceView");
  const navViewHomeBtn = document.getElementById("navViewHomeBtn");
  const navViewWorkspaceBtn = document.getElementById("navViewWorkspaceBtn");
  const homeLaunchWorkspaceBtn = document.getElementById("homeLaunchWorkspaceBtn");
  const homeProblemLedgerList = document.getElementById("homeProblemLedgerList");
  const ledgerCountBadge = document.getElementById("ledgerCountBadge");
  const headerProblemCountBadge = document.getElementById("headerProblemCountBadge");

  // State
  let currentProblem = (window.PROBLEMS && window.PROBLEMS[0]) || null;

  // 1. Initialize Test Console UI Module with Game-Feel FX
  const testConsole = initConsole({
    consoleSection,
    consoleTabs,
    consoleBody,
    celebrationCanvas
  });

  // 2. Initialize CodeMirror Editor Module
  const editor = createEditor({
    textarea: document.getElementById("codeEditor"),
    onRunCode: () => runCode(),
    onCodeChange: (value) => {
      if (currentProblem) {
        localStorage.setItem(`code_${currentProblem.id}`, value);
      }
    }
  });

  // 3. Initialize View Transitions Module
  const transitions = initTransitions({
    homeView,
    workspaceView,
    navViewHomeBtn,
    navViewWorkspaceBtn,
    editor
  });

  if (navViewHomeBtn) navViewHomeBtn.addEventListener("click", () => transitions.switchView("home"));
  if (navViewWorkspaceBtn) navViewWorkspaceBtn.addEventListener("click", () => transitions.switchView("workspace"));
  if (homeLaunchWorkspaceBtn) homeLaunchWorkspaceBtn.addEventListener("click", () => transitions.switchView("workspace"));

  // 4. Initialize Problem Catalog Drawer Module
  const catalog = initCatalog({
    modal: document.getElementById("problemCatalogModal"),
    backdrop: document.getElementById("modalBackdrop"),
    openBtn: document.getElementById("openProblemCatalogBtn"),
    closeBtn: document.getElementById("closeModalBtn"),
    searchInput: document.getElementById("problemSearchInput"),
    clearSearchBtn: document.getElementById("clearSearchBtn"),
    categoryChipsContainer: document.getElementById("categoryChips"),
    difficultyChipsContainer: document.getElementById("difficultyChips"),
    cardListContainer: document.getElementById("modalCardList"),
    countText: document.getElementById("modalProblemCountText"),
    headerBadge: headerProblemCountBadge,
    onSelectProblem: (problemId) => {
      loadProblem(problemId);
      transitions.switchView("workspace");
    },
    getCurrentProblemId: () => (currentProblem ? currentProblem.id : "")
  });

  // 5. Load Problem Details & Code
  function loadProblem(problemId) {
    currentProblem = (window.PROBLEMS || []).find(p => p.id === problemId) || window.PROBLEMS[0];
    if (!currentProblem) return;

    // Update Dropdown value
    if (problemSelect) problemSelect.value = currentProblem.id;

    // Update Language & Mode
    const isSql = (currentProblem.language === "sql");
    editor.setOption("mode", isSql ? "text/x-sql" : "python");

    const editorTagLabel = document.querySelector(".editor-lang-tag span");
    if (editorTagLabel) {
      editorTagLabel.textContent = isSql ? "SQL (SQLite Engine)" : "Python 3 (Auto-Indent + Autocomplete)";
    }

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

      // Load Saved Code or Starter Code
      const savedCode = localStorage.getItem(`code_${currentProblem.id}`);
      editor.setValue(savedCode ? savedCode : currentProblem.starterCode);
      editor.clearHistory();

      // Update Console
      testConsole.setProblem(currentProblem);

      // Refresh Catalog Card Highlight
      catalog.renderModalCardList();
    };

    animateProblemLoad(paneContent, applyContentUpdate);
  }

  // 6. Navigation Problem Dropdown & Homepage Ledger
  function refreshProblemDropdown() {
    if (!problemSelect) return;
    problemSelect.innerHTML = "";
    (window.PROBLEMS || []).forEach((prob) => {
      const opt = document.createElement("option");
      opt.value = prob.id;
      opt.textContent = prob.title;
      problemSelect.appendChild(opt);
    });
    if (headerProblemCountBadge) headerProblemCountBadge.textContent = window.PROBLEMS.length;
  }

  function renderHomeProblemLedger() {
    if (!homeProblemLedgerList) return;
    homeProblemLedgerList.innerHTML = "";
    if (ledgerCountBadge) {
      ledgerCountBadge.textContent = `${(window.PROBLEMS || []).length} challenges`;
    }

    (window.PROBLEMS || []).forEach((prob, idx) => {
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
        const reducedMotion = prefersReducedMotion();
        if (window.gsap && !reducedMotion) {
          gsap.to(row, {
            scale: 0.985,
            y: 1.5,
            duration: 0.09,
            ease: "power2.in",
            onComplete: () => {
              gsap.to(row, { scale: 1, y: 0, duration: 0.15, ease: "power2.out" });
              loadProblem(prob.id);
              transitions.switchView("workspace");
            }
          });
        } else {
          loadProblem(prob.id);
          transitions.switchView("workspace");
        }
      });

      homeProblemLedgerList.appendChild(row);
    });
  }

  // 7. Left Pane Tabs (Problem, Intuition, Solution)
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetViewId = btn.dataset.target;
      const targetView = document.getElementById(targetViewId);
      if (!targetView || btn.classList.contains("active")) return;

      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      animateTabSwitch(tabViews, targetView);
    });
  });

  // 8. Editor Actions (Reset, Copy, Load Solution)
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

  // 9. Run Code Action with Physical Feedback & Dopamine Loop
  async function runCode() {
    if (runCodeBtn.disabled) return;
    const reducedMotion = prefersReducedMotion();
    const userCode = editor.getValue();

    // 1. Physical Button Compression & Rapid Overshoot (Game-feel click)
    if (window.gsap && !reducedMotion) {
      gsap.timeline()
        .to(runCodeBtn, { scale: 0.93, y: 2, duration: 0.07, ease: "power2.in" })
        .to(runCodeBtn, { scale: 1, y: 0, duration: 0.2, ease: "back.out(2.5)" });
    }

    runCodeBtn.disabled = true;
    runCodeBtn.classList.add("is-running");
    const originalBtnContent = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <span>Run Code</span>
    `;

    runCodeBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
      <span>Executing...</span>
    `;

    // 2. Start Live Anticipation in Test Console (Pipeline + Energy Bar)
    testConsole.startExecution();

    try {
      // 3. Execute in Pyodide WebAssembly Worker
      const outcome = await window.pythonRunner.runTests(userCode, currentProblem);

      if (!outcome.success && outcome.error) {
        testConsole.renderExecutionError(outcome.error);
      } else {
        // 4. Sequential Resolution Loop (Small dopamine hits + grand finale)
        const res = await testConsole.resolveTestSequence(outcome);

        if (res && res.allPassed) {
          // Button Victory Ack
          runCodeBtn.classList.remove("is-running");
          runCodeBtn.classList.add("is-success");
          runCodeBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Passed!</span>
          `;

          if (window.gsap && !reducedMotion) {
            gsap.fromTo(runCodeBtn, { scale: 1.08 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
          }

          await new Promise(r => setTimeout(r, 900));
        }
      }
    } catch (err) {
      testConsole.renderExecutionError(err.message || String(err));
    } finally {
      runCodeBtn.classList.remove("is-running");
      runCodeBtn.classList.remove("is-success");
      runCodeBtn.disabled = false;
      runCodeBtn.innerHTML = originalBtnContent;
    }
  }

  runCodeBtn.addEventListener("click", runCode);

  problemSelect.addEventListener("change", (e) => {
    loadProblem(e.target.value);
    transitions.switchView("workspace");
  });

  // 10. Pyodide Status Indicator
  if (window.pythonRunner) {
    window.pythonRunner.onStatusChange((status, isReady) => {
      if (statusText) statusText.textContent = status;
      if (statusDot) {
        if (isReady) statusDot.classList.add("ready");
        else statusDot.classList.remove("ready");
      }
    });
  }

  // Initial Boot
  refreshProblemDropdown();
  catalog.setupFilterChips();
  renderHomeProblemLedger();
  if (window.PROBLEMS && window.PROBLEMS.length > 0) {
    loadProblem(window.PROBLEMS[0].id);
  }
  transitions.switchView("home");

  // Boot Pyodide WASM Engine
  if (window.pythonRunner) {
    window.pythonRunner.init();
  }
});
