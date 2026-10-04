import { expect, test } from '@playwright/test';

test('interactive tutorial allows playing step by step and returns to menu', async ({ page }) => {
  await page.goto('/?seed=7');
  await page.getByRole('button', { name: 'HOW TO PLAY' }).click();

  await expect(page.getByText('HOW TO PLAY')).toBeVisible();
  await expect(page.getByText('STEP 1 OF 5')).toBeVisible();
  await expect(page.getByText('X gate, the bit flip.')).toBeVisible();

  // Step 1: FLIP and MEASURE
  await page.getByRole('button', { name: 'FLIP', exact: true }).click();
  await page.getByRole('button', { name: 'MEASURE', exact: true }).click();
  await page.getByRole('button', { name: /NEXT STEP/ }).click();

  // Step 2: MIX and MEASURE
  await expect(page.getByText('STEP 2 OF 5')).toBeVisible();
  await expect(page.getByText(/Hadamard \(H\) gate/)).toBeVisible();
  await page.getByRole('button', { name: 'MIX', exact: true }).click();
  await page.getByRole('button', { name: 'MEASURE', exact: true }).click();
  await page.getByRole('button', { name: /NEXT STEP/ }).click();

  // Step 3: Interference (MIX -> TURN -> MIX)
  await expect(page.getByText('STEP 3 OF 5')).toBeVisible();
  await expect(page.getByText(/Z gate, the phase flip/)).toBeVisible();
  await page.getByRole('button', { name: 'MIX', exact: true }).click();
  await page.getByRole('button', { name: 'TURN', exact: true }).click();
  await page.getByRole('button', { name: 'MIX', exact: true }).click();
  await page.getByRole('button', { name: 'MEASURE', exact: true }).click();
  await page.getByRole('button', { name: /NEXT STEP/ }).click();

  // Step 4: Entanglement (MIX on A, LINK A->B)
  await expect(page.getByText('STEP 4 OF 5')).toBeVisible();
  await expect(page.getByText(/CNOT \(controlled-NOT\) gate/)).toBeVisible();
  await page.getByRole('button', { name: 'MIX', exact: true }).click();
  await page.getByRole('button', { name: 'LINK', exact: true }).click();
  await page.getByLabel('Coin A').click();
  await page.getByLabel('Coin B').click();
  await page.getByRole('button', { name: 'MEASURE', exact: true }).click();
  await page.getByRole('button', { name: /NEXT STEP/ }).click();

  // Step 5: TWIST
  await expect(page.getByText('STEP 5 OF 5')).toBeVisible();
  await expect(page.getByText('Quantum: Y gate.')).toBeVisible();

  // Switch to Manual tab
  await page.getByRole('button', { name: 'MANUAL', exact: true }).click();
  await expect(page.getByText('THE LOOP')).toBeVisible();
  await expect(page.getByText('quantum superposition')).toBeVisible();
  await expect(page.getByText('entanglement')).toBeVisible();

  // Return to Menu
  await page.getByRole('button', { name: 'BACK', exact: true }).click();
  await expect(page.getByRole('button', { name: 'ONE COIN' })).toBeVisible();
});
