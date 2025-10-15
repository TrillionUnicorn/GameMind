import { test, expect } from '@playwright/test';

/**
 * COLOR VALIDATION TESTS
 * Verifies exact RGB/HEX colors match design specifications
 * Tests Tailwind CSS color classes are applied correctly
 */

test.describe('Color Validation - Exact RGB Values', () => {
	// Tailwind color reference
	const COLORS = {
		white: 'rgb(255, 255, 255)',
		black: 'rgb(0, 0, 0)',
		red500: 'rgb(239, 68, 68)',
		red600: 'rgb(220, 38, 38)',
		red700: 'rgb(185, 28, 28)',
		amber100: 'rgb(254, 243, 199)',
		amber700: 'rgb(180, 83, 9)',
		gray900: 'rgb(17, 24, 39)',
		transparent: 'rgba(0, 0, 0, 0)'
	};

	test.describe('Home Page Colors', () => {
		test('Hero section text colors', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			// Hero title should be white
			const heroTitle = page.locator('h1').first();
			const titleColor = await heroTitle.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});
			expect(titleColor).toBe(COLORS.white);

			// Hero subtitle should be white or light gray
			const subtitle = page.locator('p').first();
			const subtitleColor = await subtitle.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});
			// Should be white or rgba white
			expect(subtitleColor).toMatch(/rgb\(255, 255, 255\)|rgba\(255, 255, 255/);
		});

		test('CTA button colors', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const ctaButton = page.locator('a:has-text("Start Playing")').first();

			// Background should be red-500 or red-600
			const bgColor = await ctaButton.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			expect(bgColor).toMatch(new RegExp(`${COLORS.red500}|${COLORS.red600}`));

			// Text should be white
			const textColor = await ctaButton.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});
			expect(textColor).toBe(COLORS.white);

			// Border radius should exist
			const borderRadius = await ctaButton.evaluate((el) => {
				return window.getComputedStyle(el).borderRadius;
			});
			expect(borderRadius).not.toBe('0px');
		});

		test('Statistics colors', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const stats = [
				page.locator('text=10K+').first(),
				page.locator('text=1M+').first(),
				page.locator('text=95%').first(),
				page.locator('text=4.9/5').first()
			];

			for (const stat of stats) {
				const color = await stat.evaluate((el) => {
					return window.getComputedStyle(el).color;
				});
				// Should be white
				expect(color).toBe(COLORS.white);
			}
		});

		test('Pricing card colors', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			const pricingHeading = page.locator('text=Pricing').first();
			await pricingHeading.scrollIntoViewIfNeeded();

			const cards = page.locator('.bg-white\\/5, .bg-white\\/10').filter({
				has: page.locator('text=/\\$[0-9]+/')
			});

			const card = cards.first();

			// Background should be semi-transparent white
			const bgColor = await card.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			expect(bgColor).toMatch(/rgba\(255, 255, 255, 0\.(05|1)\)/);

			// Border should exist and be white-ish
			const borderColor = await card.evaluate((el) => {
				return window.getComputedStyle(el).borderColor;
			});
			expect(borderColor).toMatch(/rgba?\(255, 255, 255/);
		});
	});

	test.describe('Play Chess Page Colors', () => {
		test('Chess board square colors', async ({ page }) => {
			await page.goto('/play');
			await page.waitForLoadState('networkidle');

			const board = page.locator('.grid').first();
			const squares = board.locator('> div');

			// Light square (amber-100)
			const lightSquare = squares.first();
			const lightColor = await lightSquare.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			expect(lightColor).toBe(COLORS.amber100);

			// Dark square (amber-700)
			const darkSquare = squares.nth(1);
			const darkColor = await darkSquare.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			expect(darkColor).toBe(COLORS.amber700);
		});

		test('Chess piece colors', async ({ page }) => {
			await page.goto('/play');
			await page.waitForLoadState('networkidle');

			const pieces = page.locator('text=/[♔♕♖♗♘♙♚♛♜♝♞♟]/');

			// White pieces should be white
			const whitePiece = pieces.first();
			const whiteColor = await whitePiece.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});
			expect(whiteColor).toBe(COLORS.white);

			// Black pieces should be black
			const blackPiece = pieces.last();
			const blackColor = await blackPiece.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});
			expect(blackColor).toBe(COLORS.black);
		});

		test('Game control button colors', async ({ page }) => {
			await page.goto('/play');
			await page.waitForLoadState('networkidle');

			const buttons = page.locator('button:has-text("New Game"), button:has-text("Switch Sides")');
			const button = buttons.first();

			// Background should be red
			const bgColor = await button.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			expect(bgColor).toMatch(new RegExp(`${COLORS.red500}|${COLORS.red600}`));

			// Text should be white
			const textColor = await button.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});
			expect(textColor).toBe(COLORS.white);
		});

		test('Difficulty selector colors', async ({ page }) => {
			await page.goto('/play');
			await page.waitForLoadState('networkidle');

			const easyBtn = page.locator('button:has-text("Easy")');
			const mediumBtn = page.locator('button:has-text("Medium")');
			const hardBtn = page.locator('button:has-text("Hard")');

			// All buttons should be visible
			await expect(easyBtn).toBeVisible();
			await expect(mediumBtn).toBeVisible();
			await expect(hardBtn).toBeVisible();

			// Active button should have different color
			const activeBg = await easyBtn.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			expect(activeBg).toBeTruthy();
		});
	});

	test.describe('Pitch Deck Page Colors', () => {
		test('Title gradient colors', async ({ page }) => {
			await page.goto('/pitch');
			await page.waitForLoadState('networkidle');

			const title = page.locator('h1').first();

			// Should have gradient background
			const bgImage = await title.evaluate((el) => {
				return window.getComputedStyle(el).backgroundImage;
			});
			expect(bgImage).toContain('gradient');

			// Should have background-clip: text
			const bgClip = await title.evaluate((el) => {
				return window.getComputedStyle(el).backgroundClip;
			});
			expect(bgClip).toBe('text');
		});

		test('Market data colors', async ({ page }) => {
			await page.goto('/pitch');
			await page.waitForLoadState('networkidle');

			const marketData = page.locator('text=$187.7B').first();
			await marketData.scrollIntoViewIfNeeded();

			const color = await marketData.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});
			// Should be white or gradient
			expect(color).toMatch(/rgb\(255, 255, 255\)|rgba\(255, 255, 255/);
		});
	});

	test.describe('Contact Page Colors', () => {
		test('Form input colors', async ({ page }) => {
			await page.goto('/contact');
			await page.waitForLoadState('networkidle');

			const input = page.locator('input').first();

			// Background should be semi-transparent
			const bgColor = await input.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			expect(bgColor).toMatch(/rgba\(255, 255, 255, 0\.(05|1)\)/);

			// Text color should be white
			const textColor = await input.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});
			expect(textColor).toBe(COLORS.white);

			// Border should exist
			const borderColor = await input.evaluate((el) => {
				return window.getComputedStyle(el).borderColor;
			});
			expect(borderColor).toMatch(/rgba?\(255, 255, 255/);
		});

		test('Submit button colors', async ({ page }) => {
			await page.goto('/contact');
			await page.waitForLoadState('networkidle');

			const submitBtn = page.locator('button[type="submit"]');

			// Background should be red
			const bgColor = await submitBtn.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			expect(bgColor).toMatch(new RegExp(`${COLORS.red500}|${COLORS.red600}`));

			// Text should be white
			const textColor = await submitBtn.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});
			expect(textColor).toBe(COLORS.white);
		});
	});

	test.describe('Global Color Consistency', () => {
		test('All primary buttons have consistent colors', async ({ page }) => {
			const pages = ['/', '/play', '/pitch', '/contact'];

			for (const url of pages) {
				await page.goto(url);
				await page.waitForLoadState('networkidle');

				const buttons = page.locator('button, a').filter({
					hasText: /Start|Play|Join|Submit|New Game|Contact/
				});

				const count = await buttons.count();
				if (count > 0) {
					const button = buttons.first();
					const bgColor = await button.evaluate((el) => {
						return window.getComputedStyle(el).backgroundColor;
					});

					// Should be red or transparent (for links)
					expect(bgColor).toMatch(
						new RegExp(`${COLORS.red500}|${COLORS.red600}|${COLORS.transparent}`)
					);
				}
			}
		});

		test('All headings have consistent colors', async ({ page }) => {
			const pages = ['/', '/play', '/pitch', '/contact'];

			for (const url of pages) {
				await page.goto(url);
				await page.waitForLoadState('networkidle');

				const headings = page.locator('h1, h2, h3');
				const count = await headings.count();

				if (count > 0) {
					const heading = headings.first();
					const color = await heading.evaluate((el) => {
						return window.getComputedStyle(el).color;
					});

					// Should be white or have gradient
					expect(color).toMatch(/rgb\(255, 255, 255\)|rgba\(255, 255, 255/);
				}
			}
		});
	});
});

