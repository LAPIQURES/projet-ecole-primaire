const pool = require('../database/db');

async function checkSchema() {
  try {
    const conn = await pool.getConnection();
    
    // Check Eleve table
    const [eleveFields] = await conn.query('DESC Eleve');
    console.log('\n📋 TABLE ELEVE:');
    eleveFields.forEach(f => console.log(`  - ${f.Field}: ${f.Type}`));
    
    // Check Note table
    const [noteFields] = await conn.query('DESC Note');
    console.log('\n📋 TABLE NOTE:');
    noteFields.forEach(f => console.log(`  - ${f.Field}: ${f.Type}`));
    
    // Check Sequence table
    const [seqFields] = await conn.query('DESC Sequence');
    console.log('\n📋 TABLE SEQUENCE:');
    seqFields.forEach(f => console.log(`  - ${f.Field}: ${f.Type}`));
    
    // Check Examen table if exists
    try {
      const [examFields] = await conn.query('DESC Examen');
      console.log('\n📋 TABLE EXAMEN:');
      examFields.forEach(f => console.log(`  - ${f.Field}: ${f.Type}`));
    } catch (e) {
      console.log('\n❌ Table EXAMEN n\'existe pas');
    }
    
    conn.release();
    pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkSchema();
