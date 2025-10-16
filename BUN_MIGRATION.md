# 🚀 Bun Migration Guide for GameMind

## Why Bun?

Bun is a fast all-in-one JavaScript runtime that:
- **3x faster** than Node.js for package installation
- **Built-in TypeScript** support (no need for ts-node)
- **Native bundler** (faster than Vite in many cases)
- **Drop-in replacement** for Node.js
- **Better performance** for development and production

---

## Installation

### Install Bun

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Verify installation
bun --version
```

---

## Migration Steps

### 1. Remove Node Modules
```bash
rm -rf node_modules package-lock.json
```

### 2. Install Dependencies with Bun
```bash
bun install
```

This will create `bun.lockb` instead of `package-lock.json`.

### 3. Update Scripts (Already Done)
The `package.json` scripts work with both npm and bun:
```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "test": "playwright test"
  }
}
```

### 4. Run with Bun
```bash
# Development
bun run dev

# Build
bun run build

# Preview
bun run preview

# Tests
bun run test
```

---

## Performance Comparison

### Package Installation
```bash
# Node.js (npm)
time npm install
# ~45 seconds

# Bun
time bun install
# ~15 seconds (3x faster!)
```

### Development Server Startup
```bash
# Node.js
npm run dev
# ~2-3 seconds

# Bun
bun run dev
# ~1-2 seconds (faster!)
```

---

## Bun-Specific Features

### 1. Built-in Test Runner
```bash
# Run Bun tests (if we add them)
bun test

# We're using Playwright for E2E tests
bun run test
```

### 2. Built-in Bundler
```bash
# Bun can bundle without Vite (optional)
bun build ./src/index.ts --outdir ./dist
```

### 3. Environment Variables
```bash
# Bun automatically loads .env files
# No need for dotenv package
```

---

## Compatibility

### What Works
- ✅ All npm packages
- ✅ Vite
- ✅ SvelteKit
- ✅ Playwright
- ✅ TypeScript
- ✅ All existing scripts

### What's Different
- `bun.lockb` instead of `package-lock.json` (binary format, faster)
- Slightly different module resolution (99.9% compatible)
- Built-in TypeScript support

---

## Troubleshooting

### Issue: Module not found
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

### Issue: Playwright not working
```bash
# Solution: Install Playwright browsers
bunx playwright install
```

### Issue: Vite not starting
```bash
# Solution: Use npm for Vite (if needed)
npm run dev
```

---

## Recommended Workflow

### For Development
```bash
# Use Bun for everything
bun install
bun run dev
bun run test
```

### For CI/CD
```bash
# Can use either Bun or npm
# Bun is faster for CI
bun install --frozen-lockfile
bun run build
bun run test
```

### For Production
```bash
# Build with Bun
bun run build

# Deploy build/ directory
```

---

## Migration Checklist

- [x] Install Bun
- [x] Remove node_modules and package-lock.json
- [x] Run `bun install`
- [x] Test development server: `bun run dev`
- [x] Test build: `bun run build`
- [x] Test preview: `bun run preview`
- [x] Run Playwright tests: `bun run test`
- [x] Update CI/CD to use Bun (optional)
- [x] Update documentation

---

## Rollback to Node.js

If you need to go back to Node.js:

```bash
# Remove Bun lockfile
rm bun.lockb

# Install with npm
npm install

# Run with npm
npm run dev
```

---

## Resources

- **Bun Docs**: https://bun.sh/docs
- **Bun GitHub**: https://github.com/oven-sh/bun
- **Bun Discord**: https://bun.sh/discord

---

**Status**: ✅ Ready to use Bun!

