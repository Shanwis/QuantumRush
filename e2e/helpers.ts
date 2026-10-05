import type { Page } from '@playwright/test';

export interface TestOp {
  kind: 'X' | 'H' | 'Z' | 'Y' | 'CNOT';
  coin?: number;
  control?: number;
  target?: number;
}

const ACTION_NAMES: Record<string, string> = {
  X: 'FLIP',
  H: 'MIX',
  Z: 'TURN',
  Y: 'TWIST',
};

const COINS = ['A', 'B', 'C', 'D'];

export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(String(error)));
  return errors;
}

export async function applyOp(page: Page, op: TestOp): Promise<void> {
  if (op.kind === 'CNOT') {
    await page.getByRole('button', { name: 'LINK', exact: true }).click();
    await page.getByRole('button', { name: `Coin ${COINS[op.control ?? 0]}` }).click();
    await page.getByRole('button', { name: `Coin ${COINS[op.target ?? 0]}` }).click();
    return;
  }
  await page.getByRole('button', { name: `Coin ${COINS[op.coin ?? 0]}` }).click();
  await page.getByRole('button', { name: ACTION_NAMES[op.kind], exact: true }).click();
}

export async function readChallenge(page: Page): Promise<{ key: string; solution: TestOp[] }> {
  await page.waitForFunction(() => Boolean((window as { __QR_TEST__?: unknown }).__QR_TEST__));
  return page.evaluate(() => {
    const hook = (
      window as unknown as { __QR_TEST__: { challenge: { key: string; solution: TestOp[] } } }
    ).__QR_TEST__;
    return { key: hook.challenge.key, solution: hook.challenge.solution };
  });
}
