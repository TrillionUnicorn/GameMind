import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/contact');
	});

	test('should load contact page successfully', async ({ page }) => {
		await expect(page).toHaveTitle(/Contact Us - GameMind/);
	});

	test('should display contact form', async ({ page }) => {
		await expect(page.getByText(/Send us a Message/i)).toBeVisible();
		await expect(page.getByLabel(/Name/i)).toBeVisible();
		await expect(page.getByLabel(/Email/i)).toBeVisible();
		await expect(page.getByLabel(/Subject/i)).toBeVisible();
		await expect(page.getByLabel(/Message/i)).toBeVisible();
	});

	test('should validate required fields', async ({ page }) => {
		const submitButton = page.getByRole('button', { name: /Send Message/i });
		await submitButton.click();

		// Form should not submit (HTML5 validation)
		// Check that we're still on the same page
		await expect(page.getByText(/Send us a Message/i)).toBeVisible();
	});

	test('should submit contact form', async ({ page }) => {
		await page.getByLabel(/Name/i).fill('Test User');
		await page.getByLabel(/Email/i).fill('test@example.com');
		await page.getByLabel(/Subject/i).fill('Test Subject');
		await page.getByLabel(/Message/i).fill('This is a test message');

		const submitButton = page.getByRole('button', { name: /Send Message/i });
		await submitButton.click();

		// Wait for success message
		await expect(page.getByText(/Thank you for your message/i)).toBeVisible({ timeout: 3000 });
	});

	test('should display contact information', async ({ page }) => {
		await expect(page.getByText(/Contact Information/i)).toBeVisible();
		await expect(page.getByText(/hello@gamemind\.com/i)).toBeVisible();
		await expect(page.getByText(/business@gamemind\.com/i)).toBeVisible();
		await expect(page.getByText(/support@gamemind\.com/i)).toBeVisible();
	});

	test('should have social media links', async ({ page }) => {
		await expect(page.getByText(/Follow Us/i)).toBeVisible();
		await expect(page.getByRole('link', { name: /GitHub/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /LinkedIn/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /Twitter/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /Discord/i })).toBeVisible();
	});

	test('should display response time information', async ({ page }) => {
		await expect(page.getByText(/Response Time/i)).toBeVisible();
		await expect(page.getByText(/Within 24 hours/i)).toBeVisible();
	});

	test('should display office hours', async ({ page }) => {
		await expect(page.getByText(/Office Hours/i)).toBeVisible();
		await expect(page.getByText(/Monday - Friday/i)).toBeVisible();
	});

	test('should have no console errors', async ({ page }) => {
		const errors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(msg.text());
			}
		});

		await page.goto('/contact');
		await page.waitForLoadState('networkidle');

		expect(errors).toHaveLength(0);
	});

	test('should be responsive on mobile', async ({ page, viewport }) => {
		if (viewport && viewport.width < 768) {
			// Form should be visible and usable
			await expect(page.getByLabel(/Name/i)).toBeVisible();
			await expect(page.getByLabel(/Email/i)).toBeVisible();
		}
	});

	test('should clear form after successful submission', async ({ page }) => {
		await page.getByLabel(/Name/i).fill('Test User');
		await page.getByLabel(/Email/i).fill('test@example.com');
		await page.getByLabel(/Subject/i).fill('Test Subject');
		await page.getByLabel(/Message/i).fill('This is a test message');

		const submitButton = page.getByRole('button', { name: /Send Message/i });
		await submitButton.click();

		// Wait for success message
		await expect(page.getByText(/Thank you for your message/i)).toBeVisible({ timeout: 3000 });

		// Form should be cleared
		await expect(page.getByLabel(/Name/i)).toHaveValue('');
		await expect(page.getByLabel(/Email/i)).toHaveValue('');
	});
});

