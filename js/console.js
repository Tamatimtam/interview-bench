// js/console.js - Interactive Test Case Console & Result Visualizer
import { escapeHtml } from "./utils.js";

export function initConsole({ consoleTabs, consoleBody }) {
  let selectedCaseIndex = 0;
  let currentTestResults = null;
  let currentProblem = null;

  function setProblem(problem) {
    currentProblem = problem;
    selectedCaseIndex = 0;
    currentTestResults = null;
    renderConsoleChips();
    renderInitialConsole();
  }

  function setTestResults(results) {
    currentTestResults = results;
    renderConsoleChips();
    renderActiveCaseDetail();
  }

  function renderConsoleChips() {
    if (!consoleTabs || !currentProblem || !currentProblem.testCases) return;
    consoleTabs.innerHTML = "";

    currentProblem.testCases.forEach((tc, idx) => {
      const chip = document.createElement("button");
      chip.className = `case-chip ${idx === selectedCaseIndex ? "active" : ""}`;

      let statusIcon = "";
      if (currentTestResults && currentTestResults.results && currentTestResults.results[idx]) {
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
    if (!consoleBody || !currentProblem) return;
    consoleBody.innerHTML = `
      <div class="empty-console">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Press "Run Code" or hit Ctrl+Enter to test your solution against ${currentProblem.testCases.length} test cases.</span>
      </div>
    `;
  }

  function renderRunningState() {
    if (!consoleBody) return;
    consoleBody.innerHTML = `
      <div class="empty-console">
        <span>Running solution against test suite in Pyodide...</span>
      </div>
    `;
  }

  function renderExecutionError(errorMsg) {
    if (!consoleBody) return;
    currentTestResults = null;
    consoleBody.innerHTML = `
      <div class="summary-banner has-fail">
        <span>Execution Error</span>
      </div>
      <div class="case-detail-card">
        <div class="case-row">
          <span class="case-label">Error Details</span>
          <div class="case-val error">${escapeHtml(errorMsg)}</div>
        </div>
      </div>
    `;
    renderConsoleChips();
  }

  function renderActiveCaseDetail() {
    if (!consoleBody || !currentProblem) return;

    if (!currentTestResults || !currentTestResults.results || !currentTestResults.results.length) {
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
          <span style="color: var(--text-muted); font-size: 11px;">${escapeHtml((currentProblem.testCases[selectedCaseIndex] && currentProblem.testCases[selectedCaseIndex].note) || "")}</span>
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

  return {
    setProblem,
    setTestResults,
    renderRunningState,
    renderExecutionError,
    renderConsoleChips,
    renderInitialConsole,
    renderActiveCaseDetail
  };
}
