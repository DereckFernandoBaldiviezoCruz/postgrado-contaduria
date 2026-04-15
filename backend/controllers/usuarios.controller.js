const db = require('../db/db');
const bcrypt = require('bcrypt');

async function listar() {
  const [rows] = await db.query(`
SELECT id,nombre,usuario,rol,estado,area
FROM usuarios
ORDER BY id DESC
`);

  return rows;
}

async function crear(data) {
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
}

async function editar(id, data) {
  await db.query(
    `
UPDATE usuarios
SET nombre=?,usuario=?,rol=?,area=?
WHERE id=?
`,
    [data.nombre, data.usuario, data.rol, data.area, id],
  );

  return { ok: true };
}

async function eliminar(id) {
  await db.query(
    `
DELETE FROM usuarios
WHERE id=?
`,
    [id],
  );

  return { ok: true };
}

async function actualizarPerfil(data) {
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
}

module.exports = {
  listar,
  crear,
  editar,
  eliminar,
  actualizarPerfil,
};
