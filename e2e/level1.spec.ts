import { expect, test } from '@playwright/test';
import { trackErrors } from './helpers';

test('level one is won with MIX and the best persists across reload', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'ONE COIN' }).click();
  await expect(page.getByText('ONE COIN').first()).toBeVisible();

  await page.getByRole('button', { name: 'MIX', exact: true }).click();
  await page.getByRole('button', { name: 'MEASURE' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('TARGET REACHED');
  await expect(dialog).toContainText('NEW HIGH SCORE!');
  await expect(dialog).toContainText('SCORE');

  await page.reload();
  const best = page.locator('.menu__scores div', { hasText: 'ONE COIN' }).locator('dd');
  await expect(best).not.toHaveText('---');
  expect(errors).toEqual([]);
});

test('level one also accepts FLIP then FLIP then MIX histories via undo', async ({ page }) => {
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'ONE COIN' }).click();
  await page.getByRole('button', { name: 'FLIP', exact: true }).click();
  await page.getByRole('button', { name: 'UNDO' }).click();
  await page.getByRole('button', { name: 'MIX', exact: true }).click();
  await page.getByRole('button', { name: 'MEASURE' }).click();
  await expect(page.getByRole('dialog')).toContainText('TARGET REACHED');
});
