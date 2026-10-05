import { expect, test } from '@playwright/test';

test('tutorial teaches every operation and gates progress', async ({ page }) => {
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'HOW TO PLAY' }).click();
  await expect(page.getByText('STEP 1 OF 5')).toBeVisible();

  const next = page.getByRole('button', { name: /NEXT STEP/ });
  await expect(next).toBeDisabled();

  await expect(page.getByText('X gate, the bit flip.')).toBeVisible();
  await page.getByRole('button', { name: 'FLIP', exact: true }).click();
  await expect(next).toBeDisabled();
  await page.getByRole('button', { name: 'MEASURE', exact: true }).click();
  await expect(next).toBeEnabled();
  await next.click();

  await expect(page.getByText('STEP 2 OF 5')).toBeVisible();
  await expect(page.getByText(/Hadamard \(H\) gate/)).toBeVisible();
  await page.getByRole('button', { name: 'MIX', exact: true }).click();
  await page.getByRole('button', { name: 'MEASURE', exact: true }).click();
  await next.click();

  await expect(page.getByText('STEP 3 OF 5')).toBeVisible();
  await expect(page.getByText(/Z gate, the phase flip/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'FLIP', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'MIX', exact: true }).click();
  await page.getByRole('button', { name: 'TURN', exact: true }).click();
  await page.getByRole('button', { name: 'MIX', exact: true }).click();
  await page.getByRole('button', { name: 'MEASURE', exact: true }).click();
  await next.click();

  await expect(page.getByText('STEP 4 OF 5')).toBeVisible();
  await expect(page.getByText(/CNOT \(controlled-NOT\) gate/)).toBeVisible();
  await page.getByRole('button', { name: 'MIX', exact: true }).click();
  await page.getByRole('button', { name: 'LINK', exact: true }).click();
  await page.getByLabel('Coin A').click();
  await page.getByLabel('Coin B').click();
  await page.getByRole('button', { name: 'MEASURE', exact: true }).click();
  await next.click();

  await expect(page.getByText('STEP 5 OF 5')).toBeVisible();
  await expect(page.getByText('Quantum: Y gate — bit flip and phase in one gate.')).toBeVisible();
  const twist = page.getByRole('button', { name: 'TWIST', exact: true });
  await expect(twist).toHaveClass(/btn--pulse/);
  await page.getByRole('button', { name: 'MIX', exact: true }).click();
  await page.getByRole('button', { name: 'LINK', exact: true }).click();
  await page.getByLabel('Coin A').click();
  await page.getByLabel('Coin B').click();
  await page.getByLabel('Coin B').click();
  await twist.click();
  await page.getByRole('button', { name: 'MEASURE', exact: true }).click();
  await expect(page.getByText('Training complete!')).toBeVisible();
  await expect(page.getByRole('button', { name: 'PLAY TWO COINS' })).toBeVisible();

  await page.getByRole('button', { name: 'MANUAL', exact: true }).click();
  await expect(page.getByText('THE LOOP')).toBeVisible();
  await expect(page.getByText('quantum superposition')).toBeVisible();
  await expect(page.getByText('entanglement')).toBeVisible();

  await page.getByRole('button', { name: 'BACK', exact: true }).click();
  await expect(page.getByRole('button', { name: 'TWO COINS' })).toBeVisible();
});
