---
name: debug-failing-test
description: Investigate failing tests and produce minimal fixes.
---

# Debug Failing Test

1. Capture the exact failing command and output.
2. Locate the smallest responsible code path.
3. Reproduce the failure in the task worktree.
4. Apply the smallest safe fix.
5. Add or update regression coverage.
6. Re-run the failing test and adjacent suite.
7. Write a rollback note.
