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
        r.docente_id,
        e.nombre_completo estudiante,
        p.nombre programa,
        r.tema,
        d.nombre_completo docente,
        r.estado,
        COUNT(tr.id) tribunales_asignados
      FROM recepciones r
      JOIN estudiantes e ON e.id=r.estudiante_id
      LEFT JOIN programas p ON p.id=r.programa_id
      LEFT JOIN docentes d ON d.id=r.docente_id
      LEFT JOIN tribunales tr ON tr.recepcion_id=r.id
      WHERE r.estado NOT IN ('Finalizado','Rechazado')
      AND r.area = ?
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

async function cargaDocentes(docenteExcluir = null) {
  try {
    let sql = `
      SELECT
        d.id,
        d.nombre_completo,

        COALESCE(SUM(
          CASE 
            WHEN r.estado NOT IN ('Finalizado','Rechazado')
            THEN 1
            ELSE 0
          END
        ),0) pendientes,

        COALESCE(SUM(
          CASE 
            WHEN r.estado IN ('Finalizado','Rechazado')
            THEN 1
            ELSE 0
          END
        ),0) finalizados,

        COUNT(tr.id) total

      FROM docentes d

      LEFT JOIN tribunales tr
        ON tr.docente_id = d.id

      LEFT JOIN recepciones r
        ON r.id = tr.recepcion_id

      WHERE d.estado = 'Activo'
    `;

    const params = [];

    if (docenteExcluir) {
      sql += ` AND d.id <> ?`;
      params.push(docenteExcluir);
    }

    sql += `
      GROUP BY d.id
      ORDER BY pendientes DESC, total DESC
    `;

    const [rows] = await db.query(sql, params);

    return rows;
  } catch (error) {
    throw new Error(manejarErrorDB(error));
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

    if (!presidente || !secretario || !vocal) {
      throw new Error('Debe asignar todos los miembros del tribunal');
    }

    // Validar que no se repitan
    const ids = [presidente, secretario, vocal];

    if (new Set(ids).size !== ids.length) {
      throw new Error('No puede repetir docentes en el tribunal');
    }

    // Obtener tutor/docente de la recepción
    const [[recepcion]] = await db.query(
      `
      SELECT docente_id
      FROM recepciones
      WHERE id=?
      `,
      [recepcion_id],
    );

    // Validar que tutor no sea tribunal
    if (ids.includes(String(recepcion.docente_id))) {
      throw new Error(
        'El tutor/docente asignado a la monografía no puede formar parte del tribunal',
      );
    }

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

    await registrarAuditoria(
      'tribunales',
      recepcion_id,
      'INSERT',
      'Se asignó o actualizó tribunal de defensa',
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    throw new Error(manejarErrorDB(error));
  }
}

module.exports = {
  listarDefensas,
  cargaDocentes,
  obtenerTribunal,
  guardarTribunal,
};
