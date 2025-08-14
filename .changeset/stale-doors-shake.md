---
"create-carve-app": minor
---

fix: resolve ESM import resolution issue by adding explicit .js extensions

- Added explicit .js extensions to import statements in create.ts and init.ts
- Ensures proper ESM module resolution when package is published to npm
- Fixes ERR_MODULE_NOT_FOUND error when using bun create carve-app@latest
- Maintains compatibility with both Node.js and Bun environments
