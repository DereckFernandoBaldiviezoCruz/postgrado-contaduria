const db = require('../db/db');
const registrarAuditoria = require('./auditoria');

/* =========================
   LISTAR
========================= */
async function listar() {
  const [rows] = await db.query(`
    SELECT
      t.id,
      t.nombre_completo,
      t.ci,
      t.correo,
      t.celular,
      t.tipo,
      t.nivel_academico,
      t.docente_id,
      d.nombre_completo AS docente_nombre
    FROM tutores t
    LEFT JOIN docentes d ON d.id = t.docente_id
    ORDER BY t.nombre_completo ASC
  `);

  return rows;
}

/* =========================
   CREAR
========================= */
async function crear(data, usuario_id) {
  try {
    let {
      nombre_completo,
      ci,
      correo,
      celular,
      tipo,
      docente_id,
      nivel_academico,
    } = data;

    if (!tipo) throw new Error('Tipo requerido');

    // 🔴 SI ES INTERNO → sacar nivel del docente
    if (tipo === 'INTERNO') {
      if (!docente_id) throw new Error('Tutor interno requiere docente_id');

      const [[docente]] = await db.query(
        `SELECT nivel_academico FROM docentes WHERE id=?`,
        [docente_id],
      );

      nivel_academico = docente?.nivel_academico || null;
    }

    // 🔴 SI ES EXTERNO → validar que venga
    if (tipo === 'EXTERNO' && !nivel_academico) {
      throw new Error('Nivel académico requerido');
    }

    if (tipo === 'EXTERNO') docente_id = null;

    const [result] = await db.query(
      `
      INSERT INTO tutores
      (nombre_completo, ci, correo, celular, tipo, docente_id, nivel_academico)
      VALUES (?,?,?,?,?,?,?)
      `,
      [
        nombre_completo,
        ci,
        correo,
        celular,
        tipo,
        docente_id || null,
        nivel_academico,
      ],
    );

    const tutor_id = result.insertId;

    await registrarAuditoria(
      'tutores',
      tutor_id,
      'CREATE',
      `Se creó el tutor ${nombre_completo}`,
      usuario_id,
    );

    return { id: tutor_id };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Ya existe un tutor con ese CI');
    }

    throw error;
  }
}

/* =========================
   EDITAR
========================= */
async function editar(id, data, usuario_id) {
  try {
    let {
      nombre_completo,
      ci,
      correo,
      celular,
      tipo,
      docente_id,
      nivel_academico,
    } = data;

    if (tipo === 'INTERNO') {
      if (!docente_id) throw new Error('Tutor interno requiere docente');

      const [[docente]] = await db.query(
        `SELECT nivel_academico FROM docentes WHERE id=?`,
        [docente_id],
      );

      nivel_academico = docente?.nivel_academico || null;
    }

    if (tipo === 'EXTERNO' && !nivel_academico) {
      throw new Error('Nivel académico requerido');
    }

    if (tipo === 'EXTERNO') docente_id = null;

    await db.query(
      `
      UPDATE tutores SET
        nombre_completo=?,
        ci=?,
        correo=?,
        celular=?,
        tipo=?,
        docente_id=?,
        nivel_academico=?
      WHERE id=?
      `,
      [
        nombre_completo,
        ci,
        correo,
        celular,
        tipo,
        docente_id || null,
        nivel_academico,
        id,
      ],
    );

    await registrarAuditoria(
      'tutores',
      id,
      'UPDATE',
      `Se editó el tutor ${nombre_completo}`,
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Ya existe un tutor con ese CI');
    }

    throw error;
  }
}

/* =========================
   ELIMINAR
========================= */
async function eliminar(id, usuario_id) {
  const [[tutor]] = await db.query(
    'SELECT nombre_completo FROM tutores WHERE id=?',
    [id],
  );

  await db.query('DELETE FROM tutores WHERE id=?', [id]);

  await registrarAuditoria(
    'tutores',
    id,
    'DELETE',
    `Se eliminó el tutor ${tutor?.nombre_completo || ''}`,
    usuario_id,
  );

  return { ok: true };
}

module.exports = { listar, crear, editar, eliminar };
