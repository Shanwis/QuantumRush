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

test('reload gives a different target and resets the run', async ({ page }) => {
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'TWO COINS' }).click();
  const before = await readChallenge(page);

  await page.getByRole('button', { name: 'FLIP', exact: true }).click();
  await page.getByRole('button', { name: 'RELOAD' }).click();

  const after = await readChallenge(page);
  expect(after.key).not.toBe(before.key);
  await expect(
    page.locator('.hud__stat', { hasText: 'MOVES' }).locator('.hud__value'),
  ).toHaveText('0');
  await expect(page.getByText('NO MOVES YET')).toBeVisible();
});
