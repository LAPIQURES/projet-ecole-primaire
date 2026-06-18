const pool = require('../database/db');

async function main() {
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'Eleve'
       AND COLUMN_NAME IN ('photoURL', 'photo_url')`
  );

  const columnSet = new Set(cols.map((c) => c.COLUMN_NAME));
  const hasPhotoURL = columnSet.has('photoURL');
  const hasPhotoSnake = columnSet.has('photo_url');

  if (!hasPhotoURL) {
    console.log("ℹ️  Colonne 'photoURL' absente → ajout...");
    await pool.query(
      "ALTER TABLE Eleve ADD COLUMN photoURL VARCHAR(512) DEFAULT NULL COMMENT 'URL de la photo de profil'"
    );
    console.log("✅ Colonne 'photoURL' ajoutée.");
  } else {
    console.log("✅ Colonne 'photoURL' déjà présente.");
  }

  if (hasPhotoSnake) {
    console.log("ℹ️  Colonne legacy 'photo_url' détectée → copie des valeurs vers 'photoURL'...");
    const [result] = await pool.query(
      `UPDATE Eleve
       SET photoURL = photo_url
       WHERE (photoURL IS NULL OR photoURL = '')
         AND photo_url IS NOT NULL
         AND photo_url <> ''`
    );
    console.log(`✅ Copie terminée (lignes affectées: ${result.affectedRows ?? 0}).`);
  }
}

main()
  .then(() => process.exitCode = 0)
  .catch((err) => {
    console.error('❌ Migration photoURL échouée:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try { await pool.end(); } catch { /* ignore */ }
  });
