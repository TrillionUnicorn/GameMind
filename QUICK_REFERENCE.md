# ⚡ GameMind Quick Reference Guide

## 🚀 Quick Start

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone and setup
git clone https://github.com/TrillionUnicorn/GameMind.git
cd GameMind
bun install

# Start development
bun run dev
# Open http://localhost:5173
```

---

## 📝 Common Commands

### Development
```bash
bun run dev          # Start dev server
bun run build        # Build for production
bun run preview      # Preview production build
bun run check        # Type check
bun run lint         # Lint code
bun run format       # Format code
```

### Testing
```bash
bun run test         # Run all Playwright tests
bun run test:ui      # Run tests with UI
bun run test:headed  # Run tests in headed mode
bun run test:debug   # Debug tests
```

### Validation
```bash
chmod +x scripts/validate-mvp.sh
./scripts/validate-mvp.sh  # Run full validation
```

---

## 🌳 Git Workflow

### Create Feature Branch
```bash
git checkout -b feature/feature-name
# Make changes
git add .
git commit -m "feat: description"
git push -u origin feature/feature-name
gh pr create --web
```

### Create MVP Variant
```bash
git checkout -b mvp/variant-name
# Make changes
git add .
git commit -m "feat(mvp): variant description"
git push -u origin mvp/variant-name
gh pr create --title "MVP Variant: Name" --web
```

### Update Branch
```bash
git checkout main
git pull origin main
git checkout your-branch
git merge main
```

---

## 🧪 Testing Specific Pages

```bash
# Test home page only
bun run test tests/home.spec.ts

# Test play page only
bun run test tests/play.spec.ts

# Test pitch page only
bun run test tests/pitch.spec.ts

# Test contact page only
bun run test tests/contact.spec.ts

# Test responsive design
bun run test tests/responsive.spec.ts

# Test UI validation
bun run test tests/ui-validation.spec.ts
```

---

## 📱 Test Specific Viewports

```bash
# Mobile only
bun run test --project="Mobile Chrome"

# Tablet only
bun run test --project="iPad"

# Desktop only
bun run test --project="chromium"

# All mobile devices
bun run test --project="Mobile Chrome" --project="Mobile Safari"
```

---

## 🔍 Debugging

### Debug Specific Test
```bash
bun run test:debug tests/home.spec.ts
```

### View Test Report
```bash
bunx playwright show-report
```

### Update Snapshots
```bash
bun run test --update-snapshots
```

---

## 📦 Package Management

### Add Dependency
```bash
bun add package-name
```

### Add Dev Dependency
```bash
bun add -d package-name
```

### Remove Dependency
```bash
bun remove package-name
```

### Update All Dependencies
```bash
bun update
```

---

## 🐛 Troubleshooting

### Clear Cache
```bash
rm -rf node_modules bun.lockb .svelte-kit
bun install
```

### Reinstall Playwright
```bash
bunx playwright install
```

### Check for Errors
```bash
bun run check
bun run lint
```

### View Build Output
```bash
bun run build --debug
```

---

## 📊 Project Structure

```
GameMind/
├── src/
│   ├── lib/
│   │   ├── components/    # UI components
│   │   └── engines/       # Game engines
│   └── routes/            # Pages
├── tests/                 # Playwright tests
├── scripts/               # Automation scripts
├── .github/               # GitHub config
└── docs/                  # Documentation
```

---

## 🎯 MVP Variants

### Current Status
- ✅ MVP 1: Pro Gamer (main branch)
- ⏳ MVP 2: Casual Zen (planned)
- ⏳ MVP 3: Educational Kids (planned)
- ⏳ MVP 4: Minimalist Pro (planned)
- ⏳ MVP 5: Social Streamer (planned)

### Access Variants
```bash
# Switch to variant
git checkout mvp/variant-name

# List all variants
git branch -a | grep mvp
```

---

## 🚀 Deployment

### Build for Production
```bash
bun run build
```

### Deploy to Vercel
```bash
vercel
```

### Deploy to Netlify
```bash
netlify deploy --prod
```

### Docker Build
```bash
docker-compose up -d
```

---

## 📚 Documentation

- **README.md** - Project overview
- **SETUP_GUIDE.md** - Detailed setup
- **DEVELOPMENT.md** - Architecture
- **ROADMAP.md** - Future plans
- **BUN_MIGRATION.md** - Bun guide
- **GIT_WORKFLOW.md** - Git workflow
- **MVP_VARIANTS_PLAN.md** - Variants strategy
- **EXECUTION_SUMMARY.md** - Current status

---

## 🆘 Get Help

### Check Documentation
```bash
# View README
cat README.md

# View setup guide
cat SETUP_GUIDE.md
```

### Run Validation
```bash
./scripts/validate-mvp.sh
```

### Contact
- Email: hello@gamemind.com
- Discord: https://discord.gg/gamemind
- GitHub: https://github.com/TrillionUnicorn/GameMind

---

## ⚡ Pro Tips

1. **Always run validation before PR**
   ```bash
   ./scripts/validate-mvp.sh
   ```

2. **Use conventional commits**
   ```bash
   git commit -m "feat: add feature"
   git commit -m "fix: fix bug"
   git commit -m "docs: update docs"
   ```

3. **Test on multiple browsers**
   ```bash
   bun run test --project=chromium --project=firefox --project=webkit
   ```

4. **Keep branches updated**
   ```bash
   git checkout main && git pull
   git checkout your-branch && git merge main
   ```

5. **Use GitHub CLI for PRs**
   ```bash
   gh pr create --web
   gh pr list
   gh pr view
   gh pr merge
   ```

---

**Happy Coding! 🎮🚀**

