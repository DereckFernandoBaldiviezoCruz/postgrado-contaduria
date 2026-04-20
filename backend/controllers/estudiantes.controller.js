const db = require('../db/db');
const registrarAuditoria = require('./auditoria');
const manejarErrorDB = require('./dbError');

/* =========================
   LISTAR ACTIVOS
========================= */
async function listar(buscar = '') {
  try {
    let sql = `
      SELECT 
        e.*,
        c.nombre AS carrera_nombre
      FROM estudiantes e
      LEFT JOIN carreras c ON c.id = e.carrera_id
      WHERE e.estado='Activo'
    `;

    let params = [];

    if (buscar) {
      sql += `
        AND (
          e.nombre_completo LIKE ?
          OR e.ci LIKE ?
          OR e.correo LIKE ?
          OR e.celular LIKE ?
          OR c.nombre LIKE ?
        )
      `;

      const filtro = `%${buscar}%`;
      params = [filtro, filtro, filtro, filtro, filtro];
    }

    sql += ' ORDER BY e.id DESC';

    const [rows] = await db.query(sql, params);
    return rows;
  } catch (error) {
    manejarErrorDB(error, 'Error al listar estudiantes');
  }
}

/* =========================
   CREAR
========================= */
async function crear(data, usuario_id) {
  try {
    const { nombre_completo, ci, correo, celular, carrera_id } = data;

    const [result] = await db.query(
      `
      INSERT INTO estudiantes
      (nombre_completo, ci, correo, celular, carrera_id)
      VALUES (?,?,?,?,?)
    `,
      [nombre_completo, ci, correo, celular, carrera_id],
    );

    await registrarAuditoria(
      'estudiantes',
      result.insertId,
      'INSERT',
      `Se creó estudiante "${nombre_completo}"`,
      usuario_id,
    );

    return { id: result.insertId };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Ya existe un estudiante con ese CI');
    }

    manejarErrorDB(error, 'Error al crear estudiante');
  }
}

/* =========================
   EDITAR
========================= */
async function editar(id, data, usuario_id) {
  try {
    await db.query(
      `
      UPDATE estudiantes SET
        nombre_completo=?,
        ci=?,
        correo=?,
        celular=?,
        carrera_id=?
      WHERE id=?
    `,
      [
        data.nombre_completo,
        data.ci,
        data.correo,
        data.celular,
        data.carrera_id,
        id,
      ],
    );

    await registrarAuditoria(
      'estudiantes',
      id,
      'UPDATE',
      `Se editó estudiante "${data.nombre_completo}"`,
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Ya existe un estudiante con ese CI');
    }

    manejarErrorDB(error, 'Error al editar estudiante');
  }
}

/* =========================
   ELIMINAR (INACTIVAR)
========================= */
async function eliminar(id, usuario_id) {
  try {
    const [[est]] = await db.query(
      'SELECT nombre_completo FROM estudiantes WHERE id=?',
      [id],
    );

    await db.query("UPDATE estudiantes SET estado='Inactivo' WHERE id=?", [id]);

    await registrarAuditoria(
      'estudiantes',
      id,
      'UPDATE',
      `Se desactivó estudiante "${est?.nombre_completo || ''}"`,
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    manejarErrorDB(error, 'Error al eliminar estudiante');
  }
}

/* =========================
   LISTAR TODOS
========================= */
async function listarTodos(buscar = '') {
  try {
    let sql = `
      SELECT *
      FROM estudiantes
      WHERE 1=1
    `;

    let params = [];

    if (buscar) {
      sql += `
        AND (
          nombre_completo LIKE ?
          OR ci LIKE ?
          OR celular LIKE ?
          OR correo LIKE ?
        )
      `;

      const filtro = `%${buscar}%`;
      params = [filtro, filtro, filtro, filtro];
    }

    sql += ` ORDER BY nombre_completo ASC`;

    const [rows] = await db.query(sql, params);
    return rows;
  } catch (error) {
    manejarErrorDB(error, 'Error al listar estudiantes');
  }
}

/* =========================
   CAMBIAR ESTADO
========================= */
async function cambiarEstadoEstudiante(id, estado, usuario_id) {
  try {
    const [[est]] = await db.query(
      'SELECT nombre_completo FROM estudiantes WHERE id=?',
      [id],
    );

    await db.query('UPDATE estudiantes SET estado=? WHERE id=?', [estado, id]);

    await registrarAuditoria(
      'estudiantes',
      id,
      'UPDATE',
      `Se cambió estado de estudiante "${est?.nombre_completo || ''}" a ${estado}`,
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    manejarErrorDB(error, 'Error al cambiar estado del estudiante');
  }
}

/* =========================
   IMPORTAR
========================= */
async function importar(datos, usuario_id) {
  try {
    let insertados = 0;
    let duplicados = [];

    for (const e of datos) {
      try {
        const [carrera] = await db.query(
          'SELECT id FROM carreras WHERE nombre=?',
          [e.carrera],
        );

        if (carrera.length === 0) continue;

        await db.query(
          `
          INSERT INTO estudiantes
          (nombre_completo, ci, correo, celular, carrera_id)
          VALUES (?,?,?,?,?)
        `,
          [e.nombre_completo, e.ci, e.correo, e.celular, carrera[0].id],
        );

        insertados++;
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          duplicados.push(e.ci);
        } else {
          throw error;
        }
      }
    }

    await registrarAuditoria(
      'estudiantes',
      0,
      'IMPORT',
      `Importación masiva de estudiantes (${insertados} insertados)`,
      usuario_id,
    );

    return {
      insertados,
      duplicados,
    };
  } catch (error) {
    manejarErrorDB(error, 'Error al importar estudiantes');
  }
}

module.exports = {
  listar,
  crear,
  editar,
  eliminar,
  listarTodos,
  cambiarEstadoEstudiante,
  importar,
};
