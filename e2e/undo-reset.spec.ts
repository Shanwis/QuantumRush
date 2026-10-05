import { expect, test } from '@playwright/test';

const moves = (page: import('@playwright/test').Page) =>
  page.locator('.hud__stat', { hasText: 'MOVES' }).locator('.hud__value');

test('undo reverts one move and reset clears the run without refunding moves', async ({
  page,
}) => {
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'TWO COINS' }).click();

  await page.getByRole('button', { name: 'FLIP', exact: true }).click();
  await page.getByRole('button', { name: 'MIX', exact: true }).click();
  await expect(moves(page)).toHaveText('2');

  await page.getByRole('button', { name: 'UNDO' }).click();
  await expect(moves(page)).toHaveText('2');
  await expect(page.locator('.history__item')).toHaveCount(1);

  await page.getByRole('button', { name: 'RESET' }).click();
  await expect(moves(page)).toHaveText('2');
  await expect(page.getByText('NO MOVES YET')).toBeVisible();

  await page.getByRole('button', { name: 'MIX', exact: true }).click();
  await page.getByRole('button', { name: 'MEASURE' }).click();
  await page.getByRole('button', { name: 'RESET' }).click();
  await expect(page.getByText('PRESS MEASURE TO SAMPLE 1000 SHOTS')).toBeVisible();
});
