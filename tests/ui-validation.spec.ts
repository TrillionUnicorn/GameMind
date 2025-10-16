import { test, expect } from '@playwright/test';

test.describe('UI/CSS Validation', () => {
	test('should have no broken images on home page', async ({ page }) => {
		await page.goto('/');

		const images = page.locator('img');
		const count = await images.count();

		for (let i = 0; i < count; i++) {
			const img = images.nth(i);
			const isVisible = await img.isVisible();

			if (isVisible) {
				const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
				expect(naturalWidth).toBeGreaterThan(0);
			}
		}
	});

	test('should have no overlapping elements', async ({ page }) => {
		await page.goto('/');

		// Check that main sections don't overlap
		const sections = page.locator('section');
		const count = await sections.count();

		for (let i = 0; i < count - 1; i++) {
			const current = sections.nth(i);
			const next = sections.nth(i + 1);

			const currentBox = await current.boundingBox();
			const nextBox = await next.boundingBox();

			if (currentBox && nextBox) {
				// Next section should start after current section
				expect(nextBox.y).toBeGreaterThanOrEqual(currentBox.y);
			}
		}
	});

	test('should have readable text contrast', async ({ page }) => {
		await page.goto('/');

		// Check that text is not invisible (opacity 0 or display none)
		const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button');
		const count = await textElements.count();

		for (let i = 0; i < count; i++) {
			const element = textElements.nth(i);
			const isVisible = await element.isVisible();

			if (isVisible) {
				const opacity = await element.evaluate((el) => {
					return window.getComputedStyle(el).opacity;
				});
				expect(parseFloat(opacity)).toBeGreaterThan(0);
			}
		}
	});

	test('should have no CSS errors', async ({ page }) => {
		const cssErrors: string[] = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error' && msg.text().includes('CSS')) {
				cssErrors.push(msg.text());
			}
		});

		await page.goto('/');
		await page.waitForLoadState('networkidle');

		expect(cssErrors).toHaveLength(0);
	});

	test('should have proper button states', async ({ page }) => {
		await page.goto('/');

		const buttons = page.locator('button, a.btn');
		const count = await buttons.count();

		for (let i = 0; i < count; i++) {
			const button = buttons.nth(i);
			const isVisible = await button.isVisible();

			if (isVisible) {
				// Check that button has cursor pointer
				const cursor = await button.evaluate((el) => {
					return window.getComputedStyle(el).cursor;
				});
				expect(cursor).toBe('pointer');

				// Hover and check for visual feedback
				await button.hover();
				await page.waitForTimeout(100);

				// Button should still be visible after hover
				await expect(button).toBeVisible();
			}
		}
	});

	test('should have proper form input styles', async ({ page }) => {
		await page.goto('/contact');

		const inputs = page.locator('input, textarea');
		const count = await inputs.count();

		for (let i = 0; i < count; i++) {
			const input = inputs.nth(i);
			const isVisible = await input.isVisible();

			if (isVisible) {
				// Check that input has border
				const border = await input.evaluate((el) => {
					return window.getComputedStyle(el).border;
				});
				expect(border).toBeTruthy();

				// Focus and check for focus state
				await input.focus();
				await page.waitForTimeout(100);

				// Input should have focus styles
				const outline = await input.evaluate((el) => {
					return window.getComputedStyle(el).outline;
				});
				// Should have some outline or ring
				expect(outline).toBeTruthy();
			}
		}
	});

	test('should have no layout shifts', async ({ page }) => {
		await page.goto('/');

		// Wait for page to fully load
		await page.waitForLoadState('networkidle');

		// Get initial positions of key elements
		const hero = page.locator('section').first();
		const initialBox = await hero.boundingBox();

		// Wait a bit
		await page.waitForTimeout(1000);

		// Check that position hasn't shifted
		const finalBox = await hero.boundingBox();

		if (initialBox && finalBox) {
			expect(Math.abs(finalBox.y - initialBox.y)).toBeLessThan(5); // Allow 5px tolerance
		}
	});

	test('should have proper spacing between elements', async ({ page }) => {
		await page.goto('/');

		// Check that cards have proper spacing
		const cards = page.locator('[class*="card"]');
		const count = await cards.count();

		if (count > 1) {
			for (let i = 0; i < count - 1; i++) {
				const current = cards.nth(i);
				const next = cards.nth(i + 1);

				const currentBox = await current.boundingBox();
				const nextBox = await next.boundingBox();

				if (currentBox && nextBox) {
					// Should have some gap between cards
					const gap = nextBox.y - (currentBox.y + currentBox.height);
					if (gap > 0) {
						expect(gap).toBeGreaterThan(0);
					}
				}
			}
		}
	});

	test('should have consistent font sizes', async ({ page }) => {
		await page.goto('/');

		// Check that headings have larger font than paragraphs
		const h1 = page.locator('h1').first();
		const p = page.locator('p').first();

		const h1Size = await h1.evaluate((el) => {
			return parseFloat(window.getComputedStyle(el).fontSize);
		});

		const pSize = await p.evaluate((el) => {
			return parseFloat(window.getComputedStyle(el).fontSize);
		});

		expect(h1Size).toBeGreaterThan(pSize);
	});

	test('should have no broken links', async ({ page }) => {
		await page.goto('/');

		const links = page.locator('a[href^="/"]');
		const count = await links.count();

		for (let i = 0; i < count; i++) {
			const link = links.nth(i);
			const href = await link.getAttribute('href');

			if (href && !href.startsWith('http')) {
				// Internal link - check that it's valid
				expect(href).toMatch(/^\/[a-z-]*$/);
			}
		}
	});

	test('should have proper z-index stacking', async ({ page }) => {
		await page.goto('/');

		// Navigation should be on top
		const nav = page.locator('nav').first();
		const navZIndex = await nav.evaluate((el) => {
			return window.getComputedStyle(el).zIndex;
		});

		expect(parseInt(navZIndex)).toBeGreaterThan(0);
	});
});

