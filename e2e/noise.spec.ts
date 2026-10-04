import { expect, test } from '@playwright/test';

test('shot noise alone never triggers a win', async ({ page }) => {
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'ONE COIN' }).click();

  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'MEASURE' }).click();
  }
  await expect(page.locator('.bar-anim')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByRole('button', { name: 'MIX', exact: true }).click();
  await page.getByRole('button', { name: 'MEASURE' }).click();
  await expect(page.getByRole('dialog')).toContainText('TARGET REACHED');
});
