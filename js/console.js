// js/console.js - Interactive Test Case Console with Game-Feel Motion & Dopamine Payoff
import { escapeHtml, prefersReducedMotion } from "./utils.js";
import { celebrationFX, animateCounter } from "./celebration.js";

export function initConsole({ consoleSection, consoleTabs, consoleBody, celebrationCanvas }) {
  let selectedCaseIndex = 0;
  let currentTestResults = null;
  let currentProblem = null;
  let activeSequenceId = 0;
  let isResolvingSequence = false;

  // Initialize canvas particle engine
  if (celebrationCanvas && consoleSection) {
    celebrationFX.init(celebrationCanvas, consoleSection);
  }

  function setProblem(problem) {
    activeSequenceId++;
    isResolvingSequence = false;
    currentProblem = problem;
    selectedCaseIndex = 0;
    currentTestResults = null;
    if (consoleSection) consoleSection.classList.remove("is-executing");
    renderConsoleChips();
    renderInitialConsole();
  }

  function renderConsoleChips(caseStates = []) {
    if (!consoleTabs || !currentProblem || !currentProblem.testCases) return;
    consoleTabs.innerHTML = "";

    currentProblem.testCases.forEach((tc, idx) => {
      const chip = document.createElement("button");
      chip.id = `testChip_${idx}`;
      chip.className = `case-chip ${idx === selectedCaseIndex ? "active" : ""}`;

      const state = caseStates[idx] || (currentTestResults && currentTestResults.results && currentTestResults.results[idx]
        ? (currentTestResults.results[idx].passed ? "pass" : "fail")
        : "idle");

      let icon = "";
      if (state === "evaluating") {
        chip.classList.add("evaluating");
        icon = `<span class="spin" style="display:inline-block; font-size:10px; margin-right:2px;">◓</span>`;
      } else if (state === "pass") {
        chip.classList.add("pass");
        icon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      } else if (state === "fail") {
        chip.classList.add("fail");
        icon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      }

      chip.innerHTML = `${icon}<span>Case ${idx + 1}</span>`;
      chip.addEventListener("click", () => {
        selectedCaseIndex = idx;
        renderConsoleChips(caseStates);
        renderActiveCaseDetail();
        highlightActivePipelineRow(idx);
      });

      consoleTabs.appendChild(chip);
    });
  }

  function renderInitialConsole() {
    if (!consoleBody || !currentProblem) return;
    consoleBody.innerHTML = `
      <div class="empty-console">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Press <strong>Run Code</strong> (or <code>Ctrl + Enter</code>) to test your solution against ${currentProblem.testCases.length} test cases.</span>
      </div>
    `;
  }

  // Live Anticipation State: Prepares test case pipeline while WASM runtime executes
  function startExecution() {
    activeSequenceId++;
    isResolvingSequence = true;
    if (consoleSection) consoleSection.classList.add("is-executing");

    const totalCases = (currentProblem && currentProblem.testCases && currentProblem.testCases.length) || 0;
    const initialStates = new Array(totalCases).fill("queued");

    renderConsoleChips(initialStates);

    let pipelineRowsHtml = "";
    if (currentProblem && currentProblem.testCases) {
      currentProblem.testCases.forEach((tc, idx) => {
        pipelineRowsHtml += `
          <div class="pipeline-row" id="pipelineRow_${idx}">
            <div class="pipeline-row-left">
              <span class="pipeline-case-num">Case ${idx + 1}</span>
              <span class="pipeline-case-note">${escapeHtml(tc.note || "Standard verification")}</span>
            </div>
            <div class="pipeline-row-right">
              <span class="pipeline-status-pill queued" id="pipelinePill_${idx}">QUEUED</span>
            </div>
          </div>
        `;
      });
    }

    consoleBody.innerHTML = `
      <div class="test-pipeline-wrap">
        <div class="pipeline-header">
          <span class="pipeline-title">Executing Test Vectors</span>
          <span class="pipeline-stats">Pyodide WASM active</span>
        </div>
        <div class="pipeline-list" id="pipelineList">
          ${pipelineRowsHtml}
        </div>
      </div>
      <div id="inspectorArea">
        <div class="empty-console" style="height: 100px; padding: 12px;">
          <span style="font-size: 12px; color: var(--text-muted);">Awaiting runtime results...</span>
        </div>
      </div>
    `;

    // Subtle entrance animation on the pipeline
    if (window.gsap && !prefersReducedMotion()) {
      const rows = consoleBody.querySelectorAll(".pipeline-row");
      gsap.fromTo(rows, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.04, ease: "power2.out" });
    }
  }

  // Sequential Resolution Engine: Ticking off tests one-by-one with GSAP dopamine pops
  async function resolveTestSequence(outcome) {
    const thisSequenceId = ++activeSequenceId;
    isResolvingSequence = true;
    currentTestResults = outcome;

    const results = outcome.results || [];
    const totalCases = results.length;
    const reducedMotion = prefersReducedMotion();

    const caseStates = new Array(totalCases).fill("queued");

    // Sequential resolution cadence: 140ms per test case (punchy & rhythmic)
    const stepDuration = reducedMotion ? 10 : Math.max(120, Math.min(200, Math.floor(900 / Math.max(totalCases, 1))));

    for (let i = 0; i < totalCases; i++) {
      if (thisSequenceId !== activeSequenceId) return; // Cancelled by newer run or problem change

      const res = results[i];
      const chipEl = document.getElementById(`testChip_${i}`);
      const rowEl = document.getElementById(`pipelineRow_${i}`);
      const pillEl = document.getElementById(`pipelinePill_${i}`);

      // 1. Focus state: EVALUATING
      caseStates[i] = "evaluating";
      if (chipEl) {
        chipEl.className = `case-chip evaluating ${i === selectedCaseIndex ? "active" : ""}`;
        chipEl.innerHTML = `<span class="spin" style="display:inline-block; font-size:10px; margin-right:2px;">◓</span><span>Case ${i + 1}</span>`;
      }
      if (rowEl) rowEl.className = `pipeline-row evaluating ${i === selectedCaseIndex ? "active" : ""}`;
      if (pillEl) {
        pillEl.className = "pipeline-status-pill evaluating";
        pillEl.textContent = "CHECKING...";
      }

      // Small tension delay for anticipation
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      if (thisSequenceId !== activeSequenceId) return;

      // 2. Resolve outcome: PASSED or FAILED
      if (res.passed) {
        caseStates[i] = "pass";
        if (chipEl) {
          chipEl.className = `case-chip pass ${i === selectedCaseIndex ? "active" : ""}`;
          chipEl.innerHTML = `
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Case ${i + 1}</span>
          `;

          // Small Dopamine Hit: Spring pop + micro-sparks on the chip
          if (window.gsap && !reducedMotion) {
            gsap.fromTo(
              chipEl,
              { scale: 1.2, filter: "brightness(1.4)" },
              { scale: 1, filter: "brightness(1)", duration: 0.24, ease: "back.out(3)" }
            );
          }
          celebrationFX.triggerChipSpark(chipEl);
        }

        if (rowEl) {
          rowEl.className = `pipeline-row pass ${i === selectedCaseIndex ? "active" : ""}`;
          if (window.gsap && !reducedMotion) {
            gsap.fromTo(rowEl, { x: 3 }, { x: 0, duration: 0.2, ease: "power2.out" });
          }
        }

        if (pillEl) {
          pillEl.className = "pipeline-status-pill pass";
          pillEl.innerHTML = `✓ PASSED`;
        }
      } else {
        // Failed case
        caseStates[i] = "fail";
        if (chipEl) {
          chipEl.className = `case-chip fail ${i === selectedCaseIndex ? "active" : ""}`;
          chipEl.innerHTML = `
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            <span>Case ${i + 1}</span>
          `;

          // Constructive failure impact shake
          if (window.gsap && !reducedMotion) {
            gsap.fromTo(
              chipEl,
              { x: -5 },
              { x: 5, duration: 0.05, repeat: 4, yoyo: true, ease: "power1.inOut", onComplete: () => gsap.set(chipEl, { x: 0 }) }
            );
          }
        }

        if (rowEl) {
          rowEl.className = `pipeline-row fail ${i === selectedCaseIndex ? "active" : ""}`;
          if (window.gsap && !reducedMotion) {
            gsap.fromTo(
              rowEl,
              { x: -6 },
              { x: 6, duration: 0.06, repeat: 3, yoyo: true, ease: "power1.inOut", onComplete: () => gsap.set(rowEl, { x: 0 }) }
            );
          }
        }

        if (pillEl) {
          pillEl.className = "pipeline-status-pill fail";
          pillEl.innerHTML = `✕ FAILED`;
        }
      }
    }

    if (consoleSection) consoleSection.classList.remove("is-executing");
    isResolvingSequence = false;

    // Attach click handlers to the newly resolved pipeline rows
    const pipelineRows = consoleBody.querySelectorAll(".pipeline-row");
    pipelineRows.forEach((row, idx) => {
      row.addEventListener("click", () => {
        selectedCaseIndex = idx;
        renderConsoleChips(caseStates);
        renderActiveCaseDetail();
        highlightActivePipelineRow(idx);
      });
    });

    // 3. The Grand Finale: All Passed vs Failed
    if (outcome.allPassed) {
      // The "Oh Shit" Tension Pause (180ms)
      if (!reducedMotion) {
        await new Promise(r => setTimeout(r, 180));
      }
      if (thisSequenceId !== activeSequenceId) return;

      // Render the All-Pass Victory Showcase
      renderVictoryPayoff(outcome);
      return { success: true, allPassed: true };
    } else {
      // Some failed: automatically select the first failing case so user immediately sees what went wrong
      const firstFailIdx = results.findIndex(r => !r.passed);
      if (firstFailIdx !== -1) {
        selectedCaseIndex = firstFailIdx;
        renderConsoleChips(caseStates);
        highlightActivePipelineRow(firstFailIdx);
      }
      renderFailureSummary(outcome);
      return { success: true, allPassed: false };
    }
  }

  function renderVictoryPayoff(outcome) {
    const inspectorArea = document.getElementById("inspectorArea");
    if (!inspectorArea) {
      renderActiveCaseDetail();
      return;
    }

    const totalCases = (outcome.results && outcome.results.length) || 0;

    inspectorArea.innerHTML = `
      <div class="summary-banner all-pass" id="victoryBanner">
        <div class="banner-title-group">
          <div class="victory-icon-circle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <div style="font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.02em;">ALL ${totalCases} TEST CASES PASSED</div>
            <div style="font-size: 11px; color: #7ee787; font-weight: 400;">Optimal solution logic verified against test suite</div>
          </div>
        </div>
        <div class="banner-meta">
          <span class="banner-badge-pill">⚡ <span id="runtimeCounter">0</span>ms</span>
          <span class="banner-badge-pill" style="background: rgba(46, 160, 67, 0.3); border-color: #3fb950; color: #ffffff;">100% SUCCESS</span>
        </div>
      </div>

      <div id="activeCaseDetailSlot" style="margin-top: 10px;"></div>
    `;

    const bannerEl = document.getElementById("victoryBanner");
    const runtimeEl = document.getElementById("runtimeCounter");

    // Elastic entrance for Victory Banner
    if (window.gsap && !prefersReducedMotion() && bannerEl) {
      gsap.fromTo(
        bannerEl,
        { scale: 0.92, y: 14, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.48, ease: "elastic.out(1, 0.65)" }
      );
    }

    // Grand Finale Particle Burst & Shockwave
    celebrationFX.triggerVictoryCelebration(bannerEl);

    // Roll up the execution time counter
    animateCounter(runtimeEl, outcome.executionMs || 12, 0.45, "");

    // Render active case card beneath the banner
    renderCaseDetailCardToSlot("activeCaseDetailSlot");
  }

  function renderFailureSummary(outcome) {
    const inspectorArea = document.getElementById("inspectorArea");
    if (!inspectorArea) {
      renderActiveCaseDetail();
      return;
    }

    const passedCount = (outcome.results || []).filter(r => r.passed).length;
    const totalCount = (outcome.results || []).length;

    inspectorArea.innerHTML = `
      <div class="summary-banner has-fail" id="failBanner">
        <div>
          <div style="font-size: 13px; font-weight: 700; color: #ffffff;">${passedCount} of ${totalCount} Test Cases Passed</div>
          <div style="font-size: 11px; color: #ff7b72; font-weight: 400;">Expected vs Actual output diverged. Review Case ${selectedCaseIndex + 1} below.</div>
        </div>
        <div class="banner-meta">
          <span class="banner-badge-pill">${outcome.executionMs}ms</span>
          <span class="banner-badge-pill">NEED ADJUSTMENT</span>
        </div>
      </div>

      <div id="activeCaseDetailSlot" style="margin-top: 10px;"></div>
    `;

    const bannerEl = document.getElementById("failBanner");
    if (window.gsap && !prefersReducedMotion() && bannerEl) {
      gsap.fromTo(
        bannerEl,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }

    renderCaseDetailCardToSlot("activeCaseDetailSlot");
  }

  function highlightActivePipelineRow(activeIdx) {
    const rows = consoleBody.querySelectorAll(".pipeline-row");
    rows.forEach((r, idx) => {
      if (idx === activeIdx) r.classList.add("active");
      else r.classList.remove("active");
    });
  }

  function renderCaseDetailCardToSlot(slotId) {
    const slot = document.getElementById(slotId);
    if (!slot || !currentProblem) return;

    const res = currentTestResults && currentTestResults.results && currentTestResults.results[selectedCaseIndex];
    const tc = currentProblem.testCases && currentProblem.testCases[selectedCaseIndex];

    if (!res) {
      if (!tc) return;
      slot.innerHTML = `
        <div class="case-detail-card">
          <div class="case-row">
            <span class="case-label">Case ${selectedCaseIndex + 1} Focus</span>
            <div class="case-val">${escapeHtml(tc.note || "Standard verification")}</div>
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

    const passStatus = res.passed ? "PASSED" : "FAILED";
    const passColor = res.passed ? "#3fb950" : "#f85149";

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

    slot.innerHTML = `
      <div class="case-detail-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
          <span style="font-weight: 700; color: ${passColor}; font-size: 11px; letter-spacing: 0.03em;">${passStatus} · CASE ${selectedCaseIndex + 1}</span>
          <span style="color: var(--text-muted); font-size: 11px;">${escapeHtml((tc && tc.note) || "")}</span>
        </div>

        <div class="case-row">
          <span class="case-label">Input</span>
          <div class="case-val">${escapeHtml(res.input)}</div>
        </div>

        <div class="case-row">
          <span class="case-label">Expected Output</span>
          <div class="case-val ${!res.passed ? "diff-highlight-expected" : ""}">${escapeHtml(String(res.expected))}</div>
        </div>

        <div class="case-row">
          <span class="case-label">Your Output</span>
          <div class="case-val ${!res.passed ? "diff-highlight-actual error" : ""}">${escapeHtml(String(res.actual))}</div>
        </div>

        ${logsHtml}
        ${errorHtml}
      </div>
    `;

    if (window.gsap && !prefersReducedMotion()) {
      const card = slot.querySelector(".case-detail-card");
      if (card) {
        gsap.fromTo(card, { opacity: 0.6, y: 5 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" });
      }
    }
  }

  function renderActiveCaseDetail() {
    const slot = document.getElementById("activeCaseDetailSlot");
    if (slot) {
      renderCaseDetailCardToSlot("activeCaseDetailSlot");
      return;
    }
    // Fallback if full layout is re-rendered
    renderCaseDetailCardToSlot("consoleBody");
  }

  function renderExecutionError(errorMsg) {
    activeSequenceId++;
    isResolvingSequence = false;
    currentTestResults = null;
    if (consoleSection) consoleSection.classList.remove("is-executing");

    if (!consoleBody) return;
    consoleBody.innerHTML = `
      <div class="summary-banner has-fail">
        <div>
          <div style="font-size: 13px; font-weight: 700;">Runtime / Syntax Error</div>
          <div style="font-size: 11px; color: #ff7b72;">Your code raised an exception before test verification completed.</div>
        </div>
        <span class="banner-badge-pill">EXECUTION HALTED</span>
      </div>
      <div class="case-detail-card" style="margin-top: 10px;">
        <div class="case-row">
          <span class="case-label">Error Details & Traceback</span>
          <div class="case-val error" style="font-size: 11px; line-height: 1.5;">${escapeHtml(errorMsg)}</div>
        </div>
      </div>
    `;
    renderConsoleChips();
  }

  return {
    setProblem,
    startExecution,
    resolveTestSequence,
    renderExecutionError,
    renderConsoleChips,
    renderInitialConsole,
    renderActiveCaseDetail
  };
}
