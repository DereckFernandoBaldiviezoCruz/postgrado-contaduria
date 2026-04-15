/* =========================
   LISTAR
========================= */
export const listarCarreras = async () => {
  return await window.api.listarCarreras();
};

/* =========================
   CREAR
========================= */
export const crearCarreraAPI = async (data) => {
  return await window.api.crearCarrera(data);
};

/* =========================
   EDITAR
========================= */
export const editarCarreraAPI = async (data) => {
  return await window.api.editarCarrera(data);
};

/* =========================
   ELIMINAR
========================= */
export const eliminarCarreraAPI = async (id) => {
  return await window.api.eliminarCarrera(id);
  
};

export const listarCarrerasTodos = () =>
  window.api.listarCarrerasTodos();

export const cambiarEstadoCarreraAPI = (id, estado) =>
  window.api.cambiarEstadoCarrera(id, estado);