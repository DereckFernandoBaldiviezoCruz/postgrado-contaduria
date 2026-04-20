const db = require('../db/db');
const bcrypt = require('bcrypt');
const dbError = require('./dbError');

/* =========================
   LISTAR
========================= */
async function listar() {
  try {
    const [rows] = await db.query(`
      SELECT id,nombre,usuario,rol,estado,area
      FROM usuarios
      ORDER BY id DESC
    `);

    return rows;
  } catch (error) {
    throw dbError(error, 'Error al listar usuarios');
  }
}

/* =========================
   CREAR
========================= */
async function crear(data) {
  try {
    const hash = await bcrypt.hash(data.password, 10);

    const [result] = await db.query(
      `
      INSERT INTO usuarios
      (nombre,usuario,password,rol,area)
      VALUES (?,?,?,?,?)
      `,
      [data.nombre, data.usuario, hash, data.rol, data.area],
    );

    return { id: result.insertId };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('El usuario ya existe');
    }

    throw dbError(error, 'Error al crear usuario');
  }
}

/* =========================
   EDITAR
========================= */
async function editar(id, data) {
  try {
    await db.query(
      `
      UPDATE usuarios
      SET nombre=?,usuario=?,rol=?,area=?
      WHERE id=?
      `,
      [data.nombre, data.usuario, data.rol, data.area, id],
    );

    return { ok: true };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('El usuario ya existe');
    }

    throw dbError(error, 'Error al editar usuario');
  }
}

/* =========================
   ELIMINAR
========================= */
async function eliminar(id) {
  try {
    await db.query(
      `
      DELETE FROM usuarios
      WHERE id=?
      `,
      [id],
    );

    return { ok: true };
  } catch (error) {
    throw dbError(error, 'Error al eliminar usuario');
  }
}

/* =========================
   ACTUALIZAR PERFIL
========================= */
async function actualizarPerfil(data) {
  try {
    const { id, nombre, password } = data;

    if (password) {
      const hash = await bcrypt.hash(password, 10);

      await db.query('UPDATE usuarios SET nombre=?, password=? WHERE id=?', [
        nombre,
        hash,
        id,
      ]);
    } else {
      await db.query('UPDATE usuarios SET nombre=? WHERE id=?', [nombre, id]);
    }

    return { ok: true };
  } catch (error) {
    throw dbError(error, 'Error al actualizar perfil');
  }
}

module.exports = {
  listar,
  crear,
  editar,
  eliminar,
  actualizarPerfil,
};
