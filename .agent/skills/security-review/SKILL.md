---
name: security-review
description: Review code and diffs for secrets, destructive actions, unsafe shell usage, and permission escalation.
---

# Security Review

Check:

- Secrets and credentials
- Shell commands that mutate outside the worktree
- Network calls that exfiltrate data
- Tool policies and approval boundaries
- MCP servers with broad filesystem access
- Generated files that should not be committed
- Rollback path for destructive changes
