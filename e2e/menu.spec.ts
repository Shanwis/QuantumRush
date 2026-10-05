import { expect, test } from '@playwright/test';
import { trackErrors } from './helpers';

test('menu offers all three levels and high scores', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/');
  await expect(page.getByText('QUBIT RUSH')).toBeVisible();
  await expect(page.getByText('THE QUANTUM COIN GAME')).toBeVisible();
  await expect(page.getByRole('button', { name: 'ONE COIN' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'TWO COINS' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'THREE COINS' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'FOUR COINS' })).toBeVisible();
  await expect(page.getByText('HIGH SCORES')).toBeVisible();
  expect(errors).toEqual([]);
});
