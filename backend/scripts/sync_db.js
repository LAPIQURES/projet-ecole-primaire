const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables (which currently point to the remote DB)
const envPath = path.resolve(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

const remoteConfig = {
  host: process.env.DB_HOST || '163.123.183.89',
  port: Number(process.env.DB_PORT) || 17705,
  user: process.env.DB_USER || 'ecole',
  password: process.env.DB_PASSWORD || 'peda2026',
  database: process.env.DB_NAME || 'ecole2026',
  ssl: false
};

const localConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '', // Default blank password for standard local installs
};

async function runSync() {
  console.log('🔌 Connexion à la base de données en ligne...');
  console.log(`Hôte: ${remoteConfig.host}:${remoteConfig.port}`);
  
  let remoteConn;
  try {
    remoteConn = await mysql.createConnection(remoteConfig);
    console.log('✅ Connecté à la base de données en ligne !');
  } catch (err) {
    console.error('❌ Impossible de se connecter à la base de données en ligne :', err.message);
    process.exit(1);
  }

  try {
    // 1. Get list of tables (Filter to keep only PascalCase main tables to avoid Windows case sensitivity crashes)
    const [tablesResult] = await remoteConn.query('SHOW TABLES');
    const tableKey = tablesResult.length > 0 ? Object.keys(tablesResult[0])[0] : '';
    let tables = tablesResult.map(row => row[tableKey]);
    
    // On Windows, MySQL is case insensitive. The remote DB is Linux and has both "Cours" and "cours".
    // We only keep tables starting with an Uppercase letter to avoid conflicts.
    tables = tables.filter(t => /^[A-Z]/.test(t));
    
    console.log(`📋 Tables principales trouvées (${tables.length}) :`, tables.join(', '));

    const dumpData = [];
    dumpData.push(`CREATE DATABASE IF NOT EXISTS \`${remoteConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    dumpData.push(`USE \`${remoteConfig.database}\`;\n`);

    const tableData = [];

    // 2. Fetch schema and rows for each table
    for (const table of tables) {
      console.log(`🔄 Extraction de la table : ${table}...`);
      
      // Get Create Table statement
      const [[createResult]] = await remoteConn.query(`SHOW CREATE TABLE \`${table}\``);
      const createSql = createResult['Create Table'];
      
      // Get all rows
      const [rows] = await remoteConn.query(`SELECT * FROM \`${table}\``);
      
      tableData.push({
        name: table,
        createSql,
        rows
      });

      // Append to the SQL dump output
      dumpData.push(`DROP TABLE IF EXISTS \`${table}\`;`);
      dumpData.push(createSql + ';');
      
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]).map(col => `\`${col}\``).join(', ');
        const valueStrings = [];
        
        for (const row of rows) {
          const values = Object.values(row).map(val => {
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number') return val;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return `'${String(val).replace(/(['\\])/g, '\\$1')}'`;
          });
          valueStrings.push(`(${values.join(', ')})`);
        }
        
        dumpData.push(`INSERT INTO \`${table}\` (${columns}) VALUES \n${valueStrings.join(',\n')};\n`);
      }
    }

    // Write dump file as backup
    const dumpPath = path.resolve(__dirname, '..', '..', 'local_dump.sql');
    fs.writeFileSync(dumpPath, dumpData.join('\n'));
    console.log(`💾 Sauvegarde de secours créée : ${dumpPath}`);

    // 3. Connect to local MySQL and restore
    console.log('\n🔌 Connexion au serveur MySQL local...');
    let localConn;
    try {
      localConn = await mysql.createConnection(localConfig);
      console.log('✅ Connecté au serveur MySQL local !');
    } catch (err) {
      console.log('⚠️  Impossible de se connecter au MySQL local (sans mot de passe).');
      console.log('   Si ton MySQL local nécessite un mot de passe ou un port différent,');
      console.log('   tu peux importer manuellement le fichier "local_dump.sql" généré.');
      console.log('   Erreur locale :', err.message);
      return;
    }

    try {
      console.log(`🛠️ Récréation de la base de données locale \`${remoteConfig.database}\`...`);
      await localConn.query(`CREATE DATABASE IF NOT EXISTS \`${remoteConfig.database}\``);
      await localConn.query(`USE \`${remoteConfig.database}\``);

      // Disable foreign keys check for bulk import
      await localConn.query('SET FOREIGN_KEY_CHECKS = 0');

      for (const table of tableData) {
        console.log(`📥 Importation locale de la table : ${table.name} (${table.rows.length} lignes)...`);
        await localConn.query(`DROP TABLE IF EXISTS \`${table.name}\``);
        await localConn.query(table.createSql);
        
        if (table.rows.length > 0) {
          const columns = Object.keys(table.rows[0]).map(col => `\`${col}\``).join(', ');
          
          // Insert in chunks of 100 rows to prevent packet size limits
          const chunkSize = 100;
          for (let i = 0; i < table.rows.length; i += chunkSize) {
            const chunk = table.rows.slice(i, i + chunkSize);
            const valueStrings = [];
            const queryParams = [];
            
            for (const row of chunk) {
              const placeholders = Object.values(row).map(() => '?').join(', ');
              valueStrings.push(`(${placeholders})`);
              queryParams.push(...Object.values(row).map(v => {
                if (v instanceof Date) {
                  return v.toISOString().slice(0, 19).replace('T', ' ');
                }
                return v;
              }));
            }
            
            const insertSql = `INSERT INTO \`${table.name}\` (${columns}) VALUES ${valueStrings.join(', ')}`;
            await localConn.query(insertSql, queryParams);
          }
        }
      }

      await localConn.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('🎉 Synchronisation locale réussie avec succès !');

      // 4. Update the project .env to point to localhost
      console.log('✍️ Mise à jour du fichier .env pour pointer sur le local...');
      const localEnvContent = [
        'DB_HOST=127.0.0.1',
        'DB_PORT=3306',
        'DB_NAME=ecole2026',
        'DB_USER=root',
        'DB_PASSWORD='
      ].join('\n');
      fs.writeFileSync(envPath, localEnvContent);
      console.log('✅ Fichier .env mis à jour avec les accès locaux (localhost:3306).');

    } catch (localErr) {
      console.error('❌ Erreur durant la restauration locale :', localErr.message);
    } finally {
      await localConn.end();
    }

  } catch (err) {
    console.error('❌ Erreur générale durant la synchronisation :', err);
  } finally {
    await remoteConn.end();
    console.log('🔌 Connexions fermées.');
  }
}

runSync();
