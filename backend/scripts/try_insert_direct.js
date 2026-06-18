const pool = require('../database/db');
const config = require('../config');
(async () => {
  try {
    const insertCols = ['idClasse','idAdmin','idTemps','heure','created_at'];
    const vals = [1,1,1,'10:00', new Date()];
    const sql = `INSERT INTO EmploiDuTemps (${insertCols.join(',')}) VALUES (${insertCols.map(()=>'?').join(',')})`;
    console.log('SQL', sql);
    console.log('VALS', vals.map(v=>typeof v+':'+String(v)));
    const [r] = await pool.query(sql, vals);
    console.log('Inserted id', r.insertId);
    process.exit(0);
  } catch (e) { console.error('ERR', e); process.exit(1); }
})();
