const db = require('../db/db');
const registrarAuditoria = require('./auditoria');
const manejarErrorDB = require('./dbError');

/* =========================
   LISTAR
========================= */
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
    manejarErrorDB(error, 'Error al listar docentes');
  }
}

/* =========================
   CREAR
========================= */
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

    // =========================
    // VALIDACIONES
    // =========================

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre_completo)) {
      throw new Error('Nombre inválido');
    }

    if (!/^[0-9]+$/.test(ci)) {
      throw new Error('El CI solo debe contener números');
    }

    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      throw new Error('Correo no válido');
    }

    if (celular && !/^[0-9]+$/.test(celular)) {
      throw new Error('Celular inválido');
    }

    if (!nivel_academico) {
      throw new Error('Nivel académico obligatorio');
    }

    // =========================
    // INSERT
    // =========================

    const [result] = await db.query(
      `
      INSERT INTO docentes
      (nombre_completo, ci, nivel_academico, correo, celular, carrera_id)
      VALUES (?,?,?,?,?,?)
    `,
      [
        nombre_completo,
        ci,
        nivel_academico,
        correo || null,
        celular,
        carrera_id || null,
      ],
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

    throw error; // 🔥 IMPORTANTE
  }
}

/* =========================
   EDITAR
========================= */
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

    manejarErrorDB(error, 'Error al editar docente');
  }
}

/* =========================
   ELIMINAR
========================= */
async function eliminar(id, usuario_id) {
  try {
    await db.query(`UPDATE docentes SET estado = 'Inactivo' WHERE id = ?`, [
      id,
    ]);

    await registrarAuditoria(
      'docentes',
      id,
      'DELETE',
      'Se desactivó docente',
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    manejarErrorDB(error, 'Error al eliminar docente');
  }
}

/* =========================
   ACTIVAR
========================= */
async function activar(id, usuario_id) {
  try {
    await db.query(`UPDATE docentes SET estado = 'Activo' WHERE id = ?`, [id]);

    await registrarAuditoria(
      'docentes',
      id,
      'UPDATE',
      'Se activó docente',
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    manejarErrorDB(error, 'Error al activar docente');
  }
}

/* =========================
   LISTAR ACTIVOS
========================= */
async function listarActivos(buscar = '') {
  try {
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
  } catch (error) {
    manejarErrorDB(error, 'Error al listar docentes activos');
  }
}

/* =========================
   IMPORTAR
========================= */
async function importar(datos, usuario_id) {
  try {
    let insertados = 0;
    let duplicados = [];
    let errores = [];

    for (const d of datos) {
      try {
        // =========================
        // VALIDACIONES
        // =========================

        if (!d.nombre_completo || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(d.nombre_completo)) {
          errores.push(`Nombre inválido: ${d.nombre_completo}`);
          continue;
        }

        if (!d.ci || !/^[0-9]+$/.test(d.ci)) {
          errores.push(`CI inválido: ${d.ci}`);
          continue;
        }

        if (d.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo)) {
          errores.push(`Correo inválido: ${d.correo}`);
          continue;
        }

        if (d.celular && !/^[0-9]+$/.test(d.celular)) {
          errores.push(`Celular inválido: ${d.celular}`);
          continue;
        }

        // =========================
        // CARRERA (OPCIONAL)
        // =========================

        let carreraId = null;

        if (d.carrera) {
          const [carrera] = await db.query(
            'SELECT id FROM carreras WHERE nombre=?',
            [d.carrera],
          );

          if (carrera.length > 0) {
            carreraId = carrera[0].id;
          }
        }

        // =========================
        // INSERT
        // =========================

        await db.query(
          `
          INSERT INTO docentes
          (nombre_completo, ci, nivel_academico, correo, celular, carrera_id)
          VALUES (?,?,?,?,?,?)
        `,
          [
            d.nombre_completo,
            d.ci,
            d.nivel_academico || null,
            d.correo || null,
            d.celular,
            carreraId,
          ],
        );

        insertados++;
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          duplicados.push(d.ci);
        } else {
          errores.push(`Error en CI ${d.ci}`);
        }
      }
    }

    await registrarAuditoria(
      'docentes',
      0,
      'IMPORT',
      `Importación docentes (${insertados} insertados)`,
      usuario_id,
    );

    return {
      insertados,
      duplicados,
      errores,
    };
  } catch (error) {
    manejarErrorDB(error, 'Error al importar docentes');
  }
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
