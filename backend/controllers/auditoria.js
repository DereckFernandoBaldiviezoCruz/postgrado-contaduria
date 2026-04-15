const db = require('../db/db');

async function registrarAuditoria(
  tabla,
  registro_id,
  accion,
  descripcion,
  usuario_id,
) {
  try {
    await db.query(
      `
      INSERT INTO auditoria
      (tabla, registro_id, accion, descripcion, usuario_id)
      VALUES (?,?,?,?,?)
    `,
      [tabla, registro_id, accion, descripcion, usuario_id],
    );
  } catch (error) {
    console.error('Error registrando auditoría:', error);
  }
}

module.exports = registrarAuditoria;
