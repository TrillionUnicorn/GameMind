import { test, expect } from '@playwright/test';

const viewports = [
	{ name: 'Mobile Portrait', width: 375, height: 667 },
	{ name: 'Mobile Landscape', width: 667, height: 375 },
	{ name: 'Tablet Portrait', width: 768, height: 1024 },
	{ name: 'Tablet Landscape', width: 1024, height: 768 },
	{ name: 'Desktop Small', width: 1366, height: 768 },
	{ name: 'Desktop Large', width: 1920, height: 1080 },
	{ name: 'Desktop 4K', width: 3840, height: 2160 }
];

test.describe('Responsive Design Tests', () => {
	for (const viewport of viewports) {
		test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
			test.use({ viewport: { width: viewport.width, height: viewport.height } });

			test('Home page should be responsive', async ({ page }) => {
				await page.goto('/');

				// Check that page loads
				await expect(page).toHaveTitle(/GameMind/);

				// Check that hero section is visible
				await expect(page.getByText(/The World's Most/i)).toBeVisible();

				// Check for horizontal scrollbar (should not exist)
				const hasHorizontalScroll = await page.evaluate(() => {
					return document.documentElement.scrollWidth > document.documentElement.clientWidth;
				});
				expect(hasHorizontalScroll).toBe(false);

				// Check that navigation is accessible
				if (viewport.width < 768) {
					// Mobile: should have menu button
					await expect(page.getByRole('button', { name: /Toggle menu/i })).toBeVisible();
				} else {
					// Desktop: should have nav links
					await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
				}
			});

			test('Play page should be responsive', async ({ page }) => {
				await page.goto('/play');

				// Check that page loads
				await expect(page).toHaveTitle(/Play Chess/);

				// Check that chess board is visible
				const chessBoard = page.locator('.chess-board');
				await expect(chessBoard).toBeVisible();

				// Check that board fits in viewport
				const boardBox = await chessBoard.boundingBox();
				expect(boardBox).toBeTruthy();
				if (boardBox) {
					expect(boardBox.width).toBeLessThanOrEqual(viewport.width);
					expect(boardBox.height).toBeLessThanOrEqual(viewport.height);
				}

				// Check for horizontal scrollbar
				const hasHorizontalScroll = await page.evaluate(() => {
					return document.documentElement.scrollWidth > document.documentElement.clientWidth;
				});
				expect(hasHorizontalScroll).toBe(false);
			});

			test('Pitch page should be responsive', async ({ page }) => {
				await page.goto('/pitch');

				// Check that page loads
				await expect(page).toHaveTitle(/Pitch Deck/);

				// Check that content is visible
				await expect(page.getByText(/GameMind/i).first()).toBeVisible();

				// Check for horizontal scrollbar
				const hasHorizontalScroll = await page.evaluate(() => {
					return document.documentElement.scrollWidth > document.documentElement.clientWidth;
				});
				expect(hasHorizontalScroll).toBe(false);
			});

			test('Contact page should be responsive', async ({ page }) => {
				await page.goto('/contact');

				// Check that page loads
				await expect(page).toHaveTitle(/Contact Us/);

				// Check that form is visible
				await expect(page.getByLabel(/Name/i)).toBeVisible();

				// Check for horizontal scrollbar
				const hasHorizontalScroll = await page.evaluate(() => {
					return document.documentElement.scrollWidth > document.documentElement.clientWidth;
				});
				expect(hasHorizontalScroll).toBe(false);
			});
		});
	}
});

test.describe('Touch Interactions (Mobile)', () => {
	test.use({ viewport: { width: 375, height: 667 } });

	test('should handle touch on chess board', async ({ page }) => {
		await page.goto('/play');

		// Tap on a chess piece
		const pawn = page.locator('.chess-square').nth(48);
		await pawn.tap();

		// Should show highlights
		await page.waitForTimeout(200);

		// Tap on a valid move
		const targetSquare = page.locator('.chess-square').nth(32);
		await targetSquare.tap();

		// Move should be made
		await page.waitForTimeout(500);
		await expect(page.getByText(/Move \d+/i)).toBeVisible();
	});

	test('should handle mobile menu', async ({ page }) => {
		await page.goto('/');

		// Tap menu button
		const menuButton = page.getByRole('button', { name: /Toggle menu/i });
		await menuButton.tap();

		// Menu should open
		await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();

		// Tap a link
		await page.getByRole('link', { name: 'Play Now' }).tap();

		// Should navigate
		await expect(page).toHaveURL(/\/play/);
	});
});

test.describe('Orientation Changes', () => {
	test('should handle portrait to landscape', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		// Check portrait
		await expect(page.getByText(/The World's Most/i)).toBeVisible();

		// Change to landscape
		await page.setViewportSize({ width: 667, height: 375 });
		await page.waitForTimeout(500);

		// Should still be visible
		await expect(page.getByText(/The World's Most/i)).toBeVisible();
	});
});

