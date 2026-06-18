const pool = require('../database/db');
const config = require('../config');
(async () => {
  const body = { idClasse:1, idCours:5, idTemps:1, startTime:'10:00', endTime:'11:00', dayOfWeek:2 };
  try {
    const [cols] = await pool.query(`SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`, [config.db.database, 'EmploiDuTemps']);
    const colNames = cols.map(c => c.COLUMN_NAME);
    console.log('cols in table:', colNames);
    console.log('cols details:');
    cols.forEach(c => console.log(' -', c.COLUMN_NAME, c.DATA_TYPE, c.CHARACTER_MAXIMUM_LENGTH));
    const mapping = {
      idSalle: ['idSalle','idsalle','id_salle','salle_id','idsalle'],
      idClasse: ['idClasse','idclasse','id_classe','classe_id'],
      idProf: ['idProf','idprof','id_prof','prof_id','idEnseignant'],
      subject: ['subject','matiere','libelle','title'],
      dayOfWeek: ['dayOfWeek','dayofweek','day','jour','day_of_week','jourDeSemaine'],
      startTime: ['startTime','start_time','heure_debut','debut','start'],
      endTime: ['endTime','end_time','heure_fin','fin','end'],
    };
    const insertCols = [];
    const insertVals = [];
    const valPlaceholders = [];
    const addIfExists = (key, value) => {
      const candidates = mapping[key];
      for (const c of candidates) {
        if (colNames.includes(c)) {
          insertCols.push(c);
          insertVals.push(value);
          valPlaceholders.push('?');
          return;
        }
      }
    };
    addIfExists('idSalle', body.idSalle || null);
    addIfExists('idClasse', body.idClasse || null);
    addIfExists('idProf', body.idProf || null);
    addIfExists('subject', body.subject || '');
    if (colNames.includes('idAdmin')) { insertCols.push('idAdmin'); insertVals.push(1); valPlaceholders.push('?'); }
    if (colNames.includes('idTemps')) { insertCols.push('idTemps'); insertVals.push(body.idTemps || 1); valPlaceholders.push('?'); }
    if (colNames.includes('heure')) { insertCols.push('heure'); insertVals.push(String(body.startTime).slice(0,5)); valPlaceholders.push('?'); }
    else { addIfExists('dayOfWeek', body.dayOfWeek); addIfExists('startTime', body.startTime); addIfExists('endTime', body.endTime); }
    if (colNames.includes('created_at')) { insertCols.push('created_at'); insertVals.push(new Date()); valPlaceholders.push('?'); }
    console.log('sql:', `INSERT INTO EmploiDuTemps (${insertCols.join(',')}) VALUES (${valPlaceholders.join(',')})`);
    console.log('vals:', insertVals.map(v=>typeof v + ':' + String(v)).join(' | '));
    process.exit(0);
  } catch (e) { console.error(e); process.exit(1); }
})();
