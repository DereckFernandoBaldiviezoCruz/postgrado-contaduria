const db = require('../db/db');

async function registrarAuditoria(
  tabla,
  registro_id,
  accion,
  descripcion,
  usuario_id,
) {
  try {
    // Hora Bolivia UTC-4
    const fechaBolivia = new Date(Date.now() - 4 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await db.query(
      `
      INSERT INTO auditoria
      (tabla, registro_id, accion, descripcion, usuario_id, fecha)
      VALUES (?,?,?,?,?,?)
    `,
      [tabla, registro_id, accion, descripcion, usuario_id, fechaBolivia],
    );
  } catch (error) {
    console.error('Error registrando auditoría:', error);
  }
}

module.exports = registrarAuditoria;
