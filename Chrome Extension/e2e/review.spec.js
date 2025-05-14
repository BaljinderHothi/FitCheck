const { test, expect } = require('@playwright/test');

test.describe('Product Review Submission', () => {
  test('should successfully submit a product review', async ({ page }) => {

    await page.addInitScript(() => {
      window.chrome = {
        runtime: {
          sendMessage: (message, callback) => {
            console.log('Message sent:', message);
            if (callback) callback({ success: true });
          }
        }
      };
    });

    const productName = 'Test Product';
    const purchaseId = 'purchase123';
    const url = `file://${process.cwd()}/review.html?purchaseId=${purchaseId}&product=${encodeURIComponent(productName)}`;
    

    await page.goto(url);
    

    const productElement = page.locator('#productName');
    await expect(productElement).toContainText(`Product: ${productName}`);
    

    await page.locator('.star[data-value="4"]').click();
    

    await page.locator('#reviewText').fill('This is a great product! I really enjoy using it.');
    

    await page.selectOption('#worthIt', 'yes');
    

    await page.screenshot({ path: 'review-form-filled.png' });

    await page.locator('#submitReview').click();
    
    await page.waitForTimeout(1000);
    const logs = await page.evaluate(() => {
      return window.console.logs || [];
    });
    
    expect(logs.some(log => log.includes('SUBMIT_REVIEW'))).toBeTruthy();
  });
});