const { test, expect } = require('@playwright/test');

test.describe('Teacher dashboard', () => {
  test('should render main teacher sections with dev token', async ({ page, baseURL }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'dev:enseignant:1');
      localStorage.setItem('user', JSON.stringify({ role: 'enseignant', prenom: 'Jean', nom: 'Dupont' }));
    });

    await page.goto(baseURL + '/enseignant/dashboard');
    await page.waitForTimeout(800);

    const content = await page.content();
    expect(content).toContain('Bonjour, Jean Dupont');
    expect(content).toContain('Actions rapides');
    expect(content).toContain('Cours du jour');
  });
});
