import { expect, test } from '@playwright/test';
import { applyOp, readChallenge } from './helpers';

test('shot noise alone never triggers a win', async ({ page }) => {
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'TWO COINS' }).click();

  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'MEASURE' }).click();
  }
  await expect(page.locator('.bar-anim')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  const challenge = await readChallenge(page);
  for (const op of challenge.solution) await applyOp(page, op);
  await page.getByRole('button', { name: 'MEASURE' }).click();
  await expect(page.getByRole('dialog')).toContainText('TARGET REACHED');
});
