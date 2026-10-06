import { expect, test } from '@playwright/test';

test('leaderboard shows three level columns and an honest offline state', async ({ page }) => {
  await page.route('**/rest/v1/**', (route) => route.abort());
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'LEADERBOARD' }).click();

  await expect(page.getByRole('button', { name: 'REFRESH' })).toBeVisible();
  await expect(page.locator('.leaderboard-col')).toHaveCount(3);
  await expect(page.locator('.leaderboard-col').nth(0)).toContainText('TWO COINS');
  await expect(page.locator('.leaderboard-col').nth(1)).toContainText('THREE COINS');
  await expect(page.locator('.leaderboard-col').nth(2)).toContainText('FOUR COINS');

  await expect(page.locator('.leaderboard-banner')).toBeVisible();
  await expect(page.locator('.leaderboard-banner')).toContainText('LOCAL RECORDS ONLY');

  const fit = await page.evaluate(() => {
    const box = document.querySelector('.leaderboard-columns');
    return box ? box.getBoundingClientRect().bottom - window.innerHeight : 0;
  });
  expect(fit).toBeLessThanOrEqual(1);

  await page.getByRole('button', { name: 'BACK TO MENU' }).click();
  await expect(page.getByRole('button', { name: 'TWO COINS' })).toBeVisible();
});

test('leaderboard columns stack with tabs on mobile', async ({ page }) => {
  await page.route('**/rest/v1/**', (route) => route.abort());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'LEADERBOARD' }).click();

  await expect(page.getByRole('button', { name: 'THREE COINS' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'THREE COINS' }).first().click();
  await expect(page.locator('.leaderboard-col').nth(1)).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
