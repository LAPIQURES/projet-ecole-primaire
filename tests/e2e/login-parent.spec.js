const { test, expect } = require('@playwright/test');

test.describe('Login and Parent dashboard', () => {
  test('should open login and parent dashboard with dev token', async ({ page, baseURL }) => {
    await page.goto(baseURL + '/login');
    await page.waitForSelector('body');

    await page.addInitScript(() => {
      localStorage.setItem('token', 'dev:parent:1');
      localStorage.setItem('user', JSON.stringify({ role: 'parent', prenom: 'Parent', nom: 'User' }));
    });

    await page.goto(baseURL + '/parent/dashboard');
    await page.waitForTimeout(800);

    const content = await page.content();
    expect(content).toContain('Suivez la scolarité');
    expect(content).toContain('Mon enfant');
  });
});
