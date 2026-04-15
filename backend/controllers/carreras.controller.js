const db = require('../db/db');
const registrarAuditoria = require('./auditoria');

async function listar() {
  const [rows] = await db.query(
    "SELECT * FROM carreras WHERE estado='Activo' ORDER BY id DESC",
  );
  return rows;
}

async function crear(data, usuario_id) {
  const { nombre, estado } = data;

  const [result] = await db.query(
    'INSERT INTO carreras (nombre, estado) VALUES (?,?)',
    [nombre, estado],
  );

  await registrarAuditoria(
    'carreras',
    result.insertId,
    'INSERT',
    `Se creó la carrera "${nombre}"`,
    usuario_id,
  );

  return { id: result.insertId };
}

async function editar(id, data, usuario_id) {
  const { nombre, estado } = data;

  await db.query('UPDATE carreras SET nombre=?, estado=? WHERE id=?', [
    nombre,
    estado,
    id,
  ]);

  await registrarAuditoria(
    'carreras',
    id,
    'UPDATE',
    `Se editó la carrera "${nombre}"`,
    usuario_id,
  );

  return { ok: true };
}

async function eliminar(id, usuario_id) {
  await db.query("UPDATE carreras SET estado='Inactivo' WHERE id=?", [id]);

  await registrarAuditoria(
    'carreras',
    id,
    'DELETE',
    'Se desactivó una carrera',
    usuario_id,
  );

  return { ok: true };
}

async function listarTodos() {
  const [rows] = await db.query('SELECT * FROM carreras ORDER BY id DESC');
  return rows;
}

async function cambiarEstadoCarrera(id, estado, usuario_id) {
  await db.query('UPDATE carreras SET estado=? WHERE id=?', [estado, id]);

  await registrarAuditoria(
    'carreras',
    id,
    'UPDATE',
    `Se cambió estado de carrera a ${estado}`,
    usuario_id,
  );

  return { ok: true };
}

module.exports = {
  listar,
  crear,
  editar,
  eliminar,
  listarTodos,
  cambiarEstadoCarrera,
};
