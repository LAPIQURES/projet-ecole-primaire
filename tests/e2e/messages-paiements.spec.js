const { test, expect } = require('@playwright/test');

test.describe('Messages and Paiements smoke', () => {
  test('admin pages render and parent quick links are visible', async ({ page, baseURL }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'dev:admin:1');
      localStorage.setItem('user', JSON.stringify({ role: 'admin', prenom: 'Admin', nom: 'User' }));
    });

    await page.goto(baseURL + '/paiements');
    await page.waitForTimeout(700);
    let content = await page.content();
    expect(content).toContain('Gestion des Paiements');
    expect(content).toContain('Enregistrer un paiement');

    await page.goto(baseURL + '/messages');
    await page.waitForTimeout(700);
    content = await page.content();
    expect(content).toContain('Messages');

    await page.evaluate(() => {
      localStorage.setItem('token', 'dev:parent:1');
      localStorage.setItem('user', JSON.stringify({ role: 'parent', prenom: 'Parent', nom: 'User' }));
    });
    await page.goto(baseURL + '/parent/dashboard');
    await page.waitForTimeout(700);
    content = await page.content();
    expect(content).toContain('Accès rapide');
    expect(content).toContain('Paiements');
    expect(content).toContain('Messages');
  });
});
