const { test, expect } = require('@playwright/test');

test.describe('Emploi E2E', () => {
  test('create via API and show in UI', async ({ page, baseURL }) => {
    // set dev token
    await page.addInitScript(() => {
      localStorage.setItem('token', 'dev:enseignant:1');
      localStorage.setItem('user', JSON.stringify({ role: 'enseignant', prenom: 'Jean', nom: 'Dupont' }));
    });

    // call backend API to create slot
    const apiCreate = await page.evaluate(async () => {
      const payload = { idClasse: 1, idCours: 7, startTime: '18:00', endTime: '19:00', dayOfWeek: 5, jour: 'Vendredi', heure: '18:00' };
      const res = await fetch('http://localhost:5000/api/emploi-temps', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer dev:enseignant:1' }, body: JSON.stringify(payload) });
      const body = await res.json().catch(() => null);
      return { status: res.status, body };
    });

    expect(apiCreate.status).toBe(201);
    const createdId = apiCreate.body.idTemps;
    expect(createdId).toBeTruthy();

    // navigate to emploi page and check created time appears
    await page.goto(baseURL + '/enseignant/emploi-du-temps');
    await page.waitForSelector('body');
    const content = await page.content();
    expect(content).toContain('18:00');

    // cleanup via API
    const del = await page.evaluate(async (id) => {
      const r = await fetch('http://localhost:5000/api/emploi-temps/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer dev:enseignant:1' } });
      return r.status;
    }, createdId);
    expect([200,204]).toContain(del);
  });
});
