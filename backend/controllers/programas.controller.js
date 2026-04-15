const db = require('../db/db');
const registrarAuditoria = require('./auditoria');

/* ===============================
   LISTAR PROGRAMAS
================================ */
async function listar() {
  try {
    const area = global.areaActual;

    const [rows] = await db.query(
      `
      SELECT
        p.id,
        p.nombre,
        p.gestion,
        p.version,
        p.capacidad_maxima,
        p.carrera_id,
        p.estado,
        c.nombre AS carrera_nombre,
        COUNT(DISTINCT r.estudiante_id) AS inscritos
      FROM programas p
      LEFT JOIN carreras c ON c.id = p.carrera_id
      LEFT JOIN recepciones r ON r.programa_id = p.id
      WHERE p.estado = 'Activo'
      AND p.area = ?
      GROUP BY
        p.id, p.nombre, p.gestion, p.version,
        p.capacidad_maxima, p.carrera_id, c.nombre
      ORDER BY p.id DESC
    `,
      [area],
    );

    return rows;
  } catch (error) {
    console.error(error);
    throw new Error('Error al listar programas');
  }
}

/* ===============================
   CREAR
================================ */
async function crear(data, usuario_id) {
  const { nombre, gestion, version, capacidad_maxima, carrera_id } = data;
  const area = global.areaActual;

  const [result] = await db.query(
    `
    INSERT INTO programas
    (nombre, gestion, version, capacidad_maxima, carrera_id, area)
    VALUES (?,?,?,?,?,?)
  `,
    [nombre, gestion, version, capacidad_maxima, carrera_id, area],
  );

  await registrarAuditoria(
    'programas',
    result.insertId,
    'INSERT',
    `Se creó programa "${nombre}"`,
    usuario_id,
  );

  return { id: result.insertId };
}

/* ===============================
   EDITAR
================================ */
async function editar(id, data, usuario_id) {
  await db.query(
    `
    UPDATE programas SET
      nombre=?,
      gestion=?,
      version=?,
      capacidad_maxima=?,
      carrera_id=?
    WHERE id=?
  `,
    [
      data.nombre,
      data.gestion,
      data.version,
      data.capacidad_maxima,
      data.carrera_id,
      id,
    ],
  );

  await registrarAuditoria(
    'programas',
    id,
    'UPDATE',
    `Se editó programa "${data.nombre}"`,
    usuario_id,
  );

  return { ok: true };
}

/* ===============================
   ELIMINAR
================================ */
async function eliminar(id, usuario_id) {
  await db.query('DELETE FROM programas WHERE id=?', [id]);

  await registrarAuditoria(
    'programas',
    id,
    'DELETE',
    'Se eliminó programa',
    usuario_id,
  );

  return { ok: true };
}

async function cambiarEstadoPrograma(id, estado, usuario_id) {
  await db.query('UPDATE programas SET estado=? WHERE id=?', [estado, id]);

  await registrarAuditoria(
    'programas',
    id,
    'UPDATE',
    `Se cambió estado del programa a ${estado}`,
    usuario_id,
  );

  return { ok: true };
}

async function listarTodos() {
  const area = global.areaActual;
  const [rows] = await db.query(
    `
    SELECT
      p.id,
      p.nombre,
      p.gestion,
      p.version,
      p.capacidad_maxima,
      p.carrera_id,
      p.estado,
      c.nombre AS carrera_nombre,
      COUNT(DISTINCT r.estudiante_id) AS inscritos
    FROM programas p
    LEFT JOIN carreras c ON c.id = p.carrera_id
    LEFT JOIN recepciones r ON r.programa_id = p.id
    WHERE p.area = ?
    GROUP BY
      p.id, p.nombre, p.gestion, p.version,
      p.capacidad_maxima, p.carrera_id, c.nombre, p.estado
    ORDER BY p.id DESC
  `,
    [area],
  );
  return rows;
}

module.exports = {
  listar,
  crear,
  editar,
  eliminar,
  cambiarEstadoPrograma,
  listarTodos,
};
