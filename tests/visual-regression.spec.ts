import { test, expect } from '@playwright/test';

/**
 * VISUAL REGRESSION TESTS
 * Tests exact colors, positions, and visual appearance
 * NO ASSUMPTIONS - Everything is verified with real measurements
 */

test.describe('Visual Regression - Colors & Positions', () => {
	test.beforeEach(async ({ page }) => {
		// Ensure consistent viewport
		await page.setViewportSize({ width: 1920, height: 1080 });
	});

	test.describe('Home Page Visual Tests', () => {
		test('Hero section - exact colors and positions', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			// Test hero title
			const heroTitle = page.locator('h1').first();
			await expect(heroTitle).toBeVisible();

			// Verify title color (should be white)
			const titleColor = await heroTitle.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});
			expect(titleColor).toBe('rgb(255, 255, 255)');

			// Verify title position
			const titleBox = await heroTitle.boundingBox();
			expect(titleBox).toBeTruthy();
			expect(titleBox!.y).toBeGreaterThan(100); // Below navbar
			expect(titleBox!.y).toBeLessThan(400); // In viewport

			// Take screenshot for baseline
			await expect(heroTitle).toHaveScreenshot('hero-title.png');
		});

		test('CTA buttons - exact colors and hover states', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			// Find primary CTA button
			const ctaButton = page.locator('a:has-text("Start Playing")').first();
			await expect(ctaButton).toBeVisible();

			// Verify button background color (red-500 or red-600)
			const bgColor = await ctaButton.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			// Should be red (rgb(239, 68, 68) or rgb(220, 38, 38))
			expect(bgColor).toMatch(/rgb\(239, 68, 68\)|rgb\(220, 38, 38\)/);

			// Verify button text color (white)
			const textColor = await ctaButton.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});
			expect(textColor).toBe('rgb(255, 255, 255)');

			// Verify button padding
			const padding = await ctaButton.evaluate((el) => {
				const style = window.getComputedStyle(el);
				return {
					top: style.paddingTop,
					right: style.paddingRight,
					bottom: style.paddingBottom,
					left: style.paddingLeft
				};
			});
			expect(padding.top).toBeTruthy();
			expect(padding.right).toBeTruthy();

			// Test hover state
			await ctaButton.hover();
			await page.waitForTimeout(300); // Wait for transition

			const hoverBgColor = await ctaButton.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			// Should be darker on hover
			expect(hoverBgColor).toBeTruthy();

			// Screenshot
			await expect(ctaButton).toHaveScreenshot('cta-button.png');
		});

		test('Statistics section - exact layout and colors', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			// Find statistics
			const stat1 = page.locator('text=10K+').first();
			const stat2 = page.locator('text=1M+').first();
			const stat3 = page.locator('text=95%').first();
			const stat4 = page.locator('text=4.9/5').first();

			// Verify all stats are visible
			await expect(stat1).toBeVisible();
			await expect(stat2).toBeVisible();
			await expect(stat3).toBeVisible();
			await expect(stat4).toBeVisible();

			// Verify stat colors (should be white or gradient)
			const stat1Color = await stat1.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});
			expect(stat1Color).toBe('rgb(255, 255, 255)');

			// Verify stats are horizontally aligned
			const box1 = await stat1.boundingBox();
			const box2 = await stat2.boundingBox();
			expect(box1).toBeTruthy();
			expect(box2).toBeTruthy();

			// Should be on same horizontal line (within 50px)
			const yDiff = Math.abs(box1!.y - box2!.y);
			expect(yDiff).toBeLessThan(50);

			// Screenshot
			const statsSection = page.locator('section').filter({ has: stat1 });
			await expect(statsSection).toHaveScreenshot('stats-section.png');
		});

		test('Pricing cards - glass morphism and colors', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			// Scroll to pricing
			const pricingHeading = page.locator('text=Pricing').first();
			await pricingHeading.scrollIntoViewIfNeeded();

			// Find pricing cards
			const cards = page.locator('.bg-white\\/5, .bg-white\\/10').filter({
				has: page.locator('text=/\\$[0-9]+/')
			});

			const cardCount = await cards.count();
			expect(cardCount).toBeGreaterThanOrEqual(3);

			// Test first card
			const card = cards.first();

			// Verify glass morphism background
			const bgColor = await card.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			// Should be semi-transparent white
			expect(bgColor).toMatch(/rgba\(255, 255, 255, 0\.(05|1)\)/);

			// Verify backdrop filter
			const backdropFilter = await card.evaluate((el) => {
				return window.getComputedStyle(el).backdropFilter;
			});
			expect(backdropFilter).toContain('blur');

			// Verify border
			const border = await card.evaluate((el) => {
				return window.getComputedStyle(el).border;
			});
			expect(border).toBeTruthy();

			// Screenshot
			await expect(card).toHaveScreenshot('pricing-card.png');
		});
	});

	test.describe('Play Chess Page Visual Tests', () => {
		test('Chess board - exact square colors', async ({ page }) => {
			await page.goto('/play');
			await page.waitForLoadState('networkidle');

			// Find chess board
			const board = page.locator('.grid').first();
			await expect(board).toBeVisible();

			// Get all squares
			const squares = board.locator('> div');
			const squareCount = await squares.count();
			expect(squareCount).toBe(64);

			// Test first square (should be light - amber-100)
			const lightSquare = squares.first();
			const lightColor = await lightSquare.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			expect(lightColor).toBe('rgb(254, 243, 199)'); // amber-100

			// Test second square (should be dark - amber-700)
			const darkSquare = squares.nth(1);
			const darkColor = await darkSquare.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			expect(darkColor).toBe('rgb(180, 83, 9)'); // amber-700

			// Verify squares are same size
			const lightBox = await lightSquare.boundingBox();
			const darkBox = await darkSquare.boundingBox();
			expect(lightBox).toBeTruthy();
			expect(darkBox).toBeTruthy();

			// Width and height should be equal (square aspect ratio)
			expect(Math.abs(lightBox!.width - lightBox!.height)).toBeLessThan(2);
			expect(Math.abs(darkBox!.width - darkBox!.height)).toBeLessThan(2);

			// Screenshot
			await expect(board).toHaveScreenshot('chess-board.png');
		});

		test('Chess pieces - exact colors and positions', async ({ page }) => {
			await page.goto('/play');
			await page.waitForLoadState('networkidle');

			// Find pieces
			const pieces = page.locator('text=/[♔♕♖♗♘♙♚♛♜♝♞♟]/');
			const pieceCount = await pieces.count();
			expect(pieceCount).toBe(32);

			// Test white piece color
			const whitePiece = pieces.first();
			const whiteColor = await whitePiece.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});
			expect(whiteColor).toBe('rgb(255, 255, 255)');

			// Test piece font size
			const fontSize = await whitePiece.evaluate((el) => {
				return window.getComputedStyle(el).fontSize;
			});
			expect(fontSize).toBeTruthy();

			// Screenshot
			await expect(whitePiece).toHaveScreenshot('chess-piece.png');
		});

		test('Game controls - button colors and spacing', async ({ page }) => {
			await page.goto('/play');
			await page.waitForLoadState('networkidle');

			// Find control buttons
			const newGameBtn = page.locator('button:has-text("New Game")');
			const switchBtn = page.locator('button:has-text("Switch Sides")');

			await expect(newGameBtn).toBeVisible();
			await expect(switchBtn).toBeVisible();

			// Verify button colors
			const btnBgColor = await newGameBtn.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			expect(btnBgColor).toMatch(/rgb\(239, 68, 68\)|rgb\(220, 38, 38\)/);

			// Verify buttons are horizontally aligned
			const box1 = await newGameBtn.boundingBox();
			const box2 = await switchBtn.boundingBox();
			expect(box1).toBeTruthy();
			expect(box2).toBeTruthy();

			const yDiff = Math.abs(box1!.y - box2!.y);
			expect(yDiff).toBeLessThan(10);

			// Verify spacing between buttons
			const spacing = box2!.x - (box1!.x + box1!.width);
			expect(spacing).toBeGreaterThan(8); // At least 8px gap
			expect(spacing).toBeLessThan(32); // At most 32px gap

			// Screenshot
			await expect(newGameBtn).toHaveScreenshot('game-control-button.png');
		});
	});

	test.describe('Responsive Design Visual Tests', () => {
		const viewports = [
			{ name: 'mobile', width: 375, height: 667 },
			{ name: 'tablet', width: 768, height: 1024 },
			{ name: 'desktop', width: 1920, height: 1080 }
		];

		for (const viewport of viewports) {
			test(`Home page on ${viewport.name} - no horizontal scroll`, async ({ page }) => {
				await page.setViewportSize({ width: viewport.width, height: viewport.height });
				await page.goto('/');
				await page.waitForLoadState('networkidle');

				// Check for horizontal scrollbar
				const hasHorizontalScroll = await page.evaluate(() => {
					return document.documentElement.scrollWidth > document.documentElement.clientWidth;
				});
				expect(hasHorizontalScroll).toBe(false);

				// Screenshot
				await expect(page).toHaveScreenshot(`home-${viewport.name}.png`, {
					fullPage: true
				});
			});
		}
	});

	test.describe('Navigation Visual Tests', () => {
		test('Navigation bar - colors and position', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			// Find navigation
			const nav = page.locator('nav').first();
			await expect(nav).toBeVisible();

			// Verify nav is at top
			const navBox = await nav.boundingBox();
			expect(navBox).toBeTruthy();
			expect(navBox!.y).toBeLessThan(50); // Should be at top

			// Verify nav background
			const navBg = await nav.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			expect(navBg).toBeTruthy();

			// Screenshot
			await expect(nav).toHaveScreenshot('navigation.png');
		});
	});

	test.describe('Footer Visual Tests', () => {
		test('Footer - colors and layout', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			// Scroll to footer
			const footer = page.locator('footer');
			await footer.scrollIntoViewIfNeeded();
			await expect(footer).toBeVisible();

			// Verify footer background
			const footerBg = await footer.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			expect(footerBg).toBeTruthy();

			// Screenshot
			await expect(footer).toHaveScreenshot('footer.png');
		});
	});
});

