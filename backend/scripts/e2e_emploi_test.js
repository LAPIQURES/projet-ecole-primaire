const axios = require('axios');
const API = axios.create({ baseURL: 'http://localhost:5000/api', timeout: 5000, headers: { Authorization: 'Bearer dev:enseignant:1', 'Content-Type': 'application/json' } });

async function run() {
  try {
    console.log('E2E: create slot');
    const createRes = await API.post('/emploi-temps', { idClasse:1, idCours:5, startTime: '15:00', endTime: '16:00', dayOfWeek: 3, jour: 'Mercredi', heure: '15:00' });
    console.log('create status', createRes.status, 'body:', createRes.data);
    const idKey = createRes.data.idTemps || createRes.data.id || createRes.data.ID || createRes.data.Id;

    // verify list
    const list = await API.get('/emploi-temps');
    const found = list.data.find((r) => String(r.idTemps || r.id || r.ID || r.Id) === String(idKey));
    console.log('found in list?', !!found);

    // update
    console.log('E2E: update slot');
    if (idKey) {
      await API.put(`/emploi-temps/${idKey}`, { startTime: '15:30', endTime: '16:30', dayOfWeek: 3, jour: 'Mercredi', heure: '15:30' });
      const after = await API.get('/emploi-temps');
      const f2 = after.data.find((r) => String(r.idTemps || r.id || r.ID || r.Id) === String(idKey));
      console.log('updated startTime:', f2 ? f2.heure || f2.startTime : 'not found');

      // delete
      console.log('E2E: delete slot');
      await API.delete(`/emploi-temps/${idKey}`);
      const afterDel = await API.get('/emploi-temps');
      const f3 = afterDel.data.find((r) => String(r.idTemps || r.id || r.ID || r.Id) === String(idKey));
      console.log('exists after delete?', !!f3);
    } else {
      console.log('No id returned from create, aborting update/delete');
    }

    console.log('E2E script finished');
    process.exit(0);
  } catch (err) {
    console.error('E2E error', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

run();
