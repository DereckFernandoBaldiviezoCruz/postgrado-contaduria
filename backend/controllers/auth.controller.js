const db = require('../db/db');
const bcrypt = require('bcrypt');

async function login(usuario, password) {
  const [rows] = await db.query(
    "SELECT * FROM usuarios WHERE usuario=? AND estado='Activo'",
    [usuario],
  );

  if (rows.length === 0) {
    throw new Error('Usuario o contraseña incorrectos');
  }

  const user = rows[0];

  const passwordCorrecta = await bcrypt.compare(password, user.password);

  if (!passwordCorrecta) {
    throw new Error('Usuario o contraseña incorrectos');
  }

  const usuarioLogueado = {
    id: user.id,
    nombre: user.nombre,
    usuario: user.usuario,
    rol: user.rol,
    area: user.area,
  };

  global.usuarioActual = usuarioLogueado;

  return usuarioLogueado;
}

module.exports = { login };
