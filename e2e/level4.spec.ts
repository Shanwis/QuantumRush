import { expect, test } from '@playwright/test';
import { applyOp, readChallenge, trackErrors } from './helpers';

test('four coins are solved by canonical solution and the best persists', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'FOUR COINS' }).click();
  await expect(page.locator('button[aria-label="Coin D"]')).toBeVisible();

  const challenge = await readChallenge(page);
  for (const op of challenge.solution) await applyOp(page, op);
  await page.getByRole('button', { name: 'MEASURE' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('TARGET REACHED');
  await expect(dialog).toContainText('NEW HIGH SCORE!');

  await page.reload();
  const best = page.locator('.menu__scores div', { hasText: 'FOUR COINS' }).locator('dd');
  await expect(best).not.toHaveText('---');
  expect(errors).toEqual([]);
});
