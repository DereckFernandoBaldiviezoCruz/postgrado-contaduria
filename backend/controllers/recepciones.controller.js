const db = require('../db/db');
const registrarAuditoria = require('./auditoria');
const manejarErrorDB = require('./dbError');

/* =========================
   LISTAR
========================= */
async function listar(buscar = '') {
  try {
    const area = global.areaActual;

    let sql = `
      SELECT
        e.id AS estudiante_id,
        e.nombre_completo AS estudiante,

        r.id AS recepcion_id,
        r.tema,
        r.objetivo,
        r.observaciones,
        r.fecha_recepcion,
        r.estado,
        r.tutor_id,
        r.programa_id,

        p.nombre AS programa,

        t.nombre_completo AS tutor

      FROM estudiantes e

      LEFT JOIN recepciones r 
        ON r.id = (
          SELECT r2.id
          FROM recepciones r2
          INNER JOIN programas p2 ON p2.id = r2.programa_id
          WHERE r2.estudiante_id = e.id
          AND p2.area = ?
          AND r2.estado NOT IN ('Finalizado','Rechazado')
          ORDER BY r2.id DESC
          LIMIT 1
        )

      LEFT JOIN programas p 
        ON p.id = r.programa_id

      LEFT JOIN tutores t
        ON t.id = r.tutor_id
    `;

    let params = [area];

    if (buscar) {
      sql += `
        WHERE e.estado='Activo'
        AND (
          e.nombre_completo LIKE ?
          OR p.nombre LIKE ?
          OR r.tema LIKE ?
          OR t.nombre_completo LIKE ?
        )
      `;

      const filtro = `%${buscar}%`;
      params = [filtro, filtro, filtro, filtro];
    } else {
      sql += ` WHERE e.estado='Activo'`;
    }

    sql += ` ORDER BY e.nombre_completo ASC`;

    const [rows] = await db.query(sql, [area, ...params]);
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error(manejarErrorDB(error));
  }
}

/* =========================
   CREAR
========================= */
async function crear(data, usuario_id) {
  try {
    const {
      estudiante_id,
      tutor_id,
      programa_id,
      tema,
      objetivo,
      observaciones,
      fecha_recepcion,
    } = data;

    const [result] = await db.query(
      `
      INSERT INTO recepciones
      (estudiante_id,programa_id,tutor_id,tema,objetivo,observaciones,fecha_recepcion,estado)
      VALUES (?,?,?,?,?,?,?,'Recepcionado')
    `,
      [
        estudiante_id,
        programa_id,
        tutor_id || null,
        tema,
        objetivo,
        observaciones,
        fecha_recepcion,
      ],
    );

    await registrarAuditoria(
      'recepciones',
      result.insertId,
      'INSERT',
      `Se registró recepción de tema "${tema}"`,
      usuario_id,
    );

    return { id: result.insertId };
  } catch (error) {
    console.error(error);
    throw new Error(manejarErrorDB(error));
  }
}

/* =========================
   EDITAR
========================= */
async function editar(id, data, usuario_id) {
  try {
    await db.query(
      `
      UPDATE recepciones SET
        programa_id=?,
        tutor_id=?,
        tema=?,
        objetivo=?,
        observaciones=?,
        fecha_recepcion=?
      WHERE id=?
    `,
      [
        data.programa_id,
        data.tutor_id || null,
        data.tema,
        data.objetivo,
        data.observaciones,
        data.fecha_recepcion,
        id,
      ],
    );

    await registrarAuditoria(
      'recepciones',
      id,
      'UPDATE',
      `Se editó recepción "${data.tema}"`,
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    console.error(error);
    throw new Error(manejarErrorDB(error));
  }
}

/* =========================
   CAMBIAR ESTADO + FECHA FINAL
========================= */
async function cambiarEstado(id, estado, usuario_id) {
  try {
    if (estado === 'Finalizado' || estado === 'Rechazado') {
      await db.query(
        `
        UPDATE recepciones
        SET estado=?, fecha_finalizacion=NOW()
        WHERE id=?
      `,
        [estado, id],
      );
    } else {
      await db.query(
        `
        UPDATE recepciones
        SET estado=?
        WHERE id=?
      `,
        [estado, id],
      );
    }

    await registrarAuditoria(
      'recepciones',
      id,
      'UPDATE',
      `Se cambió estado de recepción a ${estado}`,
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    console.error(error);
    throw new Error(manejarErrorDB(error));
  }
}

/* =========================
   HISTORIAL RECEPCIONES
========================= */
async function historial(estudiante_id) {
  try {
    const [rows] = await db.query(
      `
      SELECT
        r.id,
        r.tema,
        r.objetivo,
        r.observaciones,
        r.fecha_recepcion,
        r.fecha_finalizacion,
        r.estado,
        t.nombre_completo AS tutor
      FROM recepciones r
      LEFT JOIN tutores t ON t.id = r.tutor_id
      WHERE r.estudiante_id=?
      ORDER BY r.id DESC
    `,
      [estudiante_id],
    );

    return rows;
  } catch (error) {
    console.error(error);
    throw new Error(manejarErrorDB(error));
  }
}

module.exports = {
  listar,
  crear,
  editar,
  cambiarEstado,
  historial,
};
