import { expect, test } from '@playwright/test';

test('reduced motion swaps the flicker for a static coin', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'ONE COIN' }).click();
  await page.getByRole('button', { name: 'MIX', exact: true }).click();

  await expect(page.getByText('UNSETTLED')).toBeVisible();
  await expect(page.locator('.coin--flicker')).toHaveCount(0);
});
