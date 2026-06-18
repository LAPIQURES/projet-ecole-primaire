const pool = require('../database/db');

const cache = new Map();

async function getTableColumns(tableName) {
  if (cache.has(tableName)) return cache.get(tableName);

  const [rows] = await pool.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?`,
    [tableName]
  );

  const columns = new Set(rows.map((row) => row.COLUMN_NAME));
  cache.set(tableName, columns);
  return columns;
}

function selectColumns(alias, columns, names) {
  return names
    .map((name) => (columns.has(name) ? `${alias}.${name} AS ${name}` : `NULL AS ${name}`))
    .join(', ');
}

module.exports = { getTableColumns, selectColumns };