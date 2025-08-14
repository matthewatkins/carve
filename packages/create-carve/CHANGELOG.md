# create-carve-app

## 0.4.0

### Minor Changes

- fix: resolve ESM import resolution issue by adding explicit .js extensions

  - Added explicit .js extensions to import statements in create.ts and init.ts
  - Ensures proper ESM module resolution when package is published to npm
  - Fixes ERR_MODULE_NOT_FOUND error when using bun create carve-app@latest
  - Maintains compatibility with both Node.js and Bun environments

### Patch Changes

- 485d017: fix: resolve ESM module resolution issue in published npm package

  - Changed TypeScript moduleResolution from "bundler" to "node" for proper ESM compatibility
  - Fixed import path resolution that was causing ERR_MODULE_NOT_FOUND errors
  - Ensures CLI works correctly when published to npmjs.org

## 0.3.1

### Patch Changes

- fixed a file extension issue

## 0.3.0

### Minor Changes

- Refactored commands with shared rename utils for simplification

## 0.2.1

### Patch Changes

- Updating CLI commands to be cleaner and not rely on citty

## 0.2.0

### Minor Changes

- fixing default cli run command

## 0.1.10

### Patch Changes

- updating readme and changing package name

## 0.1.1

### Patch Changes

- Fixes the NPM publishing of the create-carve package

## 0.1.0

### Minor Changes

- Initial CLI setup

## 0.0.6

### Patch Changes

- Initial alpha release of the Carve CLI tool for scaffolding projects. Features include:

  - Interactive project creation with @clack/prompts
  - Template downloading with giget
  - Automatic project renaming from "carve" to custom name
  - Multi-package manager support (detects bun, npm, yarn, pnpm)
  - Database setup with Docker and PostgreSQL
  - Environment file creation
  - Git repository initialization
  - Comprehensive project structure with microservices architecture
