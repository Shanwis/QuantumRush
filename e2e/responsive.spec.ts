import { expect, test } from '@playwright/test';

test('menu and gameplay fit mobile and desktop widths', async ({ page }) => {
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/?seed=7');
    await expect(page.getByRole('button', { name: 'ONE COIN' })).toBeVisible();

    await page.getByRole('button', { name: 'ONE COIN' }).click();
    await expect(page.getByRole('button', { name: 'MEASURE' })).toBeVisible();
    await expect(page.getByText('TARGET')).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
