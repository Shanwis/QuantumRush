import { expect, test } from './fixtures';

test('reduced motion swaps the flicker for a static coin', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'TWO COINS' }).click();
  await page.getByRole('button', { name: 'MIX', exact: true }).click();

  await expect(page.getByText('UNSETTLED')).toBeVisible();
  await expect(page.locator('.coin--flicker')).toHaveCount(0);
});
