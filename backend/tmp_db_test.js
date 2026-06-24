const pool = require('./database/db');
(async ()=>{
  try{
    const [rows] = await pool.query('SELECT 1+1 AS two');
    console.log('DB OK', rows);
  }catch(e){
    console.error('DB ERROR', e && e.message, e);
  }finally{
    process.exit(0);
  }
})();