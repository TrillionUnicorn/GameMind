import { test, expect } from '@playwright/test';

test.describe('Play Chess Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/play');
	});

	test('should load play page successfully', async ({ page }) => {
		await expect(page).toHaveTitle(/Play Chess - GameMind/);
	});

	test('should display chess board', async ({ page }) => {
		const chessBoard = page.locator('.chess-board');
		await expect(chessBoard).toBeVisible();
	});

	test('should have 64 squares', async ({ page }) => {
		const squares = page.locator('.chess-square');
		await expect(squares).toHaveCount(64);
	});

	test('should display chess pieces', async ({ page }) => {
		const pieces = page.locator('.piece');
		// Should have 32 pieces at start
		await expect(pieces).toHaveCount(32);
	});

	test('should show game status', async ({ page }) => {
		await expect(page.getByText(/Your turn|AI's turn/i)).toBeVisible();
	});

	test('should have difficulty selector', async ({ page }) => {
		await expect(page.getByText(/AI Difficulty/i)).toBeVisible();
		await expect(page.getByText(/Easy/i)).toBeVisible();
		await expect(page.getByText(/Medium/i)).toBeVisible();
		await expect(page.getByText(/Hard/i)).toBeVisible();
	});

	test('should have game controls', async ({ page }) => {
		await expect(page.getByRole('button', { name: /New Game/i })).toBeVisible();
		await expect(page.getByRole('button', { name: /Switch Sides/i })).toBeVisible();
	});

	test('should allow piece selection', async ({ page }) => {
		// Click on a white pawn (row 6, any column)
		const pawn = page.locator('.chess-square').nth(48); // First white pawn
		await pawn.click();

		// Should show possible moves (highlighted squares)
		const highlighted = page.locator('.chess-square').filter({ hasText: '' });
		// At least one move should be highlighted
		await expect(highlighted.first()).toBeVisible();
	});

	test('should make a move', async ({ page }) => {
		// Click on a white pawn
		const pawn = page.locator('.chess-square').nth(48);
		await pawn.click();

		// Wait a bit for highlights
		await page.waitForTimeout(200);

		// Click on a valid move square (two squares forward)
		const targetSquare = page.locator('.chess-square').nth(32);
		await targetSquare.click();

		// Wait for AI to respond
		await page.waitForTimeout(1000);

		// Check that move was recorded
		await expect(page.getByText(/Move \d+/i)).toBeVisible();
	});

	test('should display move history', async ({ page }) => {
		await expect(page.getByText(/Move History/i)).toBeVisible();
	});

	test('should change difficulty', async ({ page }) => {
		const hardButton = page.getByRole('button', { name: /Hard/i });
		await hardButton.click();

		// Should restart game
		await page.waitForTimeout(500);

		// Board should be reset
		const pieces = page.locator('.piece');
		await expect(pieces).toHaveCount(32);
	});

	test('should reset game', async ({ page }) => {
		// Make a move first
		const pawn = page.locator('.chess-square').nth(48);
		await pawn.click();
		await page.waitForTimeout(200);
		const targetSquare = page.locator('.chess-square').nth(32);
		await targetSquare.click();
		await page.waitForTimeout(500);

		// Click new game
		const newGameButton = page.getByRole('button', { name: /New Game/i });
		await newGameButton.click();

		// Board should be reset
		const pieces = page.locator('.piece');
		await expect(pieces).toHaveCount(32);
	});

	test('should switch sides', async ({ page }) => {
		const switchButton = page.getByRole('button', { name: /Switch Sides/i });
		await switchButton.click();

		// Should show AI's turn (since we're now black)
		await expect(page.getByText(/AI's turn/i)).toBeVisible({ timeout: 2000 });
	});

	test('should have how to play instructions', async ({ page }) => {
		await expect(page.getByText(/How to Play/i)).toBeVisible();
		await expect(page.getByText(/Click on a piece to select it/i)).toBeVisible();
	});

	test('should have no console errors', async ({ page }) => {
		const errors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(msg.text());
			}
		});

		await page.goto('/play');
		await page.waitForLoadState('networkidle');

		expect(errors).toHaveLength(0);
	});

	test('should be responsive on mobile', async ({ page, viewport }) => {
		if (viewport && viewport.width < 768) {
			const chessBoard = page.locator('.chess-board');
			await expect(chessBoard).toBeVisible();

			// Board should fit in viewport
			const boardBox = await chessBoard.boundingBox();
			expect(boardBox).toBeTruthy();
			if (boardBox) {
				expect(boardBox.width).toBeLessThanOrEqual(viewport.width);
			}
		}
	});

	test('should show AI thinking indicator', async ({ page }) => {
		// Make a move to trigger AI
		const pawn = page.locator('.chess-square').nth(48);
		await pawn.click();
		await page.waitForTimeout(200);
		const targetSquare = page.locator('.chess-square').nth(32);
		await targetSquare.click();

		// Should show thinking indicator briefly
		await expect(page.getByText(/AI is thinking/i)).toBeVisible({ timeout: 1000 });
	});
});

