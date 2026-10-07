import { expect, test } from './fixtures';

test('menu and gameplay fit mobile and desktop widths', async ({ page }) => {
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/?seed=7');
    await expect(page.getByRole('button', { name: 'TWO COINS' })).toBeVisible();

    await page.getByRole('button', { name: 'TWO COINS' }).click();
    await expect(page.getByRole('button', { name: 'MEASURE' })).toBeVisible();
    await expect(page.getByText('TARGET')).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  }
});
