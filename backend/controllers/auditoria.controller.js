const db = require('../db/db');

/* =========================
   LISTAR AUDITORIA (PAGINADO)
========================= */

async function listar(pagina = 1, limite = 20) {
  const offset = (pagina - 1) * limite;

  const baseSql = `
    FROM auditoria a
    LEFT JOIN usuarios u ON u.id = a.usuario_id
  `;

  // 🔹 DATA
  const [rows] = await db.query(
    `
    SELECT
      a.id,
      a.tabla,
      a.registro_id,
      a.accion,
      a.descripcion,
      a.fecha,
      u.usuario
    ${baseSql}
    ORDER BY a.fecha DESC
    LIMIT ? OFFSET ?
    `,
    [limite, offset],
  );

  // 🔹 TOTAL REAL
  const [[total]] = await db.query(`SELECT COUNT(*) total ${baseSql}`);

  return {
    data: rows,
    total: total.total,
  };
}

/* =========================
   FILTRAR (PAGINADO REAL)
========================= */

async function filtrar(filtro, pagina = 1, limite = 20) {
  const offset = (pagina - 1) * limite;

  let baseSql = `
    FROM auditoria a
    LEFT JOIN usuarios u ON u.id = a.usuario_id
    WHERE 1=1
  `;

  const params = [];

  if (filtro.usuario) {
    baseSql += ` AND u.usuario LIKE ?`;
    params.push(`%${filtro.usuario}%`);
  }

  if (filtro.tabla) {
    baseSql += ` AND a.tabla LIKE ?`;
    params.push(`%${filtro.tabla}%`);
  }

  if (filtro.accion) {
    baseSql += ` AND a.accion = ?`;
    params.push(filtro.accion);
  }

  // 🔹 DATA
  const [rows] = await db.query(
    `
    SELECT
      a.id,
      a.tabla,
      a.registro_id,
      a.accion,
      a.descripcion,
      a.fecha,
      u.usuario
    ${baseSql}
    ORDER BY a.fecha DESC
    LIMIT ? OFFSET ?
    `,
    [...params, limite, offset],
  );

  // 🔹 TOTAL FILTRADO (CLAVE 🔥)
  const [[total]] = await db.query(`SELECT COUNT(*) total ${baseSql}`, params);

  return {
    data: rows,
    total: total.total,
  };
}

module.exports = {
  listar,
  filtrar,
};
