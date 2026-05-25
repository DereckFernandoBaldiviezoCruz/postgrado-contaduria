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
        r.docente_id,
        r.programa_id,

        p.nombre AS programa,
        d.nombre_completo AS tutor

      FROM estudiantes e

      INNER JOIN estudiante_area ea 
        ON ea.estudiante_id = e.id

      LEFT JOIN recepciones r 
        ON r.id = (
          SELECT r2.id
          FROM recepciones r2
          WHERE r2.estudiante_id = e.id
          AND r2.area = ?
          ORDER BY r2.id DESC
          LIMIT 1
        )

      LEFT JOIN programas p 
        ON p.id = r.programa_id

      LEFT JOIN docentes d
        ON d.id = r.docente_id

      WHERE ea.area = ?
      AND ea.estado = 'Activo'

      AND (
        r.id IS NULL
        OR r.estado = 'Recepcionado'
        OR r.estado = 'Finalizado'
        OR r.estado = 'Rechazado'
      )
    `;

    let params = [area, area];

    if (buscar) {
      sql += `
        AND (
          e.nombre_completo LIKE ?
          OR p.nombre LIKE ?
          OR r.tema LIKE ?
          OR d.nombre_completo LIKE ?
        )
      `;

      const filtro = `%${buscar}%`;
      params.push(filtro, filtro, filtro, filtro);
    }

    sql += ` ORDER BY e.nombre_completo ASC`;

    const [rows] = await db.query(sql, params);

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
    const area = global.areaActual;

    const {
      estudiante_id,
      docente_id,
      programa_id,
      tema,
      objetivo,
      observaciones,
      fecha_recepcion,
    } = data;

    // 🔥 VALIDAR QUE EL ESTUDIANTE PERTENECE AL AREA
    const [[existe]] = await db.query(
      `
      SELECT id 
      FROM estudiante_area
      WHERE estudiante_id=? AND area=? AND estado='Activo'
    `,
      [estudiante_id, area],
    );

    if (!existe) {
      throw new Error('El estudiante no pertenece a esta área');
    }

    const [result] = await db.query(
      `
      INSERT INTO recepciones
      (estudiante_id,programa_id,docente_id,tema,objetivo,observaciones,fecha_recepcion,estado, area)
      VALUES (?,?,?,?,?,?,?,'Recepcionado',?)
    `,
      [
        estudiante_id,
        programa_id,
        docente_id || null,
        tema,
        objetivo,
        observaciones,
        fecha_recepcion,
        area,
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
    throw error; // 🔥 IMPORTANTE
  }
}

/* =========================
   EDITAR
========================= */
async function editar(id, data, usuario_id) {
  try {
    const area = global.areaActual;
    await db.query(
      `
      UPDATE recepciones SET
        programa_id=?,
        docente_id=?,
        tema=?,
        objetivo=?,
        observaciones=?,
        fecha_recepcion=?
      WHERE id=? AND area=?
    `,
      [
        data.programa_id,
        data.docente_id || null,
        data.tema,
        data.objetivo,
        data.observaciones,
        data.fecha_recepcion,
        id,
        area,
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
    const area = global.areaActual;
    if (estado === 'Finalizado' || estado === 'Rechazado') {
      await db.query(
        `
        UPDATE recepciones
        SET estado=?, fecha_finalizacion=NOW()
        WHERE id=? AND area=?
      `,
        [estado, id, area],
      );
    } else {
      await db.query(
        `
        UPDATE recepciones
        SET estado=?
        WHERE id=? AND area=?
      `,
        [estado, id, area],
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
    const area = global.areaActual;

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
    d.nombre_completo AS tutor

  FROM recepciones r

  LEFT JOIN docentes d 
    ON d.id = r.docente_id

  WHERE r.estudiante_id = ?
  AND r.area = ?

  ORDER BY r.id DESC
  `,
      [estudiante_id, area],
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
