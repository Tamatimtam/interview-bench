// runner.js - Resilient Client-Side Runner Engine with Web Worker Chaos Protection

class CodeRunner {
  constructor() {
    this.worker = null;
    this.isReady = false;
    this.isLoading = false;
    this.statusListeners = [];
    this.status = "Initializing runtime...";
    this.currentRun = null;
    this.runCounter = 0;
    this.useWorker = typeof Worker !== "undefined";
    this.fallbackPyodide = null;
  }

  onStatusChange(callback) {
    this.statusListeners.push(callback);
    callback(this.status, this.isReady);
  }

  notifyStatus(status, ready = false) {
    this.status = status;
    this.isReady = ready;
    this.statusListeners.forEach(cb => cb(status, ready));
  }

  async init() {
    if (this.isReady || this.isLoading) return;
    this.isLoading = true;

    if (this.useWorker) {
      try {
        this.setupWorker();
        return;
      } catch (err) {
        console.warn("Worker creation failed, falling back to main-thread Pyodide:", err);
        this.useWorker = false;
      }
    }

    // Fallback if workers are blocked
    await this.initFallback();
  }

  setupWorker() {
    if (this.worker) {
      try { this.worker.terminate(); } catch (e) {}
    }

    this.notifyStatus("Starting execution worker...", false);
    this.worker = new Worker("worker.js");

    this.worker.onmessage = (e) => {
      const data = e.data;
      if (!data) return;

      if (data.type === "STATUS") {
        this.notifyStatus(data.status, data.isReady);
        if (data.isReady) {
          this.isLoading = false;
        }
      } else if (data.type === "RESULT") {
        if (this.currentRun && this.currentRun.id === data.runId) {
          clearTimeout(this.currentRun.timeoutId);
          const resolve = this.currentRun.resolve;
          this.currentRun = null;
          resolve(data);
        }
      }
    };

    this.worker.onerror = (err) => {
      console.error("Worker error encountered:", err);
      this.notifyStatus("Worker error. Restarting...", false);
      this.setupWorker();
    };

    this.worker.postMessage({ type: "INIT" });
  }

  async initFallback() {
    this.notifyStatus("Loading main-thread Pyodide...", false);
    try {
      if (typeof loadPyodide === "undefined") {
        throw new Error("Pyodide script not loaded from CDN.");
      }
      this.fallbackPyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/"
      });
      await this.fallbackPyodide.loadPackage("sqlite3");
      this.isLoading = false;
      this.notifyStatus("Engine Ready (Python + SQLite)", true);
    } catch (err) {
      console.warn("Pyodide fallback error:", err);
      this.isLoading = false;
      this.notifyStatus("Engine offline (CDN unavailable)", false);
    }
  }

  async runTests(userCode, problem) {
    const startTime = performance.now();
    this.runCounter++;
    const runId = this.runCounter;

    // 1. Worker Execution with 5-Second Watchdog Timer (Chaos Engineering)
    if (this.useWorker && this.worker) {
      return new Promise((resolve) => {
        // Hard watchdog timeout: 5000ms
        const timeoutId = setTimeout(() => {
          console.warn(`[Chaos Protection] Execution timeout hit on run #${runId}. Terminating worker.`);
          
          // Terminate runaway infinite loop thread
          try {
            this.worker.terminate();
          } catch (e) {}

          // Immediately re-create a clean worker for future runs
          this.setupWorker();

          const totalMs = Math.round(performance.now() - startTime);
          this.currentRun = null;

          resolve({
            success: false,
            executionMs: totalMs,
            error: `⏱️ Time Limit Exceeded (5.0s Limit)

Chaos Protection Triggered: Execution was aborted to prevent your browser tab from freezing!

Common causes:
• An infinite loop (e.g. while condition never becomes False, or pointer not advancing)
• Unbounded recursion without a base case
• Heavy computational complexity beyond O(10^7) ops`,
            results: []
          });
        }, 5000);

        this.currentRun = { id: runId, resolve, timeoutId };

        this.worker.postMessage({
          type: "RUN",
          runId,
          userCode,
          problem
        });
      }).then(res => {
        res.executionMs = res.executionMs || Math.round(performance.now() - startTime);
        return res;
      });
    }

    // 2. Fallback Main Thread Execution (if workers unsupported)
    if (!this.fallbackPyodide) {
      await this.init();
      if (!this.fallbackPyodide) {
        return {
          success: false,
          error: "Runtime could not be loaded. Please ensure you have internet access to load the Pyodide WebAssembly runtime.",
          results: []
        };
      }
    }

    // Main thread execution fallback
    try {
      const isSql = (problem.language === "sql");
      const funcName = problem.functionName;
      const testCases = problem.testCases;

      let harness = "";
      if (isSql) {
        harness = `
import sqlite3, json, traceback
__results = []
try:
    for idx, tc in enumerate(${JSON.stringify(testCases)}):
        conn = sqlite3.connect(":memory:")
        c = conn.cursor()
        s = tc.get('schemaSql', '')
        if s: c.executescript(s)
        c.execute(${JSON.stringify(userCode)})
        rows = c.fetchall()
        act = "\\n".join([" ".join(str(v) for v in r) for r in rows]).strip()
        exp = str(tc.get('expected', '')).strip()
        passed = (sorted([l.strip() for l in act.splitlines() if l.strip()]) == sorted([l.strip() for l in exp.splitlines() if l.strip()]))
        __results.append({"test_index": idx, "input": "Sample Tables", "expected": exp, "actual": act if act else "(Empty Result Set)", "passed": passed, "logs": "", "error": None})
        conn.close()
except Exception as e:
    __results.append({"test_index": -1, "input": "SQL Execution Error", "expected": None, "actual": None, "passed": False, "logs": "", "error": traceback.format_exc()})
json.dumps(__results)
`;
      } else {
        harness = `
import sys, io, json, traceback
class CappedOut(io.StringIO):
    def write(self, s):
        if self.tell() < 25000: super().write(s)
        return len(s)
__out = CappedOut()
sys.stdout = __out
__results = []
try:
    exec(${JSON.stringify(userCode)}, globals())
    user_func = globals()['${funcName}']
    for idx, tc in enumerate(${JSON.stringify(testCases)}):
        __out.seek(0); __out.truncate(0)
        act = user_func(*tc['input']) if isinstance(tc['input'], tuple) else user_func(tc['input'])
        passed = (act == tc['expected'])
        __results.append({"test_index": idx, "input": tc['input'], "expected": tc['expected'], "actual": act, "passed": passed, "logs": __out.getvalue(), "error": None})
except Exception as e:
    __results.append({"test_index": -1, "input": "Execution Error", "expected": None, "actual": None, "passed": False, "logs": __out.getvalue() if '__out' in locals() else "", "error": traceback.format_exc()})
finally:
    sys.stdout = sys.__stdout__
json.dumps(__results)
`;
      }

      const rawJson = await this.fallbackPyodide.runPythonAsync(harness);
      const testOutputs = JSON.parse(rawJson);
      const totalTimeMs = Math.round(performance.now() - startTime);

      if (testOutputs.length === 1 && testOutputs[0].test_index === -1) {
        return { success: false, executionMs: totalTimeMs, error: testOutputs[0].error, results: [] };
      }
      return { success: true, allPassed: testOutputs.every(t => t.passed), executionMs: totalTimeMs, results: testOutputs };
    } catch (err) {
      return {
        success: false,
        executionMs: Math.round(performance.now() - startTime),
        error: err.message || String(err),
        results: []
      };
    }
  }
}

// Global runner instance
window.codeRunner = new CodeRunner();
window.pythonRunner = window.codeRunner;
