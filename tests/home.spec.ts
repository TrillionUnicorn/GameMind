import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should load home page successfully', async ({ page }) => {
		await expect(page).toHaveTitle(/GameMind/);
	});

	test('should display hero section', async ({ page }) => {
		const hero = page.locator('section').first();
		await expect(hero).toBeVisible();
		await expect(page.getByText(/The World's Most/i)).toBeVisible();
		await expect(page.getByText(/Intelligent Gaming Platform/i)).toBeVisible();
	});

	test('should have working navigation', async ({ page }) => {
		// Check navigation links
		await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Play Now' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Pitch Deck' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
	});

	test('should display statistics', async ({ page }) => {
		await expect(page.getByText(/10K\+/)).toBeVisible();
		await expect(page.getByText(/1M\+/)).toBeVisible();
		await expect(page.getByText(/95%/)).toBeVisible();
		await expect(page.getByText(/4\.9\/5/)).toBeVisible();
	});

	test('should have CTA buttons', async ({ page }) => {
		const playButton = page.getByRole('link', { name: /Start Playing Free/i });
		const pitchButton = page.getByRole('link', { name: /View Pitch Deck/i });

		await expect(playButton).toBeVisible();
		await expect(pitchButton).toBeVisible();
	});

	test('should display Why Us section', async ({ page }) => {
		await expect(page.getByText(/Why Choose GameMind/i)).toBeVisible();
		await expect(page.getByText(/Adaptive AI/i)).toBeVisible();
		await expect(page.getByText(/Multi-Game Platform/i)).toBeVisible();
		await expect(page.getByText(/Advanced Analytics/i)).toBeVisible();
	});

	test('should display How It Works section', async ({ page }) => {
		await expect(page.getByText(/How It Works/i)).toBeVisible();
		await expect(page.getByText(/Choose Your Game/i)).toBeVisible();
		await expect(page.getByText(/AI Adapts to You/i)).toBeVisible();
		await expect(page.getByText(/Improve & Compete/i)).toBeVisible();
	});

	test('should display pricing section', async ({ page }) => {
		await expect(page.getByText(/Choose Your Plan/i)).toBeVisible();
		await expect(page.getByText(/Free/i)).toBeVisible();
		await expect(page.getByText(/Pro/i)).toBeVisible();
		await expect(page.getByText(/Master Class/i)).toBeVisible();
	});

	test('should have waitlist form', async ({ page }) => {
		const emailInput = page.getByPlaceholder(/Enter your email/i);
		const submitButton = page.getByRole('button', { name: /Join Waitlist/i });

		await expect(emailInput).toBeVisible();
		await expect(submitButton).toBeVisible();
	});

	test('should submit waitlist form', async ({ page }) => {
		const emailInput = page.getByPlaceholder(/Enter your email/i);
		const submitButton = page.getByRole('button', { name: /Join Waitlist/i });

		await emailInput.fill('test@example.com');
		await submitButton.click();

		// Wait for success message
		await expect(page.getByText(/Thanks for joining/i)).toBeVisible({ timeout: 3000 });
	});

	test('should have footer', async ({ page }) => {
		const footer = page.locator('footer');
		await expect(footer).toBeVisible();
		await expect(footer.getByText(/GameMind/i)).toBeVisible();
		await expect(footer.getByText(/Product/i)).toBeVisible();
		await expect(footer.getByText(/Company/i)).toBeVisible();
	});

	test('should have no console errors', async ({ page }) => {
		const errors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(msg.text());
			}
		});

		await page.goto('/');
		await page.waitForLoadState('networkidle');

		expect(errors).toHaveLength(0);
	});

	test('should be responsive on mobile', async ({ page, viewport }) => {
		if (viewport && viewport.width < 768) {
			// Check mobile menu button exists
			const menuButton = page.getByRole('button', { name: /Toggle menu/i });
			await expect(menuButton).toBeVisible();
		}
	});

	test('should have proper meta tags', async ({ page }) => {
		const title = await page.title();
		expect(title).toContain('GameMind');

		const description = await page.locator('meta[name="description"]').getAttribute('content');
		expect(description).toBeTruthy();
	});
});

