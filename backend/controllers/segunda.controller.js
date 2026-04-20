const db = require('../db/db');
const registrarAuditoria = require('./auditoria');
const dbError = require('./dbError');

/* =========================
   OBTENER REPROBADOS
========================= */
async function obtenerSegundaInstancia(buscar = '') {
  try {
    const area = global.areaActual;

    let sql = `
SELECT
  r.id AS recepcion_id,
  r.tema,
  e.nombre_completo AS estudiante,

  c.nota_entrada,
  c.nota_defensa,
  c.suma,
  c.estado,
  c.instancia,

  p.area AS tipo

FROM recepciones r
JOIN estudiantes e ON e.id = r.estudiante_id
JOIN programas p ON p.id = r.programa_id
JOIN calificaciones c ON c.recepcion_id = r.id

WHERE (
  c.estado = 'Reprobado'
  OR c.instancia > 1
)
AND p.area = ?

-- 🔥 SOLO ÚLTIMA RECEPCIÓN DEL ESTUDIANTE
AND r.id = (
  SELECT MAX(r2.id)
  FROM recepciones r2
  WHERE r2.estudiante_id = r.estudiante_id
)

-- 🔥 SOLO ÚLTIMO MES
AND (
  c.fecha_registro >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
)
`;

    let params = [area];

    if (buscar) {
      sql += `
        AND (
          e.nombre_completo LIKE ?
          OR r.tema LIKE ?
        )
      `;
      const filtro = `%${buscar}%`;
      params.push(filtro, filtro);
    }

    sql += ` ORDER BY e.nombre_completo`;

    const [rows] = await db.query(sql, params);
    return rows;
  } catch (error) {
    throw dbError(error);
  }
}

/* =========================
   GUARDAR SEGUNDA INSTANCIA
========================= */
async function guardarSegundaInstancia(data, usuario_id) {
  try {
    const { recepcion_id, nota_defensa } = data;

    const [[info]] = await db.query(
      `
      SELECT c.*, p.area
      FROM calificaciones c
      JOIN recepciones r ON r.id = c.recepcion_id
      JOIN programas p ON p.id = r.programa_id
      WHERE c.recepcion_id=?
      `,
      [recepcion_id],
    );

    const tipo = info.area;
    let instancia = info.instancia || 1;

    // 🔒 VALIDACIONES
    if (tipo === 'Diplomados' && instancia >= 4) {
      throw new Error('Máximo de instancias alcanzado');
    }

    instancia++;

    let suma = 0;

    if (tipo === 'Diplomados') {
      suma = parseInt(info.nota_entrada) + parseInt(nota_defensa);
    } else {
      suma = parseInt(nota_defensa);
    }

    const estado = suma >= 66 ? 'Aprobado' : 'Reprobado';

    await db.query(
      `
      UPDATE calificaciones
      SET 
        nota_defensa=?,
        suma=?,
        estado=?,
        instancia=?
      WHERE recepcion_id=?
      `,
      [nota_defensa, suma, estado, instancia, recepcion_id],
    );

    // ✅ FINALIZA SOLO SI APRUEBA
    if (estado === 'Aprobado') {
      await db.query(
        `
        UPDATE recepciones
        SET estado='Finalizado', fecha_finalizacion=NOW()
        WHERE id=?
        `,
        [recepcion_id],
      );
    }

    await registrarAuditoria(
      'calificaciones',
      recepcion_id,
      'UPDATE',
      `Segunda instancia (${tipo}) → ${estado}`,
      usuario_id,
    );

    return true;
  } catch (error) {
    throw dbError(error);
  }
}

module.exports = {
  obtenerSegundaInstancia,
  guardarSegundaInstancia,
};
