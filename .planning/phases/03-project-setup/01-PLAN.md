# Phase 3, Plan 1: Vite + React + TypeScript Project Setup

## Objective

Set up the foundational Vite + React + TypeScript project with development tooling (ESLint, Prettier) and CI/CD pipeline for Vercel deployment.

## Context

This is Phase 3 of Milestone 1 (MVP). Phases 1-2 validated:
- Line art generation works (100% success rate)
- Wikidata pipeline provides ship data (99 ships tested)

Now we need the frontend foundation before building UI components (Phase 5) and game logic (Phase 6).

## Tasks

### Task 1: Initialize Vite Project
**Action**: Create Vite project with React + TypeScript template

```bash
cd /home/bmoerdler/Documents/Keel
npm create vite@latest . -- --template react-ts
```

**Note**: Since project directory exists, may need `--force` or manual setup.

**Verification**: `npm run dev` starts development server

---

### Task 2: Configure TypeScript
**Action**: Update `tsconfig.json` with strict settings

**Settings to enable**:
- `strict: true` (already default in Vite template)
- `noUncheckedIndexedAccess: true`
- Path aliases: `@/*` → `src/*`

**Verification**: `npx tsc --noEmit` passes

---

### Task 3: Install and Configure ESLint
**Action**: Set up ESLint with TypeScript and React rules

**Dependencies**:
```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks
```

**Configuration**: Create `eslint.config.js` (flat config)

**Rules**:
- TypeScript strict type checking
- React hooks rules
- No unused variables (warn)
- Consistent imports

**Verification**: `npm run lint` passes on generated code

---

### Task 4: Install and Configure Prettier
**Action**: Set up Prettier for code formatting

**Dependencies**:
```bash
npm install -D prettier eslint-config-prettier
```

**Configuration**: Create `.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**Verification**: `npm run format` works

---

### Task 5: Add npm Scripts
**Action**: Update `package.json` with development scripts

**Scripts to add**:
```json
{
  "lint": "eslint src --ext .ts,.tsx",
  "lint:fix": "eslint src --ext .ts,.tsx --fix",
  "format": "prettier --write src",
  "format:check": "prettier --check src",
  "typecheck": "tsc --noEmit"
}
```

**Verification**: All scripts run without error

---

### Task 6: Set Up Vitest for Testing
**Action**: Install and configure Vitest with React Testing Library

**Dependencies**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

**Configuration**: Add to `vite.config.ts`:
```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
}
```

**Create**: `src/test/setup.ts` with testing-library matchers

**Verification**: `npm test` runs sample test

---

### Task 7: Create Vercel Configuration
**Action**: Add `vercel.json` for deployment settings

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**Verification**: Config file exists and is valid JSON

---

### Task 8: Create GitHub Actions Workflow
**Action**: Add CI workflow for lint, typecheck, test, build

**File**: `.github/workflows/ci.yml`

**Steps**:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Run lint
5. Run typecheck
6. Run tests
7. Run build

**Verification**: Workflow file is valid YAML

---

### Task 9: Clean Up Template and Add Placeholder
**Action**: Remove Vite template boilerplate, add Keel placeholder

**Changes**:
- Replace `App.tsx` with Keel placeholder content
- Remove Vite assets (logo SVGs)
- Update `index.html` title to "Keel"
- Clean up `App.css` / `index.css`

**Verification**: `npm run dev` shows Keel placeholder page

---

### Task 10: Verify Full Build Pipeline
**Action**: Run complete CI checks locally

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

**Verification**: All commands pass, `dist/` contains built files

---

## Success Criteria

- [ ] Vite dev server runs at localhost
- [ ] TypeScript compiles with strict settings
- [ ] ESLint passes on all source files
- [ ] Prettier formatting is consistent
- [ ] Vitest runs sample test successfully
- [ ] `npm run build` produces `dist/` output
- [ ] CI workflow validates on all checks
- [ ] Ready for Vercel deployment

## Dependencies

- Node.js 20+
- npm 9+

## Estimated Tasks: 10

---
*Created: 2026-01-18*
