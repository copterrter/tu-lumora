import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('Complete purchase flow from homepage to checkout', async ({ page }) => {
    // 1. Start at homepage
    await page.goto('/');
    
    // 2. Click Pre-Order to go to product page
    await page.getByRole('link', { name: /PRE-ORDER NOW/i }).first().click();
    await expect(page).toHaveURL(/.*\/product/);

    // 3. Select Item and Add to Cart
    // Wait for the Product Page to fully load its interactable elements
    // Wait for the Size options to be available before interacting
    await page.waitForSelector('button:has-text("M")');

    // Select Size (e.g., M) - It's just 'M', but we need to ensure we click the size button, not text elsewhere
    const sizeBtn = page.getByRole('button', { name: 'M', exact: true }).filter({ hasText: /^M$/ });
    await sizeBtn.click();
    
    // Click Add to Squad (Add to cart)
    const addToCartBtn = page.getByRole('button', { name: /\+ Add To Squad/i });
    // Scroll to the button and force click it to ensure it registers
    await addToCartBtn.scrollIntoViewIfNeeded();
    await addToCartBtn.click({ force: true });

    // 4. Open Cart & Go to Checkout
    // The cart is updated directly in the sidebar on the product page.
    // Verify the cart displays the added item
    await expect(page.getByText('TU LUMORA T-SHIRT (M)')).toBeVisible({ timeout: 10000 });

    // Click the Continue and Pay button in the sidebar
    const checkoutBtn = page.getByRole('button', { name: /CONTINUE AND PAY/i });
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    await expect(page).toHaveURL(/.*\/checkout/);

    // 5. Verify Checkout Page loaded
    await expect(page.getByRole('heading', { name: /SHIPPING\s*INFORMATION/i })).toBeVisible();
    
    // Check initial total is correct (329 or 350 for example)
    const totalAmountText = await page.locator('.text-4xl.sm\\:text-5xl.font-black').innerText();
    expect(totalAmountText).toMatch(/฿\d+/);

    // 6. Test Form Validation (Submit Empty)
    await page.getByRole('button', { name: /CONTINUE AND PAY/i }).click();
    // We expect some inline validation error to appear
    await expect(page.locator('p.text-red-400').first()).toBeVisible();

    // 7. Fill valid form data
    await page.fill('input[placeholder*="FIRST NAME"]', 'Playwright');
    await page.fill('input[placeholder*="LAST NAME"]', 'Tester');
    await page.fill('input[placeholder*="EMAIL"]', 'test@tulumora.com');
    
    // Social Contact (IG is default, switch to LINE or fill IG)
    await page.fill('input[placeholder*="Instagram ID"]', '@playwrighttest');

    // Address
    await page.fill('textarea[placeholder*="FULL ADDRESS"]', '123 Test Street, Bangkok');
    await page.fill('input[placeholder*="POSTAL CODE"]', '10110');
    await page.fill('input[placeholder*="PHONE NUM"]', '0812345678');

    // 8. Upload dummy slip
    // Create a dummy image in memory/buffer for upload
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    await page.setInputFiles('input[type="file"]', {
      name: 'dummy-slip.png',
      mimeType: 'image/png',
      buffer
    });

    // 9. Accept Agreements
    await page.locator('input[type="checkbox"]').nth(0).click(); // PDPA
    await page.locator('input[type="checkbox"]').nth(1).click(); // No Refund

    // Note: We stop before hitting actual "CONTINUE AND PAY" to avoid 
    // spamming the production Database/Email queue with fake orders.
    // If we want to submit, we would mock the Supabase /api/verify route.
    
    // Just verify the button is enabled and we are ready
    const submitBtn = page.getByRole('button', { name: /CONTINUE AND PAY/i });
    await expect(submitBtn).toBeEnabled();
  });
});
