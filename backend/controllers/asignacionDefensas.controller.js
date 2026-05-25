const db = require('../db/db');
const auditoria = require('./auditoria');
const manejarErrorDB = require('./dbError');

async function obtenerDefensas(buscar = '') {
  try {
    const area = global.areaActual;

    let sql = `
SELECT 
  r.id AS recepcion_id,
  e.id AS estudiante_id,
  e.nombre_completo AS estudiante,
  p.nombre AS programa,
  r.tema,
  DATE_FORMAT(r.fecha_recepcion,'%Y-%m-%d') AS fecha_recepcion,
  r.observaciones,
  r.estado,
  r.docente_id AS tutor_id,
  d.nombre_completo AS tutor,
  df.id AS defensa_id,
  IFNULL(DATE_FORMAT(df.fecha,'%Y-%m-%d'),'-') AS fecha_defensa
FROM recepciones r
JOIN estudiantes e ON e.id = r.estudiante_id
LEFT JOIN programas p ON p.id = r.programa_id
LEFT JOIN docentes d ON d.id = r.docente_id
LEFT JOIN defensas df ON df.recepcion_id = r.id
WHERE r.estado IN ('Aceptado','Programada')
AND p.area = ?
`;

    let params = [area];

    if (buscar) {
      sql += `
      AND ( 
        e.nombre_completo LIKE ?
        OR r.tema LIKE ?
        OR p.nombre LIKE ?
        OR d.nombre_completo LIKE ?
      )
      `;
      const filtro = `%${buscar}%`;
      params.push(filtro, filtro, filtro, filtro);
    }

    sql += ` ORDER BY
      CASE
      WHEN df.fecha IS NULL THEN 0
      ELSE 1
      END,
      e.nombre_completo ASC`;

    const [rows] = await db.query(sql, params);
    return rows;
  } catch (error) {
    manejarErrorDB(error);
  }
}

async function asignarFechaDefensa(data, usuario_id) {
  try {
    const { recepcion_id, fecha } = data;

    const [existe] = await db.query(
      'SELECT id FROM defensas WHERE recepcion_id=?',
      [recepcion_id],
    );

    if (existe.length > 0) {
      await db.query('UPDATE defensas SET fecha=? WHERE recepcion_id=?', [
        fecha,
        recepcion_id,
      ]);
    } else {
      await db.query('INSERT INTO defensas (recepcion_id,fecha) VALUES (?,?)', [
        recepcion_id,
        fecha,
      ]);
    }

    await db.query("UPDATE recepciones SET estado='Programada' WHERE id=?", [
      recepcion_id,
    ]);

    await auditoria(
      'defensas',
      recepcion_id,
      'PROGRAMAR DEFENSA',
      `Se programó defensa para la recepción ${recepcion_id} en fecha ${fecha}`,
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    manejarErrorDB(error);
  }
}

module.exports = {
  obtenerDefensas,
  asignarFechaDefensa,
};
