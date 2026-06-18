const { test, expect } = require('@playwright/test');

test.describe('Full Emploi flow', () => {
  test('login -> create -> modify -> delete -> verify UI updates', async ({ page, baseURL }) => {
    // Pre-auth using dev token
    await page.addInitScript(() => {
      localStorage.setItem('token', 'dev:enseignant:1');
      localStorage.setItem('user', JSON.stringify({ role: 'enseignant', prenom: 'Jean', nom: 'Dupont' }));
    });

    // Create via API
    const create = await page.evaluate(async () => {
      const payload = { idClasse: 1, idCours: 8, startTime: '12:00', endTime: '13:00', dayOfWeek: 2, jour: 'Mardi', heure: '12:00' };
      const res = await fetch('http://localhost:5000/api/emploi-temps', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer dev:enseignant:1' }, body: JSON.stringify(payload) });
      return { status: res.status, body: await res.json().catch(() => null) };
    });
    expect(create.status).toBe(201);
    const id = create.body.idTemps;
    expect(id).toBeTruthy();

    // Navigate to emploi UI and verify created slot
    await page.goto(baseURL + '/enseignant/emploi-du-temps');
    await page.waitForTimeout(800);
    let content = await page.content();
    expect(content).toContain('12:00');

    // Modify via API
    const upd = await page.evaluate(async (id) => {
      const payload = { startTime: '12:30', endTime: '13:30', jour: 'Mardi', heure: '12:30' };
      const r = await fetch('http://localhost:5000/api/emploi-temps/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer dev:enseignant:1' }, body: JSON.stringify(payload) });
      return { status: r.status, body: await r.json().catch(() => null) };
    }, id);
    expect([200,201]).toContain(upd.status);

    // Reload UI and check updated time
    await page.reload();
    await page.waitForTimeout(800);
    content = await page.content();
    expect(content).toContain('12:30');

    // Delete via API
    const del = await page.evaluate(async (id) => {
      const r = await fetch('http://localhost:5000/api/emploi-temps/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer dev:enseignant:1' } });
      return r.status;
    }, id);
    expect([200,204]).toContain(del);

    // Final UI check to ensure it's gone
    await page.reload();
    await page.waitForTimeout(800);
    content = await page.content();
    expect(content).not.toContain('12:30');
  });
});
