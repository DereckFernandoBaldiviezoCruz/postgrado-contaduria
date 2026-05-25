const db = require('../db/db');
const manejarErrorDB = require('./dbError');
const registrarAuditoria = require('./auditoria');

/* =========================
   OBTENER POR RECEPCION
========================= */
async function obtenerPorRecepcion(recepcion_id) {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM pagos
      WHERE recepcion_id = ?
      LIMIT 1
    `,
      [recepcion_id],
    );

    return rows[0] || null;
  } catch (error) {
    throw new Error(manejarErrorDB(error));
  }
}

/* =========================
   CREAR
========================= */
async function crear(data, usuario_id) {
  try {
    const { recepcion_id, tipo, numero_comprobante, fecha_pago, monto, glosa } =
      data;

    const [result] = await db.query(
      `
      INSERT INTO pagos (
        recepcion_id,
        tipo,
        numero_comprobante,
        fecha_pago,
        monto,
        glosa
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [recepcion_id, tipo, numero_comprobante, fecha_pago, monto, glosa],
    );

    await registrarAuditoria(
      'pagos',
      result.insertId,
      'INSERT',
      `Se registró pago ${tipo}`,
      usuario_id,
    );

    return {
      id: result.insertId,
    };
  } catch (error) {
    throw new Error(manejarErrorDB(error));
  }
}

/* =========================
   EDITAR
========================= */
async function editar(data, usuario_id) {
  try {
    const { id, tipo, numero_comprobante, fecha_pago, monto, glosa } = data;

    await db.query(
      `
      UPDATE pagos SET
        tipo=?,
        numero_comprobante=?,
        fecha_pago=?,
        monto=?,
        glosa=?
      WHERE id=?
    `,
      [tipo, numero_comprobante, fecha_pago, monto, glosa, id],
    );

    await registrarAuditoria(
      'pagos',
      id,
      'UPDATE',
      `Se editó pago ${tipo}`,
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    throw new Error(manejarErrorDB(error));
  }
}

/* =========================
   ELIMINAR
========================= */
async function eliminar(id, usuario_id) {
  try {
    await db.query(
      `
      DELETE FROM pagos
      WHERE id=?
    `,
      [id],
    );

    await registrarAuditoria(
      'pagos',
      id,
      'DELETE',
      `Se eliminó pago`,
      usuario_id,
    );

    return { ok: true };
  } catch (error) {
    throw new Error(manejarErrorDB(error));
  }
}

module.exports = {
  obtenerPorRecepcion,
  crear,
  editar,
  eliminar,
};
