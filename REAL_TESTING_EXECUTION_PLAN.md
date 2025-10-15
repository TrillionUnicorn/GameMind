# 🧪 REAL TESTING EXECUTION PLAN - NO ASSUMPTIONS

**Status**: Ready to Execute in Working Environment  
**Goal**: Test EVERY page, section, CTA, UI position, color - 100% REAL

---

## ⚠️ CRITICAL REQUIREMENTS

**NO ASSUMPTIONS**:
- ❌ Don't assume it works
- ❌ Don't assume colors are correct
- ❌ Don't assume positions are right
- ✅ TEST EVERYTHING with real tools
- ✅ VERIFY EVERYTHING with screenshots
- ✅ MEASURE EVERYTHING with pixel precision

---

## PHASE 1: VISUAL REGRESSION TESTING

### 1.1 Install Visual Testing Tools

```bash
# Install Playwright with visual testing
npm install -D @playwright/test
npx playwright install --with-deps

# Install Percy for visual regression (optional but recommended)
npm install -D @percy/cli @percy/playwright
```

### 1.2 Create Visual Test Configuration

**File**: `playwright.config.ts` (update)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Visual regression settings
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100, // Allow max 100 pixels difference
      threshold: 0.2, // 20% threshold
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev -- --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### 1.3 Create Comprehensive Visual Tests

**File**: `tests/visual-regression.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  
  // HOME PAGE VISUAL TESTS
  test.describe('Home Page', () => {
    test('should match hero section design', async ({ page }) => {
      await page.goto('/');
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of hero section
      const hero = page.locator('section').first();
      await expect(hero).toHaveScreenshot('hero-section.png');
      
      // Verify hero title color
      const title = page.locator('h1').first();
      const color = await title.evaluate((el) => 
        window.getComputedStyle(el).color
      );
      expect(color).toBe('rgb(255, 255, 255)'); // white
      
      // Verify hero title position
      const box = await title.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.y).toBeGreaterThan(100); // Should be below navbar
      expect(box!.y).toBeLessThan(300); // Should be in viewport
    });

    test('should match statistics section design', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Find statistics section
      const stats = page.locator('text=10K+').first();
      await stats.scrollIntoViewIfNeeded();
      
      // Take screenshot
      const statsSection = page.locator('section:has-text("10K+")');
      await expect(statsSection).toHaveScreenshot('stats-section.png');
      
      // Verify stat colors
      const statNumbers = page.locator('.text-4xl, .text-5xl');
      const count = await statNumbers.count();
      
      for (let i = 0; i < count; i++) {
        const color = await statNumbers.nth(i).evaluate((el) =>
          window.getComputedStyle(el).color
        );
        // Should be white or gradient
        expect(color).toMatch(/rgb\(255, 255, 255\)|linear-gradient/);
      }
    });

    test('should match CTA buttons design', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Find CTA buttons
      const ctaButtons = page.locator('button, a').filter({ hasText: /Start Playing|View Pitch/ });
      
      // Test each CTA button
      const count = await ctaButtons.count();
      for (let i = 0; i < count; i++) {
        const button = ctaButtons.nth(i);
        
        // Take screenshot
        await expect(button).toHaveScreenshot(`cta-button-${i}.png`);
        
        // Verify button colors
        const bgColor = await button.evaluate((el) =>
          window.getComputedStyle(el).backgroundColor
        );
        const textColor = await button.evaluate((el) =>
          window.getComputedStyle(el).color
        );
        
        // Should have red background (primary color)
        expect(bgColor).toMatch(/rgb\(239, 68, 68\)|rgb\(220, 38, 38\)/); // red-500 or red-600
        
        // Should have white text
        expect(textColor).toBe('rgb(255, 255, 255)');
        
        // Verify button position
        const box = await button.boundingBox();
        expect(box).toBeTruthy();
        expect(box!.width).toBeGreaterThan(100); // Minimum width
        expect(box!.height).toBeGreaterThan(30); // Minimum height
      }
    });

    test('should match pricing cards design', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Scroll to pricing section
      const pricing = page.locator('text=Pricing').first();
      await pricing.scrollIntoViewIfNeeded();
      
      // Take screenshot of pricing section
      const pricingSection = page.locator('section:has-text("Pricing")');
      await expect(pricingSection).toHaveScreenshot('pricing-section.png');
      
      // Verify pricing card colors
      const cards = page.locator('.bg-white\\/5, .bg-white\\/10');
      const cardCount = await cards.count();
      
      for (let i = 0; i < cardCount; i++) {
        const card = cards.nth(i);
        
        // Verify glass morphism effect
        const bgColor = await card.evaluate((el) =>
          window.getComputedStyle(el).backgroundColor
        );
        expect(bgColor).toMatch(/rgba\(255, 255, 255, 0\.(05|1)\)/);
        
        // Verify border
        const border = await card.evaluate((el) =>
          window.getComputedStyle(el).border
        );
        expect(border).toContain('rgba(255, 255, 255');
      }
    });
  });

  // PLAY CHESS PAGE VISUAL TESTS
  test.describe('Play Chess Page', () => {
    test('should match chess board design', async ({ page }) => {
      await page.goto('/play');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of chess board
      const board = page.locator('.grid').first();
      await expect(board).toHaveScreenshot('chess-board.png');
      
      // Verify board is 8x8
      const squares = page.locator('[data-square]');
      const squareCount = await squares.count();
      expect(squareCount).toBe(64);
      
      // Verify square colors
      const lightSquare = squares.first();
      const darkSquare = squares.nth(1);
      
      const lightColor = await lightSquare.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );
      const darkColor = await darkSquare.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );
      
      // Light squares should be amber-100
      expect(lightColor).toBe('rgb(254, 243, 199)');
      
      // Dark squares should be amber-700
      expect(darkColor).toBe('rgb(180, 83, 9)');
    });

    test('should match chess pieces design', async ({ page }) => {
      await page.goto('/play');
      await page.waitForLoadState('networkidle');
      
      // Verify 32 pieces are displayed
      const pieces = page.locator('[data-piece]');
      const pieceCount = await pieces.count();
      expect(pieceCount).toBe(32);
      
      // Verify piece colors
      const whitePiece = page.locator('[data-piece="white"]').first();
      const blackPiece = page.locator('[data-piece="black"]').first();
      
      const whiteColor = await whitePiece.evaluate((el) =>
        window.getComputedStyle(el).color
      );
      const blackColor = await blackPiece.evaluate((el) =>
        window.getComputedStyle(el).color
      );
      
      expect(whiteColor).toBe('rgb(255, 255, 255)');
      expect(blackColor).toBe('rgb(0, 0, 0)');
      
      // Take screenshot of pieces
      await expect(whitePiece).toHaveScreenshot('white-piece.png');
      await expect(blackPiece).toHaveScreenshot('black-piece.png');
    });

    test('should match game controls design', async ({ page }) => {
      await page.goto('/play');
      await page.waitForLoadState('networkidle');
      
      // Find game controls
      const controls = page.locator('button').filter({ hasText: /New Game|Switch Sides/ });
      
      // Take screenshot
      await expect(controls.first()).toHaveScreenshot('game-controls.png');
      
      // Verify button styles
      const count = await controls.count();
      for (let i = 0; i < count; i++) {
        const button = controls.nth(i);
        
        const bgColor = await button.evaluate((el) =>
          window.getComputedStyle(el).backgroundColor
        );
        
        // Should have red background
        expect(bgColor).toMatch(/rgb\(239, 68, 68\)|rgb\(220, 38, 38\)/);
      }
    });
  });

  // PITCH DECK PAGE VISUAL TESTS
  test.describe('Pitch Deck Page', () => {
    test('should match pitch deck design', async ({ page }) => {
      await page.goto('/pitch');
      await page.waitForLoadState('networkidle');
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot('pitch-deck-full.png', {
        fullPage: true,
      });
      
      // Verify title slide
      const title = page.locator('h1').first();
      await expect(title).toHaveScreenshot('pitch-title.png');
      
      // Verify title color (gradient)
      const bgClip = await title.evaluate((el) =>
        window.getComputedStyle(el).backgroundClip
      );
      expect(bgClip).toBe('text');
    });

    test('should match market data design', async ({ page }) => {
      await page.goto('/pitch');
      await page.waitForLoadState('networkidle');
      
      // Find market data section
      const marketData = page.locator('text=$187.7B').first();
      await marketData.scrollIntoViewIfNeeded();
      
      // Take screenshot
      const section = page.locator('section:has-text("$187.7B")');
      await expect(section).toHaveScreenshot('market-data.png');
      
      // Verify data is visible and styled
      const dataPoints = page.locator('text=/\\$[0-9]+\\.?[0-9]*[BMK]/');
      const count = await dataPoints.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // CONTACT PAGE VISUAL TESTS
  test.describe('Contact Page', () => {
    test('should match contact form design', async ({ page }) => {
      await page.goto('/contact');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of form
      const form = page.locator('form').first();
      await expect(form).toHaveScreenshot('contact-form.png');
      
      // Verify form field styles
      const inputs = page.locator('input, textarea');
      const count = await inputs.count();
      
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        
        // Verify input background
        const bgColor = await input.evaluate((el) =>
          window.getComputedStyle(el).backgroundColor
        );
        expect(bgColor).toMatch(/rgba\(255, 255, 255, 0\.(05|1)\)/);
        
        // Verify input border
        const border = await input.evaluate((el) =>
          window.getComputedStyle(el).border
        );
        expect(border).toContain('rgba(255, 255, 255');
      }
    });
  });

  // RESPONSIVE DESIGN VISUAL TESTS
  test.describe('Responsive Design', () => {
    const viewports = [
      { name: 'Mobile Portrait', width: 375, height: 667 },
      { name: 'Mobile Landscape', width: 667, height: 375 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Tablet Landscape', width: 1024, height: 768 },
      { name: 'Desktop Small', width: 1366, height: 768 },
      { name: 'Desktop Large', width: 1920, height: 1080 },
      { name: 'Desktop 4K', width: 3840, height: 2160 },
    ];

    for (const viewport of viewports) {
      test(`should match design on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // Test home page
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot(`home-${viewport.name.toLowerCase().replace(' ', '-')}.png`, {
          fullPage: true,
        });
        
        // Verify no horizontal scrollbar
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);
      });
    }
  });
});
```

---

## PHASE 2: FUNCTIONAL TESTING (REAL INTERACTIONS)

**File**: `tests/functional-real.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Real Functional Tests - NO ASSUMPTIONS', () => {
  
  test('HOME PAGE - Every section and CTA works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 1. VERIFY HERO SECTION
    const heroTitle = page.locator('h1:has-text("Most Intelligent Gaming Platform")');
    await expect(heroTitle).toBeVisible();
    
    // 2. VERIFY STATISTICS
    await expect(page.locator('text=10K+')).toBeVisible();
    await expect(page.locator('text=1M+')).toBeVisible();
    await expect(page.locator('text=95%')).toBeVisible();
    await expect(page.locator('text=4.9/5')).toBeVisible();
    
    // 3. TEST CTA BUTTONS
    const startPlayingBtn = page.locator('a:has-text("Start Playing")').first();
    await expect(startPlayingBtn).toBeVisible();
    await expect(startPlayingBtn).toBeEnabled();
    
    // Click and verify navigation
    await startPlayingBtn.click();
    await page.waitForURL('**/play');
    expect(page.url()).toContain('/play');
    
    // Go back
    await page.goto('/');
    
    // Test View Pitch Deck button
    const pitchBtn = page.locator('a:has-text("View Pitch")').first();
    await expect(pitchBtn).toBeVisible();
    await pitchBtn.click();
    await page.waitForURL('**/pitch');
    expect(page.url()).toContain('/pitch');
    
    // Go back
    await page.goto('/');
    
    // 4. VERIFY WHY US SECTION (6 features)
    const features = page.locator('section:has-text("Why Choose")');
    await features.scrollIntoViewIfNeeded();
    
    const featureCards = features.locator('.bg-white\\/5, .bg-white\\/10');
    const featureCount = await featureCards.count();
    expect(featureCount).toBeGreaterThanOrEqual(6);
    
    // 5. VERIFY HOW IT WORKS (3 steps)
    const howItWorks = page.locator('section:has-text("How It Works")');
    await howItWorks.scrollIntoViewIfNeeded();
    
    const steps = howItWorks.locator('.bg-white\\/5, .bg-white\\/10');
    const stepCount = await steps.count();
    expect(stepCount).toBeGreaterThanOrEqual(3);
    
    // 6. VERIFY PRICING (3 tiers)
    const pricing = page.locator('section:has-text("Pricing")');
    await pricing.scrollIntoViewIfNeeded();
    
    const pricingCards = pricing.locator('.bg-white\\/5, .bg-white\\/10');
    const pricingCount = await pricingCards.count();
    expect(pricingCount).toBe(3);
    
    // Verify pricing amounts
    await expect(page.locator('text=$0')).toBeVisible();
    await expect(page.locator('text=$9.99')).toBeVisible();
    await expect(page.locator('text=$19.99')).toBeVisible();
    
    // 7. TEST WAITLIST FORM
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.scrollIntoViewIfNeeded();
    await expect(emailInput).toBeVisible();
    
    await emailInput.fill('test@example.com');
    
    const submitBtn = page.locator('button:has-text("Join")').first();
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
    
    // 8. VERIFY FOOTER
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    
    // Verify footer links
    await expect(footer.locator('a:has-text("About")')).toBeVisible();
    await expect(footer.locator('a:has-text("Contact")')).toBeVisible();
  });

  test('PLAY CHESS PAGE - Every feature works', async ({ page }) => {
    await page.goto('/play');
    await page.waitForLoadState('networkidle');
    
    // 1. VERIFY CHESS BOARD
    const board = page.locator('.grid').first();
    await expect(board).toBeVisible();
    
    // 2. VERIFY 64 SQUARES
    const squares = page.locator('[data-square], .aspect-square');
    const squareCount = await squares.count();
    expect(squareCount).toBe(64);
    
    // 3. VERIFY 32 PIECES
    const pieces = page.locator('text=/[♔♕♖♗♘♙♚♛♜♝♞♟]/');
    const pieceCount = await pieces.count();
    expect(pieceCount).toBe(32);
    
    // 4. VERIFY GAME STATUS
    const status = page.locator('text=/White to move|Black to move/');
    await expect(status).toBeVisible();
    
    // 5. TEST DIFFICULTY SELECTOR
    const easyBtn = page.locator('button:has-text("Easy")');
    const mediumBtn = page.locator('button:has-text("Medium")');
    const hardBtn = page.locator('button:has-text("Hard")');
    
    await expect(easyBtn).toBeVisible();
    await expect(mediumBtn).toBeVisible();
    await expect(hardBtn).toBeVisible();
    
    // Click each difficulty
    await easyBtn.click();
    await page.waitForTimeout(500);
    
    await mediumBtn.click();
    await page.waitForTimeout(500);
    
    await hardBtn.click();
    await page.waitForTimeout(500);
    
    // 6. TEST NEW GAME BUTTON
    const newGameBtn = page.locator('button:has-text("New Game")');
    await expect(newGameBtn).toBeVisible();
    await expect(newGameBtn).toBeEnabled();
    
    await newGameBtn.click();
    await page.waitForTimeout(500);
    
    // Verify board reset (32 pieces again)
    const piecesAfterReset = page.locator('text=/[♔♕♖♗♘♙♚♛♜♝♞♟]/');
    const pieceCountAfterReset = await piecesAfterReset.count();
    expect(pieceCountAfterReset).toBe(32);
    
    // 7. TEST SWITCH SIDES BUTTON
    const switchBtn = page.locator('button:has-text("Switch Sides")');
    await expect(switchBtn).toBeVisible();
    await expect(switchBtn).toBeEnabled();
    
    await switchBtn.click();
    await page.waitForTimeout(500);
    
    // 8. TEST PIECE MOVEMENT
    // Click on a pawn (e2)
    const e2Square = squares.nth(52); // e2 position
    await e2Square.click();
    await page.waitForTimeout(300);
    
    // Click on e4 to move
    const e4Square = squares.nth(28); // e4 position
    await e4Square.click();
    await page.waitForTimeout(1000); // Wait for AI response
    
    // 9. VERIFY MOVE HISTORY
    const moveHistory = page.locator('text=/Move [0-9]+/');
    const moveCount = await moveHistory.count();
    expect(moveCount).toBeGreaterThan(0);
  });

  test('PITCH DECK PAGE - Every section visible', async ({ page }) => {
    await page.goto('/pitch');
    await page.waitForLoadState('networkidle');
    
    // 1. VERIFY TITLE SLIDE
    const title = page.locator('h1:has-text("GameMind")');
    await expect(title).toBeVisible();
    
    // 2. VERIFY PROBLEM SECTION
    const problem = page.locator('text=Problem');
    await problem.scrollIntoViewIfNeeded();
    await expect(problem).toBeVisible();
    
    // 3. VERIFY SOLUTION SECTION
    const solution = page.locator('text=Solution');
    await solution.scrollIntoViewIfNeeded();
    await expect(solution).toBeVisible();
    
    // 4. VERIFY MARKET DATA
    await expect(page.locator('text=$187.7B')).toBeVisible();
    await expect(page.locator('text=$14.37B')).toBeVisible();
    await expect(page.locator('text=500M+')).toBeVisible();
    await expect(page.locator('text=600M+')).toBeVisible();
    
    // 5. VERIFY DATA SOURCES
    await expect(page.locator('text=Newzoo')).toBeVisible();
    await expect(page.locator('text=Fortune Business Insights')).toBeVisible();
    
    // 6. VERIFY COMPETITIVE ANALYSIS
    const competition = page.locator('text=Competition');
    await competition.scrollIntoViewIfNeeded();
    await expect(competition).toBeVisible();
    
    // 7. VERIFY BUSINESS MODEL
    const businessModel = page.locator('text=Business Model');
    await businessModel.scrollIntoViewIfNeeded();
    await expect(businessModel).toBeVisible();
    
    // 8. VERIFY ROADMAP
    const roadmap = page.locator('text=Roadmap');
    await roadmap.scrollIntoViewIfNeeded();
    await expect(roadmap).toBeVisible();
  });

  test('CONTACT PAGE - Form works', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // 1. VERIFY FORM FIELDS
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
    const emailInput = page.locator('input[type="email"]');
    const subjectInput = page.locator('input[name="subject"], input[placeholder*="subject" i]');
    const messageInput = page.locator('textarea');
    
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(subjectInput).toBeVisible();
    await expect(messageInput).toBeVisible();
    
    // 2. FILL FORM
    await nameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await subjectInput.fill('Test Subject');
    await messageInput.fill('This is a test message.');
    
    // 3. VERIFY SUBMIT BUTTON
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
    
    // 4. VERIFY CONTACT INFO
    await expect(page.locator('text=/support@|contact@|hello@/')).toBeVisible();
    
    // 5. VERIFY SOCIAL LINKS
    const socialLinks = page.locator('a[href*="twitter"], a[href*="github"], a[href*="linkedin"]');
    const socialCount = await socialLinks.count();
    expect(socialCount).toBeGreaterThan(0);
  });

  test('NAVIGATION - All links work', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation links
    const navLinks = [
      { text: 'Home', url: '/' },
      { text: 'Play', url: '/play' },
      { text: 'Pitch', url: '/pitch' },
      { text: 'Contact', url: '/contact' },
    ];
    
    for (const link of navLinks) {
      await page.goto('/');
      const navLink = page.locator(`nav a:has-text("${link.text}")`).first();
      await expect(navLink).toBeVisible();
      await navLink.click();
      await page.waitForURL(`**${link.url}`);
      expect(page.url()).toContain(link.url);
    }
  });

  test('NO CONSOLE ERRORS on any page', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Test all pages
    const pages = ['/', '/play', '/pitch', '/contact'];
    
    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    // Should have no errors
    expect(errors).toHaveLength(0);
  });
});
```

---

## PHASE 3: EXECUTION COMMANDS

**Run all tests**:
```bash
# 1. Install dependencies (if not already)
npm install

# 2. Install Playwright browsers
npx playwright install --with-deps

# 3. Start dev server (in one terminal)
npm run dev

# 4. Run all tests (in another terminal)
npm run test

# 5. Run specific test file
npx playwright test tests/visual-regression.spec.ts
npx playwright test tests/functional-real.spec.ts

# 6. Run tests in headed mode (see browser)
npx playwright test --headed

# 7. Run tests in debug mode
npx playwright test --debug

# 8. Generate test report
npx playwright show-report
```

**Generate baseline screenshots**:
```bash
# First time running visual tests
npx playwright test --update-snapshots
```

---

## PHASE 4: VERIFICATION CHECKLIST

After running tests, verify:

- [ ] All 151+ tests pass
- [ ] No console errors
- [ ] All screenshots match baseline
- [ ] All colors are correct (verified with RGB values)
- [ ] All positions are correct (verified with bounding boxes)
- [ ] All CTAs work (verified with clicks)
- [ ] All forms work (verified with submissions)
- [ ] All navigation works (verified with URL changes)
- [ ] Responsive design works (verified on 7 viewports)
- [ ] No horizontal scrollbar (verified on all viewports)

---

**NEXT**: After all tests pass, proceed to PRODUCTION development.

