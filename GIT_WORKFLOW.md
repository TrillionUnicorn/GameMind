# 🔄 Git Workflow & PR Management Guide

## Overview
This guide explains the Git workflow for GameMind development, including branch management, PR creation, and merge strategies.

---

## Branch Strategy

### Main Branches
- **`main`** - Production-ready code, always deployable
- **`develop`** - Integration branch for features (optional)

### Feature Branches
- **`feature/feature-name`** - New features
- **`bugfix/bug-name`** - Bug fixes
- **`hotfix/issue-name`** - Urgent production fixes
- **`mvp/variant-name`** - MVP variant development
- **`docs/topic-name`** - Documentation updates

---

## Workflow Steps

### 1. Create a New Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/add-mahjong-game

# Or for MVP variant
git checkout -b mvp/variant-2-minimalist

# Or for bug fix
git checkout -b bugfix/fix-chess-castling
```

### 2. Make Changes

```bash
# Make your changes
# Edit files...

# Check status
git status

# Add files
git add .

# Or add specific files
git add src/routes/play/+page.svelte

# Commit with descriptive message
git commit -m "feat: add Mahjong game implementation"
```

### 3. Commit Message Convention

Use conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(chess): add castling move validation"
git commit -m "fix(ui): resolve mobile menu overflow issue"
git commit -m "docs: update setup guide with Bun instructions"
git commit -m "test: add responsive design tests for all pages"
git commit -m "style(tailwind): fix button hover states"
```

### 4. Push to Remote

```bash
# Push branch to remote
git push origin feature/add-mahjong-game

# If branch doesn't exist on remote
git push -u origin feature/add-mahjong-game
```

### 5. Create Pull Request

#### Via GitHub CLI
```bash
# Install GitHub CLI if not installed
# macOS: brew install gh
# Windows: winget install GitHub.cli

# Login
gh auth login

# Create PR
gh pr create --title "Add Mahjong game" --body "Implements Mahjong game with AI opponent"

# Create PR with template
gh pr create --web
```

#### Via GitHub Web Interface
1. Go to https://github.com/TrillionUnicorn/GameMind
2. Click "Pull requests" tab
3. Click "New pull request"
4. Select your branch
5. Fill in the PR template
6. Click "Create pull request"

### 6. PR Review Process

#### As Author
```bash
# Make requested changes
git add .
git commit -m "fix: address PR review comments"
git push origin feature/add-mahjong-game

# PR will automatically update
```

#### As Reviewer
1. Review code changes
2. Test locally:
   ```bash
   git fetch origin
   git checkout feature/add-mahjong-game
   bun install
   bun run dev
   bun run test
   ```
3. Leave comments or approve
4. Request changes if needed

### 7. Merge Pull Request

#### Merge Strategies

**Squash and Merge** (Recommended for features)
- Combines all commits into one
- Keeps main branch history clean
- Use for: Features, bug fixes

**Rebase and Merge** (For clean history)
- Replays commits on top of main
- Maintains individual commits
- Use for: Well-organized commit history

**Merge Commit** (For preserving history)
- Creates a merge commit
- Preserves all commits
- Use for: MVP variants, major features

#### Via GitHub CLI
```bash
# Squash and merge
gh pr merge --squash

# Rebase and merge
gh pr merge --rebase

# Merge commit
gh pr merge --merge

# Delete branch after merge
gh pr merge --squash --delete-branch
```

#### Via GitHub Web Interface
1. Click "Merge pull request"
2. Choose merge strategy
3. Confirm merge
4. Delete branch (optional)

### 8. Clean Up

```bash
# Switch back to main
git checkout main

# Pull latest changes
git pull origin main

# Delete local branch
git branch -d feature/add-mahjong-game

# Delete remote branch (if not auto-deleted)
git push origin --delete feature/add-mahjong-game
```

---

## MVP Variant Workflow

### Creating MVP Variants

```bash
# Create MVP variant branch from main
git checkout main
git pull origin main
git checkout -b mvp/variant-2-minimalist

# Make changes for variant
# ...

# Commit and push
git add .
git commit -m "feat(mvp2): create minimalist variant"
git push -u origin mvp/variant-2-minimalist

# Create PR
gh pr create --title "MVP Variant 2: Minimalist Design" --body "..."
```

### Keeping Variants in Sync

```bash
# Update variant with main branch changes
git checkout mvp/variant-2-minimalist
git merge main

# Resolve conflicts if any
# ...

git add .
git commit -m "chore: merge main into variant-2"
git push origin mvp/variant-2-minimalist
```

---

## Best Practices

### 1. Keep Branches Small
- One feature per branch
- Easier to review
- Faster to merge

### 2. Update Frequently
```bash
# Pull main regularly
git checkout main
git pull origin main

# Merge into your branch
git checkout feature/your-feature
git merge main
```

### 3. Write Good Commit Messages
```bash
# Bad
git commit -m "fix stuff"

# Good
git commit -m "fix(chess): resolve pawn promotion bug on rank 8"
```

### 4. Test Before PR
```bash
# Always run before creating PR
bun run check
bun run lint
bun run build
bun run test
```

### 5. Keep PR Description Updated
- Update PR description if scope changes
- Add screenshots for UI changes
- Link related issues

---

## Handling Conflicts

### Merge Conflicts

```bash
# Update your branch with main
git checkout feature/your-feature
git merge main

# If conflicts occur
# Edit conflicted files
# Look for <<<<<<< HEAD markers

# After resolving
git add .
git commit -m "chore: resolve merge conflicts with main"
git push origin feature/your-feature
```

### Rebase Conflicts

```bash
# Rebase on main
git checkout feature/your-feature
git rebase main

# If conflicts occur
# Resolve conflicts
git add .
git rebase --continue

# Force push (be careful!)
git push origin feature/your-feature --force-with-lease
```

---

## Emergency Procedures

### Revert a Commit

```bash
# Revert last commit
git revert HEAD

# Revert specific commit
git revert <commit-hash>

# Push revert
git push origin main
```

### Hotfix Process

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# Fix the bug
# ...

# Commit and push
git add .
git commit -m "fix: resolve critical production bug"
git push -u origin hotfix/critical-bug

# Create PR with high priority
gh pr create --title "HOTFIX: Critical bug" --label "priority:high"

# After merge, tag release
git checkout main
git pull origin main
git tag -a v0.0.2 -m "Hotfix release"
git push origin v0.0.2
```

---

## Automation

### Pre-commit Hooks

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
bun run lint
bun run check
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

### GitHub Actions

Already configured in `.github/workflows/ci.yml`:
- Runs on every PR
- Checks linting, type checking, build, tests
- Prevents merge if checks fail

---

## Useful Commands

```bash
# View commit history
git log --oneline --graph --all

# View changes
git diff

# View changes in staged files
git diff --staged

# Stash changes
git stash
git stash pop

# Cherry-pick commit
git cherry-pick <commit-hash>

# View remote branches
git branch -r

# View all branches
git branch -a

# Delete merged branches
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d
```

---

## Resources

- **Git Documentation**: https://git-scm.com/doc
- **GitHub CLI**: https://cli.github.com/
- **Conventional Commits**: https://www.conventionalcommits.org/

---

**Happy Coding! 🚀**

