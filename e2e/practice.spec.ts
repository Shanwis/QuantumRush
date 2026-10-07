import { expect, test } from './fixtures';
import { applyOp, readChallenge } from './helpers';

test('replaying a challenge is practice and never sets a high score', async ({ page }) => {
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'TWO COINS' }).click();

  const challenge = await readChallenge(page);
  for (const op of challenge.solution) await applyOp(page, op);
  await page.getByRole('button', { name: 'MEASURE' }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('NEW HIGH SCORE!');
  await expect(dialog.getByRole('button', { name: 'SUBMIT SCORE' })).toBeVisible();
  await expect(dialog.getByRole('textbox')).toHaveCount(0);

  await dialog.getByRole('button', { name: 'PLAY AGAIN' }).click();
  for (const op of challenge.solution) await applyOp(page, op);
  await page.getByRole('button', { name: 'MEASURE' }).click();

  await expect(dialog).toContainText('(not considered for high score)');
  await expect(dialog).not.toContainText('NEW HIGH SCORE!');
  await expect(dialog.getByRole('button', { name: 'SUBMIT SCORE' })).toHaveCount(0);
});
