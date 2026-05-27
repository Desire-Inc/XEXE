# CI Debugger Run — ShellPrefix TypeScript parse failure

## Trigger

GitHub Actions failed at:

```text
bun -F @xexe/platform typecheck
src/shell/ShellPrefix.ts(27,169): error TS1127: Invalid character.
src/shell/ShellPrefix.ts(27,170): error TS1005: ';' expected.
src/shell/ShellPrefix.ts(27,172): error TS1127: Invalid character.
src/shell/ShellPrefix.ts(27,343): error TS1002: Unterminated string literal.
src/shell/ShellPrefix.ts(28,1): error TS1128: Declaration or statement expected.
```

## Root cause

`renderZshShim()` used a TypeScript template literal containing zsh text with `${BUFFER#:}`. TypeScript parsed that as a JS interpolation expression instead of literal shell syntax.

## Fix

Re-render the zsh shim using an array of quoted string fragments joined with `\n`, keeping `${BUFFER#:}` literal and avoiding invalid TypeScript parsing.

## Regression coverage

Added `ShellPrefix.test.ts` for parsing and shim rendering.
