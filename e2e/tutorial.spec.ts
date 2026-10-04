import { expect, test } from '@playwright/test';

test('tutorial explains each operation and returns to menu', async ({ page }) => {
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'HOW TO PLAY' }).click();

  await expect(page.getByText('HOW TO PLAY')).toBeVisible();
  await expect(page.getByText('THE LOOP')).toBeVisible();
  await expect(page.getByText('X gate, the bit flip.')).toBeVisible();
  await expect(page.getByText(/Hadamard \(H\) gate/)).toBeVisible();
  await expect(page.getByText(/Z gate, the phase flip/)).toBeVisible();
  await expect(page.getByText('Quantum: Y gate.')).toBeVisible();
  await expect(page.getByText(/CNOT \(controlled-NOT\) gate/)).toBeVisible();
  await expect(page.getByText('entanglement')).toBeVisible();
  await expect(page.getByText('quantum superposition')).toBeVisible();

  await page.getByRole('button', { name: 'BACK' }).click();
  await expect(page.getByRole('button', { name: 'ONE COIN' })).toBeVisible();
});
