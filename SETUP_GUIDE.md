# 🚀 GameMind Setup Guide

Complete guide to get GameMind running on your local machine or deploy to production.

---

## 📋 Prerequisites

### Required Software
- **Node.js**: Version 22+ (LTS recommended)
  - Download: https://nodejs.org/
  - Verify: `node --version`
- **npm**: Version 10+ (comes with Node.js)
  - Verify: `npm --version`
- **Git**: Latest version
  - Download: https://git-scm.com/
  - Verify: `git --version`

### Optional (for production)
- **Docker**: Latest version
  - Download: https://www.docker.com/
- **Docker Compose**: Latest version (usually comes with Docker Desktop)

---

## 🏁 Quick Start (Development)

### 1. Clone the Repository
```bash
git clone https://github.com/TrillionUnicorn/GameMind.git
cd GameMind
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- Svelte 5 and SvelteKit 2
- Tailwind CSS v4+
- GSAP, Svelte-Motion, Lottie (animation libraries)
- TypeScript and all dev dependencies

### 3. Set Up Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your preferred editor
# For development, the defaults should work fine
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at: **http://localhost:5173**

### 5. Open in Browser
```bash
# macOS
open http://localhost:5173

# Linux
xdg-open http://localhost:5173

# Windows
start http://localhost:5173
```

---

## 🎮 Testing the Application

### Navigate to Different Pages
1. **Home Page**: http://localhost:5173/
2. **Play Chess**: http://localhost:5173/play
3. **Pitch Deck**: http://localhost:5173/pitch
4. **Contact**: http://localhost:5173/contact

### Test Chess Game
1. Go to http://localhost:5173/play
2. Click on a white piece (you play as white by default)
3. Click on a highlighted square to move
4. Watch the AI respond
5. Try different difficulty levels
6. Use "Switch Sides" to play as black
7. Use "New Game" to restart

---

## 🛠️ Development Commands

### Available Scripts
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type check TypeScript
npm run check

# Type check in watch mode
npm run check:watch

# Lint code
npm run lint

# Format code with Prettier
npm run format
```

### Development Workflow
1. Make changes to files in `src/`
2. Save the file
3. Browser automatically reloads (hot module replacement)
4. Check console for any errors

---

## 🏗️ Project Structure

```
GameMind/
├── src/
│   ├── lib/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # Base UI components (Button, Card, Input)
│   │   │   ├── chess/       # Chess-specific components
│   │   │   ├── Navigation.svelte
│   │   │   └── Footer.svelte
│   │   └── engines/         # Game engines
│   │       └── chess/       # Chess engine and AI
│   │           ├── types.ts
│   │           ├── board.ts
│   │           ├── moves.ts
│   │           └── ai.ts
│   ├── routes/              # SvelteKit routes (pages)
│   │   ├── +layout.svelte   # Root layout
│   │   ├── +page.svelte     # Home page
│   │   ├── play/
│   │   │   └── +page.svelte # Chess game page
│   │   ├── pitch/
│   │   │   └── +page.svelte # Pitch deck page
│   │   └── contact/
│   │       └── +page.svelte # Contact page
│   ├── app.css              # Global styles with Tailwind
│   └── app.html             # HTML template
├── static/                  # Static assets
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose setup
├── tailwind.config.js      # Tailwind CSS configuration
├── svelte.config.js        # SvelteKit configuration
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
├── .env.example            # Environment variables template
├── .gitignore             # Git ignore rules
├── README.md              # Project overview
├── DEVELOPMENT.md         # Development guide
├── ROADMAP.md             # Product roadmap
├── PROJECT_STATUS.md      # Current status
└── SETUP_GUIDE.md         # This file
```

---

## 🐳 Docker Deployment

### Build and Run with Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

### Services Included
- **app**: GameMind web application (port 3000)
- **postgres**: TimescaleDB database (port 5432)
- **redis**: Redis cache (port 6379)
- **nginx**: Reverse proxy (ports 80, 443)

### Access Application
- **Direct**: http://localhost:3000
- **Via Nginx**: http://localhost

---

## 🌐 Production Deployment

### Option 1: Vercel (Recommended for SvelteKit)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Option 3: VPS (DigitalOcean, AWS, etc.)
```bash
# On your server
git clone https://github.com/TrillionUnicorn/GameMind.git
cd GameMind
npm install
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start build/index.js --name gamemind
pm2 save
pm2 startup
```

### Option 4: Docker on VPS
```bash
# On your server
git clone https://github.com/TrillionUnicorn/GameMind.git
cd GameMind
docker-compose up -d
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Error: Port 5173 is already in use

# Solution: Kill the process or use a different port
npm run dev -- --port 3000
```

#### 2. Module Not Found
```bash
# Error: Cannot find module 'X'

# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript Errors
```bash
# Error: Type errors in code

# Solution: Run type check to see all errors
npm run check

# Generate types
npm run prepare
```

#### 4. Tailwind Styles Not Working
```bash
# Solution: Make sure Tailwind is imported in app.css
# Check that vite.config.ts has @tailwindcss/vite plugin
# Restart dev server
```

#### 5. Build Fails
```bash
# Solution: Clear cache and rebuild
rm -rf .svelte-kit build
npm run build
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Home page loads and displays correctly
- [ ] Navigation menu works (desktop and mobile)
- [ ] Chess game is playable
- [ ] AI makes moves after player moves
- [ ] Difficulty levels work
- [ ] Pitch deck displays all sections
- [ ] Contact form validates input
- [ ] All links work
- [ ] Responsive design works on mobile
- [ ] Animations are smooth

### Browser Testing
Test in these browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📊 Performance Optimization

### Build Optimization
```bash
# Build with analysis
npm run build

# Check bundle size
ls -lh build/
```

### Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit
4. Target scores: 90+ in all categories

---

## 🔐 Security Best Practices

### Environment Variables
- Never commit `.env` file
- Use `.env.example` as template
- Rotate secrets regularly
- Use different secrets for dev/prod

### Dependencies
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

---

## 📚 Additional Resources

### Documentation
- **Svelte 5**: https://svelte.dev/docs
- **SvelteKit 2**: https://kit.svelte.dev/docs
- **Tailwind CSS v4**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

### Community
- **Discord**: https://discord.gg/gamemind
- **GitHub Issues**: https://github.com/TrillionUnicorn/GameMind/issues
- **Discussions**: https://github.com/TrillionUnicorn/GameMind/discussions

---

## 🆘 Getting Help

### If You're Stuck
1. Check this guide thoroughly
2. Search existing GitHub issues
3. Ask in Discord community
4. Create a new GitHub issue with:
   - Description of the problem
   - Steps to reproduce
   - Error messages
   - Your environment (OS, Node version, etc.)

### Contact
- **Email**: hello@gamemind.com
- **Discord**: https://discord.gg/gamemind
- **GitHub**: https://github.com/TrillionUnicorn/GameMind

---

**Happy Coding! 🎮🚀**

