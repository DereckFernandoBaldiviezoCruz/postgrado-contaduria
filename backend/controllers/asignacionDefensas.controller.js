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
      t.id AS tutor_id,
      t.nombre_completo AS tutor,
      d.id AS defensa_id,
      IFNULL(DATE_FORMAT(d.fecha,'%Y-%m-%d'),'-') AS fecha_defensa
    FROM recepciones r
    JOIN estudiantes e ON e.id = r.estudiante_id
    LEFT JOIN programas p ON p.id = r.programa_id
    LEFT JOIN tutores t ON t.id = r.tutor_id
    LEFT JOIN defensas d ON d.recepcion_id = r.id
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
        OR t.nombre_completo LIKE ?
      )
      `;
      const filtro = `%${buscar}%`;
      params.push(filtro, filtro, filtro, filtro);
    }

    sql += ` ORDER BY
      CASE
      WHEN d.fecha IS NULL THEN 0
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
