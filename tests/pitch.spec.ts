import { test, expect } from '@playwright/test';

test.describe('Pitch Deck Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/pitch');
	});

	test('should load pitch deck page successfully', async ({ page }) => {
		await expect(page).toHaveTitle(/Pitch Deck - GameMind/);
	});

	test('should display title slide', async ({ page }) => {
		await expect(page.getByText(/GameMind/i).first()).toBeVisible();
		await expect(page.getByText(/The World's Most Intelligent Gaming Platform/i)).toBeVisible();
	});

	test('should have CTA buttons', async ({ page }) => {
		await expect(page.getByRole('link', { name: /Schedule Meeting/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /Try Demo/i })).toBeVisible();
	});

	test('should display problem statement', async ({ page }) => {
		await expect(page.getByText(/The Problem/i)).toBeVisible();
		await expect(page.getByText(/\$187\.7B Market/i)).toBeVisible();
	});

	test('should display solution section', async ({ page }) => {
		await expect(page.getByText(/Our Solution/i)).toBeVisible();
		await expect(page.getByText(/Adaptive AI/i)).toBeVisible();
		await expect(page.getByText(/Multi-Game/i)).toBeVisible();
		await expect(page.getByText(/AI Coaching/i)).toBeVisible();
	});

	test('should display market analysis with data', async ({ page }) => {
		await expect(page.getByText(/Market Opportunity/i)).toBeVisible();
		await expect(page.getByText(/\$187\.7B/i)).toBeVisible();
		await expect(page.getByText(/\$14\.37B/i)).toBeVisible();
		await expect(page.getByText(/500M\+/i)).toBeVisible();
		await expect(page.getByText(/600M\+/i)).toBeVisible();
	});

	test('should display data sources', async ({ page }) => {
		await expect(page.getByText(/Newzoo/i)).toBeVisible();
		await expect(page.getByText(/Fortune Business Insights/i)).toBeVisible();
	});

	test('should display competitive analysis', async ({ page }) => {
		await expect(page.getByText(/Competitive Landscape/i)).toBeVisible();
		await expect(page.getByText(/Chess\.com/i)).toBeVisible();
		await expect(page.getByText(/Lichess/i)).toBeVisible();
	});

	test('should display business model', async ({ page }) => {
		await expect(page.getByText(/Business Model/i)).toBeVisible();
		await expect(page.getByText(/Free Tier/i)).toBeVisible();
		await expect(page.getByText(/\$9\.99/i)).toBeVisible();
		await expect(page.getByText(/\$19\.99/i)).toBeVisible();
	});

	test('should display revenue projections', async ({ page }) => {
		await expect(page.getByText(/Revenue Projections/i)).toBeVisible();
		await expect(page.getByText(/2024/i)).toBeVisible();
		await expect(page.getByText(/2025/i)).toBeVisible();
	});

	test('should display product roadmap', async ({ page }) => {
		await expect(page.getByText(/Product Roadmap/i)).toBeVisible();
		await expect(page.getByText(/Q4 2024/i)).toBeVisible();
		await expect(page.getByText(/Q1 2025/i)).toBeVisible();
	});

	test('should have no console errors', async ({ page }) => {
		const errors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(msg.text());
			}
		});

		await page.goto('/pitch');
		await page.waitForLoadState('networkidle');

		expect(errors).toHaveLength(0);
	});

	test('should be responsive on mobile', async ({ page, viewport }) => {
		if (viewport && viewport.width < 768) {
			// Check that content is visible and not overflowing
			const container = page.locator('.container').first();
			await expect(container).toBeVisible();
		}
	});

	test('should have proper scrolling', async ({ page }) => {
		// Scroll to bottom
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await page.waitForTimeout(500);

		// Should see footer
		await expect(page.locator('footer')).toBeVisible();
	});
});

