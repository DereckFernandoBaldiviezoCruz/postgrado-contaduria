const db = require('../db/db');
const manejarErrorDB = require('./dbError');

/* =========================
   PENDIENTES ÁREA ACTUAL
========================= */
async function obtenerPendientes() {
  try {
    const area = global.areaActual;

    /* TRIBUNALES */
    const [[tribunales]] = await db.query(
      `
      SELECT COUNT(*) total
      FROM recepciones r
      WHERE r.area = ?
      AND r.estado = 'Recepcionado'
      AND (
        SELECT COUNT(*)
        FROM tribunales t
        WHERE t.recepcion_id = r.id
      ) = 0
    `,
      [area],
    );

    /* SEGUIMIENTO */
    const [[seguimiento]] = await db.query(
      `
      SELECT COUNT(*) total
      FROM recepciones
      WHERE area = ?
      AND estado IN ('En revision')
    `,
      [area],
    );

    /* ASIGNACION DEFENSAS */
    const [[defensas]] = await db.query(
      `
      SELECT COUNT(*) total
      FROM recepciones
      WHERE area = ?
      AND estado = 'Aceptado'
    `,
      [area],
    );

    /* CALIFICAR */
    const [[calificaciones]] = await db.query(
      `
      SELECT COUNT(*) total
      FROM recepciones r
      LEFT JOIN calificaciones c
        ON c.recepcion_id = r.id
      WHERE r.area = ?
      AND r.estado = 'Programada'
      AND c.id IS NULL
    `,
      [area],
    );

    /* SEGUNDA INSTANCIA */
    const [[segundaInstancia]] = await db.query(
      `
      SELECT COUNT(*) total
      FROM calificaciones c
      INNER JOIN recepciones r
        ON r.id = c.recepcion_id
      WHERE r.area = ?
      AND c.estado = 'Reprobado'
      AND c.instancia = 1
    `,
      [area],
    );

    return {
      tribunales: tribunales.total,
      seguimiento: seguimiento.total,
      defensas: defensas.total,
      calificaciones: calificaciones.total,
      segundaInstancia: segundaInstancia.total,
      total:
        tribunales.total +
        seguimiento.total +
        defensas.total +
        calificaciones.total +
        segundaInstancia.total,
    };
  } catch (error) {
    console.error(error);
    throw new Error(manejarErrorDB(error));
  }
}

/* =========================
   PENDIENTES POR ÁREAS
========================= */
async function obtenerPendientesPorAreas() {
  try {
    const areas = ['MAESTRIAS', 'DIPLOMADOS'];

    const resultado = {};

    for (const area of areas) {
      const [[tribunales]] = await db.query(
        `
        SELECT COUNT(*) total
        FROM recepciones r
        WHERE r.area = ?
        AND r.estado = 'Recepcionado'
        AND (
          SELECT COUNT(*)
          FROM tribunales t
          WHERE t.recepcion_id = r.id
        ) = 0
      `,
        [area],
      );

      const [[seguimiento]] = await db.query(
        `
        SELECT COUNT(*) total
        FROM recepciones
        WHERE area = ?
        AND estado IN ('En revision')
      `,
        [area],
      );

      const [[defensas]] = await db.query(
        `
        SELECT COUNT(*) total
        FROM recepciones
        WHERE area = ?
        AND estado = 'Aceptado'
      `,
        [area],
      );

      const [[calificaciones]] = await db.query(
        `
        SELECT COUNT(*) total
        FROM recepciones r
        LEFT JOIN calificaciones c
          ON c.recepcion_id = r.id
        WHERE r.area = ?
        AND r.estado = 'Programada'
        AND c.id IS NULL
      `,
        [area],
      );

      const [[segundaInstancia]] = await db.query(
        `
        SELECT COUNT(*) total
        FROM calificaciones c
        INNER JOIN recepciones r
          ON r.id = c.recepcion_id
        WHERE r.area = ?
        AND c.estado = 'Reprobado'
        AND c.instancia = 1
      `,
        [area],
      );

      resultado[area] = {
        tribunales: tribunales.total,
        seguimiento: seguimiento.total,
        defensas: defensas.total,
        calificaciones: calificaciones.total,
        segundaInstancia: segundaInstancia.total,
      };
    }

    return resultado;
  } catch (error) {
    console.error(error);
    throw new Error(manejarErrorDB(error));
  }
}

module.exports = {
  obtenerPendientes,
  obtenerPendientesPorAreas,
};
