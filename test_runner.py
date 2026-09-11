#!/usr/bin/env python3
import os
import sys
import time
import subprocess

# ANSI color codes for pretty terminal output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

TIMEOUT_SECONDS = 4.0

def run_tests():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_dir = os.path.join(base_dir, "test_cases", "input")
    output_dir = os.path.join(base_dir, "test_cases", "output")
    solution_file = os.path.join(base_dir, "solution.py")

    if not os.path.exists(solution_file):
        print(f"{RED}Error: solution.py not found in {base_dir}!{RESET}")
        return

    test_inputs = sorted(os.listdir(input_dir))
    total_tests = len(test_inputs)
    passed_count = 0

    print(f"\n{BOLD}{CYAN}=== 🧪 Running HackerRank Test Suite (16 Cases) ==={RESET}\n")

    for idx, in_file_name in enumerate(test_inputs):
        test_id = in_file_name.replace("input_", "").replace(".txt", "")
        in_path = os.path.join(input_dir, in_file_name)
        out_path = os.path.join(output_dir, f"output_{test_id}.txt")

        with open(in_path, "r") as f:
            input_data = f.read()

        with open(out_path, "r") as f:
            expected_output = f.read().strip()

        # Parse n for friendly info
        n_elements = input_data.strip().split("\n", 1)[0]

        start_time = time.time()
        try:
            res = subprocess.run(
                [sys.executable, solution_file],
                input=input_data,
                text=True,
                capture_output=True,
                timeout=TIMEOUT_SECONDS
            )
            elapsed = time.time() - start_time
            actual_output = res.stdout.strip()
            stderr_output = res.stderr.strip()

            if res.returncode != 0:
                print(f"  [{BOLD}{RED}RUNTIME ERROR{RESET}] Test #{test_id} (n = {n_elements}):")
                if stderr_output:
                    # Print last 3 lines of error to keep it readable
                    err_lines = stderr_output.splitlines()
                    print(f"    {YELLOW}Error:{RESET} {err_lines[-1]}")
                continue

            if actual_output == expected_output:
                passed_count += 1
                print(f"  [{BOLD}{GREEN}PASS{RESET}] Test #{test_id} (n = {n_elements}) - {elapsed:.3f}s")
            else:
                print(f"  [{BOLD}{RED}FAIL{RESET}] Test #{test_id} (n = {n_elements}) - {elapsed:.3f}s")
                # For small tests, show friendly hint
                if int(n_elements) <= 10:
                    arr_snippet = input_data.strip().split()[1:]
                    print(f"         Input arr: {arr_snippet}")
                print(f"         Expected: {expected_output}")
                print(f"         Got:      {actual_output if actual_output else '(None / Empty)'}")

        except subprocess.TimeoutExpired:
            print(f"  [{BOLD}{YELLOW}TIME LIMIT EXCEEDED{RESET}] Test #{test_id} (n = {n_elements}) > {TIMEOUT_SECONDS}s")
            print(f"         Hint: Your algorithm might be O(n^2). Try finding a faster approach!")

    print("\n" + "=" * 50)
    if passed_count == total_tests:
        print(f"{BOLD}{GREEN}🎉 Awesome job! All {passed_count}/{total_tests} test cases passed!{RESET}\n")
    else:
        print(f"{BOLD}{YELLOW}Result: {passed_count}/{total_tests} passed.{RESET} Keep going, you got this!\n")

if __name__ == "__main__":
    run_tests()
