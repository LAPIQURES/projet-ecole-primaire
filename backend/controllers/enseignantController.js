const bcrypt = require('bcrypt');
const pool = require('../database/db');
const { getTableColumns, selectColumns } = require('../utils/schema');

let cachedPhotoColumn;
async function resolveEnseignantPhotoColumn() {
  if (cachedPhotoColumn !== undefined) return cachedPhotoColumn;
  const cols = await getTableColumns('Enseignant');
  cachedPhotoColumn = cols.has('photoURL') ? 'photoURL' : cols.has('photo_url') ? 'photo_url' : null;
  return cachedPhotoColumn;
}

let cachedPersonneColumns;
async function resolvePersonneColumns() {
  if (cachedPersonneColumns !== undefined) return cachedPersonneColumns;
  cachedPersonneColumns = await getTableColumns('Personne');
  return cachedPersonneColumns;
}

async function getNextIdPers() {
  const [rows] = await pool.query('SELECT COALESCE(MAX(idPers), 0) + 1 AS nextId FROM Personne');
  return rows[0].nextId;
}

function buildPersonneSelect(columns) {
  return selectColumns('p', columns, [
    'idPers',
    'nom',
    'prenom',
    'mobile',
    'phone',
    'email',
    'username',
    'dateNaissance',
    'lieuNaissance',
  ]);
}

async function buildTeacherDetail(enseignantRow) {
  const teacherId = enseignantRow.idEnseignant;
  const teacherCourseId = enseignantRow.idCours || teacherId;

  const [coursesResult, scheduleResult] = await Promise.all([
    pool.query(
      `SELECT
        c.idCours, c.libelle, c.idClasse, cl.libelle AS classe,
        c.idSalle, s.libelle AS salle, c.heures,
        COALESCE(nb.nbEleves, 0) AS nbEleves
       FROM Cours c
       LEFT JOIN Classe cl ON cl.idClasse = c.idClasse
       LEFT JOIN Salle s ON s.idSalle = c.idSalle
       LEFT JOIN (
         SELECT f.idSalle, COUNT(DISTINCT f.matricule) AS nbEleves
         FROM Frequente f
         GROUP BY f.idSalle
       ) nb ON nb.idSalle = c.idSalle
       WHERE c.idEnseignant = ? OR c.idCours = ?
       ORDER BY cl.libelle, c.libelle`,
      [teacherId, teacherCourseId]
    ),
    pool.query(
      `SELECT
        e.idTemps AS id,
        e.idClasse,
        e.idCours,
        e.idAdmin,
        e.jour AS dayOfWeek,
        e.heure AS startTime,
        NULL AS endTime,
        s.libelle AS salle,
        cl.libelle AS classe
       FROM EmploiDuTemps e
       LEFT JOIN Salle s ON s.idSalle = e.idSalle
       LEFT JOIN Classe cl ON cl.idClasse = e.idClasse
       WHERE e.idCours = ?
       ORDER BY e.jour, e.heure`,
      [teacherCourseId]
    )
  ]);

  const courses = Array.isArray(coursesResult[0]) ? coursesResult[0] : [];
  const schedule = Array.isArray(scheduleResult[0]) ? scheduleResult[0] : [];
  const roomMap = new Map();
  const classMap = new Map();

  courses.forEach((row) => {
    if (row.idSalle) {
      const roomKey = String(row.idSalle);
      if (!roomMap.has(roomKey)) {
        roomMap.set(roomKey, {
          idSalle: row.idSalle,
          libelle: row.salle || 'Salle',
          classe: row.classe || '—',
          nbEleves: Number(row.nbEleves || 0),
          cours: [],
        });
      }
      roomMap.get(roomKey).cours.push({ idCours: row.idCours, libelle: row.libelle, heures: row.heures });
    }

    if (row.idClasse) {
      const classKey = String(row.idClasse);
      if (!classMap.has(classKey)) {
        classMap.set(classKey, {
          idClasse: row.idClasse,
          libelle: row.classe || '—',
          nbEleves: Number(row.nbEleves || 0),
          nbSalles: 0,
        });
      }
      const classItem = classMap.get(classKey);
      classItem.nbSalles += row.idSalle ? 1 : 0;
      classItem.nbEleves = Math.max(classItem.nbEleves, Number(row.nbEleves || 0));
    }
  });

  return {
    ...enseignantRow,
    stats: {
      nbClasses: classMap.size,
      nbSalles: roomMap.size,
      nbEleves: courses.reduce((sum, row) => sum + Number(row.nbEleves || 0), 0),
      totalHeures: courses.reduce((sum, row) => sum + Number(row.heures || 0), 0),
    },
    cours: courses,
    salles: Array.from(roomMap.values()),
    classes: Array.from(classMap.values()),
    calendrier: schedule,
  };
}

exports.getEnseignants = async (req, res) => {
  try {
    const photoCol = await resolveEnseignantPhotoColumn();
    const photoSelect = photoCol ? `, en.${photoCol} AS photoURL` : '';
    const personneCols = await resolvePersonneColumns();

    const [rows] = await pool.query(`
      SELECT en.idEnseignant, en.idCours, en.idPers, en.Actif, en.created_at${photoSelect},
        ${buildPersonneSelect(personneCols)},
        c.libelle AS cours, c.idCours,
        COALESCE(stats.nbClasses, 0) AS nbClasses,
        COALESCE(stats.nbSalles, 0) AS nbSalles,
        COALESCE(stats.nbEleves, 0) AS nbEleves,
        COALESCE(stats.totalHeures, 0) AS totalHeures
      FROM Enseignant en
      LEFT JOIN Personne p ON p.idPers = en.idPers
      LEFT JOIN Cours c ON c.idCours = en.idCours
      LEFT JOIN (
        SELECT
          en2.idEnseignant,
          COUNT(DISTINCT c2.idClasse) AS nbClasses,
          COUNT(DISTINCT c2.idSalle) AS nbSalles,
          COUNT(DISTINCT f.matricule) AS nbEleves,
          COALESCE(SUM(c2.heures), 0) AS totalHeures
        FROM Enseignant en2
        LEFT JOIN Cours c2 ON c2.idEnseignant = en2.idEnseignant OR c2.idCours = en2.idCours
        LEFT JOIN Frequente f ON f.idSalle = c2.idSalle
        GROUP BY en2.idEnseignant
      ) stats ON stats.idEnseignant = en.idEnseignant
      ORDER BY en.created_at DESC LIMIT 200
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEnseignantById = async (req, res) => {
  try {
    const photoCol = await resolveEnseignantPhotoColumn();
    const photoSelect = photoCol ? `, en.${photoCol} AS photoURL` : '';
    const personneCols = await resolvePersonneColumns();

    const [rows] = await pool.query(
      `SELECT en.*, ${buildPersonneSelect(personneCols)}, c.libelle AS cours${photoSelect}
       FROM Enseignant en
       LEFT JOIN Personne p ON p.idPers = en.idPers
       LEFT JOIN Cours c ON c.idCours = en.idCours
       WHERE en.idEnseignant = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Enseignant non trouvé' });
    res.json(await buildTeacherDetail(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEnseignant = async (req, res) => {
  try {
    const { nom, prenom, mobile, phone, username, password, dateNaissance, lieuNaissance, idCours, photoURL } = req.body;
    if (!nom || !prenom) return res.status(400).json({ error: 'Nom et prénom requis' });

    const idAdmin = req.user?.id || 1;
    const idPers = await getNextIdPers();
    const pwd = password || '1234';
    const hashedPassword = await bcrypt.hash(pwd, 10);
    const uname = username || `${prenom.toLowerCase().replace(/[^a-z]/g, '')}.${nom.toLowerCase().replace(/[^a-z]/g, '')}`;

    const [userExists] = await pool.query('SELECT idPers FROM Personne WHERE username = ? LIMIT 1', [uname]);
    if (userExists.length > 0) {
      return res.status(400).json({ error: 'Nom d’utilisateur déjà utilisé' });
    }

    const [coursFallback] = await pool.query('SELECT idCours FROM Cours ORDER BY idCours ASC LIMIT 1');
    const resolvedIdCours = idCours || coursFallback[0]?.idCours || null;

    if (!resolvedIdCours) {
      return res.status(400).json({ error: 'Aucun cours disponible pour créer un enseignant' });
    }

    await pool.query(
      `INSERT INTO Personne (idPers, nom, prenom, mobile, phone, username, password, dateNaissance, lieuNaissance, typePersonne, idAdmin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, '2000-01-01'), ?, 2, ?, NOW())`,
      [idPers, nom, prenom, mobile || '', phone || '', uname, hashedPassword, dateNaissance || null, lieuNaissance || '', idAdmin]
    );

    const photoCol = await resolveEnseignantPhotoColumn();
    const personneCols = await resolvePersonneColumns();

    const [result] = photoCol && photoURL !== undefined
      ? await pool.query(
          `INSERT INTO Enseignant (idPers, idCours, ${photoCol}, Actif, idAdmin, created_at)
           VALUES (?, ?, ?, 1, ?, NOW())`,
          [idPers, resolvedIdCours, photoURL || null, idAdmin]
        )
      : await pool.query(
          `INSERT INTO Enseignant (idPers, idCours, Actif, idAdmin, created_at)
           VALUES (?, ?, 1, ?, NOW())`,
          [idPers, resolvedIdCours, idAdmin]
        );

    const [rows] = await pool.query(
      `SELECT en.idEnseignant, en.idCours, en.idPers, en.Actif${photoCol ? `, en.${photoCol} AS photoURL` : ''}, ${buildPersonneSelect(personneCols)}, c.libelle AS cours
       FROM Enseignant en
       LEFT JOIN Personne p ON p.idPers = en.idPers
       LEFT JOIN Cours c ON c.idCours = en.idCours
       WHERE en.idEnseignant = ?`,
      [result.insertId]
    );

    res.status(201).json({ ...(await buildTeacherDetail(rows[0])), username: uname, password: pwd });
  } catch (error) {
    console.error('createEnseignant error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateEnseignant = async (req, res) => {
  try {
    const { nom, prenom, mobile, phone, username, idCours, Actif, photoURL, password } = req.body;
    const [ens] = await pool.query('SELECT idPers FROM Enseignant WHERE idEnseignant = ?', [req.params.id]);
    if (!ens.length) return res.status(404).json({ error: 'Enseignant non trouvé' });

    const updates = [];
    const values = [];

    if (nom !== undefined) { updates.push('nom=?'); values.push(nom); }
    if (prenom !== undefined) { updates.push('prenom=?'); values.push(prenom); }
    if (mobile !== undefined) { updates.push('mobile=?'); values.push(mobile || ''); }
    if (phone !== undefined) { updates.push('phone=?'); values.push(phone || ''); }
    if (username !== undefined) {
      const [userExists] = await pool.query('SELECT idPers FROM Personne WHERE username = ? AND idPers != ? LIMIT 1', [username, ens[0].idPers]);
      if (userExists.length > 0) {
        return res.status(400).json({ error: 'Nom d’utilisateur déjà utilisé' });
      }
      updates.push('username=?');
      values.push(username);
    }
    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password=?');
      values.push(hashedPassword);
    }

    if (updates.length) {
      values.push(ens[0].idPers);
      await pool.query(`UPDATE Personne SET ${updates.join(', ')} WHERE idPers=?`, values);
    }

    const photoCol = await resolveEnseignantPhotoColumn();
    const enseignantUpdates = [];
    const enseignantValues = [];

    if (idCours !== undefined) { enseignantUpdates.push('idCours=?'); enseignantValues.push(idCours || null); }
    if (Actif !== undefined) { enseignantUpdates.push('Actif=?'); enseignantValues.push(Actif); }
    if (photoCol && photoURL !== undefined) { enseignantUpdates.push(`${photoCol}=?`); enseignantValues.push(photoURL || null); }

    if (enseignantUpdates.length) {
      enseignantValues.push(req.params.id);
      await pool.query(`UPDATE Enseignant SET ${enseignantUpdates.join(', ')} WHERE idEnseignant=?`, enseignantValues);
    }

    const personneCols = await resolvePersonneColumns();
    const [rows] = await pool.query(
      `SELECT en.idEnseignant, en.idCours, en.idPers, en.Actif${photoCol ? `, en.${photoCol} AS photoURL` : ''}, ${buildPersonneSelect(personneCols)}, c.libelle AS cours
       FROM Enseignant en
       LEFT JOIN Personne p ON p.idPers = en.idPers
       LEFT JOIN Cours c ON c.idCours = en.idCours
       WHERE en.idEnseignant = ?`,
      [req.params.id]
    );

    res.json(await buildTeacherDetail(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEnseignant = async (req, res) => {
  try {
    await pool.query('UPDATE Enseignant SET Actif = 0 WHERE idEnseignant = ?', [req.params.id]);
    res.json({ message: 'Enseignant désactivé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCurrentEnseignant = async (req, res) => {
  try {
    const enseignantId = req.user?.idEnseignant;
    if (!enseignantId) return res.status(403).json({ error: 'Aucun identifiant enseignant dans le token' });

    const [rows] = await pool.query(
      `SELECT en.*, p.nom, p.prenom, p.username, p.email, p.mobile, p.phone, p.dateNaissance, p.lieuNaissance
       FROM Enseignant en
       LEFT JOIN Personne p ON p.idPers = en.idPers
       WHERE en.idEnseignant = ?`,
      [enseignantId]
    );

    if (!rows.length) return res.status(404).json({ error: 'Enseignant introuvable' });
    res.json(await buildTeacherDetail(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reactivateEnseignant = async (req, res) => {
  try {
    await pool.query('UPDATE Enseignant SET Actif = 1 WHERE idEnseignant = ?', [req.params.id]);
    res.json({ message: 'Enseignant réactivé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.affecterEnseignant = async (req, res) => {
  try {
    const { idSalle, idCours } = req.body;
    if (!idSalle && !idCours) return res.status(400).json({ error: 'idSalle ou idCours requis' });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS EnseignantAffectation (
        id INT AUTO_INCREMENT PRIMARY KEY,
        idEnseignant INT NOT NULL,
        idSalle INT NULL,
        idCours INT NULL,
        idAdmin INT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const idAdmin = req.user?.id || null;
    const [result] = await pool.query(
      'INSERT INTO EnseignantAffectation (idEnseignant, idSalle, idCours, idAdmin, created_at) VALUES (?, ?, ?, ?, NOW())',
      [req.params.id, idSalle || null, idCours || null, idAdmin]
    );

    if (idCours !== undefined) await pool.query('UPDATE Enseignant SET idCours = ? WHERE idEnseignant = ?', [idCours || null, req.params.id]);

    const [rows] = await pool.query('SELECT * FROM EnseignantAffectation WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('affecterEnseignant error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.createRapportEnseignant = async (req, res) => {
  try {
    const { titre, details, type = 'Pédagogique' } = req.body;
    if (!titre || !details) return res.status(400).json({ error: 'titre et details requis' });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Rapports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reference VARCHAR(60) NOT NULL,
        categorie VARCHAR(60) NOT NULL,
        idEnseignant INT NULL,
        idEleve VARCHAR(60) NULL,
        titre VARCHAR(255) NOT NULL,
        details TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const ref = `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const [result] = await pool.query(
      'INSERT INTO Rapports (reference, categorie, idEnseignant, titre, details, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [ref, type, req.params.id, titre, details]
    );

    const [rows] = await pool.query('SELECT * FROM Rapports WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('createRapportEnseignant error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
