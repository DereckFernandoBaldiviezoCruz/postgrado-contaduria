/* =========================
   OBTENER POR RECEPCION
========================= */
export const obtenerPagoRecepcionAPI = async (recepcion_id) => {
  return await window.api.obtenerPagoRecepcion(recepcion_id);
};

/* =========================
   CREAR
========================= */
export const crearPagoAPI = async (data) => {
  return await window.api.crearPago(data);
};

/* =========================
   EDITAR
========================= */
export const editarPagoAPI = async (data) => {
  return await window.api.editarPago(data);
};

/* =========================
   ELIMINAR
========================= */
export const eliminarPagoAPI = async (id) => {
  return await window.api.eliminarPago(id);
};
