const { cargaDocentes } = require('./defensas.controller');
const db = require('../db/db');
const dbError = require('./dbError');

/* =========================
   RESUMEN GENERAL
========================= */
async function resumenGeneral() {
  try {
    const area = global.areaActual;

    const [rows] = await db.query(
      `
      SELECT
        COUNT(*) total,

        SUM(CASE WHEN r.estado = 'Recepcionado' THEN 1 ELSE 0 END) sin_tribunal,
        SUM(CASE WHEN r.estado = 'En revision' THEN 1 ELSE 0 END) en_revision,
        SUM(CASE WHEN r.estado = 'Aceptado' THEN 1 ELSE 0 END) aceptados,
        SUM(CASE WHEN r.estado = 'Rechazado' THEN 1 ELSE 0 END) rechazados,
        SUM(CASE WHEN r.estado = 'Programada' THEN 1 ELSE 0 END) programados,
        SUM(CASE WHEN r.estado IN ('Finalizado','Rechazado') THEN 1 ELSE 0 END) finalizados,
        SUM(CASE WHEN r.estado = 'Aceptado' THEN 1 ELSE 0 END) AS sin_fecha_defensa,

        SUM(
          CASE 
            WHEN r.estado = 'Programada' AND c.id IS NULL THEN 1 
            ELSE 0 
          END
        ) pendientes_calificacion

      FROM recepciones r
      JOIN programas p ON p.id = r.programa_id
      LEFT JOIN calificaciones c ON c.recepcion_id = r.id
      WHERE p.area = ?
    `,
      [area],
    );

    return rows[0];
  } catch (error) {
    throw dbError(error);
  }
}

/* =========================
   RECEPCIONES POR MES
========================= */
async function recepcionesPorMes() {
  try {
    const area = global.areaActual;

    const [rows] = await db.query(
      `
      SELECT 
        MONTH(r.fecha_recepcion) AS mes,
        YEAR(r.fecha_recepcion) AS anio,
        COUNT(*) total
      FROM recepciones r
      JOIN programas p ON p.id = r.programa_id
      WHERE p.area = ?
      GROUP BY anio, mes
      ORDER BY anio ASC, mes ASC
    `,
      [area],
    );

    return rows;
  } catch (error) {
    throw dbError(error);
  }
}

/* =========================
   POR PROGRAMA
========================= */
async function porPrograma() {
  try {
    const area = global.areaActual;

    const [rows] = await db.query(
      `
      SELECT
        p.nombre,
        COUNT(r.id) total
      FROM programas p
      LEFT JOIN recepciones r ON r.programa_id = p.id
      WHERE p.area = ?
      GROUP BY p.id
      ORDER BY total DESC
    `,
      [area],
    );

    return rows;
  } catch (error) {
    throw dbError(error);
  }
}

module.exports = {
  resumenGeneral,
  recepcionesPorMes,
  porPrograma,
  cargaDocentes,
};
