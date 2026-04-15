const db = require('../db/db');
const registrarAuditoria = require('./auditoria');

async function obtenerCalificaciones(buscar = '') {
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

p.area AS tipo,

IFNULL(c.estado,'Pendiente') estado_calificacion

FROM recepciones r

JOIN estudiantes e
ON e.id = r.estudiante_id

JOIN programas p
ON p.id = r.programa_id

JOIN defensas d
ON d.recepcion_id = r.id

LEFT JOIN calificaciones c
ON c.recepcion_id = r.id

WHERE r.estado IN ('Programada','Finalizado')
AND e.estado = 'Activo'
AND p.area = ?
AND d.fecha <= CURDATE()

AND r.fecha_recepcion = (
  SELECT MAX(r2.fecha_recepcion)
  FROM recepciones r2
  WHERE r2.estudiante_id = r.estudiante_id
)

AND (
  c.id IS NULL 
  OR c.fecha_registro >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
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

  sql += ` ORDER BY 
CASE 
WHEN c.estado IS NULL THEN 0
ELSE 1
END,
e.nombre_completo ASC`;

  const [rows] = await db.query(sql, params);

  return rows;
}

async function guardarCalificacion(data, usuario_id) {
  let { recepcion_id, nota_entrada, nota_defensa } = data;

  // 🔥 obtener tipo desde BD (NO confiar en frontend)
  const [[info]] = await db.query(
    `
    SELECT p.area
    FROM recepciones r
    JOIN programas p ON p.id = r.programa_id
    WHERE r.id=?
    `,
    [recepcion_id],
  );

  const tipo = info.area;
  if (tipo !== 'Diplomados') {
    nota_entrada = 0;
  }
  let suma = 0;

  if (tipo === 'Diplomados') {
    suma = parseInt(nota_entrada) + parseInt(nota_defensa);
  } else {
    // MAESTRIA → solo una nota
    suma = parseInt(nota_defensa);
  }

  const estado = suma >= 66 ? 'Aprobado' : 'Reprobado';

  // 🔥 verificar si ya existe
  const [existe] = await db.query(
    'SELECT id FROM calificaciones WHERE recepcion_id=?',
    [recepcion_id],
  );

  if (existe.length > 0) {
    // 🔥 UPDATE
    await db.query(
      `UPDATE calificaciones
       SET nota_entrada=?, nota_defensa=?, suma=?, estado=?
       WHERE recepcion_id=?`,
      [
        tipo === 'Diplomados' ? nota_entrada : 0,
        nota_defensa,
        suma,
        estado,
        recepcion_id,
      ],
    );

    await registrarAuditoria(
      'calificaciones',
      recepcion_id,
      'UPDATE',
      `Se actualizó calificación (${tipo}). Resultado: ${estado}`,
      usuario_id,
    );
  } else {
    // 🔥 INSERT
    await db.query(
      `INSERT INTO calificaciones
       (recepcion_id,nota_entrada,nota_defensa,suma,estado)
       VALUES (?,?,?,?,?)`,
      [
        recepcion_id,
        tipo === 'Diplomados' ? nota_entrada : 0,
        nota_defensa,
        suma,
        estado,
      ],
    );

    await registrarAuditoria(
      'calificaciones',
      recepcion_id,
      'INSERT',
      `Se registró calificación (${tipo}). Resultado: ${estado}`,
      usuario_id,
    );
  }

  // 🔥 FINALIZA SI APRUEBA
  if (estado === 'Aprobado') {
    await db.query(
      `UPDATE recepciones
       SET estado='Finalizado', fecha_finalizacion=NOW()
       WHERE id=?`,
      [recepcion_id],
    );
  }

  return true;
}

module.exports = {
  obtenerCalificaciones,
  guardarCalificacion,
};
