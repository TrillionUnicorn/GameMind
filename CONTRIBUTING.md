# Contributing to GameMind

Thank you for your interest in contributing to GameMind! This document provides guidelines and instructions for contributing.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Documentation](#documentation)

---

## 🤝 Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

---

## 🚀 Getting Started

### Prerequisites

- **Bun** 1.0+ (for backend)
- **Node.js** 22+ (for frontend)
- **PostgreSQL** 16+
- **Git** for version control

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/GameMind.git
   cd GameMind
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/TrillionUnicorn/GameMind.git
   ```

---

## 💻 Development Setup

### Backend Setup

```bash
cd PRODUCTION/backend
bun install
cp .env.example .env
# Edit .env with your credentials
createdb gamemind_dev
bun run db:migrate
bun run dev
```

### Frontend Setup

```bash
npm install
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:3000
npm run dev
```

---

## 🔧 Making Changes

### Branch Naming Convention

- **Feature:** `feature/description`
- **Bug Fix:** `fix/description`
- **Documentation:** `docs/description`
- **Performance:** `perf/description`
- **Refactor:** `refactor/description`

### Workflow

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write clean, readable code
   - Follow existing code style
   - Add comments where necessary

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**
```
feat: add game replay feature
fix: resolve authentication token expiry issue
docs: update deployment guide
perf: optimize database queries with indexes
```

---

## 🧪 Testing

### Run Tests

**Backend:**
```bash
cd PRODUCTION/backend
bun test
```

**Frontend:**
```bash
npm test
```

**E2E Tests:**
```bash
npm run test:e2e
```

### Writing Tests

- Write tests for all new features
- Ensure existing tests pass
- Aim for 80%+ code coverage
- Test edge cases and error scenarios

---

## 📤 Submitting Changes

### Before Submitting

1. **Update from upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all tests:**
   ```bash
   cd PRODUCTION/backend && bun test
   cd ../.. && npm test
   ```

3. **Check code quality:**
   ```bash
   npm run lint
   npm run type-check
   ```

### Create Pull Request

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub:**
   - Go to the repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

3. **PR Description should include:**
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Screenshots (if UI changes)
   - Related issues (if any)

### PR Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, your PR will be merged

---

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Export types when needed

### Code Style

- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings
- **Semicolons:** Required
- **Line Length:** Max 100 characters
- **Naming:**
  - `camelCase` for variables and functions
  - `PascalCase` for classes and types
  - `UPPER_CASE` for constants

### Best Practices

- Keep functions small and focused
- Use meaningful variable names
- Avoid deep nesting
- Handle errors properly
- Add comments for complex logic
- Remove console.logs before committing

---

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex algorithms
- Explain non-obvious code

**Example:**
```typescript
/**
 * Calculates the ELO rating change after a game
 * @param currentRating - Player's current ELO rating
 * @param opponentRating - Opponent's ELO rating
 * @param result - Game result (1 = win, 0.5 = draw, 0 = loss)
 * @returns The new ELO rating
 */
function calculateEloChange(
  currentRating: number,
  opponentRating: number,
  result: number
): number {
  // Implementation
}
```

### Update Documentation

- Update README if adding features
- Update API docs if changing endpoints
- Add examples for new functionality

---

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported
2. Verify it's reproducible
3. Gather relevant information

### Bug Report Should Include

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, browser, versions)
- Screenshots or error messages

---

## 💡 Suggesting Features

### Feature Request Should Include

- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Any alternatives considered

---

## 🔍 Code Review Guidelines

### For Reviewers

- Be respectful and constructive
- Explain the reasoning behind suggestions
- Approve when ready, request changes if needed
- Test the changes locally if possible

### For Contributors

- Respond to feedback promptly
- Ask questions if feedback is unclear
- Make requested changes
- Thank reviewers for their time

---

## 📞 Getting Help

- **Documentation:** See [START_HERE.md](START_HERE.md)
- **Issues:** Open an issue on GitHub
- **Discussions:** Use GitHub Discussions
- **Email:** support@gamemind.app

---

## 🎉 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Credited in the application (for significant contributions)

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to GameMind!** 🎮

