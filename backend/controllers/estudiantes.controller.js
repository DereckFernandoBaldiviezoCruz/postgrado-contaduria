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
      INNER JOIN estudiante_area ea ON ea.estudiante_id = e.id
      LEFT JOIN carreras c ON c.id = e.carrera_id
      WHERE ea.estado='Activo'
AND ea.area = ?
    `;

    let params = [global.areaActual];

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
      params.push(filtro, filtro, filtro, filtro, filtro);
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

    const carreraFinal = carrera_id || null;
    const area = global.areaActual || 'MAESTRIAS';

    /* =========================
       🔥 VALIDAR CI EN EL ÁREA
    ========================== */
    const [[existe]] = await db.query(
      `
      SELECT ea.id
      FROM estudiante_area ea
      INNER JOIN estudiantes e ON e.id = ea.estudiante_id
      WHERE e.ci = ?
AND ea.area = ?
AND ea.estado = 'Activo'
    `,
      [ci, area],
    );

    if (existe) {
      throw new Error(
        `El estudiante con CI ${ci} ya está registrado en ${area}`,
      );
    }

    /* =========================
       🔥 BUSCAR SI EL ESTUDIANTE YA EXISTE GLOBAL
    ========================== */
    const [[estudianteExistente]] = await db.query(
      'SELECT id FROM estudiantes WHERE ci=?',
      [ci],
    );

    let estudianteId;

    if (estudianteExistente) {
      estudianteId = estudianteExistente.id;
    } else {
      const [result] = await db.query(
        `
        INSERT INTO estudiantes
        (nombre_completo, ci, correo, celular, carrera_id)
        VALUES (?,?,?,?,?)
      `,
        [nombre_completo, ci, correo, celular, carreraFinal],
      );

      estudianteId = result.insertId;
    }

    /* =========================
       🔥 INSERT EN AREA
    ========================== */
    await db.query(
      `
      INSERT INTO estudiante_area (estudiante_id, area, estado)
      VALUES (?,?,?)
    `,
      [estudianteId, area,'Activo'],
    );

    await registrarAuditoria(
      'estudiantes',
      estudianteId,
      'INSERT',
      `Se registró estudiante "${nombre_completo}" en ${area}`,
      usuario_id,
    );

    return { id: estudianteId };
  } catch (error) {
  console.error('Error DB:', error);

  // 🔥 SI YA ES UN ERROR TUYO → RESPETARLO
  if (error.message) {
    throw error;
  }

  // 🔥 SI ES ERROR DE MYSQL
  throw new Error(manejarErrorDB(error, 'Error al crear estudiante'));
}
}

/* =========================
   EDITAR
========================= */
async function editar(id, data, usuario_id) {
  try {
    const carreraFinal = data.carrera_id || null;
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
        carreraFinal,
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

    await db.query(
  `
  UPDATE estudiante_area
  SET estado='Inactivo'
  WHERE estudiante_id=? AND area=?
`,
  [id, global.areaActual],
);

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
    SELECT
      e.id,
  e.nombre_completo,
  e.ci,
  e.celular,
  e.correo,
  ea.estado
      FROM estudiantes e
      INNER JOIN estudiante_area ea ON ea.estudiante_id = e.id
      WHERE ea.area = ?
    `;

    let params = [global.areaActual];

    if (buscar) {
      sql += `
        AND (
          e.nombre_completo LIKE ?
          OR e.ci LIKE ?
          OR e.celular LIKE ?
          OR e.correo LIKE ?
        )
      `;

      const filtro = `%${buscar}%`;
      params.push(filtro, filtro, filtro, filtro);
    }

    sql += ` ORDER BY e.nombre_completo ASC`;

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

    await db.query(
  `
  UPDATE estudiante_area
  SET estado=?
  WHERE estudiante_id=? AND area=?
`,
  [estado, id, global.areaActual],
);

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

const esCorreoValido = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const esNombreValido = (nombre) => {
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre);
};

async function importar(datos, usuario_id) {
  try {
    let insertados = 0;
    let duplicados = [];
    let invalidos = [];

    const area = global.areaActual;

    for (const [index, e] of datos.entries()) {
      try {
        // 🔥 LIMPIEZA
        const nombre = (e.nombre_completo || '').trim();
        const ci = (e.ci || '').toString().trim();
        const correo = (e.correo || '').trim();
        const celular = (e.celular || '').toString().trim();

        /* =========================
           VALIDACIONES
        ========================== */

        if (!nombre || !esNombreValido(nombre)) {
          invalidos.push(`Fila ${index + 2}: Nombre inválido`);
          continue;
        }

        if (!ci || !/^\d+$/.test(ci)) {
          invalidos.push(`Fila ${index + 2}: CI inválido`);
          continue;
        }

        if (!esCorreoValido(correo)) {
          invalidos.push(`Fila ${index + 2}: Correo inválido`);
          continue;
        }

        if (celular && !/^\d+$/.test(celular)) {
          invalidos.push(`Fila ${index + 2}: Celular inválido`);
          continue;
        }

        /* =========================
           CARRERA
        ========================== */
        let carreraId = null;

        if (e.carrera) {
          const [carrera] = await db.query(
            'SELECT id FROM carreras WHERE nombre=?',
            [e.carrera],
          );

          if (carrera.length > 0) {
            carreraId = carrera[0].id;
          }
        }

        /* =========================
           BUSCAR CI GLOBAL
        ========================== */
        const [[existe]] = await db.query(
          'SELECT id FROM estudiantes WHERE ci=?',
          [ci],
        );

        let estudianteId;

        if (existe) {
          estudianteId = existe.id;

          // 🔥 validar si ya está en área
          const [[yaEnArea]] = await db.query(
            `SELECT id FROM estudiante_area WHERE estudiante_id=? AND area=?`,
            [estudianteId, area],
          );

          if (yaEnArea) {
            duplicados.push(ci);
            continue;
          }

          // 🔥 insertar en área
          await db.query(
            `INSERT INTO estudiante_area (estudiante_id, area, estado)
             VALUES (?,?,?)`,
            [estudianteId, area, 'Activo'],
          );

          insertados++;
        } else {
          const [result] = await db.query(
            `INSERT INTO estudiantes
             (nombre_completo, ci, correo, celular, carrera_id)
             VALUES (?,?,?,?,?)`,
            [nombre, ci, correo || null, celular, carreraId],
          );

          estudianteId = result.insertId;

          await db.query(
            `INSERT INTO estudiante_area (estudiante_id, area)
             VALUES (?, ?)`,
            [estudianteId, area],
          );

          insertados++;
        }
      } catch (error) {
        invalidos.push(`Fila ${index + 2}: Error inesperado`);
      }
    }

    await registrarAuditoria(
      'estudiantes',
      0,
      'IMPORT',
      `Importación (${area}) (${insertados} insertados, ${duplicados.length} duplicados, ${invalidos.length} inválidos)`,
      usuario_id,
    );

    return {
      insertados,
      duplicados,
      invalidos,
    };
  } catch (error) {
    console.error(error);
    throw new Error('Error al importar estudiantes');
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
