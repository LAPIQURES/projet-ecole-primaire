const pool = require('../database/db');
const config = require('../config');
const socketHelper = require('../socket');

// Cache for columns
const tableColumnsCache = new Map();

async function getTableColumns(tableName) {
  if (tableColumnsCache.has(tableName)) return tableColumnsCache.get(tableName);
  const [cols] = await pool.query(
    'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
    [config.db.database, tableName]
  );
  const names = cols.map((c) => c.COLUMN_NAME);
  tableColumnsCache.set(tableName, names);
  return names;
}

const ensureEmploiSchema = async () => {
  const [tables] = await pool.query(`SHOW TABLES LIKE 'EmploiDuTemps'`);
  if (!tables.length) {
    await pool.query(`
      CREATE TABLE EmploiDuTemps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        idSalle INT NULL,
        idClasse INT NULL,
        idProf INT NULL,
        subject VARCHAR(160) NULL,
        dayOfWeek TINYINT NULL,
        startTime TIME NULL,
        endTime TIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }
};

ensureEmploiSchema().catch((e) => console.error('Erreur schema Emploi:', e.message));

exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM EmploiDuTemps');
    // sort in JS by possible day/start columns
    if (rows.length) {
      const dayKey = (['dayOfWeek', 'day', 'jour', 'day_of_week', 'jourDeSemaine'].find(k => k in rows[0]) || null);
      const startKey = (['startTime', 'start_time', 'heure_debut', 'debut', 'start'].find(k => k in rows[0]) || null);
      if (dayKey && startKey) {
        rows.sort((a, b) => {
          const da = Number(a[dayKey] || 0); const db = Number(b[dayKey] || 0);
          if (da !== db) return da - db;
          const ta = timeToMinutes(a[startKey]); const tb = timeToMinutes(b[startKey]);
          return (ta || 0) - (tb || 0);
        });
      }
    }
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.create = async (req, res) => {
  try {
    const body = req.body || {};
    const { idSalle, idClasse, idProf, subject, mode } = body;
    // normalize day and times: accept dayOfWeek OR jour, and startTime/endTime OR heure
    const dayOfWeek = body.dayOfWeek ?? (body.jour ? dayLabelToNumber(body.jour) : null);
    let startTime = body.startTime ?? null;
    let endTime = body.endTime ?? null;
    if ((!startTime || !endTime) && body.heure) {
      const parts = String(body.heure).split('-').map(p => p.trim());
      if (!startTime) startTime = parts[0] || null;
      if (!endTime) endTime = parts[1] || null;
    }

    if (!dayOfWeek || !startTime || !endTime) return res.status(400).json({ error: 'dayOfWeek, startTime and endTime required' });

    const conflict = await findConflict({ idSalle, idClasse, idProf, dayOfWeek, startTime, endTime, mode }, null);
    if (conflict) return res.status(409).json({ error: conflict });

    // Build INSERT dynamically according to actual table columns
    const cols = await getTableColumns('EmploiDuTemps');
    const mapping = {
      idSalle: ['idSalle','idsalle','id_salle','salle_id','idsalle'],
      idClasse: ['idClasse','idclasse','id_classe','classe_id'],
        idCours: ['idCours','idcours','id_cours','cours_id'],
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
        if (cols.includes(c)) {
          insertCols.push(c);
          insertVals.push(value);
          valPlaceholders.push('?');
          return;
        }
      }
    };

    addIfExists('idSalle', idSalle || null);
    addIfExists('idClasse', idClasse || null);
    addIfExists('idCours', body.idCours || null);
    addIfExists('idProf', idProf || null);
    addIfExists('subject', subject || '');
    // ensure idAdmin and idTemps if present in schema
    if (cols.includes('idAdmin')) {
      insertCols.push('idAdmin'); insertVals.push(body.idAdmin || 1); valPlaceholders.push('?');
    }
    if (cols.includes('idTemps') && body.idTemps != null) {
      // only include idTemps when explicitly provided; otherwise let AUTO_INCREMENT set it
      insertCols.push('idTemps'); insertVals.push(body.idTemps); valPlaceholders.push('?');
    }
    // If the table uses 'heure' rather than start/end, map accordingly
    if (cols.includes('heure')) {
      // store start time only (varchar(6))
      insertCols.push('heure');
      insertVals.push(String(startTime).slice(0,5));
      valPlaceholders.push('?');
      // also ensure 'jour' column is set when present
      if (cols.includes('jour')) {
        insertCols.push('jour');
        insertVals.push(body.jour || dayNumberToLabel(dayOfWeek));
        valPlaceholders.push('?');
      }
    } else {
      addIfExists('dayOfWeek', dayOfWeek);
      addIfExists('startTime', startTime);
      addIfExists('endTime', endTime);
    }

    // created_at if exists
    if (cols.includes('created_at')) {
      insertCols.push('created_at');
      insertVals.push(new Date());
      valPlaceholders.push('?');
    }

    if (insertCols.length === 0) return res.status(500).json({ error: 'Aucune colonne reconnue pour EmploiDuTemps' });

    const sql = `INSERT INTO EmploiDuTemps (${insertCols.join(',')}) VALUES (${valPlaceholders.join(',')})`;
    const [result] = await pool.query(sql, insertVals);
    let rows = [];
    try {
      if (cols.includes('idTemps')) {
        const [r] = await pool.query('SELECT * FROM EmploiDuTemps WHERE idTemps = ? LIMIT 1', [result.insertId]);
        rows = r;
      } else {
        const [r] = await pool.query('SELECT * FROM EmploiDuTemps WHERE id = ? LIMIT 1', [result.insertId]);
        rows = r;
      }
    } catch (e) {
      // fallback: return most recent by created_at or by class
      const [r2] = await pool.query('SELECT * FROM EmploiDuTemps WHERE idClasse = ? ORDER BY created_at DESC LIMIT 1', [idClasse || null]);
      rows = r2;
    }
    res.status(201).json(rows[0] || {});
    try {
      const io = socketHelper.get();
      const created = rows[0] || {};
      if (created.idClasse) io.to(`class-${created.idClasse}`).emit('emploi:created', created);
      if (created.idProf) io.to(`prof-${created.idProf}`).emit('emploi:created', created);
      if (created.matricule) io.to(`student-${created.matricule}`).emit('emploi:created', created);
      io.emit('emploi:created:global', { id: created.id || created.idTemps });
    } catch (e) { }
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const { idSalle, idClasse, idProf, subject, mode } = body;
    const dayOfWeek = body.dayOfWeek ?? (body.jour ? dayLabelToNumber(body.jour) : null);
    let startTime = body.startTime ?? null;
    let endTime = body.endTime ?? null;
    if ((!startTime || !endTime) && body.heure) {
      const parts = String(body.heure).split('-').map(p => p.trim());
      if (!startTime) startTime = parts[0] || null;
      if (!endTime) endTime = parts[1] || null;
    }
    if (!dayOfWeek || !startTime || !endTime) return res.status(400).json({ error: 'dayOfWeek, startTime and endTime required' });
    const conflict = await findConflict({ idSalle, idClasse, idProf, dayOfWeek, startTime, endTime, mode }, id);
    if (conflict) return res.status(409).json({ error: conflict });

    // Build UPDATE dynamically
    const cols = await getTableColumns('EmploiDuTemps');
    const mapping = {
      idSalle: ['idSalle','idsalle','id_salle','salle_id','idsalle'],
      idClasse: ['idClasse','idclasse','id_classe','classe_id'],
      idProf: ['idProf','idprof','id_prof','prof_id','idEnseignant'],
      subject: ['subject','matiere','libelle','title'],
      dayOfWeek: ['dayOfWeek','dayofweek','day','jour','day_of_week','jourDeSemaine'],
      startTime: ['startTime','start_time','heure_debut','debut','start'],
      endTime: ['endTime','end_time','heure_fin','fin','end'],
    };

    const setFragments = [];
    const setValues = [];
    const addIfExists = (key, value) => {
      const candidates = mapping[key];
      for (const c of candidates) {
        if (cols.includes(c)) {
          setFragments.push(`${c} = ?`);
          setValues.push(value);
          return;
        }
      }
    };

    if (body.hasOwnProperty('idSalle')) addIfExists('idSalle', idSalle);
    if (body.hasOwnProperty('idClasse')) addIfExists('idClasse', idClasse);
    if (body.hasOwnProperty('idProf')) addIfExists('idProf', idProf);
    if (body.hasOwnProperty('subject')) addIfExists('subject', subject);
    if (cols.includes('heure')) {
      setFragments.push('heure = ?');
      setValues.push(String(startTime).slice(0,5));
      if (cols.includes('jour')) {
        setFragments.push('jour = ?');
        setValues.push(body.jour || dayNumberToLabel(dayOfWeek));
      }
    } else {
      addIfExists('dayOfWeek', dayOfWeek);
      addIfExists('startTime', startTime);
      addIfExists('endTime', endTime);
    }

    if (setFragments.length === 0) return res.status(500).json({ error: 'Aucune colonne reconnue pour mise à jour' });

    const pk = cols.includes('idTemps') ? 'idTemps' : (cols.includes('id') ? 'id' : (cols.includes('ID') ? 'ID' : 'id'));
    const sql = `UPDATE EmploiDuTemps SET ${setFragments.join(', ')} WHERE ${pk} = ?`;
    await pool.query(sql, [...setValues, id]);

    const [rows] = await pool.query(`SELECT * FROM EmploiDuTemps WHERE ${pk} = ? LIMIT 1`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Créneau non trouvé' });
    res.json(rows[0]);
    try {
      const io = socketHelper.get();
      const updated = rows[0] || {};
      if (updated.idClasse) io.to(`class-${updated.idClasse}`).emit('emploi:updated', updated);
      if (updated.idProf) io.to(`prof-${updated.idProf}`).emit('emploi:updated', updated);
      if (updated.matricule) io.to(`student-${updated.matricule}`).emit('emploi:updated', updated);
      io.emit('emploi:updated:global', { id });
    } catch (e) { }
  } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const cols = await getTableColumns('EmploiDuTemps');
    const pk = cols.includes('idTemps') ? 'idTemps' : (cols.includes('id') ? 'id' : (cols.includes('ID') ? 'ID' : 'id'));
    await pool.query(`DELETE FROM EmploiDuTemps WHERE ${pk} = ?`, [id]);
    res.json({ message: 'Créneau supprimé' });
    try { const io = socketHelper.get(); io.emit('emploi:deleted', { id }); } catch (e) { }
  } catch (error) { res.status(500).json({ error: error.message }); }
};

function timeToMinutes(t) {
  if (!t) return null;
  const str = String(t).slice(0, 5);
  const [h, m] = str.split(':').map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function dayLabelToNumber(d) {
  if (d == null) return null;
  const s = String(d).toLowerCase();
  if (/lun/i.test(s) || /lundi/i.test(s)) return 1;
  if (/mar/i.test(s) || /mardi/i.test(s)) return 2;
  if (/mer/i.test(s) || /mercredi/i.test(s)) return 3;
  if (/jeu/i.test(s) || /jeudi/i.test(s)) return 4;
  if (/ven/i.test(s) || /vendredi/i.test(s)) return 5;
  const n = Number(d);
  if (Number.isFinite(n)) return n;
  return null;
}

function dayNumberToLabel(n) {
  const m = Number(n);
  if (!Number.isFinite(m)) return '';
  return {1:'Lundi',2:'Mardi',3:'Mercredi',4:'Jeudi',5:'Vendredi'}[m] || String(m);
}

function parseRowTimes(it) {
  // try multiple possible fields
  if (it.startTime && it.endTime) return { s: timeToMinutes(it.startTime), e: timeToMinutes(it.endTime) };
  if (it.heure) {
    // formats: "HH:MM-HH:MM" or "HH:MM" etc
    const parts = String(it.heure).split('-').map(p => p.trim());
    const s = parts[0] ? timeToMinutes(parts[0]) : null;
    const e = parts[1] ? timeToMinutes(parts[1]) : null;
    return { s, e };
  }
  if (it.heure_debut && it.heure_fin) return { s: timeToMinutes(it.heure_debut), e: timeToMinutes(it.heure_fin) };
  return { s: null, e: null };
}

async function findConflict(candidate, ignoreId) {
  const day = Number(candidate.dayOfWeek);
  const start = timeToMinutes(candidate.startTime);
  const end = timeToMinutes(candidate.endTime);
  const mode = String(candidate.mode || '').toLowerCase(); // 'commun' or 'separe' (default)

  if (!day || start == null || end == null) return 'Horaire invalide';

  // Some deployments may have different column names; select all and filter in JS for robustness
  const [allRows] = await pool.query('SELECT * FROM EmploiDuTemps');
  let rows = allRows;
  // keep only same day and optionally exclude id
  rows = rows.filter((it) => {
    if (ignoreId && String(it.id) === String(ignoreId)) return false;
    const raw = it.dayOfWeek ?? it.day ?? it.jour ?? it.day_of_week ?? it.jourDeSemaine;
    const d = dayLabelToNumber(raw);
    return d === day;
  });

  for (const it of rows) {
    const { s, e } = parseRowTimes(it);
    if (s == null || e == null) continue;
    if (!overlaps(start, end, s, e)) continue;

    if (candidate.idSalle && it.idSalle && String(candidate.idSalle) === String(it.idSalle)) {
      return 'Conflit: la salle est déjà occupée sur cet horaire';
    }
    // Prof conflict: in 'commun' mode we allow the same prof to be scheduled
    // simultaneously for the same class (shared lecture). Otherwise block.
    if (candidate.idProf && it.idProf && String(candidate.idProf) === String(it.idProf)) {
      if (mode === 'commun') {
        // If both entries are for the same class, allow (shared lecture across salles)
        if (candidate.idClasse && it.idClasse && String(candidate.idClasse) === String(it.idClasse)) {
          // allowed
        } else {
          return 'Conflit: l\'enseignant est déjà occupé sur cet horaire (mode séparé requis)';
        }
      } else {
        return 'Conflit: l\'enseignant est déjà occupé sur cet horaire';
      }
    }
    if (candidate.idClasse && it.idClasse && String(candidate.idClasse) === String(it.idClasse)) {
      return 'Conflit: la classe a déjà un cours sur cet horaire';
    }
  }

  return '';
}
