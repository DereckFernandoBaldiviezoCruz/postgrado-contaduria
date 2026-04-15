const db = require('../db/db');
const registrarAuditoria = require('./auditoria');

async function listar(buscar = '') {
  try {
    let sql = `
      SELECT
        d.*,
        c.nombre AS carrera_nombre
      FROM docentes d
      LEFT JOIN carreras c ON c.id = d.carrera_id
      `;

    let params = [];

    if (buscar) {
      sql += `
        WHERE
          d.nombre_completo LIKE ?
          OR d.ci LIKE ?
          OR d.correo LIKE ?
          OR d.celular LIKE ?
          OR d.nivel_academico LIKE ?
          OR c.nombre LIKE ?
      `;

      const filtro = `%${buscar}%`;
      params = [filtro, filtro, filtro, filtro, filtro, filtro];
    }

    sql += `
      ORDER BY 
        d.estado = 'Activo' DESC,
        d.id DESC
    `;

    const [rows] = await db.query(sql, params);
    return rows;
  } catch (error) {
    console.error(error);
    throw new Error('Error al listar docentes');
  }
}

async function crear(data, usuario_id) {
  try {
    const {
      nombre_completo,
      ci,
      nivel_academico,
      correo,
      celular,
      carrera_id,
    } = data;

    const [result] = await db.query(
      `
      INSERT INTO docentes
      (nombre_completo, ci, nivel_academico, correo, celular, carrera_id)
      VALUES (?,?,?,?,?,?)
    `,
      [nombre_completo, ci, nivel_academico, correo, celular, carrera_id],
    );

    await registrarAuditoria(
      'docentes',
      result.insertId,
      'INSERT',
      `Se creó docente "${nombre_completo}"`,
      usuario_id,
    );

    return { id: result.insertId };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Ya existe un docente con ese CI');
    }

    throw error;
  }
}

async function editar(id, data, usuario_id) {
  try {
    const {
      nombre_completo,
      ci,
      nivel_academico,
      correo,
      celular,
      carrera_id,
    } = data;

    await db.query(
      `
      UPDATE docentes SET
        nombre_completo = ?,
        ci = ?,
        nivel_academico = ?,
        correo = ?,
        celular = ?,
        carrera_id = ?
      WHERE id = ?
      `,
      [nombre_completo, ci, nivel_academico, correo, celular, carrera_id, id],
    );

    await registrarAuditoria(
      'docentes',
      id,
      'UPDATE',
      `Se editó docente "${nombre_completo}"`,
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Ya existe un docente con ese CI');
    }

    throw error;
  }
}

async function eliminar(id, usuario_id) {
  await db.query(
    `
    UPDATE docentes 
    SET estado = 'Inactivo'
    WHERE id = ?
  `,
    [id],
  );

  await registrarAuditoria(
    'docentes',
    id,
    'DELETE',
    'Se desactivó docente',
    usuario_id,
  );

  return { ok: true };
}

async function activar(id, usuario_id) {
  await db.query(
    `
    UPDATE docentes 
    SET estado = 'Activo'
    WHERE id = ?
  `,
    [id],
  );

  await registrarAuditoria(
    'docentes',
    id,
    'UPDATE',
    'Se activó docente',
    usuario_id,
  );

  return { ok: true };
}

async function listarActivos(buscar = '') {
  let sql = `
    SELECT d.*, c.nombre AS carrera_nombre
    FROM docentes d
    LEFT JOIN carreras c ON c.id = d.carrera_id
    WHERE d.estado = 'Activo'
  `;

  let params = [];

  if (buscar) {
    sql += `
      AND (
        d.nombre_completo LIKE ?
        OR d.ci LIKE ?
        OR d.correo LIKE ?
        OR d.celular LIKE ?
        OR d.nivel_academico LIKE ?
        OR c.nombre LIKE ?
      )
    `;

    const filtro = `%${buscar}%`;
    params = [filtro, filtro, filtro, filtro, filtro, filtro];
  }

  sql += ' ORDER BY d.id DESC';

  const [rows] = await db.query(sql, params);
  return rows;
}

async function importar(datos, usuario_id) {
  let insertados = 0;
  let duplicados = [];

  for (const d of datos) {
    try {
      const [carrera] = await db.query(
        'SELECT id FROM carreras WHERE nombre=?',
        [d.carrera],
      );

      if (carrera.length === 0) continue;

      await db.query(
        `
        INSERT INTO docentes
        (nombre_completo, ci, nivel_academico, correo, celular, carrera_id)
        VALUES (?,?,?,?,?,?)
      `,
        [
          d.nombre_completo,
          d.ci,
          d.nivel_academico,
          d.correo,
          d.celular,
          carrera[0].id,
        ],
      );

      insertados++;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        duplicados.push(d.ci);
      } else {
        throw error;
      }
    }
  }

  await registrarAuditoria(
    'docentes',
    0,
    'IMPORT',
    `Importación masiva de docentes (${insertados} insertados)`,
    usuario_id,
  );

  return {
    insertados,
    duplicados,
  };
}

module.exports = {
  listar,
  crear,
  editar,
  eliminar,
  activar,
  listarActivos,
  importar,
};
