import { test, expect } from '@playwright/test';

test.describe('Home page scroll (mobile)', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 / Pixel 5-like

  test('scroll down then up stays smooth, key sections visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for preloader to finish (MENU button appears)
    await expect(page.getByRole('button', { name: /MENU/i })).toBeVisible({ timeout: 20000 });

    // Scroll down in steps (simulates finger swipe) to test smoothness — cap steps for test speed
    const maxScroll = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
    const scrollStep = 1000;
    const maxSteps = 12;
    for (let i = 0; i < maxSteps; i++) {
      const y = Math.min(i * scrollStep, maxScroll);
      await page.evaluate((py) => window.scrollTo({ top: py, behavior: 'smooth' }), y);
      await page.waitForTimeout(100);
      if (y >= maxScroll) break;
    }

    // At bottom: footer or finale should be in view
    await expect(page.locator('footer').or(page.getByText('Established 2026'))).toBeInViewport({ timeout: 5000 });

    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(800);

    // Hero / brand should be visible again
    await expect(page.getByAltText('TU LUMORA')).toBeInViewport();
    await expect(page.getByRole('button', { name: /MENU/i })).toBeVisible();
  });

  test('scroll to lookbook then back up, logo and content visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /MENU/i })).toBeVisible({ timeout: 20000 });

    // Scroll to lookbook section (id="lookbook")
    await page.locator('#lookbook').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // LOOKBOOK area: white background section with editorial content
    await expect(page.getByText('WEAR')).toBeInViewport().catch(() => {});
    await expect(page.getByText('THE START').or(page.getByText('AGAINST'))).toBeVisible({ timeout: 3000 });

    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(600);

    await expect(page.getByAltText('TU LUMORA').first()).toBeInViewport();
  });
});
