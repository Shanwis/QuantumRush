import { test as base, expect } from '@playwright/test';

export { expect };

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'qubit_rush_settings',
        JSON.stringify({ v: 3, themeOn: false, tag: 'TESTER' }),
      );
    });
    await use(page);
  },
});
