import { expect, test } from '@playwright/test';

test('first visit asks for an arcade tag and remembers it', async ({ page }) => {
  await page.goto('/?seed=7');
  await expect(page.getByRole('button', { name: 'LEADERBOARD' })).toHaveCount(0);
  await expect(page.getByText('ENTER YOUR ARCADE TAG')).toBeVisible();

  const start = page.getByRole('button', { name: 'START' });
  await expect(start).toBeDisabled();
  await page.getByLabel('Arcade tag').fill('ace 9!');
  await expect(page.getByLabel('Arcade tag')).toHaveValue('ACE 9');
  await expect(start).toBeEnabled();
  await start.click();

  await expect(page.getByRole('button', { name: 'TWO COINS' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'PLAYER: ACE 9' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: 'TWO COINS' })).toBeVisible();
  await expect(page.getByText('ENTER YOUR ARCADE TAG')).toHaveCount(0);

  await page.getByRole('button', { name: 'PLAYER: ACE 9' }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit arcade tag' });
  await dialog.getByLabel('Arcade tag').fill('nova!');
  await dialog.getByLabel('Arcade tag').press('Enter');
  await expect(page.getByRole('button', { name: 'PLAYER: NOVA' })).toBeVisible();
});
