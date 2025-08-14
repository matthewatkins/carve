---
"create-carve-app": patch
---

fix: resolve ESM module resolution issue in published npm package

- Changed TypeScript moduleResolution from "bundler" to "node" for proper ESM compatibility
- Fixed import path resolution that was causing ERR_MODULE_NOT_FOUND errors
- Ensures CLI works correctly when published to npmjs.org
