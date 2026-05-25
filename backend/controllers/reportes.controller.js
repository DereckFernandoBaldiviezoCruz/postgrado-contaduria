const { cargaDocentes } = require('./defensas.controller');
const db = require('../db/db');
const dbError = require('./dbError');

/* =========================
   RESUMEN GENERAL
========================= */
async function resumenGeneral(gestion, mes, programa) {
  try {
    const area = global.areaActual;

    let sql = `
      SELECT
        COUNT(*) total,

        IFNULL(SUM(
          CASE WHEN r.estado = 'Recepcionado'
          THEN 1 ELSE 0 END
        ),0) sin_tribunal,

        IFNULL(SUM(
          CASE WHEN r.estado = 'En revision'
          THEN 1 ELSE 0 END
        ),0) en_revision,

        IFNULL(SUM(
          CASE WHEN r.estado = 'Rechazado'
          THEN 1 ELSE 0 END
        ),0) rechazados,

        IFNULL(SUM(
          CASE WHEN r.estado = 'Finalizado'
          THEN 1 ELSE 0 END
        ),0) finalizados,

        IFNULL(SUM(
          CASE WHEN r.estado = 'Aceptado'
          THEN 1 ELSE 0 END
        ),0) sin_fecha_defensa,

        IFNULL(
          SUM(
            CASE
              WHEN r.estado = 'Programada'
              AND c.id IS NULL
              THEN 1
              ELSE 0
            END
          ),0
        ) pendientes_calificacion

      FROM recepciones r
      JOIN programas p ON p.id = r.programa_id
      LEFT JOIN calificaciones c
      ON c.recepcion_id = r.id

      WHERE p.area = ?
    `;

    const params = [area];

    if (gestion !== 'TODOS') {
      sql += ` AND YEAR(r.fecha_recepcion) = ? `;
      params.push(gestion);
    }

    if (mes !== 'TODOS') {
      sql += ` AND MONTH(r.fecha_recepcion) = ? `;
      params.push(mes);
    }

    if (programa !== 'TODOS') {
      sql += ` AND p.id = ? `;
      params.push(programa);
    }

    const [rows] = await db.query(sql, params);

    return rows[0];
  } catch (error) {
    console.error(error);
    throw dbError(error);
  }
}

/* =========================
   RECEPCIONES POR MES
========================= */
async function recepcionesPorMes(gestion) {
  try {
    const area = global.areaActual;

    let sql = `
      SELECT 
        MONTH(r.fecha_recepcion) AS mes,
        YEAR(r.fecha_recepcion) AS anio,
        COUNT(*) total

      FROM recepciones r
      JOIN programas p ON p.id = r.programa_id

      WHERE p.area = ?
    `;

    const params = [area];

    if (gestion !== 'TODOS') {
      sql += ` AND YEAR(r.fecha_recepcion) = ? `;
      params.push(gestion);
    }

    sql += `
      GROUP BY anio, mes
      ORDER BY anio ASC, mes ASC
    `;

    const [rows] = await db.query(sql, params);

    return rows;
  } catch (error) {
    throw dbError(error);
  }
}

/* =========================
   POR PROGRAMA
========================= */
async function porPrograma(gestion, mes) {
  try {
    const area = global.areaActual;

    let joinFiltros = '';
    const params = [];

    if (gestion !== 'TODOS') {
      joinFiltros += ' AND YEAR(r.fecha_recepcion) = ? ';
      params.push(gestion);
    }

    if (mes !== 'TODOS') {
      joinFiltros += ' AND MONTH(r.fecha_recepcion) = ? ';
      params.push(mes);
    }

    const [rows] = await db.query(
      `
      SELECT
        p.nombre,
        COUNT(r.id) total

      FROM programas p

      LEFT JOIN recepciones r
        ON r.programa_id = p.id
        ${joinFiltros}

      WHERE p.area = ?

      GROUP BY p.id, p.nombre
      ORDER BY total DESC
    `,
      [...params, area],
    );

    return rows;
  } catch (error) {
    throw dbError(error);
  }
}

async function resumenPrograma(gestion, mes, programa) {
  try {
    const area = global.areaActual;

    let sql = `
      SELECT
        p.id,
        p.nombre,

        p.inscritos,

        COUNT(r.id) recepciones,

        SUM(
          CASE
            WHEN r.estado = 'Finalizado'
            THEN 1
            ELSE 0
          END
        ) defendidos,

        SUM(
          CASE
            WHEN r.estado NOT IN ('Finalizado', 'Rechazado')
            THEN 1
            ELSE 0
          END
        ) pendientes,

        SUM(
          CASE
            WHEN r.estado = 'Rechazado'
            THEN 1
            ELSE 0
          END
        ) rechazados,

        SUM(
  CASE
    WHEN c.suma >= 66
    THEN 1
    ELSE 0
  END
) aprobados,

        ROUND(
          AVG(
            CASE
              WHEN r.fecha_finalizacion IS NOT NULL
              THEN TIMESTAMPDIFF(
  DAY,
  r.fecha_recepcion,
  r.fecha_finalizacion
)
            END
          ),
          1
        ) tiempo_promedio,

        ROUND(
  (
    SUM(
      CASE
        WHEN c.suma >= 66
        THEN 1
        ELSE 0
      END
    )
    / NULLIF(COUNT(r.id),0)
  ) * 100,
  1
) eficiencia

      FROM programas p

      LEFT JOIN recepciones r
      ON r.programa_id = p.id

      LEFT JOIN calificaciones c
ON c.recepcion_id = r.id

      WHERE p.area = ?
    `;

    const params = [area];

    if (gestion !== 'TODOS') {
      sql += ` AND YEAR(r.fecha_recepcion) = ? `;
      params.push(gestion);
    }

    if (mes !== 'TODOS') {
      sql += ` AND MONTH(r.fecha_recepcion) = ? `;
      params.push(mes);
    }

    if (programa !== 'TODOS') {
      sql += ` AND p.id = ? `;
      params.push(programa);
    }

    sql += `
      GROUP BY p.id
      ORDER BY defendidos DESC
    `;

    const [rows] = await db.query(sql, params);

    return rows;
  } catch (error) {
    console.error(error);
    throw dbError(error);
  }
}

module.exports = {
  resumenGeneral,
  recepcionesPorMes,
  porPrograma,
  resumenPrograma,
  cargaDocentes,
};
