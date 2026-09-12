// worker.js - Dedicated Background Thread for Pyodide Execution
// Isolates Python and SQLite execution from the main UI thread to prevent UI freezing.

let pyodide = null;
let isReady = false;
let isLoading = false;

async function initPyodide() {
  if (isReady || isLoading) return;
  isLoading = true;
  self.postMessage({ type: "STATUS", status: "Downloading Pyodide WebAssembly runtime...", isReady: false });

  try {
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/"
    });
    self.postMessage({ type: "STATUS", status: "Loading SQLite package...", isReady: false });
    await pyodide.loadPackage("sqlite3");
    isReady = true;
    isLoading = false;
    self.postMessage({ type: "STATUS", status: "Engine Ready (Python + SQLite)", isReady: true });
  } catch (err) {
    isLoading = false;
    self.postMessage({ type: "STATUS", status: "Engine initialization failed: " + err.message, isReady: false, error: true });
  }
}

// Build Python harness with memory and output-capping safety
function buildPythonHarness(userCode, funcName, testCases) {
  return `
import sys
import io
import json
import traceback

class CappedStdout(io.StringIO):
    def __init__(self, limit=25000):
        super().__init__()
        self.limit = limit
        self.truncated = False
    def write(self, s):
        if self.tell() >= self.limit:
            if not self.truncated:
                super().write("\\n[Output limit reached: stdout truncated to protect memory]")
                self.truncated = True
            return len(s)
        return super().write(s)

__user_stdout = CappedStdout()
sys.stdout = __user_stdout
__results = []

try:
    exec(${JSON.stringify(userCode)}, globals())
    
    if '${funcName}' not in globals():
        raise Exception("Function '${funcName}' was not defined in your code. Please check your function signature.")

    user_func = globals()['${funcName}']
    test_cases = ${JSON.stringify(testCases)}
    
    for idx, tc in enumerate(test_cases):
        raw_input = tc['input']
        expected = tc['expected']
        
        __user_stdout.seek(0)
        __user_stdout.truncate(0)
        __user_stdout.truncated = False
        
        call_expr = f"user_func({raw_input})"
        actual = eval(call_expr, globals())
        
        captured_log = __user_stdout.getvalue()
        passed = (actual == expected) or (captured_log.rstrip() == str(expected).rstrip())
        
        # If user function printed output rather than returning a value, show printed output
        display_actual = actual if actual is not None else captured_log.rstrip()
        
        __results.append({
            "test_index": idx,
            "input": raw_input,
            "expected": expected,
            "actual": display_actual,
            "passed": passed,
            "logs": captured_log,
            "error": None
        })

except Exception as e:
    err_tb = traceback.format_exc()
    # Format a concise human-readable error summary for junior developers
    lines = err_tb.strip().splitlines()
    short_err = lines[-1] if lines else str(e)
    __results.append({
        "test_index": -1,
        "input": "Execution Error",
        "expected": None,
        "actual": None,
        "passed": False,
        "logs": __user_stdout.getvalue() if '__user_stdout' in locals() else "",
        "error": f"{short_err}\\n\\nFull Traceback:\\n{err_tb}"
    })

finally:
    sys.stdout = sys.__stdout__

json.dumps(__results)
`;
}

// Build SQL harness with database isolation
function buildSqlHarness(userCode, testCases) {
  return `
import sqlite3
import json
import traceback

__results = []

try:
    test_cases = ${JSON.stringify(testCases)}
    user_query = ${JSON.stringify(userCode)}
    
    for idx, tc in enumerate(test_cases):
        conn = sqlite3.connect(":memory:")
        cursor = conn.cursor()
        
        schema_script = tc.get('schemaSql', '')
        if schema_script:
            cursor.executescript(schema_script)
            
        cursor.execute(user_query)
        rows = cursor.fetchall()
        
        formatted_rows = [" ".join(str(val) for val in row) for row in rows]
        actual_output = "\\n".join(formatted_rows).strip()
        expected_output = str(tc.get('expected', '')).strip()
        
        actual_lines = [l.strip() for l in actual_output.splitlines() if l.strip()]
        expected_lines = [l.strip() for l in expected_output.splitlines() if l.strip()]
        
        passed = (sorted(actual_lines) == sorted(expected_lines))
        
        __results.append({
            "test_index": idx,
            "input": "Sample Database Tables",
            "expected": expected_output,
            "actual": actual_output if actual_output else "(Empty Result Set)",
            "passed": passed,
            "logs": "",
            "error": None
        })
        conn.close()

except Exception as e:
    err_tb = traceback.format_exc()
    lines = err_tb.strip().splitlines()
    short_err = lines[-1] if lines else str(e)
    __results.append({
        "test_index": -1,
        "input": "SQL Execution Error",
        "expected": None,
        "actual": None,
        "passed": False,
        "logs": "",
        "error": f"{short_err}\\n\\nTraceback:\\n{err_tb}"
    })

json.dumps(__results)
`;
}

self.onmessage = async function(e) {
  const data = e.data;
  if (!data) return;

  if (data.type === "INIT") {
    await initPyodide();
    return;
  }

  if (data.type === "RUN") {
    const { runId, userCode, problem } = data;
    if (!isReady) {
      await initPyodide();
      if (!isReady) {
        self.postMessage({
          type: "RESULT",
          runId,
          success: false,
          error: "Pyodide runtime failed to load. Please check your network connection.",
          results: []
        });
        return;
      }
    }

    const isSql = (problem.language === "sql");
    const harnessCode = isSql 
      ? buildSqlHarness(userCode, problem.testCases)
      : buildPythonHarness(userCode, problem.functionName, problem.testCases);

    try {
      const rawJson = await pyodide.runPythonAsync(harnessCode);
      const testOutputs = JSON.parse(rawJson);

      if (testOutputs.length === 1 && testOutputs[0].test_index === -1) {
        self.postMessage({
          type: "RESULT",
          runId,
          success: false,
          error: testOutputs[0].error,
          results: []
        });
        return;
      }

      const allPassed = testOutputs.every(t => t.passed);
      self.postMessage({
        type: "RESULT",
        runId,
        success: true,
        allPassed,
        results: testOutputs
      });
    } catch (err) {
      self.postMessage({
        type: "RESULT",
        runId,
        success: false,
        error: err.message || String(err),
        results: []
      });
    }
  }
};

// Automatically initiate Pyodide on worker creation
initPyodide();
