/**
 * seed_roles.js
 * Crée les comptes de test : Directeur (judes/1234) et Intendant (jud/1234)
 * Usage: node backend/scripts/seed_roles.js
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecole2026',
};

async function seed() {
  console.log('🔌 Connexion à la base de données locale...');
  const conn = await mysql.createConnection(dbConfig);
  console.log('✅ Connecté !');

  const password = '1234';
  const hash = await bcrypt.hash(password, 10);

  const comptes = [
    { username: 'judes', nom: 'Directeur Judes', typeAdmin: 5, role: 'directeur' },
    { username: 'jud',   nom: 'Intendant Jud',   typeAdmin: 6, role: 'intendant' },
  ];

  for (const compte of comptes) {
    // Vérifie si le compte existe déjà
    const [existing] = await conn.query('SELECT ID FROM Admin WHERE username = ? LIMIT 1', [compte.username]);
    if (existing.length > 0) {
      // Met à jour le mot de passe et le type
      await conn.query(
        'UPDATE Admin SET password = ?, typeAdmin = ?, nom = ?, updatedAt = NOW() WHERE username = ?',
        [hash, compte.typeAdmin, compte.nom, compte.username]
      );
      console.log(`♻️  Compte existant mis à jour : ${compte.username} (${compte.role})`);
    } else {
      // Insère le nouveau compte
      await conn.query(
        'INSERT INTO Admin (username, password, typeAdmin, nom, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [compte.username, hash, compte.typeAdmin, compte.nom]
      );
      console.log(`✅ Compte créé : ${compte.username} / ${password} → rôle: ${compte.role}`);
    }
  }

  await conn.end();
  console.log('\n🎉 Seeding terminé !');
  console.log('   → Directeur : login=judes | password=1234');
  console.log('   → Intendant : login=jud   | password=1234');
}

seed().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
