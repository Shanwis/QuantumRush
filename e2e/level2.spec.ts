import { expect, test } from '@playwright/test';
import { applyOp, readChallenge, trackErrors } from './helpers';

test('a two-coin challenge is solved by its canonical solution', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'TWO COINS' }).click();

  const challenge = await readChallenge(page);
  for (const op of challenge.solution) await applyOp(page, op);
  await expect(page.locator('.history__item')).toHaveCount(challenge.solution.length);

  await page.getByRole('button', { name: 'MEASURE' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('TARGET REACHED');
  expect(errors).toEqual([]);
});

test('hint reveals canonical solution steps', async ({ page }) => {
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'TWO COINS' }).click();
  const challenge = await readChallenge(page);
  await page.getByRole('button', { name: 'HINT' }).click();
  await expect(page.getByText(/TRY:/)).toBeVisible();
  expect(challenge.solution.length).toBeGreaterThan(0);
});
