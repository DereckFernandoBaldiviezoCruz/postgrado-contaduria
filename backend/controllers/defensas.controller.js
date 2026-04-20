const db = require('../db/db');
const registrarAuditoria = require('./auditoria');
const manejarErrorDB = require('./dbError');

async function listarDefensas() {
  try {
    const area = global.areaActual;

    const [rows] = await db.query(
      `
      SELECT
        r.id recepcion_id,
        e.nombre_completo estudiante,
        p.nombre programa,
        r.tema,
        t.nombre_completo tutor,
        r.estado,
        COUNT(tr.id) tribunales_asignados
      FROM recepciones r
      JOIN estudiantes e ON e.id=r.estudiante_id
      LEFT JOIN programas p ON p.id=r.programa_id
      LEFT JOIN tutores t ON t.id=r.tutor_id
      LEFT JOIN tribunales tr ON tr.recepcion_id=r.id
      WHERE r.estado NOT IN ('Finalizado','Rechazado')
      AND p.area = ?
      GROUP BY r.id
      ORDER BY e.nombre_completo
      `,
      [area],
    );

    return rows;
  } catch (error) {
    manejarErrorDB(error);
  }
}

async function cargaDocentes() {
  try {
    const [rows] = await db.query(`
      SELECT
        d.id,
        d.nombre_completo,
        SUM(CASE WHEN r.estado NOT IN ('Finalizado','Rechazado') THEN 1 ELSE 0 END) pendientes,
        SUM(CASE WHEN r.estado IN ('Finalizado','Rechazado') THEN 1 ELSE 0 END) finalizados,
        COUNT(tr.id) total
      FROM docentes d
      LEFT JOIN tribunales tr ON tr.docente_id=d.id
      LEFT JOIN recepciones r ON r.id=tr.recepcion_id
      WHERE d.estado = 'Activo'
      GROUP BY d.id
      ORDER BY total ASC
    `);

    return rows;
  } catch (error) {
    manejarErrorDB(error);
  }
}

async function obtenerTribunal(recepcion_id) {
  try {
    const [rows] = await db.query(
      'SELECT * FROM tribunales WHERE recepcion_id=?',
      [recepcion_id],
    );

    return rows;
  } catch (error) {
    manejarErrorDB(error);
  }
}

async function guardarTribunal(data, usuario_id) {
  try {
    const { recepcion_id, presidente, secretario, vocal } = data;

    // 🔥 Validación básica
    if (!presidente || !secretario || !vocal) {
      throw new Error('Debe asignar todos los miembros del tribunal');
    }

    // 🔥 eliminar anteriores
    await db.query('DELETE FROM tribunales WHERE recepcion_id=?', [
      recepcion_id,
    ]);

    const miembros = [
      [recepcion_id, presidente, 'PRESIDENTE'],
      [recepcion_id, secretario, 'SECRETARIO'],
      [recepcion_id, vocal, 'VOCAL'],
    ];

    for (const m of miembros) {
      await db.query(
        `
        INSERT INTO tribunales
        (recepcion_id, docente_id, rol)
        VALUES (?,?,?)
        `,
        m,
      );
    }

    await db.query(
      `
      UPDATE recepciones
      SET estado='En revision'
      WHERE id=? AND estado='Recepcionado'
      `,
      [recepcion_id],
    );

    // 🔵 AUDITORÍA
    await registrarAuditoria(
      'tribunales',
      recepcion_id,
      'INSERT',
      'Se asignó o actualizó tribunal de defensa',
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    manejarErrorDB(error);
  }
}

module.exports = {
  listarDefensas,
  cargaDocentes,
  obtenerTribunal,
  guardarTribunal,
};
